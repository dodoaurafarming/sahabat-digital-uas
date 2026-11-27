<?php

declare(strict_types=1);

const USER_PROFILE_COLUMNS = 'id, name, email, role, status, reject_reason, avatar_url, is_online, last_seen_at, kelas, gender, frame_color, nip, subject, color_theme, created_at, updated_at';

function formatUserProfile(array $row): array
{
    $avatarUrl = $row['avatar_url'] ?? null;

    return [
        'id' => (int) $row['id'],
        'name' => (string) $row['name'],
        'email' => (string) $row['email'],
        'role' => (string) $row['role'],
        'status' => (string) ($row['status'] ?? 'active'),
        'reject_reason' => $row['reject_reason'] ?? null,
        'avatar_url' => $avatarUrl,
        'avatar_full_url' => buildUploadFullUrl($avatarUrl),
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

function handleGetProfile(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];

    $stmt = $pdo->prepare('SELECT ' . USER_PROFILE_COLUMNS . ' FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if (!$row) {
        sendJson(['status' => 'ERROR', 'message' => 'Pengguna tidak ditemukan'], 404);
    }

    $response = [
        'status' => 'OK',
        'user' => formatUserProfile($row),
    ];

    if ($row['role'] === 'siswa') {
        $quizStmt = $pdo->prepare(
            'SELECT COUNT(*) AS total_attempts,
                    COALESCE(ROUND(AVG(score), 1), 0) AS average_score,
                    COALESCE(MAX(score), 0) AS best_score
             FROM quiz_scores
             WHERE student_id = ?'
        );
        $quizStmt->execute([$userId]);
        $quizStats = $quizStmt->fetch();

        $response['quiz_summary'] = [
            'total_attempts' => (int) ($quizStats['total_attempts'] ?? 0),
            'average_score' => (float) ($quizStats['average_score'] ?? 0),
            'best_score' => (int) ($quizStats['best_score'] ?? 0),
        ];
    }

    sendJson($response);
}

function handleUpdateProfile(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];
    $userRole = (string) ($auth['role'] ?? '');
    $input = getJsonInput();

    $setClauses = [];
    $params = [];

    if (array_key_exists('name', $input)) {
        $name = trim((string) $input['name']);
        if ($name === '' || mb_strlen($name) > 100) {
            sendJson(['status' => 'ERROR', 'message' => 'Nama wajib diisi (maksimal 100 karakter)'], 422);
        }
        $setClauses[] = 'name = ?';
        $params[] = $name;
    }

    if (array_key_exists('password', $input) && trim((string) $input['password']) !== '') {
        $password = (string) $input['password'];
        if (strlen($password) < 6) {
            sendJson(['status' => 'ERROR', 'message' => 'Kata sandi baru minimal 6 karakter'], 422);
        }
        $setClauses[] = 'password_hash = ?';
        $params[] = password_hash($password, PASSWORD_BCRYPT);
    }

    $frameColorInput = $input['frame_color'] ?? $input['frameColor'] ?? null;
    if ($frameColorInput !== null && trim((string) $frameColorInput) !== '') {
        $frameColor = trim((string) $frameColorInput);
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $frameColor)) {
            sendJson(['status' => 'ERROR', 'message' => 'Format warna bingkai harus kode hex valid (#RRGGBB)'], 422);
        }
        $setClauses[] = 'frame_color = ?';
        $params[] = strtoupper($frameColor);
    }

    $colorThemeInput = $input['color_theme'] ?? $input['colorTheme'] ?? null;
    if ($colorThemeInput !== null && trim((string) $colorThemeInput) !== '') {
        $colorTheme = trim((string) $colorThemeInput);
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $colorTheme)) {
            sendJson(['status' => 'ERROR', 'message' => 'Format warna tema harus kode hex valid (#RRGGBB)'], 422);
        }
        $setClauses[] = 'color_theme = ?';
        $params[] = strtoupper($colorTheme);
    }

    if ($userRole === 'siswa') {
        if (array_key_exists('kelas', $input) && $input['kelas'] !== '' && $input['kelas'] !== null) {
            $kelas = (int) $input['kelas'];
            if ($kelas < 1 || $kelas > 6) {
                sendJson(['status' => 'ERROR', 'message' => 'Kelas siswa harus berada di antara 1 sampai 6'], 422);
            }
            $setClauses[] = 'kelas = ?';
            $params[] = $kelas;
        }

        if (array_key_exists('gender', $input) && trim((string) $input['gender']) !== '') {
            $gender = trim((string) $input['gender']);
            if (!in_array($gender, ['Laki-laki', 'Perempuan'], true)) {
                sendJson(['status' => 'ERROR', 'message' => 'Gender hanya mendukung Laki-laki atau Perempuan'], 422);
            }
            $setClauses[] = 'gender = ?';
            $params[] = $gender;
        }
    }

    if ($userRole === 'guru') {
        if (array_key_exists('nip', $input) && trim((string) $input['nip']) !== '') {
            $nip = trim((string) $input['nip']);
            if (!preg_match('/^[0-9]{8,18}$/', $nip)) {
                sendJson(['status' => 'ERROR', 'message' => 'NIP guru harus berupa angka 8 sampai 18 digit'], 422);
            }
            $setClauses[] = 'nip = ?';
            $params[] = $nip;
        }

        if (array_key_exists('subject', $input)) {
            $subject = trim((string) $input['subject']);
            $setClauses[] = 'subject = ?';
            $params[] = $subject !== '' ? mb_substr($subject, 0, 100) : null;
        }
    }

    if (empty($setClauses)) {
        sendJson(['status' => 'ERROR', 'message' => 'Tidak ada data profil yang diubah'], 422);
    }

    $params[] = $userId;
    $sql = 'UPDATE users SET ' . implode(', ', $setClauses) . ' WHERE id = ?';
    $updateStmt = $pdo->prepare($sql);
    $updateStmt->execute($params);

    $stmt = $pdo->prepare('SELECT ' . USER_PROFILE_COLUMNS . ' FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $updatedRow = $stmt->fetch();

    sendJson([
        'status' => 'OK',
        'message' => 'Profil berhasil diperbarui',
        'user' => formatUserProfile($updatedRow),
    ]);
}

