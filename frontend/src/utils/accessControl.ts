import type { User } from '../types/models';

export function isCurhatRestrictedForUser(user: User | null): boolean {
  return Boolean(user && user.role === 'siswa' && user.kelas !== null && user.kelas < 4);
}

export function canAccessCurhat(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'guru' || user.role === 'admin') return true;
  if (user.kelas === null) return true;
  return user.kelas >= 4;
}

export function getClassAccessLabel(kelas?: number | null): string {
  if (!kelas) return 'Belum diatur';
  return kelas >= 4
    ? `Kelas ${kelas} — Akses Penuh (Materi, Kuis, & Ruang Curhat)`
    : `Kelas ${kelas} — Akses Materi & Kuis (Ruang Curhat khusus Kelas 4–6)`;
}
