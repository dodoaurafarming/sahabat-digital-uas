<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../controllers/UploadController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
$action = $_GET['action'] ?? '';

try {
    if ($method === 'POST' && $action === 'avatar') {
        $pdo = getDbConnection();
        handleUploadAvatarEndpoint($pdo);
    }

    if ($method === 'POST' && in_array($action, ['', 'media', 'image', 'chat_image'], true)) {
        handleUploadMediaEndpoint();
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint unggah media tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
