import { useState, type FormEvent } from 'react';
import { ApiError, authApi, saveAuthSession } from '../services/api';
import type { User, UserRole } from '../types/models';
import { loadAssetByKey } from '../utils/assetLoader';

interface LoginPageProps {
  onBackHome?: () => void;
  onNavigateDaftar?: () => void;
  onLoginSuccess: (role: UserRole, user: User) => void;
}

const logoModules = import.meta.glob(
  '../assets/logo-sahabat-digital.{png,jpg,jpeg,webp,svg}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

const rocketModules = import.meta.glob('../assets/login.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultLogoSrc = loadAssetByKey(
  logoModules,
  '../assets/logo-sahabat-digital.png',
);
const defaultRocketSrc = loadAssetByKey(rocketModules, '../assets/login.png');

export function LoginPage({
  onBackHome,
  onNavigateDaftar,
  onLoginSuccess,
}: LoginPageProps) {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [logoSrc, setLogoSrc] = useState<string>(defaultLogoSrc);
  const [rocketSrc, setRocketSrc] = useState<string>(defaultRocketSrc);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password, role });

      saveAuthSession(response.token, response.user);
      onLoginSuccess(response.user.role, response.user);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login gagal. Periksa email dan kata sandimu ya.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B569A]/25 via-[#F3F8FC] to-[#00B5D8]/35 px-4 py-8 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00B5D8]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#2B569A]/20 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/75 p-6 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackHome}
            className="flex cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-80"
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo Sahabat Digital"
                onError={() => setLogoSrc('')}
                className="h-9 w-9 rounded-xl object-contain sm:h-11 sm:w-11"
              />
            ) : (
              <div className="font-playful flex h-9 w-9 items-center justify-center rounded-xl bg-[#2B569A] text-sm font-bold text-white sm:h-11 sm:w-11">
                SD
              </div>
            )}
            <span className="font-playful text-lg font-bold text-[#2B569A] sm:text-xl">
              Sahabat Digital
            </span>
          </button>

          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="font-clean cursor-pointer rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#2B569A] shadow-sm transition hover:bg-white sm:text-sm"
            >
              Kembali ke Beranda
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:mt-6 lg:grid-cols-2 lg:gap-12">
          {/* Kolom Kiri: Teks & Ilustrasi */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="font-playful text-4xl leading-tight font-bold text-[#1E3A6D] sm:text-5xl lg:text-6xl">
              Mulai <br />
              <span className="text-[#00B5D8]">Perjalananmu</span>
            </h1>
            <p className="font-clean mt-3 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
              Jelajahi ruang belajar seru dan cerita dengan aman bersama teman
              serta guru pendampingmu.
            </p>

            <div className="relative mt-8 flex w-full max-w-[320px] justify-center sm:max-w-[360px] lg:justify-start">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 animate-pulse rounded-full bg-[#00B5D8] opacity-30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 animate-pulse rounded-full bg-[#7BB642] opacity-30 blur-3xl"
              />

              <div className="relative w-full overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-500 hover:scale-105">
                {rocketSrc ? (
                  <img
                    src={rocketSrc}
                    alt="Ilustrasi Sahabat Digital"
                    onError={() => setRocketSrc('')}
                    className="h-auto w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 w-full flex-col items-center justify-center bg-gradient-to-br from-[#2B569A] via-[#00B5D8] to-[#7BB642] p-6 text-center text-white">
                    <span className="font-playful text-lg font-bold">
                      Sahabat Digital
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Login */}
          <div className="mx-auto w-full max-w-md">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-playful text-2xl font-bold text-[#2B569A] sm:text-3xl">
                Selamat Datang
              </h2>
            </div>

            <div className="mt-6">
              <span className="font-clean mb-2 block text-xs font-semibold text-slate-600">
                Masuk sebagai
              </span>
              <div className="relative grid grid-cols-2 rounded-full bg-[#F3F8FC] p-1.5 shadow-inner ring-1 ring-slate-200/80">
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-full bg-[#2B569A] shadow-md transition-transform duration-300 ease-out ${
                    role === 'guru' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setRole('siswa')}
                  className={`font-playful relative z-10 cursor-pointer rounded-full py-2.5 text-sm font-bold transition-colors duration-200 ${
                    role === 'siswa'
                      ? 'text-white'
                      : 'text-[#2B569A] hover:text-[#00B5D8]'
                  }`}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guru')}
                  className={`font-playful relative z-10 cursor-pointer rounded-full py-2.5 text-sm font-bold transition-colors duration-200 ${
                    role === 'guru'
                      ? 'text-white'
                      : 'text-[#2B569A] hover:text-[#00B5D8]'
                  }`}
                >
                  Guru
                </button>
              </div>
            </div>

            {error && (
              <div className="font-clean mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="font-clean mb-2 block text-xs font-semibold text-[#1E3A6D]"
                >
                  Email
                </label>
                <div className="relative flex items-center">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === 'siswa'
                        ? 'Masukkan email siswa'
                        : 'Masukkan email guru'
                    }
                    required
                    className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3.5 pr-11 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      aria-label="Bersihkan email"
                      className="absolute right-4 cursor-pointer text-xs font-bold text-slate-400 transition hover:text-slate-600"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="font-clean mb-2 block text-xs font-semibold text-[#1E3A6D]"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      role === 'siswa'
                        ? 'Masukkan password'
                        : 'Masukkan kata sandi guru'
                    }
                    required
                    className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3.5 pr-12 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                    className="absolute right-4 flex cursor-pointer items-center justify-center text-slate-400 transition hover:text-[#2B569A]"
                  >
                    {showPassword ? (
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="font-playful w-full cursor-pointer rounded-full bg-[#2B569A] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-colors duration-200 hover:bg-[#00B5D8] hover:text-[#0F294A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? 'Memuat...' : 'Masuk'}
                </button>
              </div>
            </form>

            <p className="font-clean mt-6 text-center text-xs text-slate-600 sm:text-sm">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={onNavigateDaftar}
                className="cursor-pointer font-bold text-[#2B569A] underline transition hover:text-[#00B5D8]"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
