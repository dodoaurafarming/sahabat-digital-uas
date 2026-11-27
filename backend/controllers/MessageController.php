<?php

declare(strict_types=1);

function getAuthorizedChatRoom(PDO $pdo, int $roomId, int $userId, string $role): array
{
    if ($roomId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID ruang obrolan (room_id) wajib diisi dengan angka valid'], 422);
    }

    $stmt = $pdo->prepare(
        'SELECT id, student_id, teacher_id, status, theme
         FROM chat_rooms
         WHERE id = ?
         LIMIT 1'
    );
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();

    if (!$room) {
        sendJson(['status' => 'ERROR', 'message' => 'Ruang obrolan tidak ditemukan'], 404);
    }

    $isParticipant = ($role === 'siswa' && (int) $room['student_id'] === $userId)
        || ($role === 'guru' && (int) $room['teacher_id'] === $userId);

    if (!$isParticipant) {
        sendJson(['status' => 'ERROR', 'message' => 'Anda tidak berwenang mengakses ruang obrolan ini'], 403);
    }

    return $room;
}

function formatMessageRow(array $row): array
{
    $imageUrl = $row['image_url'] ?? null;

    return [
        'id' => (int) $row['id'],
        'room_id' => (int) $row['room_id'],
        'sender_id' => (int) $row['sender_id'],
        'sender_name' => (string) ($row['sender_name'] ?? ''),
        'sender_role' => (string) ($row['sender_role'] ?? ''),
        'content' => $row['content'] !== null ? (string) $row['content'] : null,
        'image_url' => $imageUrl,
        'image_full_url' => buildUploadFullUrl($imageUrl),
        'is_read' => (bool) $row['is_read'],
        'created_at' => (string) $row['created_at'],
    ];
}

function handleGetMessages(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];

    $roomId = (int) ($_GET['room_id'] ?? $_GET['roomId'] ?? 0);
    $afterId = max(0, (int) ($_GET['after_id'] ?? 0));
    $limit = (int) ($_GET['limit'] ?? 100);
    if ($limit < 1) {
        $limit = 100;
    } elseif ($limit > 200) {
        $limit = 200;
    }

    $room = getAuthorizedChatRoom($pdo, $roomId, $userId, $userRole);
    $hideCol = $userRole === 'guru' ? 'm.hidden_by_teacher' : 'm.hidden_by_student';

    // HTTP Polling: jika after_id > 0, hanya ambil pesan baru dengan id > after_id
    $sql = "SELECT m.id, m.room_id, m.sender_id, m.content, m.image_url, m.is_read, m.created_at,
                   u.name AS sender_name, u.role AS sender_role
            FROM messages m
            INNER JOIN users u ON u.id = m.sender_id
            WHERE m.room_id = ?
              AND m.id > ?
              AND $hideCol = 0
            ORDER BY m.id ASC
            LIMIT ?";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(1, $roomId, PDO::PARAM_INT);
    $stmt->bindValue(2, $afterId, PDO::PARAM_INT);
    $stmt->bindValue(3, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $messages = array_map('formatMessageRow', $rows);
    $lastId = $afterId;
    if (!empty($messages)) {
        $lastId = (int) $messages[count($messages) - 1]['id'];
    }

    $peerId = $userRole === 'guru' ? (int) $room['student_id'] : (int) $room['teacher_id'];
    $peerStmt = $pdo->prepare(
        'SELECT id, name, role, avatar_url, is_online, last_seen_at, kelas, subject
         FROM users
         WHERE id = ?
         LIMIT 1'
    );
    $peerStmt->execute([$peerId]);
    $peerRow = $peerStmt->fetch();

    $peer = null;
    if ($peerRow) {
        $peerAvatar = $peerRow['avatar_url'] ?? null;
        $peer = [
            'id' => (int) $peerRow['id'],
            'name' => (string) $peerRow['name'],
            'role' => (string) $peerRow['role'],
            'avatar_url' => $peerAvatar,
            'avatar_full_url' => buildUploadFullUrl($peerAvatar),
            'is_online' => (bool) $peerRow['is_online'],
            'last_seen_at' => $peerRow['last_seen_at'] ?? null,
            'kelas' => $peerRow['kelas'] !== null ? (int) $peerRow['kelas'] : null,
            'subject' => $peerRow['subject'] ?? null,
        ];
    }

    sendJson([
        'status' => 'OK',
        'room_id' => $roomId,
        'room_status' => (string) $room['status'],
        'room_theme' => (string) ($room['theme'] ?? 'default'),
        'after_id' => $afterId,
        'last_id' => $lastId,
        'has_new' => count($messages) > 0,
        'peer' => $peer,
        'messages' => $messages,
    ]);
}

