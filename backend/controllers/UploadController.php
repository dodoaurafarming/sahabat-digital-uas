<?php

declare(strict_types=1);

function handleUploadAvatarEndpoint(PDO $pdo): void
{
    $auth = requireAuth();
    $userId = (int) $auth['sub'];

    $stmt = $pdo->prepare('SELECT id, avatar_url FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(['status' => 'ERROR', 'message' => 'Pengguna tidak ditemukan'], 404);
    }

    $fieldName = isset($_FILES['avatar']) ? 'avatar' : 'file';
    $uploaded = saveUploadedImage($fieldName, 'avatars', 'avatar', $userId);

    $updateStmt = $pdo->prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
    $updateStmt->execute([$uploaded['relative_path'], $userId]);

    if (!empty($user['avatar_url'])) {
        deleteUploadedImage((string) $user['avatar_url']);
    }

    sendJson([
        'status' => 'OK',
        'message' => 'Avatar berhasil diunggah',
        'avatar_url' => $uploaded['relative_path'],
        'full_url' => $uploaded['full_url'],
        'file' => [
            'filename' => $uploaded['filename'],
            'mime' => $uploaded['mime'],
            'size' => $uploaded['size'],
            'width' => $uploaded['width'],
            'height' => $uploaded['height'],
        ],
    ], 201);
}

function handleUploadMediaEndpoint(): void
{
    $auth = requireAuth(['siswa', 'guru', 'admin']);
    $userId = (int) $auth['sub'];

    $fieldName = isset($_FILES['image']) ? 'image' : 'file';
    $uploaded = saveUploadedImage($fieldName, 'chat', 'media', $userId);

    sendJson([
        'status' => 'OK',
        'message' => 'Gambar media berhasil diunggah',
        'image_url' => $uploaded['relative_path'],
        'full_url' => $uploaded['full_url'],
        'file' => [
            'filename' => $uploaded['filename'],
            'mime' => $uploaded['mime'],
            'size' => $uploaded['size'],
            'width' => $uploaded['width'],
            'height' => $uploaded['height'],
        ],
    ], 201);
}
