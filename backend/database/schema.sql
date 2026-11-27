CREATE DATABASE IF NOT EXISTS sahabat_digital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sahabat_digital;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('siswa', 'guru', 'admin') NOT NULL DEFAULT 'siswa',
  status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'active',
  reject_reason VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  is_online TINYINT(1) NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMP NULL DEFAULT NULL,
  kelas TINYINT UNSIGNED DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  frame_color VARCHAR(20) NOT NULL DEFAULT '#00B5D8',
  nip VARCHAR(30) DEFAULT NULL,
  subject VARCHAR(100) DEFAULT NULL,
  color_theme VARCHAR(20) NOT NULL DEFAULT '#2B569A',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_rooms (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  teacher_id INT UNSIGNED NOT NULL,
  status ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  theme VARCHAR(30) NOT NULL DEFAULT 'default',
  is_important TINYINT(1) NOT NULL DEFAULT 0,
  hidden_by_teacher TINYINT(1) NOT NULL DEFAULT 0,
  hidden_by_student TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_teacher (student_id, teacher_id),
  INDEX idx_chat_rooms_teacher_updated (teacher_id, updated_at),
  INDEX idx_chat_rooms_student_updated (student_id, updated_at),
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
  hidden_by_teacher TINYINT(1) NOT NULL DEFAULT 0,
  hidden_by_student TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_room_created (room_id, created_at),
  INDEX idx_messages_room_id (room_id, id),
  CONSTRAINT fk_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  room_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type ENUM('chat', 'material', 'system') NOT NULL DEFAULT 'chat',
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
