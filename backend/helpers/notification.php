<?php

declare(strict_types=1);

function formatNotificationRow(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'user_id' => (int) $row['user_id'],
        'room_id' => $row['room_id'] !== null ? (int) $row['room_id'] : null,
        'title' => (string) $row['title'],
        'body' => (string) $row['body'],
        'type' => (string) ($row['type'] ?? 'chat'),
        'is_read' => (bool) $row['is_read'],
        'created_at' => (string) $row['created_at'],
    ];
}

function createNotification(
    PDO $pdo,
    int $userId,
    string $title,
    string $body,
    string $type = 'chat',
    ?int $roomId = null
): ?array {
    $allowedTypes = ['chat', 'material', 'system'];
    if (!in_array($type, $allowedTypes, true)) {
        $type = 'chat';
    }

    $trimmedTitle = mb_substr(trim($title), 0, 150);
    $trimmedBody = trim($body);
    if ($trimmedTitle === '') {
        return null;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO notifications (user_id, room_id, title, body, type) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $roomId, $trimmedTitle, $trimmedBody, $type]);

    $notificationId = (int) $pdo->lastInsertId();
    $fetchStmt = $pdo->prepare(
        'SELECT id, user_id, room_id, title, body, type, is_read, created_at
         FROM notifications
         WHERE id = ?
         LIMIT 1'
    );
    $fetchStmt->execute([$notificationId]);
    $row = $fetchStmt->fetch();

    return $row ? formatNotificationRow($row) : null;
}
