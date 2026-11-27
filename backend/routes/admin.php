<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/upload.php';
require_once __DIR__ . '/../helpers/notification.php';
require_once __DIR__ . '/../controllers/AdminController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'GET' && ($action === '' || $action === 'pending_teachers')) {
        handleGetPendingTeachers($pdo);
    }

    if ($method === 'GET' && $action === 'teachers') {
        handleGetAllTeachersAdmin($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'approve') {
        handleApproveTeacher($pdo);
    }

    if (in_array($method, ['PATCH', 'POST'], true) && $action === 'reject') {
        handleRejectTeacher($pdo);
    }

    if ($method === 'GET' && $action === 'users') {
        handleGetAdminUsers($pdo);
    }

    if ($method === 'GET' && $action === 'dashboard') {
        handleGetDashboardStats($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint admin tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
