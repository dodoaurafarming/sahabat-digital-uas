<?php

declare(strict_types=1);

function formatQuizScoreRow(array $row): array
{
    $score = (int) $row['score'];
    $totalQuestions = max(1, (int) $row['total_questions']);

    $formatted = [
        'id' => (int) $row['id'],
        'student_id' => (int) $row['student_id'],
        'module_slug' => (string) $row['module_slug'],
        'score' => $score,
        'total_questions' => $totalQuestions,
        'percentage' => round(($score / $totalQuestions) * 100, 1),
        'completed_at' => (string) $row['completed_at'],
    ];

    if (array_key_exists('student_name', $row)) {
        $formatted['student_name'] = (string) $row['student_name'];
    }
    if (array_key_exists('student_kelas', $row)) {
        $formatted['student_kelas'] = $row['student_kelas'] !== null ? (int) $row['student_kelas'] : null;
    }

    return $formatted;
}

function handleSaveQuizScore(PDO $pdo): void
{
    $auth = requireAuth(['siswa']);
    $studentId = (int) $auth['sub'];
    $input = getJsonInput();

    if (!array_key_exists('score', $input) || !is_numeric($input['score'])) {
        sendJson(['status' => 'ERROR', 'message' => 'Skor (score) wajib diisi dan harus berupa angka'], 422);
    }

    $score = (int) $input['score'];
    $totalInput = $input['total_questions'] ?? $input['totalQuestions'] ?? 10;
    if (!is_numeric($totalInput)) {
        sendJson(['status' => 'ERROR', 'message' => 'Jumlah soal (total_questions) harus berupa angka'], 422);
    }

    $totalQuestions = (int) $totalInput;
    if ($totalQuestions < 1 || $totalQuestions > 255) {
        sendJson(['status' => 'ERROR', 'message' => 'Jumlah soal harus berada di antara 1 sampai 255'], 422);
    }

    if ($score < 0 || $score > $totalQuestions) {
        sendJson([
            'status' => 'ERROR',
            'message' => sprintf('Skor harus berada di antara 0 sampai %d', $totalQuestions),
        ], 422);
    }

    $rawSlug = trim((string) ($input['module_slug'] ?? $input['moduleSlug'] ?? 'cyberbullying-dasar'));
    $moduleSlug = preg_replace('/[^a-z0-9_-]/i', '-', strtolower($rawSlug));
    $moduleSlug = trim((string) $moduleSlug, '-');
    if ($moduleSlug === '') {
        $moduleSlug = 'cyberbullying-dasar';
    }
    $moduleSlug = substr($moduleSlug, 0, 100);

    $insertStmt = $pdo->prepare(
        'INSERT INTO quiz_scores (student_id, module_slug, score, total_questions)
         VALUES (?, ?, ?, ?)'
    );
    $insertStmt->execute([$studentId, $moduleSlug, $score, $totalQuestions]);

    $scoreId = (int) $pdo->lastInsertId();
    $fetchStmt = $pdo->prepare(
        'SELECT id, student_id, module_slug, score, total_questions, completed_at
         FROM quiz_scores
         WHERE id = ?
         LIMIT 1'
    );
    $fetchStmt->execute([$scoreId]);
    $createdRow = $fetchStmt->fetch();

    sendJson([
        'status' => 'OK',
        'message' => 'Skor kuis berhasil disimpan',
        'score' => formatQuizScoreRow($createdRow),
    ], 201);
}

