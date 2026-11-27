<?php

declare(strict_types=1);

const UPLOAD_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const UPLOAD_ALLOWED_MIMES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

function getUploadsRootPath(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
}

function buildUploadFullUrl(?string $relativePath): ?string
{
    if ($relativePath === null || trim($relativePath) === '') {
        return null;
    }

    if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
        return $relativePath;
    }

    $cleanPath = ltrim(str_replace('\\', '/', $relativePath), '/');

    if (!empty($_ENV['APP_URL'])) {
        return rtrim((string) $_ENV['APP_URL'], '/') . '/' . $cleanPath;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');

    // Hapus segmen /routes/nama_file.php atau /index.php untuk memperoleh URL dasar folder backend
    $backendBase = preg_replace('#/(routes/[^/]+|index\.php)$#', '', $scriptName);
    $backendBase = rtrim((string) $backendBase, '/');

    return sprintf('%s://%s%s/%s', $scheme, $host, $backendBase, $cleanPath);
}

function saveUploadedImage(
    string $fieldName,
    string $subdir,
    string $prefix,
    int $ownerId
): array {
    if (!isset($_FILES[$fieldName]) || !is_array($_FILES[$fieldName])) {
        sendJson(['status' => 'ERROR', 'message' => 'File gambar wajib diunggah'], 422);
    }

    $file = $_FILES[$fieldName];
    $errorCode = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($errorCode !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Ukuran file melebihi batas konfigurasi server (maksimal 2 MB)',
            UPLOAD_ERR_FORM_SIZE => 'Ukuran file melebihi batas maksimal 2 MB',
            UPLOAD_ERR_PARTIAL => 'File hanya terunggah sebagian, silakan coba lagi',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file gambar yang dipilih',
            UPLOAD_ERR_NO_TMP_DIR => 'Direktori sementara server tidak tersedia',
            UPLOAD_ERR_CANT_WRITE => 'Server gagal menulis file ke penyimpanan',
            UPLOAD_ERR_EXTENSION => 'Unggahan file dihentikan oleh ekstensi server',
        ];

        $message = $errorMessages[$errorCode] ?? 'Gagal mengunggah file gambar';
        $statusCode = in_array($errorCode, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 413 : 422;
        sendJson(['status' => 'ERROR', 'message' => $message], $statusCode);
    }

    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0) {
        sendJson(['status' => 'ERROR', 'message' => 'File gambar tidak boleh kosong'], 422);
    }

    if ($size > UPLOAD_MAX_BYTES) {
        sendJson(['status' => 'ERROR', 'message' => 'Ukuran gambar maksimal 2 MB'], 413);
    }

    $tmpPath = (string) ($file['tmp_name'] ?? '');
    if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
        sendJson(['status' => 'ERROR', 'message' => 'Sumber file unggahan tidak valid'], 400);
    }

    // Validasi isi biner gambar secara nyata menggunakan getimagesize()
    $imageInfo = @getimagesize($tmpPath);
    if ($imageInfo === false || empty($imageInfo['mime'])) {
        sendJson(['status' => 'ERROR', 'message' => 'File yang diunggah bukan gambar yang valid'], 422);
    }

    $width = (int) ($imageInfo[0] ?? 0);
    $height = (int) ($imageInfo[1] ?? 0);
    $mime = strtolower((string) $imageInfo['mime']);

    if ($width <= 0 || $height <= 0 || !array_key_exists($mime, UPLOAD_ALLOWED_MIMES)) {
        sendJson([
            'status' => 'ERROR',
            'message' => 'Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF',
        ], 422);
    }

    $safeSubdir = preg_replace('/[^a-z0-9_-]/i', '', $subdir) ?: 'media';
    $safePrefix = preg_replace('/[^a-z0-9_-]/i', '', $prefix) ?: 'img';
    $extension = UPLOAD_ALLOWED_MIMES[$mime];

    $targetDir = getUploadsRootPath() . DIRECTORY_SEPARATOR . $safeSubdir;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
        sendJson(['status' => 'ERROR', 'message' => 'Gagal menyiapkan direktori unggahan'], 500);
    }

    $randomSuffix = bin2hex(random_bytes(8));
    $filename = sprintf('%s_%d_%s_%s.%s', $safePrefix, $ownerId, date('YmdHis'), $randomSuffix, $extension);
    $destinationPath = $targetDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($tmpPath, $destinationPath)) {
        sendJson(['status' => 'ERROR', 'message' => 'Gagal menyimpan file gambar ke server'], 500);
    }

    $relativePath = 'uploads/' . $safeSubdir . '/' . $filename;

    return [
        'relative_path' => $relativePath,
        'full_url' => buildUploadFullUrl($relativePath),
        'filename' => $filename,
        'mime' => $mime,
        'size' => $size,
        'width' => $width,
        'height' => $height,
    ];
}

function deleteUploadedImage(?string $relativePath): void
{
    if ($relativePath === null || trim($relativePath) === '') {
        return;
    }

    $normalized = ltrim(str_replace('\\', '/', trim($relativePath)), '/');
    if (!str_starts_with($normalized, 'uploads/')) {
        return;
    }

    $uploadsRoot = realpath(getUploadsRootPath());
    if ($uploadsRoot === false) {
        return;
    }

    $fullPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    $resolvedFile = realpath($fullPath);

    if ($resolvedFile === false || !is_file($resolvedFile)) {
        return;
    }

    // Pastikan file benar-benar berada di dalam folder backend/uploads/
    if (!str_starts_with($resolvedFile, $uploadsRoot . DIRECTORY_SEPARATOR)) {
        return;
    }

    @unlink($resolvedFile);
}
