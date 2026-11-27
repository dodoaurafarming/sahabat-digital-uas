<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../controllers/ChatController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'GET' && ($action === '' || $action === 'list')) {
        handleGetRooms($pdo);
    }

    if ($method === 'POST' && ($action === '' || $action === 'open' || $action === 'create')) {
        handleCreateOrGetRoom($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'theme') {
        handleUpdateRoomTheme($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'important') {
        handleToggleRoomImportant($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'status') {
        handleUpdateRoomStatus($pdo);
    }

    if (in_array($method, ['POST', 'PATCH'], true) && $action === 'hide') {
        handleHideRoom($pdo);
    }

    if (in_array($method, ['POST', 'PATCH'], true) && ($action === 'clear' || $action === 'hide_all')) {
        handleClearRoomMessages($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint ruang obrolan tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
