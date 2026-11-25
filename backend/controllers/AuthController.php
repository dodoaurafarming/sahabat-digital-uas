<?php

declare(strict_types=1);

function handleRegister(PDO $pdo): void
{
    $input = getJsonInput();
    $name = trim((string) ($input['name'] ?? ''));
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');
    $role = trim((string) ($input['role'] ?? 'siswa'));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(['status' => 'ERROR', 'message' => 'Nama dan email valid wajib diisi'], 422);
    }

    if (strlen($password) < 6) {
        sendJson(['status' => 'ERROR', 'message' => 'Kata sandi minimal 6 karakter'], 422);
    }

    if (!in_array($role, ['siswa', 'guru'], true)) {
        sendJson(['status' => 'ERROR', 'message' => 'Peran pendaftaran hanya mendukung siswa atau guru'], 422);
    }

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        sendJson(['status' => 'ERROR', 'message' => 'Email sudah terdaftar'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $insertStmt = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );
    $insertStmt->execute([$name, $email, $passwordHash, $role]);

    $userId = (int) $pdo->lastInsertId();
    $userStmt = $pdo->prepare(
        'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ? LIMIT 1'
    );
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();

    sendJson([
        'status' => 'OK',
        'message' => 'Registrasi berhasil',
        'token' => generateToken($user),
        'user' => $user,
    ], 201);
}

function handleLogin(PDO $pdo): void
{
    $input = getJsonInput();
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');

    if ($email === '' || $password === '') {
        sendJson(['status' => 'ERROR', 'message' => 'Email dan kata sandi wajib diisi'], 422);
    }

    $stmt = $pdo->prepare(
        'SELECT id, name, email, password_hash, role, avatar_url, created_at FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendJson(['status' => 'ERROR', 'message' => 'Email atau kata sandi salah'], 401);
    }

    unset($user['password_hash']);

    sendJson([
        'status' => 'OK',
        'message' => 'Login berhasil',
        'token' => generateToken($user),
        'user' => $user,
    ]);
}

function handleMe(PDO $pdo): void
{
    $auth = requireAuth();

    $stmt = $pdo->prepare(
        'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ? LIMIT 1'
    );
    $stmt->execute([$auth['sub']]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(['status' => 'ERROR', 'message' => 'Pengguna tidak ditemukan'], 404);
    }

    sendJson([
        'status' => 'OK',
        'user' => $user,
    ]);
}