import { useState, type FormEvent } from 'react';
import { ApiError, authApi } from '../services/api';
import { loadAssetByKey } from '../utils/assetLoader';

interface RegisterPageProps {
  onBackHome?: () => void;
  onNavigateLogin?: () => void;
}

const logoModules = import.meta.glob(
  '../assets/logo-sahabat-digital.{png,jpg,jpeg,webp,svg}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

const registerImgModules = import.meta.glob(
  '../assets/register-illustration.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

const defaultLogoSrc = loadAssetByKey(
  logoModules,
  '../assets/logo-sahabat-digital.png',
);

const defaultRegisterImgSrc = loadAssetByKey(
  registerImgModules,
  '../assets/register-illustration.png',
  '../assets/register-illustration.jpg',
);

export function RegisterPage({
  onBackHome,
  onNavigateLogin,
}: RegisterPageProps) {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [fullName, setFullName] = useState<string>('');
  const [kelas, setKelas] = useState<string>('4');
  const [gender, setGender] = useState<string>('Laki-laki');
  const [nip, setNip] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [logoSrc, setLogoSrc] = useState<string>(defaultLogoSrc);
  const [illustrationSrc, setIllustrationSrc] = useState<string>(
    defaultRegisterImgSrc,
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const handleRoleChange = (selectedRole: 'siswa' | 'guru') => {
    setRole(selectedRole);
    setErrorMessage('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.register(
        role === 'siswa'
          ? {
              name: fullName,
              email,
              password,
              role: 'siswa',
              kelas: parseInt(kelas, 10),
              gender,
            }
          : {
              name: fullName,
              email,
              password,
              role: 'guru',
              nip,
              subject: subject.trim() !== '' ? subject.trim() : undefined,
            },
      );

      setShowSuccessModal(true);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Terjadi kesalahan saat mendaftar. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    if (onNavigateLogin) {
      onNavigateLogin();
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B569A]/25 via-[#F3F8FC] to-[#00B5D8]/35 px-4 py-8 sm:px-6 lg:px-8">
      {/* Popup Sukses Dinamis */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F294A]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
            <div className="text-6xl">🎉</div>
            <h3 className="font-playful mt-4 text-2xl font-bold text-[#2B569A]">
              {role === 'guru' ? 'Pendaftaran Terkirim!' : 'Yeay, Berhasil Daftar!'}
            </h3>
            <p className="font-clean mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {role === 'guru'
                ? 'Akun guru kamu sudah dibuat dan sedang menunggu persetujuan administrator. Silakan login setelah disetujui ya. 🙏'
                : 'Akun kamu sudah berhasil dibuat. Sekarang silakan login menggunakan email dan password yang baru saja kamu buat ya.'}
            </p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="font-playful mt-6 w-full cursor-pointer rounded-full bg-[#7BB642] px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#2B569A]"
            >
              {role === 'guru' ? 'Mengerti, Saya Akan Menunggu' : 'Ke Halaman Login'}
            </button>
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00B5D8]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#7BB642]/20 blur-3xl"
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
              Bergabung <br />
              <span className="text-[#00B5D8]">Bersama Kami</span>
            </h1>
            <p className="font-clean mt-3 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
              Buat akunmu sekarang untuk mulai belajar materi seru, mencoba
              latihan interaktif, dan bercerita dengan aman.
            </p>

            <div className="relative mt-8 flex w-full max-w-[320px] justify-center sm:max-w-[360px] lg:justify-start">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 animate-pulse rounded-full bg-[#7BB642] opacity-30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 animate-pulse rounded-full bg-[#00B5D8] opacity-30 blur-3xl"
              />

              <div className="relative w-full overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-500 hover:scale-105">
                {illustrationSrc ? (
                  <img
                    src={illustrationSrc}
                    alt="Ilustrasi Pendaftaran Sahabat Digital"
                    onError={() => setIllustrationSrc('')}
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

          {/* Kolom Kanan: Form Pendaftaran */}
          <div className="mx-auto w-full max-w-md">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-playful text-2xl font-bold text-[#2B569A] sm:text-3xl">
                Buat Akun Baru
              </h2>
            </div>

            <div className="mt-5">
              <span className="font-clean mb-2 block text-xs font-semibold text-slate-600">
                Daftar sebagai
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
                  onClick={() => handleRoleChange('siswa')}
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
                  onClick={() => handleRoleChange('guru')}
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

            {errorMessage && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600 ring-1 ring-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="register-fullname"
                  className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                >
                  Nama Lengkap
                </label>
                <input
                  id="register-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    role === 'siswa'
                      ? 'Masukkan nama lengkap siswa'
                      : 'Masukkan nama lengkap guru'
                  }
                  required
                  className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                />
              </div>

              {role === 'siswa' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="register-kelas"
                      className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                    >
                      Kelas
                    </label>
                    <div className="relative">
                      <select
                        id="register-kelas"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="font-clean w-full cursor-pointer appearance-none rounded-full border border-slate-200/90 bg-white px-5 py-3 pr-10 text-sm text-[#1E3A6D] shadow-sm transition outline-none focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                      >
                        <option value="1">Kelas 1</option>
                        <option value="2">Kelas 2</option>
                        <option value="3">Kelas 3</option>
                        <option value="4">Kelas 4</option>
                        <option value="5">Kelas 5</option>
                        <option value="6">Kelas 6</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-gender"
                      className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                    >
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="register-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="font-clean w-full cursor-pointer appearance-none rounded-full border border-slate-200/90 bg-white px-5 py-3 pr-10 text-sm text-[#1E3A6D] shadow-sm transition outline-none focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="register-nip"
                      className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                    >
                      NIP
                    </label>
                    <input
                      id="register-nip"
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="NIP guru (8-18 digit)"
                      required
                      className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="register-subject"
                      className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                    >
                      Mapel / Jabatan
                    </label>
                    <input
                      id="register-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Wali Kelas 5"
                      className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="register-email"
                  className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email aktif"
                  required
                  className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                    className="font-clean w-full rounded-full border border-slate-200/90 bg-white px-5 py-3 pr-12 text-sm text-[#1E3A6D] shadow-sm transition outline-none placeholder:text-slate-300 focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`font-playful w-full cursor-pointer rounded-full bg-[#2B569A] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#00B5D8] hover:text-[#0F294A] disabled:cursor-not-allowed disabled:opacity-70 ${
                    isLoading ? 'flex items-center justify-center gap-2' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Memuat...
                    </>
                  ) : (
                    'Daftar Sekarang'
                  )}
                </button>
              </div>
            </form>

            <p className="font-clean mt-5 text-center text-xs text-slate-600 sm:text-sm">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="cursor-pointer font-bold text-[#2B569A] underline transition hover:text-[#00B5D8]"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
