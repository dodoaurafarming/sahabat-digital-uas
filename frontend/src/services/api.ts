import type {
  AccountStatus,
  AdminDashboardStats,
  ChatRoom,
  ChatRoomStatus,
  ChatThemeId,
  Message,
  NotificationListResponse,
  PendingTeacher,
  PollMessagesResponse,
  QuizAggregateSummary,
  QuizScore,
  QuizSummary,
  StudentProfile,
  TeacherDashboardStats,
  TeacherProfile,
  UploadedFileMeta,
  User,
  UserRole,
} from '../types/models';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost/sahabat-digital-uas/backend'
).replace(/\/+$/, '');

export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function saveAuthSession(token: string, user: User): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (trimmed === '') return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalized}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown> | FormData;
    auth?: boolean;
    keepalive?: boolean;
    signal?: AbortSignal;
    suppressUnauthorized?: boolean;
  } = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    keepalive = false,
    signal,
    suppressUnauthorized = false,
  } = options;

  const headers: Record<string, string> = {};
  let sentToken = false;

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      sentToken = true;
    }
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    method,
    headers,
    body: requestBody,
    keepalive,
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    if (response.status === 401 && sentToken && !suppressUnauthorized) {
      clearAuthSession();
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    const message =
      typeof payload.message === 'string' && payload.message.trim() !== ''
        ? payload.message
        : `Permintaan gagal (HTTP ${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export async function checkApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/index.php', {
    method: 'GET',
    auth: false,
  });
}

export function sendPresenceBeacon(online: boolean): void {
  const token = getAuthToken();
  if (!token) return;

  fetch(`${API_BASE_URL}/routes/auth.php?action=presence`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ online }),
    keepalive: true,
  }).catch(() => {});
}

// ============================================================================
// 1. Modul Autentikasi — routes/auth.php
// ============================================================================
export const authApi = {
  register(payload: {
    name: string;
    email: string;
    password: string;
    role: 'siswa' | 'guru';
    kelas?: number;
    gender?: string;
    nip?: string;
    subject?: string;
  }) {
    return apiRequest<{
      status: string;
      message: string;
      token?: string;
      requires_approval?: boolean;
      user: User;
    }>('/routes/auth.php?action=register', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },

  login(payload: { email: string; password: string; role?: UserRole }) {
    return apiRequest<{
      status: string;
      message: string;
      token: string;
      user: User;
    }>('/routes/auth.php?action=login', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },

  me(signal?: AbortSignal) {
    return apiRequest<{ status: string; user: User }>(
      '/routes/auth.php?action=me',
      { method: 'GET', signal },
    );
  },

  presence(online: boolean) {
    return apiRequest<{
      status: string;
      message: string;
      is_online: boolean;
    }>('/routes/auth.php?action=presence', {
      method: 'POST',
      body: { online },
      suppressUnauthorized: true,
    });
  },

  logout() {
    return apiRequest<{ status: string; message: string }>(
      '/routes/auth.php?action=logout',
      {
        method: 'POST',
        suppressUnauthorized: true,
      },
    );
  },
};

// ============================================================================
// 2. Modul Profil & Direktori Pengguna — routes/users.php
// ============================================================================
export const usersApi = {
  getProfile(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      user: User;
      quiz_summary?: QuizSummary;
    }>('/routes/users.php?action=profile', { method: 'GET', signal });
  },

  updateProfile(payload: {
    name?: string;
    password?: string;
    kelas?: number;
    gender?: string;
    frame_color?: string;
    color_theme?: string;
    nip?: string;
    subject?: string;
  }) {
    return apiRequest<{ status: string; message: string; user: User }>(
      '/routes/users.php?action=profile',
      { method: 'PUT', body: payload },
    );
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiRequest<{
      status: string;
      message: string;
      avatar_url: string;
      avatar_full_url?: string;
      user: User;
    }>('/routes/users.php?action=avatar', {
      method: 'POST',
      body: formData,
    });
  },

  getTeachers(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      total: number;
      teachers: TeacherProfile[];
    }>('/routes/users.php?action=teachers', { method: 'GET', signal });
  },

  getStudents(params?: { kelas?: number; search?: string }, signal?: AbortSignal) {
    const query = new URLSearchParams({ action: 'students' });
    if (params?.kelas) query.set('kelas', String(params.kelas));
    if (params?.search) query.set('search', params.search);
    return apiRequest<{
      status: string;
      total: number;
      students: StudentProfile[];
    }>(`/routes/users.php?${query.toString()}`, { method: 'GET', signal });
  },
};

// ============================================================================
// 3. Modul Kuis — routes/quiz.php
// ============================================================================
export const quizApi = {
  submitScore(payload: {
    score: number;
    total_questions: number;
    module_slug?: string;
  }) {
    return apiRequest<{ status: string; message: string; score: QuizScore }>(
      '/routes/quiz.php?action=submit',
      { method: 'POST', body: payload },
    );
  },

  getHistory(
    params?: { module_slug?: string; student_id?: number; limit?: number },
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({ action: 'history' });
    if (params?.module_slug) query.set('module_slug', params.module_slug);
    if (params?.student_id) query.set('student_id', String(params.student_id));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiRequest<{
      status: string;
      summary?: QuizSummary;
      total?: number;
      scores: QuizScore[];
    }>(`/routes/quiz.php?${query.toString()}`, { method: 'GET', signal });
  },

  getSummary(signal?: AbortSignal) {
    return apiRequest<{ status: string } & QuizAggregateSummary>(
      '/routes/quiz.php?action=summary',
      { method: 'GET', signal },
    );
  },
};

// ============================================================================
// 4. Modul Ruang Obrolan — routes/chats.php
// ============================================================================
export const chatsApi = {
  listRooms(
    params?: { filter?: 'all' | 'unread' | 'important'; search?: string },
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({ action: 'list' });
    if (params?.filter && params.filter !== 'all') {
      query.set('filter', params.filter);
    }
    if (params?.search) query.set('search', params.search);
    return apiRequest<{
      status: string;
      total: number;
      total_unread_rooms: number;
      rooms: ChatRoom[];
    }>(`/routes/chats.php?${query.toString()}`, { method: 'GET', signal });
  },

  openRoom(payload: { teacher_id?: number; student_id?: number }) {
    return apiRequest<{
      status: string;
      message: string;
      created: boolean;
      room: ChatRoom;
    }>('/routes/chats.php?action=open', {
      method: 'POST',
      body: payload,
    });
  },

  updateTheme(roomId: number, theme: ChatThemeId) {
    return apiRequest<{ status: string; message: string; room: ChatRoom }>(
      '/routes/chats.php?action=theme',
      { method: 'PATCH', body: { room_id: roomId, theme } },
    );
  },

  toggleImportant(roomId: number, isImportant?: boolean) {
    const body: Record<string, unknown> = { room_id: roomId };
    if (typeof isImportant === 'boolean') body.is_important = isImportant;
    return apiRequest<{
      status: string;
      message: string;
      room_id: number;
      is_important: boolean;
    }>('/routes/chats.php?action=important', { method: 'PATCH', body });
  },

  updateStatus(roomId: number, status: ChatRoomStatus) {
    return apiRequest<{
      status: string;
      message: string;
      room_id: number;
      room_status: ChatRoomStatus;
    }>('/routes/chats.php?action=status', {
      method: 'PATCH',
      body: { room_id: roomId, status },
    });
  },

  hideRoom(roomId: number) {
    return apiRequest<{ status: string; message: string; room_id: number }>(
      '/routes/chats.php?action=hide',
      { method: 'POST', body: { room_id: roomId } },
    );
  },

  clearRoom(roomId: number) {
    return apiRequest<{
      status: string;
      message: string;
      room_id: number;
      hidden_count: number;
    }>('/routes/chats.php?action=clear', {
      method: 'POST',
      body: { room_id: roomId },
    });
  },
};

// ============================================================================
// 5. Modul Pesan & HTTP Polling — routes/messages.php
// ============================================================================
export const messagesApi = {
  pollMessages(
    roomId: number,
    afterId = 0,
    limit = 100,
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({
      action: 'poll',
      room_id: String(roomId),
      after_id: String(afterId),
      limit: String(limit),
    });
    return apiRequest<PollMessagesResponse>(
      `/routes/messages.php?${query.toString()}`,
      { method: 'GET', signal },
    );
  },

  sendText(roomId: number, content: string) {
    return apiRequest<{ status: string; message: string; data: Message }>(
      '/routes/messages.php?action=send',
      { method: 'POST', body: { room_id: roomId, content } },
    );
  },

  sendImage(roomId: number, imageFile: File, caption?: string) {
    const formData = new FormData();
    formData.append('room_id', String(roomId));
    formData.append('image', imageFile);
    if (caption && caption.trim() !== '') {
      formData.append('content', caption.trim());
    }
    return apiRequest<{ status: string; message: string; data: Message }>(
      '/routes/messages.php?action=image',
      { method: 'POST', body: formData },
    );
  },

  markRead(roomId: number) {
    return apiRequest<{
      status: string;
      message: string;
      room_id: number;
      updated_count: number;
    }>('/routes/messages.php?action=read', {
      method: 'PATCH',
      body: { room_id: roomId },
    });
  },

  deleteMessage(messageId: number) {
    return apiRequest<{
      status: string;
      message: string;
      message_id: number;
    }>(`/routes/messages.php?action=delete&message_id=${messageId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// 6. Modul Notifikasi — routes/notifications.php
// ============================================================================
export const notificationsApi = {
  listNotifications(
    afterId = 0,
    params?: { unread_only?: boolean; limit?: number },
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({
      action: 'list',
      after_id: String(afterId),
    });
    if (params?.unread_only) query.set('unread_only', '1');
    if (params?.limit) query.set('limit', String(params.limit));
    return apiRequest<NotificationListResponse>(
      `/routes/notifications.php?${query.toString()}`,
      { method: 'GET', signal },
    );
  },

  markRead(id: number) {
    return apiRequest<{ status: string; message: string; id: number }>(
      `/routes/notifications.php?action=read&id=${id}`,
      { method: 'PATCH', body: { id } },
    );
  },

  markAllRead() {
    return apiRequest<{
      status: string;
      message: string;
      updated_count: number;
    }>('/routes/notifications.php?action=read_all', { method: 'PATCH' });
  },

  deleteNotification(id: number) {
    return apiRequest<{ status: string; message: string; id: number }>(
      `/routes/notifications.php?action=delete&id=${id}`,
      { method: 'DELETE' },
    );
  },
};

// ============================================================================
// 7. Modul Unggah Media Terpusat — routes/upload.php
// ============================================================================
export const uploadApi = {
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiRequest<{
      status: string;
      message: string;
      avatar_url: string;
      full_url: string;
      file: UploadedFileMeta;
    }>('/routes/upload.php?action=avatar', {
      method: 'POST',
      body: formData,
    });
  },

  uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest<{
      status: string;
      message: string;
      image_url: string;
      full_url: string;
      file: UploadedFileMeta;
    }>('/routes/upload.php?action=media', {
      method: 'POST',
      body: formData,
    });
  },
};

