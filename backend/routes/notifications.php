<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/notification.php';
require_once __DIR__ . '/../controllers/NotificationController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'GET' && ($action === '' || $action === 'list')) {
        handleGetNotifications($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'read') {
        handleMarkNotificationRead($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && ($action === 'read_all' || $action === 'read-all')) {
        handleMarkAllNotificationsRead($pdo);
    }

    if (in_array($method, ['DELETE', 'POST'], true) && $action === 'delete') {
        handleDeleteNotification($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint notifikasi tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