function notifyChatRecipient(
    PDO $pdo,
    array $room,
    int $senderId,
    string $senderName,
    string $previewText
): void {
    $recipientId = $senderId === (int) $room['student_id']
        ? (int) $room['teacher_id']
        : (int) $room['student_id'];

    $shortPreview = mb_substr(trim($previewText), 0, 120);
    createNotification(
        $pdo,
        $recipientId,
        'Pesan baru dari ' . $senderName,
        $shortPreview !== '' ? $shortPreview : 'Mengirim pesan baru',
        'chat',
        (int) $room['id']
    );
}

function handleSendTextMessage(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $senderId = (int) $auth['sub'];
    $senderRole = (string) $auth['role'];
    $input = getJsonInput();

    $roomId = (int) ($input['room_id'] ?? $input['roomId'] ?? $_GET['room_id'] ?? 0);
    $content = trim((string) ($input['content'] ?? $input['text'] ?? ''));

    if ($content === '') {
        sendJson(['status' => 'ERROR', 'message' => 'Isi pesan teks tidak boleh kosong'], 422);
    }

    if (mb_strlen($content) > 2000) {
        sendJson(['status' => 'ERROR', 'message' => 'Panjang pesan maksimal 2000 karakter'], 422);
    }

    $room = getAuthorizedChatRoom($pdo, $roomId, $senderId, $senderRole);
    if ($room['status'] === 'closed') {
        sendJson(['status' => 'ERROR', 'message' => 'Ruang obrolan ini telah ditutup'], 403);
    }

    $insertStmt = $pdo->prepare(
        'INSERT INTO messages (room_id, sender_id, content) VALUES (?, ?, ?)'
    );
    $insertStmt->execute([$roomId, $senderId, $content]);
    $messageId = (int) $pdo->lastInsertId();

    // Perbarui waktu aktivitas ruang dan pastikan ruang muncul kembali di kotak masuk kedua pihak
    $touchStmt = $pdo->prepare(
        'UPDATE chat_rooms
         SET updated_at = CURRENT_TIMESTAMP, hidden_by_student = 0, hidden_by_teacher = 0
         WHERE id = ?'
    );
    $touchStmt->execute([$roomId]);

    $fetchStmt = $pdo->prepare(
        'SELECT m.id, m.room_id, m.sender_id, m.content, m.image_url, m.is_read, m.created_at,
                u.name AS sender_name, u.role AS sender_role
         FROM messages m
         INNER JOIN users u ON u.id = m.sender_id
         WHERE m.id = ?
         LIMIT 1'
    );
    $fetchStmt->execute([$messageId]);
    $createdRow = $fetchStmt->fetch();

    $senderName = (string) ($createdRow['sender_name'] ?? $auth['name'] ?? 'Pengguna');
    notifyChatRecipient($pdo, $room, $senderId, $senderName, $content);

    sendJson([
        'status' => 'OK',
        'message' => 'Pesan berhasil dikirim',
        'data' => formatMessageRow($createdRow),
    ], 201);
}

