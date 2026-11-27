import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';
import { notificationsApi, resolveMediaUrl } from '../services/api';
import type { NotificationItem, UserRole } from '../types/models';

interface NavbarProps {
  isLoggedIn: boolean;
  userId?: number;
  role?: UserRole;
  userName?: string;
  userAvatar?: string | null;
  onNavigateHome?: () => void;
  onNavigateProfile: () => void;
  onNavigateCurhat?: () => void;
  onNavigateChat?: () => void;
  onNavigateMaterial?: () => void;
  onNavigateDaftar: () => void;
  onNavigateLogin: () => void;
  onLogout?: () => void;
}

const NOTIF_POLL_INTERVAL_MS = 5000;

const pngModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultLogoSrc = loadAssetByKey(
  pngModules,
  '../assets/logo-sahabat-digital.png',
);

const defaultStudentAvatarSrc = pngModules['../assets/avatar-student.png'] ?? '';
const defaultTeacherAvatarSrc = pngModules['../assets/avatar-teacher.png'] ?? '';

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return date.toLocaleDateString('id-ID');
};

const mergeNotificationsDesc = (
  existing: NotificationItem[],
  incoming: NotificationItem[],
): NotificationItem[] => {
  const byId = new Map<number, NotificationItem>();
  for (const item of existing) {
    byId.set(item.id, item);
  }
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values()).sort((a, b) => b.id - a.id);
};

