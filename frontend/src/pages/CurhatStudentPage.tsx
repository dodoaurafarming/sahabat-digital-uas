import { useEffect, useRef, useState } from 'react';
import { TeacherCard } from '../components/curhat/TeacherCard';
import {
  ApiError,
  chatsApi,
  resolveMediaUrl,
  usersApi,
} from '../services/api';
import type { ChatPeerInfo, TeacherProfile, User } from '../types/models';
import { isCurhatRestrictedForUser } from '../utils/accessControl';

interface CurhatStudentPageProps {
  currentUser: User | null;
  onBackHome: () => void;
  onOpenChat: (roomId: number, teacher: ChatPeerInfo) => void;
}

const TEACHERS_POLL_INTERVAL_MS = 5000;

export function CurhatStudentPage({
  currentUser,
  onBackHome,
  onOpenChat,
}: CurhatStudentPageProps) {
  const isRestricted = isCurhatRestrictedForUser(currentUser);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!isRestricted);
  const isPollingRef = useRef<boolean>(false);

  // Muat daftar guru aktif + HTTP Polling tiap 5 detik untuk status online guru
  useEffect(() => {
    if (isRestricted) {
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();
    isPollingRef.current = false;

    const fetchTeachers = async (isInitial: boolean) => {
      if (isCancelled || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const response = await usersApi.getTeachers(controller.signal);
        if (!isCancelled) {
          setTeachers(response.teachers ?? []);
        }
      } catch {
        if (!isCancelled && isInitial) {
          setTeachers([]);
        }
      } finally {
        isPollingRef.current = false;
        if (!isCancelled && isInitial) {
          setIsLoading(false);
        }
      }
    };

    fetchTeachers(true);
    const intervalId = window.setInterval(() => {
      fetchTeachers(false);
    }, TEACHERS_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      controller.abort();
      isPollingRef.current = false;
    };
  }, [isRestricted]);

  if (isRestricted) {
    return (
      <div className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#00B5D8]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#7BB642]/20 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl sm:p-12">
            <div className="mb-6 text-7xl">🌟</div>
            <h1 className="font-playful text-3xl font-bold text-[#2B569A] sm:text-4xl">
              Halo, Adik-adik Hebat! 👋
            </h1>
            <p className="font-clean mt-6 text-lg leading-relaxed text-slate-600">
              Fitur <span className="font-bold text-[#00B5D8]">Ruang Curhat</span>{' '}
              khusus untuk kakak-kakak <span className="font-bold">kelas 4, 5, dan 6</span> ya.
            </p>
            <p className="font-clean mt-4 text-base leading-relaxed text-slate-500">
              Kalau kamu masih di kelas 1, 2, atau 3, jangan khawatir! Kamu tetap bisa{' '}
              <span className="font-bold text-[#7BB642]">belajar di Pusat Materi</span>{' '}
              dan <span className="font-bold text-[#7BB642]">asik di Latihan Soal</span>.
              Untuk bercerita, silakan ke Bapak/Ibu Guru di kelas atau Orang Tua di rumah. 🎒✨
            </p>
            <button
              type="button"
              onClick={onBackHome}
              className="font-playful mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#00B5D8] px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#2B569A]"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStartChat = async (teacher: TeacherProfile) => {
    try {
      const response = await chatsApi.openRoom({ teacher_id: teacher.id });
      const roomId = response.room?.id;
      if (!roomId) {
        throw new Error('Respons server tidak berisi ID ruang obrolan.');
      }

      const peerInfo: ChatPeerInfo = {
        id: teacher.id,
        name: teacher.name,
        role: 'guru',
        subject: teacher.subject ?? 'Guru Pendamping',
        is_online: teacher.is_online,
        color_theme: teacher.color_theme || '#2B569A',
        avatar_url: teacher.avatar_url,
        avatar_full_url: teacher.avatar_full_url,
      };

      onOpenChat(roomId, peerInfo);
    } catch (error: unknown) {
      const msg =
        error instanceof ApiError
          ? error.message
          : 'Gagal memulai obrolan. Coba lagi nanti.';
      alert(msg);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#00B5D8]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#7BB642]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[#FEF08A]/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Kembali ke Beranda"
          className="mb-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-100 bg-white text-[#2B569A] shadow-md transition-colors hover:bg-[#2B569A] hover:text-white"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="font-playful inline-block text-3xl font-bold text-[#2B569A] transition-transform hover:scale-105 sm:text-5xl">
          Pilih Pendampingmu
        </h1>
        <p className="font-clean mt-3 mb-10 max-w-xl text-base text-slate-600 sm:text-lg">
          Pilih guru yang ingin kamu ajak bicara. Ceritamu aman dan rahasia.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2B569A] border-t-transparent" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xs">
            <p className="font-playful text-lg font-bold text-[#2B569A]">
              Belum ada guru yang terdaftar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                name={teacher.name}
                subject={teacher.subject || 'Guru Pendamping'}
                isOnline={teacher.is_online}
                avatarSrc={resolveMediaUrl(
                  teacher.avatar_full_url || teacher.avatar_url,
                )}
                colorTheme={teacher.color_theme || '#2B569A'}
                onStartChat={() => handleStartChat(teacher)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CurhatStudentPage;