function handleSendImageMessage(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $senderId = (int) $auth['sub'];
    $senderRole = (string) $auth['role'];

    $roomId = (int) ($_POST['room_id'] ?? $_POST['roomId'] ?? $_GET['room_id'] ?? 0);
    $caption = trim((string) ($_POST['content'] ?? $_POST['caption'] ?? ''));

    if (mb_strlen($caption) > 1000) {
        sendJson(['status' => 'ERROR', 'message' => 'Keterangan gambar maksimal 1000 karakter'], 422);
    }

    $room = getAuthorizedChatRoom($pdo, $roomId, $senderId, $senderRole);
    if ($room['status'] === 'closed') {
        sendJson(['status' => 'ERROR', 'message' => 'Ruang obrolan ini telah ditutup'], 403);
    }

    $fieldName = isset($_FILES['image']) ? 'image' : 'file';
    $uploaded = saveUploadedImage($fieldName, 'chat', 'chat', $senderId);

    $insertStmt = $pdo->prepare(
        'INSERT INTO messages (room_id, sender_id, content, image_url) VALUES (?, ?, ?, ?)'
    );
    $insertStmt->execute([
        $roomId,
        $senderId,
        $caption !== '' ? $caption : null,
        $uploaded['relative_path'],
    ]);
    $messageId = (int) $pdo->lastInsertId();

    $touchStmt = $pdo->prepare(
        'UPDATE chat_rooms
         SET updated_at = CURRENT_TIMESTAMP, hidden_by_student = 0, hidden_by_teacher = 0
         WHERE id = ?'
    );
    $touchStmt->execute([$roomId]);

    $fetchStmt = $pdo->prepare(
        'SELECT m.id, m.room_id, m.sender_id, m.content, m.image_url, m.is_read, m.created_at,
                u.name AS sender_name, u.role AS sender_role
         FROM messages m
         INNER JOIN users u ON u.id = m.sender_id
         WHERE m.id = ?
         LIMIT 1'
    );
    $fetchStmt->execute([$messageId]);
    $createdRow = $fetchStmt->fetch();

    $senderName = (string) ($createdRow['sender_name'] ?? $auth['name'] ?? 'Pengguna');
    $preview = $caption !== '' ? '[Foto] ' . $caption : 'Mengirim sebuah foto';
    notifyChatRecipient($pdo, $room, $senderId, $senderName, $preview);

    sendJson([
        'status' => 'OK',
        'message' => 'Pesan gambar berhasil dikirim',
        'data' => formatMessageRow($createdRow),
    ], 201);
}

function handleMarkMessagesAsRead(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];
    $input = getJsonInput();

    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);
    $room = getAuthorizedChatRoom($pdo, $roomId, $userId, $userRole);

    $peerId = $userRole === 'guru' ? (int) $room['student_id'] : (int) $room['teacher_id'];

    $stmt = $pdo->prepare(
        'UPDATE messages
         SET is_read = 1
         WHERE room_id = ? AND sender_id = ? AND is_read = 0'
    );
    $stmt->execute([$roomId, $peerId]);
    $updatedCount = $stmt->rowCount();

    // Sinkronkan status baca notifikasi obrolan untuk ruang yang sedang dibuka
    $notifStmt = $pdo->prepare(
        'UPDATE notifications
         SET is_read = 1
         WHERE user_id = ? AND room_id = ? AND is_read = 0'
    );
    $notifStmt->execute([$userId, $roomId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Pesan berhasil ditandai sudah dibaca',
        'room_id' => $roomId,
        'updated_count' => $updatedCount,
    ]);
}

function handleDeleteMessage(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];
    $input = getJsonInput();

    $messageId = (int) ($_GET['message_id'] ?? $_GET['id'] ?? $input['message_id'] ?? $input['id'] ?? 0);
    if ($messageId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID pesan (message_id) wajib diisi dengan angka valid'], 422);
    }

    $stmt = $pdo->prepare(
        'SELECT m.id, cr.student_id, cr.teacher_id
         FROM messages m
         INNER JOIN chat_rooms cr ON cr.id = m.room_id
         WHERE m.id = ?
         LIMIT 1'
    );
    $stmt->execute([$messageId]);
    $row = $stmt->fetch();

    if (!$row) {
        sendJson(['status' => 'ERROR', 'message' => 'Pesan tidak ditemukan'], 404);
    }

    $isParticipant = ($userRole === 'siswa' && (int) $row['student_id'] === $userId)
        || ($userRole === 'guru' && (int) $row['teacher_id'] === $userId);

    if (!$isParticipant) {
        sendJson(['status' => 'ERROR', 'message' => 'Anda tidak berwenang menghapus pesan ini'], 403);
    }

    $hideCol = $userRole === 'guru' ? 'hidden_by_teacher' : 'hidden_by_student';
    $updateStmt = $pdo->prepare("UPDATE messages SET $hideCol = 1 WHERE id = ?");
    $updateStmt->execute([$messageId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Pesan berhasil dihapus dari sisi Anda',
        'message_id' => $messageId,
    ]);
}
