export type UserRole = 'siswa' | 'guru' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  student_id: number;
  teacher_id: number;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  room_id: number | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface QuizScore {
  id: number;
  student_id: number;
  module_slug: string;
  score: number;
  total_questions: number;
  completed_at: string;
}