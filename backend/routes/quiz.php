<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../controllers/QuizController.php';

loadEnv(__DIR__ . '/../.env');
applyCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

try {
    $pdo = getDbConnection();

    if ($method === 'POST' && ($action === '' || $action === 'submit')) {
        handleSaveQuizScore($pdo);
    }

    if ($method === 'GET' && ($action === '' || $action === 'history' || $action === 'list')) {
        handleGetQuizScores($pdo);
    }

    if ($method === 'GET' && $action === 'summary') {
        handleGetQuizSummary($pdo);
    }

    sendJson(['status' => 'ERROR', 'message' => 'Endpoint kuis tidak ditemukan'], 404);
} catch (Throwable $e) {
    sendJson(['status' => 'ERROR', 'message' => $e->getMessage()], 500);
}
