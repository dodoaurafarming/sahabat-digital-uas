<?php

declare(strict_types=1);

function applyCorsHeaders(): void
{
    $configured = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5173';
    $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $configured))));

    $defaultDevOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ];
    foreach ($defaultDevOrigins as $devOrigin) {
        if (!in_array($devOrigin, $allowedOrigins, true)) {
            $allowedOrigins[] = $devOrigin;
        }
    }

    $requestOrigin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    $originToSend = in_array($requestOrigin, $allowedOrigins, true)
        ? $requestOrigin
        : ($allowedOrigins[0] ?? 'http://localhost:5173');

    header('Content-Type: application/json; charset=utf-8');
    header('Vary: Origin');
    header('Access-Control-Allow-Origin: ' . $originToSend);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