export function Navbar({
  isLoggedIn,
  userId,
  role = 'siswa',
  userName,
  userAvatar,
  onNavigateHome,
  onNavigateProfile,
  onNavigateCurhat,
  onNavigateChat,
  onNavigateMaterial,
  onNavigateDaftar,
  onNavigateLogin,
  onLogout,
}: NavbarProps) {
  const [logoSrc, setLogoSrc] = useState<string>(defaultLogoSrc);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const dropdownAreaRef = useRef<HTMLDivElement | null>(null);
  const lastNotifIdRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  const displayName =
    userName ??
    (role === 'guru' ? 'Bu Rina' : role === 'admin' ? 'Administrator' : 'Raka');
  const roleSubtitle =
    role === 'guru'
      ? 'Guru Pendamping'
      : role === 'admin'
        ? 'Administrator'
        : 'Siswa';

  const resolvedAvatar =
    resolveMediaUrl(userAvatar) ||
    (role === 'guru' ? defaultTeacherAvatarSrc : defaultStudentAvatarSrc);
  const avatarError = failedAvatarUrl === resolvedAvatar;
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'S';
  const avatarBorderClass = role === 'guru' ? 'border-[#7BB642]' : 'border-white';

  // Muat notifikasi awal + HTTP Polling berkala setiap 5 detik menggunakan after_id
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      lastNotifIdRef.current = 0;
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();
    lastNotifIdRef.current = 0;
    isPollingRef.current = false;

    const pollNotifications = async (isInitial: boolean) => {
      if (isCancelled || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const afterId = isInitial ? 0 : lastNotifIdRef.current;
        const res = await notificationsApi.listNotifications(
          afterId,
          { limit: 50 },
          controller.signal,
        );
        if (isCancelled) return;

        const incoming = res.notifications ?? [];
        if (isInitial) {
          setNotifications(mergeNotificationsDesc([], incoming));
        } else if (incoming.length > 0) {
          setNotifications((prev) => mergeNotificationsDesc(prev, incoming));
        }

        if (typeof res.last_id === 'number') {
          lastNotifIdRef.current = Math.max(lastNotifIdRef.current, res.last_id);
        }

        if (typeof res.unread_count === 'number') {
          setUnreadCount(res.unread_count);
        }
      } catch {
        // Biarkan state terakhir jika terjadi gangguan sementara
      } finally {
        isPollingRef.current = false;
      }
    };

    pollNotifications(true);
    const intervalId = window.setInterval(() => {
      pollNotifications(false);
    }, NOTIF_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      controller.abort();
      isPollingRef.current = false;
    };
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownAreaRef.current &&
        !dropdownAreaRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleNotif = () => {
    const nextOpen = !isNotifOpen;
    setIsNotifOpen(nextOpen);
    setIsProfileOpen(false);

    // Sinkronkan status baca terbaru setiap kali panel notifikasi dibuka
    if (nextOpen && isLoggedIn && userId) {
      notificationsApi
        .listNotifications(0, { limit: 50 })
        .then((res) => {
          setNotifications(mergeNotificationsDesc([], res.notifications ?? []));
          if (typeof res.last_id === 'number') {
            lastNotifIdRef.current = Math.max(lastNotifIdRef.current, res.last_id);
          }
          if (typeof res.unread_count === 'number') {
            setUnreadCount(res.unread_count);
          }
        })
        .catch(() => {});
    }
  };

  const handleToggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotifOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Abaikan sementara jika terjadi error jaringan
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.is_read) {
        await notificationsApi.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notif.id ? { ...item, is_read: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Abaikan sementara jika terjadi error jaringan
    }

    setIsNotifOpen(false);

    if (notif.type === 'chat' || notif.type === 'system') {
      if (onNavigateChat) onNavigateChat();
      else if (onNavigateCurhat) onNavigateCurhat();
    } else if (notif.type === 'material') {
      if (onNavigateMaterial) onNavigateMaterial();
    }
  };

  const handleDeleteNotification = async (
    e: ReactMouseEvent,
    notif: NotificationItem,
  ) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notif.id));
      if (!notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Abaikan sementara jika terjadi error jaringan
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#2B569A] text-white shadow-sm">
      {(isNotifOpen || isProfileOpen) && (
        <div
          aria-hidden="true"
          onClick={() => {
            setIsNotifOpen(false);
            setIsProfileOpen(false);
          }}
          className="fixed inset-0 z-40 bg-transparent"
        />
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo Sahabat Digital"
              onError={() => setLogoSrc('')}
              className="h-9 w-9 shrink-0 rounded-lg object-contain sm:h-11 sm:w-11"
            />
          ) : (
            <div className="font-playful flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00B5D8] text-sm font-bold text-[#0F294A] sm:h-11 sm:w-11">
              SD
            </div>
          )}
          <span className="font-playful truncate text-lg font-bold tracking-wide text-white sm:text-2xl">
            Sahabat Digital
          </span>
        </a>

        {!isLoggedIn ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateDaftar}
              className="font-clean cursor-pointer rounded-full border-2 border-white bg-transparent px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/15 sm:px-5 sm:py-2 sm:text-sm"
            >
              Daftar
            </button>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-clean cursor-pointer rounded-full bg-[#00B5D8] px-4 py-2 text-xs font-bold text-[#0F294A] shadow-sm transition hover:bg-[#19C8EB] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Login
            </button>
          </div>
        ) : (
          <div
            ref={dropdownAreaRef}
            className="relative z-50 flex shrink-0 items-center gap-3 sm:gap-4"
          >
            {/* Tombol Notifikasi */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleNotif}
                aria-label="Notifikasi"
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00B5D8] text-[10px] font-bold text-white ring-2 ring-[#2B569A]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-4 text-slate-800 shadow-xl transition-all duration-200">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-playful text-base font-bold text-[#2B569A]">
                      Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="font-clean cursor-pointer text-xs font-semibold text-[#00B5D8] transition hover:text-[#2B569A]"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 space-y-1.5 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="font-clean py-4 text-center text-sm text-slate-400">
                        Tidak ada notifikasi
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationClick(notif);
                            }
                          }}
                          className="group flex w-full cursor-pointer items-start justify-between gap-2 rounded-xl p-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {!notif.is_read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#00B5D8]" />
                              )}
                              <p
                                className={`font-clean text-sm ${
                                  !notif.is_read
                                    ? 'font-semibold text-[#0F294A]'
                                    : 'text-slate-600'
                                }`}
                              >
                                {notif.title}
                              </p>
                            </div>
                            {notif.body && (
                              <p className="font-clean mt-0.5 line-clamp-2 text-xs text-slate-500">
                                {notif.body}
                              </p>
                            )}
                            <span className="font-clean mt-1 block text-xs text-slate-400">
                              {formatTime(notif.created_at)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotification(e, notif)}
                            aria-label="Hapus notifikasi"
                            title="Hapus notifikasi"
                            className="shrink-0 cursor-pointer rounded-full px-1.5 py-0.5 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                          >
                            &#10005;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Profil */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleProfile}
                className="flex cursor-pointer items-center gap-2.5 rounded-full py-1 transition hover:opacity-90"
              >
                <span className="font-playful order-1 text-sm font-bold text-white sm:order-2 sm:text-base">
                  Halo, {displayName}!
                </span>
                {resolvedAvatar && !avatarError ? (
                  <img
                    src={resolvedAvatar}
                    alt={`Profil ${displayName}`}
                    onError={() => setFailedAvatarUrl(resolvedAvatar)}
                    className={`order-2 h-9 w-9 rounded-full border-2 object-cover sm:order-1 sm:h-11 sm:w-11 ${avatarBorderClass}`}
                  />
                ) : (
                  <div
                    className={`font-playful order-2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold sm:order-1 sm:h-11 sm:w-11 sm:text-base ${avatarBorderClass} ${
                      role === 'guru'
                        ? 'bg-[#7BB642] text-white'
                        : 'bg-[#00B5D8] text-[#0F294A]'
                    }`}
                  >
                    {userInitial}
                  </div>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 text-slate-800 shadow-xl transition-all duration-200">
                  <div className="px-3.5 py-2.5">
                    <p className="font-playful text-base font-bold text-[#2B569A]">
                      {displayName}
                    </p>
                    <p className="font-clean text-xs font-medium text-slate-400">
                      {roleSubtitle}
                    </p>
                  </div>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateProfile();
                    }}
                    className="font-clean flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-[#F3F8FC] hover:text-[#2B569A]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Edit Profil</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="font-clean flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
