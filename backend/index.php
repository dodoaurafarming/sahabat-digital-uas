<?php

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';

loadEnv(__DIR__ . '/.env');
applyCorsHeaders();

try {
    $pdo = getDbConnection();
    $pdo->query('SELECT 1');

    sendJson([
        'status' => 'OK',
        'service' => 'Sahabat Digital PHP API',
        'database' => 'Connected',
    ]);
} catch (Throwable $e) {
    sendJson([
        'status' => 'ERROR',
        'database' => 'Disconnected',
        'message' => $e->getMessage(),
    ], 500);
}