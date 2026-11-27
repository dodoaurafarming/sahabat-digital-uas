<?php

declare(strict_types=1);

const CHAT_ALLOWED_THEMES = ['default', 'green', 'pink', 'purple', 'orange'];

function formatChatRoomRow(array $row, ?array $lastMessage = null, int $unreadCount = 0): array
{
    $studentAvatar = $row['student_avatar_url'] ?? null;
    $teacherAvatar = $row['teacher_avatar_url'] ?? null;

    return [
        'id' => (int) $row['id'],
        'student_id' => (int) $row['student_id'],
        'teacher_id' => (int) $row['teacher_id'],
        'status' => (string) $row['status'],
        'theme' => (string) ($row['theme'] ?? 'default'),
        'is_important' => (bool) ($row['is_important'] ?? false),
        'created_at' => (string) $row['created_at'],
        'updated_at' => (string) $row['updated_at'],
        'unread_count' => $unreadCount,
        'last_message' => $lastMessage,
        'student' => [
            'id' => (int) $row['student_id'],
            'name' => (string) $row['student_name'],
            'email' => (string) $row['student_email'],
            'avatar_url' => $studentAvatar,
            'avatar_full_url' => buildUploadFullUrl($studentAvatar),
            'is_online' => (bool) ($row['student_is_online'] ?? false),
            'kelas' => isset($row['student_kelas']) && $row['student_kelas'] !== null ? (int) $row['student_kelas'] : null,
            'frame_color' => (string) ($row['student_frame_color'] ?? '#00B5D8'),
        ],
        'teacher' => [
            'id' => (int) $row['teacher_id'],
            'name' => (string) $row['teacher_name'],
            'email' => (string) $row['teacher_email'],
            'avatar_url' => $teacherAvatar,
            'avatar_full_url' => buildUploadFullUrl($teacherAvatar),
            'is_online' => (bool) ($row['teacher_is_online'] ?? false),
            'subject' => $row['teacher_subject'] ?? null,
            'color_theme' => (string) ($row['teacher_color_theme'] ?? '#2B569A'),
        ],
    ];
}

function fetchRoomWithParticipants(PDO $pdo, int $roomId): ?array
{
    $stmt = $pdo->prepare(
        'SELECT cr.id, cr.student_id, cr.teacher_id, cr.status, cr.theme, cr.is_important,
                cr.hidden_by_teacher, cr.hidden_by_student, cr.created_at, cr.updated_at,
                s.name AS student_name, s.email AS student_email, s.avatar_url AS student_avatar_url,
                s.is_online AS student_is_online, s.kelas AS student_kelas, s.frame_color AS student_frame_color,
                t.name AS teacher_name, t.email AS teacher_email, t.avatar_url AS teacher_avatar_url,
                t.is_online AS teacher_is_online, t.subject AS teacher_subject, t.color_theme AS teacher_color_theme
         FROM chat_rooms cr
         INNER JOIN users s ON s.id = cr.student_id
         INNER JOIN users t ON t.id = cr.teacher_id
         WHERE cr.id = ?
         LIMIT 1'
    );
    $stmt->execute([$roomId]);
    $row = $stmt->fetch();

    return $row ?: null;
}

function assertChatRoomParticipant(PDO $pdo, int $roomId, int $userId, string $role): array
{
    if ($roomId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID ruang obrolan (room_id) wajib valid'], 422);
    }

    $room = fetchRoomWithParticipants($pdo, $roomId);
    if (!$room) {
        sendJson(['status' => 'ERROR', 'message' => 'Ruang obrolan tidak ditemukan'], 404);
    }

    $isOwner = ($role === 'siswa' && (int) $room['student_id'] === $userId)
        || ($role === 'guru' && (int) $room['teacher_id'] === $userId);

    if (!$isOwner) {
        sendJson(['status' => 'ERROR', 'message' => 'Anda tidak memiliki akses ke ruang obrolan ini'], 403);
    }

    return $room;
}

