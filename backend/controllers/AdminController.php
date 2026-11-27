<?php

declare(strict_types=1);

function formatAdminTeacherRow(array $row): array
{
    $avatarUrl = $row['avatar_url'] ?? null;

    return [
        'id' => (int) $row['id'],
        'name' => (string) $row['name'],
        'email' => (string) $row['email'],
        'role' => (string) $row['role'],
        'status' => (string) $row['status'],
        'reject_reason' => $row['reject_reason'] ?? null,
        'nip' => $row['nip'] ?? null,
        'subject' => $row['subject'] ?? null,
        'avatar_url' => $avatarUrl,
        'avatar_full_url' => buildUploadFullUrl($avatarUrl),
        'is_online' => (bool) ($row['is_online'] ?? false),
        'created_at' => (string) $row['created_at'],
    ];
}

function handleGetPendingTeachers(PDO $pdo): void
{
    requireAuth(['admin']);

    $stmt = $pdo->prepare(
        "SELECT id, name, email, role, status, reject_reason, nip, subject, avatar_url, is_online, created_at
         FROM users
         WHERE role = 'guru' AND status = 'pending'
         ORDER BY created_at DESC, id DESC"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();

    sendJson([
        'status' => 'OK',
        'total' => count($rows),
        'teachers' => array_map('formatAdminTeacherRow', $rows),
    ]);
}

function handleGetAllTeachersAdmin(PDO $pdo): void
{
    requireAuth(['admin']);

    $statusFilter = trim((string) ($_GET['status'] ?? ''));
    $whereClauses = ["role = 'guru'"];
    $params = [];

    if ($statusFilter !== '') {
        if (!in_array($statusFilter, ['pending', 'active', 'rejected'], true)) {
            sendJson(['status' => 'ERROR', 'message' => 'Filter status hanya mendukung pending, active, atau rejected'], 422);
        }
        $whereClauses[] = 'status = ?';
        $params[] = $statusFilter;
    }

    $sql = 'SELECT id, name, email, role, status, reject_reason, nip, subject, avatar_url, is_online, created_at
            FROM users
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY FIELD(status, \'pending\', \'active\', \'rejected\'), created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    sendJson([
        'status' => 'OK',
        'total' => count($rows),
        'teachers' => array_map('formatAdminTeacherRow', $rows),
    ]);
}

function handleApproveTeacher(PDO $pdo): void
{
    requireAuth(['admin']);
    $input = getJsonInput();
    $teacherId = (int) ($_GET['id'] ?? $_GET['teacher_id'] ?? $input['teacher_id'] ?? $input['id'] ?? 0);

    if ($teacherId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID guru (teacher_id) wajib diisi dengan angka valid'], 422);
    }

    $checkStmt = $pdo->prepare(
        "SELECT id, name, email, status FROM users WHERE id = ? AND role = 'guru' LIMIT 1"
    );
    $checkStmt->execute([$teacherId]);
    $teacher = $checkStmt->fetch();

    if (!$teacher) {
        sendJson(['status' => 'ERROR', 'message' => 'Akun guru tidak ditemukan'], 404);
    }

    $updateStmt = $pdo->prepare(
        "UPDATE users SET status = 'active', reject_reason = NULL WHERE id = ?"
    );
    $updateStmt->execute([$teacherId]);

    createNotification(
        $pdo,
        $teacherId,
        'Akun guru Anda telah disetujui',
        'Selamat datang di Sahabat Digital. Akun guru Anda sudah aktif dan siap digunakan.',
        'system',
        null
    );

    sendJson([
        'status' => 'OK',
        'message' => 'Akun guru berhasil disetujui',
        'teacher' => [
            'id' => (int) $teacher['id'],
            'name' => (string) $teacher['name'],
            'email' => (string) $teacher['email'],
            'status' => 'active',
        ],
    ]);
}

