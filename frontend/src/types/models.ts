export type UserRole = 'siswa' | 'guru' | 'admin';

export type AccountStatus = 'pending' | 'active' | 'rejected';

export type SDClass = 1 | 2 | 3 | 4 | 5 | 6;

export type GenderOption = 'Laki-laki' | 'Perempuan';

export type ChatThemeId = 'default' | 'green' | 'pink' | 'purple' | 'orange';

export type ChatRoomStatus = 'active' | 'closed';

export type NotificationType = 'chat' | 'material' | 'system';

export type AppPage =
  | 'home'
  | 'login'
  | 'register'
  | 'profile'
  | 'curhat'
  | 'material'
  | 'quiz-intro'
  | 'quiz'
  | 'reward'
  | 'teacher-inbox'
  | 'chat-room'
  | 'admin-pending'
  | 'admin-login'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  reject_reason?: string | null;
  avatar_url: string | null;
  avatar_full_url?: string | null;
  is_online: boolean;
  last_seen_at?: string | null;
  kelas: SDClass | number | null;
  gender: GenderOption | string | null;
  frame_color: string;
  nip: string | null;
  subject: string | null;
  color_theme: string;
  created_at: string;
}

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  is_online: boolean;
  last_seen_at?: string | null;
  avatar_url: string | null;
  avatar_full_url?: string | null;
  color_theme: string;
}

export interface StudentProfile {
  id: number;
  name: string;
  email: string;
  kelas: number | null;
  gender: string | null;
  is_online: boolean;
  last_seen_at?: string | null;
  avatar_url: string | null;
  avatar_full_url?: string | null;
  frame_color: string;
  created_at: string;
}

export interface PendingTeacher {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  reject_reason?: string | null;
  nip: string | null;
  subject: string | null;
  avatar_url?: string | null;
  avatar_full_url?: string | null;
  is_online?: boolean;
  created_at: string;
}

export interface ChatRoomStudentInfo {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  avatar_full_url?: string | null;
  is_online: boolean;
  kelas: number | null;
  frame_color: string;
}

export interface ChatRoomTeacherInfo {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  avatar_full_url?: string | null;
  is_online: boolean;
  subject: string | null;
  color_theme: string;
}

export interface ChatRoomLastMessage {
  id: number;
  sender_id: number;
  content: string | null;
  image_url: string | null;
  image_full_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  student_id: number;
  teacher_id: number;
  status: ChatRoomStatus;
  theme: ChatThemeId | string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: ChatRoomLastMessage | null;
  student?: ChatRoomStudentInfo;
  teacher?: ChatRoomTeacherInfo;
}

export interface ChatPeerInfo {
  id?: number;
  name?: string;
  role?: UserRole;
  subject?: string | null;
  studentClass?: string;
  kelas?: number | null;
  is_online?: boolean;
  last_seen_at?: string | null;
  color_theme?: string;
  avatar_url?: string | null;
  avatar_full_url?: string | null;
}

export interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name?: string;
  sender_role?: UserRole | string;
  content: string | null;
  image_url: string | null;
  image_full_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PollMessagesResponse {
  status: string;
  room_id: number;
  room_status: ChatRoomStatus;
  room_theme: ChatThemeId | string;
  after_id: number;
  last_id: number;
  has_new: boolean;
  peer: ChatPeerInfo | null;
  messages: Message[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  room_id: number | null;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  status: string;
  after_id: number;
  last_id: number;
  has_new: boolean;
  unread_count: number;
  notifications: NotificationItem[];
}

export interface QuizScore {
  id: number;
  student_id: number;
  module_slug: string;
  score: number;
  total_questions: number;
  percentage?: number;
  completed_at: string;
  student_name?: string;
  student_kelas?: number | null;
}

export interface QuizSummary {
  total_attempts: number;
  average_score: number;
  best_score: number;
  latest_score?: number | null;
}

export interface QuizAggregateSummary {
  overall: {
    total_attempts: number;
    unique_students: number;
    average_score: number;
    average_percentage: number;
  };
  by_module: {
    module_slug: string;
    total_attempts: number;
    unique_students: number;
    average_score: number;
    highest_score: number;
  }[];
  by_student: {
    student_id: number;
    student_name: string;
    student_kelas: number | null;
    total_attempts: number;
    average_score: number;
    best_score: number;
    last_completed_at: string | null;
  }[];
}

export interface UploadedFileMeta {
  filename: string;
  mime: string;
  size: number;
  width: number;
  height: number;
}

export interface AdminDashboardStats {
  users: {
    total_siswa: number;
    guru_active: number;
    guru_pending: number;
    guru_rejected: number;
    total_admin: number;
  };
  chats: {
    total_rooms: number;
    active_rooms: number;
    closed_rooms: number;
    total_messages: number;
  };
  quiz: {
    total_attempts: number;
    unique_students: number;
    average_score: number;
  };
}

export interface TeacherDashboardStats {
  chats: {
    total_rooms: number;
    active_rooms: number;
    important_rooms: number;
    unread_messages: number;
  };
  quiz: {
    total_attempts: number;
    unique_students: number;
    average_score: number;
  };
}
