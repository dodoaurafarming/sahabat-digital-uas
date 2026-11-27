import { useState, type FormEvent } from 'react';
import { ApiError, authApi, saveAuthSession } from '../services/api';
import type { User } from '../types/models';

interface AdminLoginPageProps {
  onLoginSuccess: (role: 'admin', user: User) => void;
  onBackHome: () => void;
}

export function AdminLoginPage({
  onLoginSuccess,
  onBackHome,
}: AdminLoginPageProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password, role: 'admin' });

      saveAuthSession(response.token, response.user);
      onLoginSuccess('admin', response.user);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login administrator gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#1E3A6D] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2B569A] text-3xl">
            🔒
          </div>
        </div>

        <h2 className="font-playful text-center text-2xl font-bold text-[#2B569A]">
          Login Administrator
        </h2>
        <p className="font-clean mt-2 text-center text-sm text-slate-500">
          Akses khusus untuk pengelolaan sistem.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
            >
              Email Admin
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="font-clean w-full rounded-full border border-slate-200 bg-[#F3F8FC] px-5 py-3 text-sm outline-none transition focus:border-[#2B569A] focus:ring-2 focus:ring-[#2B569A]/25"
              placeholder="Masukkan email administrator"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="font-clean w-full rounded-full border border-slate-200 bg-[#F3F8FC] px-5 py-3 text-sm outline-none transition focus:border-[#2B569A] focus:ring-2 focus:ring-[#2B569A]/25"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="font-playful mt-4 w-full cursor-pointer rounded-full bg-[#2B569A] py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#00B5D8] disabled:opacity-70"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackHome}
          className="font-clean mt-6 w-full cursor-pointer text-center text-sm font-semibold text-slate-500 transition hover:text-[#2B569A]"
        >
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