function handleGetRooms(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];

    $filter = trim((string) ($_GET['filter'] ?? 'all'));
    $search = strtolower(trim((string) ($_GET['search'] ?? '')));

    $ownerCol = $userRole === 'guru' ? 'cr.teacher_id' : 'cr.student_id';
    $hideRoomCol = $userRole === 'guru' ? 'cr.hidden_by_teacher' : 'cr.hidden_by_student';
    $hideMsgCol = $userRole === 'guru' ? 'hidden_by_teacher' : 'hidden_by_student';

    $whereClauses = ["$ownerCol = ?", "$hideRoomCol = 0"];
    $params = [$userId];

    if ($filter === 'important') {
        $whereClauses[] = 'cr.is_important = 1';
    }

    $sql = 'SELECT cr.id, cr.student_id, cr.teacher_id, cr.status, cr.theme, cr.is_important,
                   cr.created_at, cr.updated_at,
                   s.name AS student_name, s.email AS student_email, s.avatar_url AS student_avatar_url,
                   s.is_online AS student_is_online, s.kelas AS student_kelas, s.frame_color AS student_frame_color,
                   t.name AS teacher_name, t.email AS teacher_email, t.avatar_url AS teacher_avatar_url,
                   t.is_online AS teacher_is_online, t.subject AS teacher_subject, t.color_theme AS teacher_color_theme
            FROM chat_rooms cr
            INNER JOIN users s ON s.id = cr.student_id
            INNER JOIN users t ON t.id = cr.teacher_id
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY cr.updated_at DESC, cr.id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $lastMsgStmt = $pdo->prepare(
        "SELECT id, sender_id, content, image_url, is_read, created_at
         FROM messages
         WHERE room_id = ? AND $hideMsgCol = 0
         ORDER BY id DESC
         LIMIT 1"
    );

    $unreadStmt = $pdo->prepare(
        "SELECT COUNT(*)
         FROM messages
         WHERE room_id = ? AND sender_id = ? AND is_read = 0 AND $hideMsgCol = 0"
    );

    $rooms = [];
    $totalUnreadRooms = 0;

    foreach ($rows as $row) {
        $roomId = (int) $row['id'];
        $peerId = $userRole === 'guru' ? (int) $row['student_id'] : (int) $row['teacher_id'];

        $lastMsgStmt->execute([$roomId]);
        $lastMsgRow = $lastMsgStmt->fetch();
        $lastMessage = null;
        if ($lastMsgRow) {
            $imgUrl = $lastMsgRow['image_url'] ?? null;
            $lastMessage = [
                'id' => (int) $lastMsgRow['id'],
                'sender_id' => (int) $lastMsgRow['sender_id'],
                'content' => $lastMsgRow['content'] !== null ? (string) $lastMsgRow['content'] : null,
                'image_url' => $imgUrl,
                'image_full_url' => buildUploadFullUrl($imgUrl),
                'is_read' => (bool) $lastMsgRow['is_read'],
                'created_at' => (string) $lastMsgRow['created_at'],
            ];
        }

        $unreadStmt->execute([$roomId, $peerId]);
        $unreadCount = (int) ($unreadStmt->fetchColumn() ?: 0);
        if ($unreadCount > 0) {
            $totalUnreadRooms++;
        }

        if ($filter === 'unread' && $unreadCount === 0) {
            continue;
        }

        if ($search !== '') {
            $peerName = strtolower((string) ($userRole === 'guru' ? $row['student_name'] : $row['teacher_name']));
            $lastText = strtolower((string) ($lastMessage['content'] ?? ''));
            $kelasText = $row['student_kelas'] !== null ? 'kelas ' . $row['student_kelas'] : '';
            if (
                !str_contains($peerName, $search)
                && !str_contains($lastText, $search)
                && !str_contains($kelasText, $search)
            ) {
                continue;
            }
        }

        $rooms[] = formatChatRoomRow($row, $lastMessage, $unreadCount);
    }

    sendJson([
        'status' => 'OK',
        'total' => count($rooms),
        'total_unread_rooms' => $totalUnreadRooms,
        'rooms' => $rooms,
    ]);
}

