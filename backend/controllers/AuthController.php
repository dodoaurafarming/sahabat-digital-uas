<?php

declare(strict_types=1);

const AUTH_USER_SELECT_COLUMNS = 'id, name, email, role, status, reject_reason, avatar_url, is_online, last_seen_at, kelas, gender, frame_color, nip, subject, color_theme, created_at';

function formatAuthUser(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => (string) $row['name'],
        'email' => (string) $row['email'],
        'role' => (string) $row['role'],
        'status' => (string) ($row['status'] ?? 'active'),
        'reject_reason' => $row['reject_reason'] ?? null,
        'avatar_url' => $row['avatar_url'] ?? null,
        'is_online' => (bool) ($row['is_online'] ?? false),
        'last_seen_at' => $row['last_seen_at'] ?? null,
        'kelas' => isset($row['kelas']) && $row['kelas'] !== null ? (int) $row['kelas'] : null,
        'gender' => $row['gender'] ?? null,
        'frame_color' => (string) ($row['frame_color'] ?? '#00B5D8'),
        'nip' => $row['nip'] ?? null,
        'subject' => $row['subject'] ?? null,
        'color_theme' => (string) ($row['color_theme'] ?? '#2B569A'),
        'created_at' => (string) $row['created_at'],
    ];
}

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

    $kelas = null;
    $gender = null;
    $nip = null;
    $subject = null;

    if ($role === 'siswa') {
        if (isset($input['kelas']) && $input['kelas'] !== '') {
            $parsedKelas = (int) $input['kelas'];
            if ($parsedKelas < 1 || $parsedKelas > 6) {
                sendJson(['status' => 'ERROR', 'message' => 'Kelas siswa harus berada di antara 1 sampai 6'], 422);
            }
            $kelas = $parsedKelas;
        }

        if (isset($input['gender']) && trim((string) $input['gender']) !== '') {
            $genderInput = trim((string) $input['gender']);
            if (!in_array($genderInput, ['Laki-laki', 'Perempuan'], true)) {
                sendJson(['status' => 'ERROR', 'message' => 'Gender hanya mendukung Laki-laki atau Perempuan'], 422);
            }
            $gender = $genderInput;
        }
    } else {
        if (isset($input['nip']) && trim((string) $input['nip']) !== '') {
            $nipInput = trim((string) $input['nip']);
            if (!preg_match('/^[0-9]{8,18}$/', $nipInput)) {
                sendJson(['status' => 'ERROR', 'message' => 'NIP guru harus berupa angka 8 sampai 18 digit'], 422);
            }
            $nip = $nipInput;
        }

        if (isset($input['subject']) && trim((string) $input['subject']) !== '') {
            $subject = mb_substr(trim((string) $input['subject']), 0, 100);
        }
    }

    $checkStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->execute([$email]);
    if ($checkStmt->fetch()) {
        sendJson(['status' => 'ERROR', 'message' => 'Email sudah terdaftar'], 409);
    }

    $accountStatus = $role === 'guru' ? 'pending' : 'active';
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insertStmt = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, role, status, kelas, gender, nip, subject)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertStmt->execute([
        $name,
        $email,
        $passwordHash,
        $role,
        $accountStatus,
        $kelas,
        $gender,
        $nip,
        $subject,
    ]);

    $userId = (int) $pdo->lastInsertId();
    $userStmt = $pdo->prepare('SELECT ' . AUTH_USER_SELECT_COLUMNS . ' FROM users WHERE id = ? LIMIT 1');
    $userStmt->execute([$userId]);
    $userRow = $userStmt->fetch();
    $user = formatAuthUser($userRow);

    if ($role === 'guru') {
        // Beri notifikasi kepada seluruh administrator bahwa ada pendaftaran guru baru
        if (function_exists('createNotification')) {
            $adminStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' AND status = 'active'");
            $adminStmt->execute();
            $admins = $adminStmt->fetchAll();

            foreach ($admins as $admin) {
                createNotification(
                    $pdo,
                    (int) $admin['id'],
                    'Guru baru menunggu persetujuan: ' . $name,
                    'Email: ' . $email . ($nip !== null ? ' • NIP: ' . $nip : ''),
                    'system',
                    null
                );
            }
        }

        sendJson([
            'status' => 'OK',
            'message' => 'Registrasi guru berhasil. Akun menunggu persetujuan administrator',
            'requires_approval' => true,
            'user' => $user,
        ], 201);
    }

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
    $requestedRole = trim((string) ($input['role'] ?? ''));

    if ($email === '' || $password === '') {
        sendJson(['status' => 'ERROR', 'message' => 'Email dan kata sandi wajib diisi'], 422);
    }

    $stmt = $pdo->prepare(
        'SELECT password_hash, ' . AUTH_USER_SELECT_COLUMNS . ' FROM users WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $userRow = $stmt->fetch();

    if (!$userRow || !password_verify($password, (string) $userRow['password_hash'])) {
        sendJson(['status' => 'ERROR', 'message' => 'Email atau kata sandi salah'], 401);
    }

    if ($requestedRole !== '' && $userRow['role'] !== $requestedRole) {
        $roleLabels = [
            'siswa' => 'Siswa',
            'guru' => 'Guru',
            'admin' => 'Administrator',
        ];
        $expectedLabel = $roleLabels[$userRow['role']] ?? $userRow['role'];
        sendJson([
            'status' => 'ERROR',
            'message' => sprintf('Akun ini terdaftar sebagai %s. Silakan masuk melalui tab %s', $expectedLabel, $expectedLabel),
        ], 403);
    }

    $accountStatus = (string) ($userRow['status'] ?? 'active');
    if ($accountStatus === 'pending') {
        sendJson([
            'status' => 'ERROR',
            'message' => 'Akun guru Anda sedang menunggu persetujuan administrator',
        ], 403);
    }

    if ($accountStatus === 'rejected') {
        $reason = trim((string) ($userRow['reject_reason'] ?? ''));
        $message = $reason !== ''
            ? 'Akun guru Anda belum disetujui. Alasan: ' . $reason
            : 'Akun guru Anda belum disetujui oleh administrator';
        sendJson(['status' => 'ERROR', 'message' => $message], 403);
    }

    $onlineStmt = $pdo->prepare(
        'UPDATE users SET is_online = 1, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    $onlineStmt->execute([(int) $userRow['id']]);

    $userRow['is_online'] = 1;
    $userRow['last_seen_at'] = date('Y-m-d H:i:s');
    unset($userRow['password_hash']);

    $user = formatAuthUser($userRow);

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

    $stmt = $pdo->prepare('SELECT ' . AUTH_USER_SELECT_COLUMNS . ' FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $auth['sub']]);
    $userRow = $stmt->fetch();

    if (!$userRow) {
        sendJson(['status' => 'ERROR', 'message' => 'Pengguna tidak ditemukan'], 404);
    }

    sendJson([
        'status' => 'OK',
        'user' => formatAuthUser($userRow),
    ]);
}

function handlePresence(PDO $pdo): void
{
    $auth = requireAuth();
    $input = getJsonInput();
    $isOnline = isset($input['online']) ? (bool) $input['online'] : true;

    $stmt = $pdo->prepare(
        'UPDATE users SET is_online = ?, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    $stmt->execute([$isOnline ? 1 : 0, (int) $auth['sub']]);

    sendJson([
        'status' => 'OK',
        'message' => 'Status kehadiran berhasil diperbarui',
        'is_online' => $isOnline,
    ]);
}

function handleLogout(PDO $pdo): void
{
    $auth = requireAuth();

    $stmt = $pdo->prepare(
        'UPDATE users SET is_online = 0, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    $stmt->execute([(int) $auth['sub']]);

    sendJson([
        'status' => 'OK',
        'message' => 'Logout berhasil',
    ]);
}
