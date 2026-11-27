<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/notification.php';
require_once __DIR__ . '/../controllers/MessageController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'GET' && ($action === '' || $action === 'list' || $action === 'poll')) {
        handleGetMessages($pdo);
    }

    if ($method === 'POST' && ($action === '' || $action === 'send' || $action === 'text')) {
        handleSendTextMessage($pdo);
    }

    if ($method === 'POST' && $action === 'image') {
        handleSendImageMessage($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'read') {
        handleMarkMessagesAsRead($pdo);
    }

    if (in_array($method, ['DELETE', 'POST'], true) && $action === 'delete') {
        handleDeleteMessage($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint pesan tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