function handleCreateOrGetRoom(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];
    $input = getJsonInput();

    if ($userRole === 'siswa') {
        $studentStmt = $pdo->prepare('SELECT kelas FROM users WHERE id = ? LIMIT 1');
        $studentStmt->execute([$userId]);
        $student = $studentStmt->fetch();

        if ($student && $student['kelas'] !== null && (int) $student['kelas'] < 4) {
            sendJson([
                'status' => 'ERROR',
                'message' => 'Fitur Ruang Curhat khusus untuk siswa kelas 4, 5, dan 6. Siswa kelas 1-3 dapat bercerita langsung kepada Bapak/Ibu Guru di sekolah atau orang tua di rumah.',
            ], 403);
        }

        $studentId = $userId;
        $teacherId = (int) ($input['teacher_id'] ?? $input['teacherId'] ?? 0);

        if ($teacherId <= 0) {
            sendJson(['status' => 'ERROR', 'message' => 'ID guru (teacher_id) wajib diisi dengan angka valid'], 422);
        }

        $teacherStmt = $pdo->prepare(
            "SELECT id FROM users WHERE id = ? AND role = 'guru' AND status = 'active' LIMIT 1"
        );
        $teacherStmt->execute([$teacherId]);
        if (!$teacherStmt->fetch()) {
            sendJson(['status' => 'ERROR', 'message' => 'Guru pendamping tidak ditemukan atau belum aktif'], 404);
        }
    } else {
        $teacherId = $userId;
        $studentId = (int) ($input['student_id'] ?? $input['studentId'] ?? 0);

        if ($studentId <= 0) {
            sendJson(['status' => 'ERROR', 'message' => 'ID siswa (student_id) wajib diisi dengan angka valid'], 422);
        }

        $studentStmt = $pdo->prepare(
            "SELECT id FROM users WHERE id = ? AND role = 'siswa' AND status = 'active' LIMIT 1"
        );
        $studentStmt->execute([$studentId]);
        if (!$studentStmt->fetch()) {
            sendJson(['status' => 'ERROR', 'message' => 'Siswa tidak ditemukan'], 404);
        }
    }

    $findStmt = $pdo->prepare(
        'SELECT id FROM chat_rooms WHERE student_id = ? AND teacher_id = ? LIMIT 1'
    );
    $findStmt->execute([$studentId, $teacherId]);
    $existing = $findStmt->fetch();

    $created = false;
    if ($existing) {
        $roomId = (int) $existing['id'];
        // Tampilkan kembali ruang obrolan bagi pihak yang membukanya
        $unhideCol = $userRole === 'guru' ? 'hidden_by_teacher' : 'hidden_by_student';
        $unhideStmt = $pdo->prepare("UPDATE chat_rooms SET $unhideCol = 0 WHERE id = ?");
        $unhideStmt->execute([$roomId]);
    } else {
        try {
            $insertStmt = $pdo->prepare(
                'INSERT INTO chat_rooms (student_id, teacher_id) VALUES (?, ?)'
            );
            $insertStmt->execute([$studentId, $teacherId]);
            $roomId = (int) $pdo->lastInsertId();
            $created = true;
        } catch (PDOException $e) {
            // Tangani kondisi race pada unique key (student_id, teacher_id)
            if ((string) $e->getCode() === '23000') {
                $findStmt->execute([$studentId, $teacherId]);
                $retry = $findStmt->fetch();
                if (!$retry) {
                    throw $e;
                }
                $roomId = (int) $retry['id'];
            } else {
                throw $e;
            }
        }
    }

    $roomRow = fetchRoomWithParticipants($pdo, $roomId);
    if (!$roomRow) {
        sendJson(['status' => 'ERROR', 'message' => 'Gagal memuat data ruang obrolan'], 500);
    }

    sendJson([
        'status' => 'OK',
        'message' => $created ? 'Ruang obrolan berhasil dibuat' : 'Ruang obrolan ditemukan',
        'created' => $created,
        'room' => formatChatRoomRow($roomRow),
    ], $created ? 201 : 200);
}