function handleGetQuizScores(PDO $pdo): void
{
    $auth = requireAuth(['siswa', 'guru', 'admin']);
    $userId = (int) $auth['sub'];
    $userRole = (string) $auth['role'];

    $moduleSlug = trim((string) ($_GET['module_slug'] ?? ''));
    $limit = (int) ($_GET['limit'] ?? 50);
    if ($limit < 1) {
        $limit = 50;
    } elseif ($limit > 200) {
        $limit = 200;
    }

    if ($userRole === 'siswa') {
        $whereClauses = ['student_id = ?'];
        $params = [$userId];

        if ($moduleSlug !== '') {
            $whereClauses[] = 'module_slug = ?';
            $params[] = $moduleSlug;
        }

        $sql = 'SELECT id, student_id, module_slug, score, total_questions, completed_at
                FROM quiz_scores
                WHERE ' . implode(' AND ', $whereClauses) . '
                ORDER BY completed_at DESC, id DESC
                LIMIT ?';

        $stmt = $pdo->prepare($sql);
        foreach ($params as $index => $val) {
            $stmt->bindValue($index + 1, $val);
        }
        $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $scores = array_map('formatQuizScoreRow', $rows);

        $summaryStmt = $pdo->prepare(
            'SELECT COUNT(*) AS total_attempts,
                    COALESCE(ROUND(AVG(score), 1), 0) AS average_score,
                    COALESCE(MAX(score), 0) AS best_score
             FROM quiz_scores
             WHERE ' . implode(' AND ', $whereClauses)
        );
        $summaryStmt->execute($params);
        $summaryRow = $summaryStmt->fetch();

        sendJson([
            'status' => 'OK',
            'summary' => [
                'total_attempts' => (int) ($summaryRow['total_attempts'] ?? 0),
                'average_score' => (float) ($summaryRow['average_score'] ?? 0),
                'best_score' => (int) ($summaryRow['best_score'] ?? 0),
                'latest_score' => !empty($scores) ? $scores[0]['score'] : null,
            ],
            'scores' => $scores,
        ]);
    }

    // Peran guru atau admin: dapat melihat seluruh riwayat atau memfilter berdasarkan student_id
    $whereClauses = ['1 = 1'];
    $params = [];

    if (isset($_GET['student_id']) && (int) $_GET['student_id'] > 0) {
        $whereClauses[] = 'q.student_id = ?';
        $params[] = (int) $_GET['student_id'];
    }

    if ($moduleSlug !== '') {
        $whereClauses[] = 'q.module_slug = ?';
        $params[] = $moduleSlug;
    }

    $sql = 'SELECT q.id, q.student_id, q.module_slug, q.score, q.total_questions, q.completed_at,
                   u.name AS student_name, u.kelas AS student_kelas
            FROM quiz_scores q
            INNER JOIN users u ON u.id = q.student_id
            WHERE ' . implode(' AND ', $whereClauses) . '
            ORDER BY q.completed_at DESC, q.id DESC
            LIMIT ?';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $index => $val) {
        $stmt->bindValue($index + 1, $val);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    sendJson([
        'status' => 'OK',
        'total' => count($rows),
        'scores' => array_map('formatQuizScoreRow', $rows),
    ]);
}

function handleGetQuizSummary(PDO $pdo): void
{
    requireAuth(['guru', 'admin']);

    $overallStmt = $pdo->query(
        'SELECT COUNT(*) AS total_attempts,
                COUNT(DISTINCT student_id) AS unique_students,
                COALESCE(ROUND(AVG(score), 1), 0) AS average_score,
                COALESCE(ROUND(AVG((score / NULLIF(total_questions, 0)) * 100), 1), 0) AS average_percentage
         FROM quiz_scores'
    );
    $overall = $overallStmt->fetch() ?: [];

    $moduleStmt = $pdo->query(
        'SELECT module_slug,
                COUNT(*) AS total_attempts,
                COUNT(DISTINCT student_id) AS unique_students,
                COALESCE(ROUND(AVG(score), 1), 0) AS average_score,
                COALESCE(MAX(score), 0) AS highest_score
         FROM quiz_scores
         GROUP BY module_slug
         ORDER BY total_attempts DESC'
    );
    $byModule = array_map(static function (array $row): array {
        return [
            'module_slug' => (string) $row['module_slug'],
            'total_attempts' => (int) $row['total_attempts'],
            'unique_students' => (int) $row['unique_students'],
            'average_score' => (float) $row['average_score'],
            'highest_score' => (int) $row['highest_score'],
        ];
    }, $moduleStmt->fetchAll());

    $studentStmt = $pdo->query(
        'SELECT u.id AS student_id,
                u.name AS student_name,
                u.kelas AS student_kelas,
                COUNT(q.id) AS total_attempts,
                COALESCE(ROUND(AVG(q.score), 1), 0) AS average_score,
                COALESCE(MAX(q.score), 0) AS best_score,
                MAX(q.completed_at) AS last_completed_at
         FROM quiz_scores q
         INNER JOIN users u ON u.id = q.student_id
         GROUP BY u.id, u.name, u.kelas
         ORDER BY best_score DESC, average_score DESC'
    );
    $byStudent = array_map(static function (array $row): array {
        return [
            'student_id' => (int) $row['student_id'],
            'student_name' => (string) $row['student_name'],
            'student_kelas' => $row['student_kelas'] !== null ? (int) $row['student_kelas'] : null,
            'total_attempts' => (int) $row['total_attempts'],
            'average_score' => (float) $row['average_score'],
            'best_score' => (int) $row['best_score'],
            'last_completed_at' => $row['last_completed_at'] ?? null,
        ];
    }, $studentStmt->fetchAll());

    sendJson([
        'status' => 'OK',
        'overall' => [
            'total_attempts' => (int) ($overall['total_attempts'] ?? 0),
            'unique_students' => (int) ($overall['unique_students'] ?? 0),
            'average_score' => (float) ($overall['average_score'] ?? 0),
            'average_percentage' => (float) ($overall['average_percentage'] ?? 0),
        ],
        'by_module' => $byModule,
        'by_student' => $byStudent,
    ]);
}