function handleUploadAvatar(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];

    $currentStmt = $pdo->prepare('SELECT id, avatar_url FROM users WHERE id = ? LIMIT 1');
    $currentStmt->execute([$userId]);
    $currentUser = $currentStmt->fetch();

    if (!$currentUser) {
        sendJson(['status' => 'ERROR', 'message' => 'Pengguna tidak ditemukan'], 404);
    }

    $fieldName = isset($_FILES['avatar']) ? 'avatar' : 'file';
    $uploaded = saveUploadedImage($fieldName, 'avatars', 'avatar', $userId);

    $updateStmt = $pdo->prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
    $updateStmt->execute([$uploaded['relative_path'], $userId]);

    if (!empty($currentUser['avatar_url'])) {
        deleteUploadedImage((string) $currentUser['avatar_url']);
    }

    $userStmt = $pdo->prepare('SELECT ' . USER_PROFILE_COLUMNS . ' FROM users WHERE id = ? LIMIT 1');
    $userStmt->execute([$userId]);
    $updatedUser = $userStmt->fetch();

    sendJson([
        'status' => 'OK',
        'message' => 'Avatar berhasil diperbarui',
        'avatar_url' => $uploaded['relative_path'],
        'avatar_full_url' => $uploaded['full_url'],
        'user' => formatUserProfile($updatedUser),
    ]);
}

function handleGetTeachers(PDO $pdo): void
{
    requireAuth();

    $stmt = $pdo->prepare(
        "SELECT id, name, email, subject, is_online, last_seen_at, avatar_url, color_theme
         FROM users
         WHERE role = 'guru' AND status = 'active'
         ORDER BY is_online DESC, name ASC"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $teachers = array_map(static function (array $row): array {
        $avatarUrl = $row['avatar_url'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'subject' => $row['subject'] ?? null,
            'is_online' => (bool) $row['is_online'],
            'last_seen_at' => $row['last_seen_at'] ?? null,
            'avatar_url' => $avatarUrl,
            'avatar_full_url' => buildUploadFullUrl($avatarUrl),
            'color_theme' => (string) ($row['color_theme'] ?? '#2B569A'),
        ];
    }, $rows);

    sendJson([
        'status' => 'OK',
        'total' => count($teachers),
        'teachers' => $teachers,
    ]);
}

function handleGetStudents(PDO $pdo): void
{
    requireAuth(['guru', 'admin']);

    $whereClauses = ["role = 'siswa'", "status = 'active'"];
    $params = [];

    if (isset($_GET['kelas']) && $_GET['kelas'] !== '') {
        $kelas = (int) $_GET['kelas'];
        if ($kelas >= 1 && $kelas <= 6) {
            $whereClauses[] = 'kelas = ?';
            $params[] = $kelas;
        }
    }

    if (isset($_GET['search']) && trim((string) $_GET['search']) !== '') {
        $keyword = '%' . trim((string) $_GET['search']) . '%';
        $whereClauses[] = '(name LIKE ? OR email LIKE ?)';
        $params[] = $keyword;
        $params[] = $keyword;
    }

    $sql = 'SELECT id, name, email, kelas, gender, is_online, last_seen_at, avatar_url, frame_color, created_at
            FROM users
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY kelas ASC, name ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $students = array_map(static function (array $row): array {
        $avatarUrl = $row['avatar_url'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'kelas' => $row['kelas'] !== null ? (int) $row['kelas'] : null,
            'gender' => $row['gender'] ?? null,
            'is_online' => (bool) $row['is_online'],
            'last_seen_at' => $row['last_seen_at'] ?? null,
            'avatar_url' => $avatarUrl,
            'avatar_full_url' => buildUploadFullUrl($avatarUrl),
            'frame_color' => (string) ($row['frame_color'] ?? '#00B5D8'),
            'created_at' => (string) $row['created_at'],
        ];
    }, $rows);

    sendJson([
        'status' => 'OK',
        'total' => count($students),
        'students' => $students,
    ]);
}