function handleUpdateRoomTheme(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $input = getJsonInput();
    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);
    $theme = trim((string) ($input['theme'] ?? ''));

    if (!in_array($theme, CHAT_ALLOWED_THEMES, true)) {
        sendJson([
            'status' => 'ERROR',
            'message' => 'Tema tidak valid. Pilihan: ' . implode(', ', CHAT_ALLOWED_THEMES),
        ], 422);
    }

    assertChatRoomParticipant($pdo, $roomId, (int) $auth['sub'], (string) $auth['role']);

    $stmt = $pdo->prepare('UPDATE chat_rooms SET theme = ? WHERE id = ?');
    $stmt->execute([$theme, $roomId]);

    $updatedRow = fetchRoomWithParticipants($pdo, $roomId);

    sendJson([
        'status' => 'OK',
        'message' => 'Tema ruang obrolan berhasil diperbarui',
        'room' => formatChatRoomRow($updatedRow),
    ]);
}

function handleToggleRoomImportant(PDO $pdo): void
{
    $auth = requireAuth(['guru']);
    $input = getJsonInput();
    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);

    $room = assertChatRoomParticipant($pdo, $roomId, (int) $auth['sub'], 'guru');

    if (array_key_exists('is_important', $input)) {
        $nextValue = (bool) $input['is_important'];
    } elseif (array_key_exists('isImportant', $input)) {
        $nextValue = (bool) $input['isImportant'];
    } else {
        $nextValue = !((bool) $room['is_important']);
    }

    $stmt = $pdo->prepare('UPDATE chat_rooms SET is_important = ? WHERE id = ?');
    $stmt->execute([$nextValue ? 1 : 0, $roomId]);

    sendJson([
        'status' => 'OK',
        'message' => $nextValue ? 'Obrolan ditandai penting' : 'Tanda penting pada obrolan dihapus',
        'room_id' => $roomId,
        'is_important' => $nextValue,
    ]);
}

function handleUpdateRoomStatus(PDO $pdo): void
{
    $auth = requireAuth(['guru']);
    $input = getJsonInput();
    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);
    $status = trim((string) ($input['status'] ?? ''));

    if (!in_array($status, ['active', 'closed'], true)) {
        sendJson(['status' => 'ERROR', 'message' => 'Status ruang obrolan hanya mendukung active atau closed'], 422);
    }

    assertChatRoomParticipant($pdo, $roomId, (int) $auth['sub'], 'guru');

    $stmt = $pdo->prepare('UPDATE chat_rooms SET status = ? WHERE id = ?');
    $stmt->execute([$status, $roomId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Status ruang obrolan berhasil diperbarui',
        'room_id' => $roomId,
        'room_status' => $status,
    ]);
}

function handleHideRoom(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $input = getJsonInput();
    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);
    $userRole = (string) $auth['role'];

    assertChatRoomParticipant($pdo, $roomId, (int) $auth['sub'], $userRole);

    $hideCol = $userRole === 'guru' ? 'hidden_by_teacher' : 'hidden_by_student';
    $stmt = $pdo->prepare("UPDATE chat_rooms SET $hideCol = 1 WHERE id = ?");
    $stmt->execute([$roomId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Ruang obrolan berhasil disembunyikan dari kotak masuk Anda',
        'room_id' => $roomId,
    ]);
}

function handleClearRoomMessages(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru']);
    $input = getJsonInput();
    $roomId = (int) ($_GET['room_id'] ?? $input['room_id'] ?? $input['roomId'] ?? 0);
    $userRole = (string) $auth['role'];

    assertChatRoomParticipant($pdo, $roomId, (int) $auth['sub'], $userRole);

    $hideCol = $userRole === 'guru' ? 'hidden_by_teacher' : 'hidden_by_student';
    $stmt = $pdo->prepare("UPDATE messages SET $hideCol = 1 WHERE room_id = ?");
    $stmt->execute([$roomId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Riwayat pesan berhasil dibersihkan dari sisi Anda',
        'room_id' => $roomId,
        'hidden_count' => $stmt->rowCount(),
    ]);
}