function handleRejectTeacher(PDO $pdo): void
{
    requireAuth(['admin']);
    $input = getJsonInput();
    $teacherId = (int) ($_GET['id'] ?? $_GET['teacher_id'] ?? $input['teacher_id'] ?? $input['id'] ?? 0);

    if ($teacherId <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'ID guru (teacher_id) wajib diisi dengan angka valid'], 422);
    }

    $reason = trim((string) ($input['reason'] ?? ''));
    if ($reason === '') {
        $reason = 'Verifikasi identitas guru tidak berhasil.';
    }
    $reason = mb_substr($reason, 0, 255);

    $checkStmt = $pdo->prepare(
        "SELECT id, name, email, status FROM users WHERE id = ? AND role = 'guru' LIMIT 1"
    );
    $checkStmt->execute([$teacherId]);
    $teacher = $checkStmt->fetch();

    if (!$teacher) {
        sendJson(['status' => 'ERROR', 'message' => 'Akun guru tidak ditemukan'], 404);
    }

    $updateStmt = $pdo->prepare(
        "UPDATE users SET status = 'rejected', reject_reason = ? WHERE id = ?"
    );
    $updateStmt->execute([$reason, $teacherId]);

    createNotification(
        $pdo,
        $teacherId,
        'Pendaftaran akun guru ditolak',
        'Alasan: ' . $reason,
        'system',
        null
    );

    sendJson([
        'status' => 'OK',
        'message' => 'Akun guru berhasil ditolak',
        'teacher' => [
            'id' => (int) $teacher['id'],
            'name' => (string) $teacher['name'],
            'email' => (string) $teacher['email'],
            'status' => 'rejected',
            'reject_reason' => $reason,
        ],
    ]);
}

function handleGetAdminUsers(PDO $pdo): void
{
    requireAuth(['admin']);

    $roleFilter = trim((string) ($_GET['role'] ?? ''));
    $statusFilter = trim((string) ($_GET['status'] ?? ''));

    $whereClauses = ['1 = 1'];
    $params = [];

    if ($roleFilter !== '') {
        if (!in_array($roleFilter, ['siswa', 'guru', 'admin'], true)) {
            sendJson(['status' => 'ERROR', 'message' => 'Filter peran tidak valid'], 422);
        }
        $whereClauses[] = 'role = ?';
        $params[] = $roleFilter;
    }

    if ($statusFilter !== '') {
        if (!in_array($statusFilter, ['pending', 'active', 'rejected'], true)) {
            sendJson(['status' => 'ERROR', 'message' => 'Filter status tidak valid'], 422);
        }
        $whereClauses[] = 'status = ?';
        $params[] = $statusFilter;
    }

    $sql = 'SELECT id, name, email, role, status, reject_reason, avatar_url, is_online,
                   kelas, gender, nip, subject, created_at
            FROM users
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY created_at DESC, id DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $users = array_map(static function (array $row): array {
        $avatarUrl = $row['avatar_url'] ?? null;

        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => (string) $row['email'],
            'role' => (string) $row['role'],
            'status' => (string) $row['status'],
            'reject_reason' => $row['reject_reason'] ?? null,
            'avatar_url' => $avatarUrl,
            'avatar_full_url' => buildUploadFullUrl($avatarUrl),
            'is_online' => (bool) $row['is_online'],
            'kelas' => $row['kelas'] !== null ? (int) $row['kelas'] : null,
            'gender' => $row['gender'] ?? null,
            'nip' => $row['nip'] ?? null,
            'subject' => $row['subject'] ?? null,
            'created_at' => (string) $row['created_at'],
        ];
    }, $rows);

    sendJson([
        'status' => 'OK',
        'total' => count($users),
        'users' => $users,
    ]);
}