// ============================================================================
// 8. Modul Admin & Dasbor Guru/Admin — routes/admin.php
// ============================================================================
export const adminApi = {
  getPendingTeachers(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      total: number;
      teachers: PendingTeacher[];
    }>('/routes/admin.php?action=pending_teachers', { method: 'GET', signal });
  },

  getTeachers(status?: AccountStatus, signal?: AbortSignal) {
    const query = new URLSearchParams({ action: 'teachers' });
    if (status) query.set('status', status);
    return apiRequest<{
      status: string;
      total: number;
      teachers: PendingTeacher[];
    }>(`/routes/admin.php?${query.toString()}`, { method: 'GET', signal });
  },

  approveTeacher(teacherId: number) {
    return apiRequest<{
      status: string;
      message: string;
      teacher: { id: number; name: string; email: string; status: AccountStatus };
    }>('/routes/admin.php?action=approve', {
      method: 'PATCH',
      body: { teacher_id: teacherId },
    });
  },

  rejectTeacher(teacherId: number, reason?: string) {
    return apiRequest<{
      status: string;
      message: string;
      teacher: {
        id: number;
        name: string;
        email: string;
        status: AccountStatus;
        reject_reason: string;
      };
    }>('/routes/admin.php?action=reject', {
      method: 'PATCH',
      body: { teacher_id: teacherId, reason: reason ?? '' },
    });
  },

  getUsers(
    params?: { role?: UserRole; status?: AccountStatus },
    signal?: AbortSignal,
  ) {
    const query = new URLSearchParams({ action: 'users' });
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    return apiRequest<{ status: string; total: number; users: User[] }>(
      `/routes/admin.php?${query.toString()}`,
      { method: 'GET', signal },
    );
  },

  getDashboard(signal?: AbortSignal) {
    return apiRequest<{
      status: string;
      role: 'admin' | 'guru';
      dashboard: AdminDashboardStats | TeacherDashboardStats;
    }>('/routes/admin.php?action=dashboard', { method: 'GET', signal });
  },
};
