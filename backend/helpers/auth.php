<?php

declare(strict_types=1);

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder !== 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }

    $decoded = base64_decode(strtr($data, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
}

function getJwtSecret(): string
{
    return $_ENV['JWT_SECRET'] ?? 'sahabat_digital_default_secret';
}

function generateToken(array $user): string
{
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64UrlEncode(json_encode([
        'sub' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24 * 7),
    ]));

    $signature = hash_hmac('sha256', "$header.$payload", getJwtSecret(), true);
    return "$header.$payload." . base64UrlEncode($signature);
}

function verifyToken(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", getJwtSecret(), true));

    if (!hash_equals($expected, $signature)) {
        return null;
    }

    $data = json_decode(base64UrlDecode($payload), true);
    if (!is_array($data) || ($data['exp'] ?? 0) < time()) {
        return null;
    }

    return $data;
}

function getBearerToken(): ?string
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if ($authHeader === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower((string) $key) === 'authorization') {
                $authHeader = (string) $value;
                break;
            }
        }
    }

    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }

    return null;
}

function requireAuth(?array $allowedRoles = null): array
{
    $token = getBearerToken();
    if ($token === null) {
        sendJson(['status' => 'ERROR', 'message' => 'Token autentikasi diperlukan'], 401);
    }

    $payload = verifyToken($token);
    if ($payload === null) {
        sendJson(['status' => 'ERROR', 'message' => 'Token tidak valid atau sudah kedaluwarsa'], 401);
    }

    if ($allowedRoles !== null && !in_array($payload['role'] ?? '', $allowedRoles, true)) {
        sendJson(['status' => 'ERROR', 'message' => 'Akses ditolak untuk peran ini'], 403);
    }

    return $payload;
}