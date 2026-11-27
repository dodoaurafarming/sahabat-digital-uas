<?php

declare(strict_types=1);

function handleGetNotifications(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];

    $afterId = max(0, (int) ($_GET['after_id'] ?? 0));
    $unreadOnly = isset($_GET['unread_only']) && in_array((string) $_GET['unread_only'], ['1', 'true'], true);
    $limit = (int) ($_GET['limit'] ?? 50);
    if ($limit < 1) {
        $limit = 50;
    } elseif ($limit > 100) {
        $limit = 100;
    }

    $whereClauses = ['user_id = ?'];
    $params = [$userId];

    if ($afterId > 0) {
        $whereClauses[] = 'id > ?';
        $params[] = $afterId;
    }

    if ($unreadOnly) {
        $whereClauses[] = 'is_read = 0';
    }

    $sql = 'SELECT id, user_id, room_id, title, body, type, is_read, created_at
            FROM notifications
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY id DESC
            LIMIT ?';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $index => $val) {
        $stmt->bindValue($index + 1, $val, PDO::PARAM_INT);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $notifications = array_map('formatNotificationRow', $rows);

    $unreadStmt = $pdo->prepare(
        'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0'
    );
    $unreadStmt->execute([$userId]);
    $unreadCount = (int) ($unreadStmt->fetchColumn() ?: 0);

    $lastIdStmt = $pdo->prepare('SELECT COALESCE(MAX(id), 0) FROM notifications WHERE user_id = ?');
    $lastIdStmt->execute([$userId]);
    $lastId = (int) ($lastIdStmt->fetchColumn() ?: 0);

    sendJson([
        'status' => 'OK',
        'after_id' => $afterId,
        'last_id' => $lastId,
        'has_new' => count($notifications) > 0,
        'unread_count' => $unreadCount,
        'notifications' => $notifications,
    ]);
}

function handleMarkNotificationRead(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];
    $input = getJsonInput();

    $notificationId = (int) ($_GET['id'] ?? $input['id'] ?? $input['notification_id'] ?? 0);
    if ($notificationId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID notifikasi wajib diisi dengan angka valid'], 422);
    }

    $checkStmt = $pdo->prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ? LIMIT 1');
    $checkStmt->execute([$notificationId, $userId]);
    if (!$checkStmt->fetch()) {
        sendJson(['status' => 'ERROR', 'message' => 'Notifikasi tidak ditemukan atau bukan milik Anda'], 404);
    }

    $updateStmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
    $updateStmt->execute([$notificationId, $userId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Notifikasi ditandai sudah dibaca',
        'id' => $notificationId,
    ]);
}

function handleMarkAllNotificationsRead(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];

    $stmt = $pdo->prepare(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
    );
    $stmt->execute([$userId]);

    sendJson([
        'status' => 'OK',
        'message' => 'Semua notifikasi berhasil ditandai sudah dibaca',
        'updated_count' => $stmt->rowCount(),
    ]);
}

function handleDeleteNotification(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];
    $input = getJsonInput();

    $notificationId = (int) ($_GET['id'] ?? $input['id'] ?? $input['notification_id'] ?? 0);
    if ($notificationId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID notifikasi wajib diisi dengan angka valid'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->execute([$notificationId, $userId]);

    if ($stmt->rowCount() === 0) {
        sendJson(['status' => 'ERROR', 'message' => 'Notifikasi tidak ditemukan atau bukan milik Anda'], 404);
    }

    sendJson([
        'status' => 'OK',
        'message' => 'Notifikasi berhasil dihapus',
        'id' => $notificationId,
    ]);
}
