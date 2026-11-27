import { useEffect, useRef, useState } from 'react';
import { ApiError, adminApi } from '../services/api';
import type { AdminDashboardStats, PendingTeacher } from '../types/models';

const ADMIN_POLL_INTERVAL_MS = 6000;

export function AdminPendingPage() {
  const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  const isPollingRef = useRef<boolean>(false);

  const loadPendingData = async (signal?: AbortSignal) => {
    const [pendingRes, dashRes] = await Promise.all([
      adminApi.getPendingTeachers(signal),
      adminApi.getDashboard(signal).catch(() => null),
    ]);

    return {
      teachers: pendingRes.teachers ?? [],
      dashboard:
        dashRes && dashRes.role === 'admin'
          ? (dashRes.dashboard as AdminDashboardStats)
          : null,
    };
  };

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const data = await loadPendingData();
      setTeachers(data.teachers);
      if (data.dashboard) {
        setStats(data.dashboard);
      }
    } catch {
      setMessage('✗ Gagal memuat daftar persetujuan guru. Pastikan server API aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    isPollingRef.current = false;

    const runSync = async (isInitial: boolean) => {
      if (isCancelled || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const data = await loadPendingData(controller.signal);
        if (isCancelled) return;
        setTeachers(data.teachers);
        if (data.dashboard) {
          setStats(data.dashboard);
        }
      } catch {
        if (!isCancelled && isInitial) {
          setMessage(
            '✗ Gagal memuat daftar persetujuan guru. Pastikan server API aktif.',
          );
        }
      } finally {
        isPollingRef.current = false;
        if (!isCancelled && isInitial) {
          setIsLoading(false);
        }
      }
    };

    runSync(true);
    const intervalId = window.setInterval(() => {
      runSync(false);
    }, ADMIN_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      controller.abort();
      isPollingRef.current = false;
    };
  }, []);

  const handleApprove = async (teacher: PendingTeacher) => {
    if (!window.confirm(`Setujui akun guru "${teacher.name}"?`)) return;
    setActionId(teacher.id);
    setMessage('');

    try {
      await adminApi.approveTeacher(teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      setMessage(`✓ ${teacher.name} berhasil disetujui.`);
      const dashRes = await adminApi.getDashboard().catch(() => null);
      if (dashRes && dashRes.role === 'admin') {
        setStats(dashRes.dashboard as AdminDashboardStats);
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof ApiError
          ? `✗ ${error.message}`
          : '✗ Gagal menyetujui guru.',
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (teacher: PendingTeacher) => {
    const reason = window.prompt(
      `Alasan menolak "${teacher.name}" (opsional):`,
      'Verifikasi identitas tidak berhasil.',
    );
    if (reason === null) return;
    setActionId(teacher.id);
    setMessage('');

    try {
      await adminApi.rejectTeacher(teacher.id, reason);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      setMessage(`✗ ${teacher.name} ditolak.`);
      const dashRes = await adminApi.getDashboard().catch(() => null);
      if (dashRes && dashRes.role === 'admin') {
        setStats(dashRes.dashboard as AdminDashboardStats);
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof ApiError
          ? `✗ ${error.message}`
          : '✗ Gagal menolak guru.',
      );
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-playful text-3xl font-bold text-[#2B569A] sm:text-4xl">
            Persetujuan Guru
          </h1>
          <p className="font-clean mt-2 text-sm text-slate-600 sm:text-base">
            Verifikasi identitas guru baru sebelum mengaktifkan akun mereka.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPending}
          disabled={isLoading}
          className="font-clean shrink-0 cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2B569A] shadow-sm ring-1 ring-slate-200 transition hover:bg-[#F3F8FC] disabled:opacity-60"
        >
          {isLoading ? 'Memuat...' : '↻ Refresh'}
        </button>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <p className="font-clean text-xs font-semibold text-slate-500">
              Total Siswa
            </p>
            <p className="font-playful mt-1 text-2xl font-bold text-[#2B569A]">
              {stats.users.total_siswa}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <p className="font-clean text-xs font-semibold text-slate-500">
              Guru Aktif
            </p>
            <p className="font-playful mt-1 text-2xl font-bold text-[#7BB642]">
              {stats.users.guru_active}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <p className="font-clean text-xs font-semibold text-slate-500">
              Menunggu
            </p>
            <p className="font-playful mt-1 text-2xl font-bold text-[#00B5D8]">
              {stats.users.guru_pending}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100">
            <p className="font-clean text-xs font-semibold text-slate-500">
              Ruang Curhat
            </p>
            <p className="font-playful mt-1 text-2xl font-bold text-[#1E3A6D]">
              {stats.chats.active_rooms}
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="font-clean mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2B569A] shadow-sm">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2B569A] border-t-transparent" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xs">
            <p className="font-playful text-lg font-bold text-[#2B569A]">
              Tidak ada guru menunggu
            </p>
            <p className="font-clean mt-1 text-sm text-slate-500">
              Semua permintaan verifikasi guru sudah diproses. Klik{' '}
              <span className="font-bold">↻ Refresh</span> untuk memeriksa ulang.
            </p>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h2 className="font-playful truncate text-lg font-bold text-[#0F294A]">
                  {teacher.name}
                </h2>
                <p className="font-clean text-xs text-slate-500">
                  {teacher.email} • Daftar {formatDate(teacher.created_at)}
                </p>
                <div className="font-clean mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>
                    NIP:{' '}
                    <span className="font-semibold text-[#2B569A]">
                      {teacher.nip || '-'}
                    </span>
                  </span>
                  <span>
                    Mapel:{' '}
                    <span className="font-semibold text-[#2B569A]">
                      {teacher.subject || '-'}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(teacher)}
                  disabled={actionId === teacher.id}
                  className="font-clean cursor-pointer rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(teacher)}
                  disabled={actionId === teacher.id}
                  className="font-clean cursor-pointer rounded-full bg-[#7BB642] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2B569A] disabled:opacity-50"
                >
                  {actionId === teacher.id ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPendingPage;
