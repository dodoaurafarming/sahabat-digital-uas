<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../controllers/UserController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'GET' && ($action === '' || $action === 'profile')) {
        handleGetProfile($pdo);
    }

    if (in_array($method, ['PUT', 'PATCH', 'POST'], true) && $action === 'profile') {
        handleUpdateProfile($pdo);
    }

    if ($method === 'POST' && $action === 'avatar') {
        handleUploadAvatar($pdo);
    }

    if ($method === 'GET' && $action === 'teachers') {
        handleGetTeachers($pdo);
    }

    if ($method === 'GET' && $action === 'students') {
        handleGetStudents($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint pengguna tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