function handleGetDashboardStats(PDO $pdo): void
{
    $auth = requireAuth(['admin', 'guru']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];

    $quizStmt = $pdo->query(
        'SELECT COUNT(*) AS total_attempts,
                COUNT(DISTINCT student_id) AS unique_students,
                COALESCE(ROUND(AVG(score), 1), 0) AS average_score
         FROM quiz_scores'
    );
    $quizStats = $quizStmt->fetch() ?: [];

    if ($userRole === 'admin') {
        $userStatsStmt = $pdo->query(
            "SELECT
                SUM(CASE WHEN role = 'siswa' THEN 1 ELSE 0 END) AS total_siswa,
                SUM(CASE WHEN role = 'guru' AND status = 'active' THEN 1 ELSE 0 END) AS guru_active,
                SUM(CASE WHEN role = 'guru' AND status = 'pending' THEN 1 ELSE 0 END) AS guru_pending,
                SUM(CASE WHEN role = 'guru' AND status = 'rejected' THEN 1 ELSE 0 END) AS guru_rejected,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admin
             FROM users"
        );
        $userStats = $userStatsStmt->fetch() ?: [];

        $chatStatsStmt = $pdo->query(
            "SELECT
                COUNT(*) AS total_rooms,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_rooms,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_rooms
             FROM chat_rooms"
        );
        $chatStats = $chatStatsStmt->fetch() ?: [];

        $totalMessages = (int) ($pdo->query('SELECT COUNT(*) FROM messages')->fetchColumn() ?: 0);

        sendJson([
            'status' => 'OK',
            'role' => 'admin',
            'dashboard' => [
                'users' => [
                    'total_siswa' => (int) ($userStats['total_siswa'] ?? 0),
                    'guru_active' => (int) ($userStats['guru_active'] ?? 0),
                    'guru_pending' => (int) ($userStats['guru_pending'] ?? 0),
                    'guru_rejected' => (int) ($userStats['guru_rejected'] ?? 0),
                    'total_admin' => (int) ($userStats['total_admin'] ?? 0),
                ],
                'chats' => [
                    'total_rooms' => (int) ($chatStats['total_rooms'] ?? 0),
                    'active_rooms' => (int) ($chatStats['active_rooms'] ?? 0),
                    'closed_rooms' => (int) ($chatStats['closed_rooms'] ?? 0),
                    'total_messages' => $totalMessages,
                ],
                'quiz' => [
                    'total_attempts' => (int) ($quizStats['total_attempts'] ?? 0),
                    'unique_students' => (int) ($quizStats['unique_students'] ?? 0),
                    'average_score' => (float) ($quizStats['average_score'] ?? 0),
                ],
            ],
        ]);
    }

    // Ringkasan dasbor untuk guru
    $roomStmt = $pdo->prepare(
        "SELECT
            COUNT(*) AS total_rooms,
            SUM(CASE WHEN status = 'active' AND hidden_by_teacher = 0 THEN 1 ELSE 0 END) AS active_rooms,
            SUM(CASE WHEN is_important = 1 AND hidden_by_teacher = 0 THEN 1 ELSE 0 END) AS important_rooms
         FROM chat_rooms
         WHERE teacher_id = ?"
    );
    $roomStmt->execute([$userId]);
    $roomStats = $roomStmt->fetch() ?: [];

    $unreadStmt = $pdo->prepare(
        'SELECT COUNT(*)
         FROM messages m
         INNER JOIN chat_rooms cr ON cr.id = m.room_id
         WHERE cr.teacher_id = ?
           AND cr.hidden_by_teacher = 0
           AND m.sender_id = cr.student_id
           AND m.is_read = 0
           AND m.hidden_by_teacher = 0'
    );
    $unreadStmt->execute([$userId]);
    $unreadMessages = (int) ($unreadStmt->fetchColumn() ?: 0);

    sendJson([
        'status' => 'OK',
        'role' => 'guru',
        'dashboard' => [
            'chats' => [
                'total_rooms' => (int) ($roomStats['total_rooms'] ?? 0),
                'active_rooms' => (int) ($roomStats['active_rooms'] ?? 0),
                'important_rooms' => (int) ($roomStats['important_rooms'] ?? 0),
                'unread_messages' => $unreadMessages,
            ],
            'quiz' => [
                'total_attempts' => (int) ($quizStats['total_attempts'] ?? 0),
                'unique_students' => (int) ($quizStats['unique_students'] ?? 0),
                'average_score' => (float) ($quizStats['average_score'] ?? 0),
            ],
        ],
    ]);
}
