-- ============================================================================
-- Migrasi Tahap 2 - Sahabat Digital (MySQL 8.x / HeidiSQL)
-- Jalankan pada database sahabat_digital yang sudah dibuat dari schema.sql Tahap 1.
-- Aman dijalankan tanpa perintah destruktif (tidak ada DROP DATABASE / DROP TABLE).
-- ============================================================================

USE sahabat_digital;

-- 1. Pastikan seluruh tabel dasar sudah tersedia
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('siswa', 'guru', 'admin') NOT NULL DEFAULT 'siswa',
  avatar_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  teacher_id INT UNSIGNED NOT NULL,
  status ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_teacher (student_id, teacher_id),
  CONSTRAINT fk_chat_rooms_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  content TEXT DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_room_created (room_id, created_at),
  CONSTRAINT fk_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  room_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_scores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  module_slug VARCHAR(100) NOT NULL DEFAULT 'cyberbullying-dasar',
  score TINYINT UNSIGNED NOT NULL,
  total_questions TINYINT UNSIGNED NOT NULL DEFAULT 10,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quiz_scores_student (student_id, module_slug),
  CONSTRAINT fk_quiz_scores_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Tambahan kolom profil, status persetujuan guru, dan kehadiran pada tabel users
ALTER TABLE users
  ADD COLUMN status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'active' AFTER role,
  ADD COLUMN reject_reason VARCHAR(255) DEFAULT NULL AFTER status,
  ADD COLUMN is_online TINYINT(1) NOT NULL DEFAULT 0 AFTER avatar_url,
  ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT NULL AFTER is_online,
  ADD COLUMN kelas TINYINT UNSIGNED DEFAULT NULL AFTER last_seen_at,
  ADD COLUMN gender VARCHAR(20) DEFAULT NULL AFTER kelas,
  ADD COLUMN frame_color VARCHAR(20) NOT NULL DEFAULT '#00B5D8' AFTER gender,
  ADD COLUMN nip VARCHAR(30) DEFAULT NULL AFTER frame_color,
  ADD COLUMN subject VARCHAR(100) DEFAULT NULL AFTER nip,
  ADD COLUMN color_theme VARCHAR(20) NOT NULL DEFAULT '#2B569A' AFTER subject,
  ADD INDEX idx_users_role_status (role, status);

-- 3. Tambahan kolom tema, tanda penting, dan sembunyikan per sisi pada tabel chat_rooms
ALTER TABLE chat_rooms
  ADD COLUMN theme VARCHAR(30) NOT NULL DEFAULT 'default' AFTER status,
  ADD COLUMN is_important TINYINT(1) NOT NULL DEFAULT 0 AFTER theme,
  ADD COLUMN hidden_by_teacher TINYINT(1) NOT NULL DEFAULT 0 AFTER is_important,
  ADD COLUMN hidden_by_student TINYINT(1) NOT NULL DEFAULT 0 AFTER hidden_by_teacher,
  ADD INDEX idx_chat_rooms_teacher_updated (teacher_id, updated_at),
  ADD INDEX idx_chat_rooms_student_updated (student_id, updated_at);

-- 4. Penyesuaian kolom pesan teks (boleh NULL untuk pesan gambar saja), sembunyikan per sisi,
--    dan indeks komposit (room_id, id) untuk HTTP polling after_id
ALTER TABLE messages
  MODIFY COLUMN content TEXT DEFAULT NULL,
  ADD COLUMN hidden_by_teacher TINYINT(1) NOT NULL DEFAULT 0 AFTER is_read,
  ADD COLUMN hidden_by_student TINYINT(1) NOT NULL DEFAULT 0 AFTER hidden_by_teacher,
  ADD INDEX idx_messages_room_id (room_id, id);

-- 5. Tambahan kolom tipe notifikasi pada tabel notifications
ALTER TABLE notifications
  ADD COLUMN type ENUM('chat', 'material', 'system') NOT NULL DEFAULT 'chat' AFTER body;

-- 6. Tambahan nilai default untuk module_slug dan total_questions pada tabel quiz_scores
ALTER TABLE quiz_scores
  MODIFY COLUMN module_slug VARCHAR(100) NOT NULL DEFAULT 'cyberbullying-dasar',
  MODIFY COLUMN total_questions TINYINT UNSIGNED NOT NULL DEFAULT 10;
