import { useState, type MouseEvent } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const pngModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultLogoSrc = loadAssetByKey(
  pngModules,
  '../assets/logo-sahabat-digital.png',
);

const PENTING_LINKS = [
  { label: 'Tentang Kami', page: 'home' },
  { label: 'Pusat Materi', page: 'material' },
  { label: 'Latihan Soal', page: 'quiz-intro' },
  { label: 'Panduan Guru', page: 'faq' },
];

const BANTUAN_LINKS = [
  { label: 'FAQ', page: 'faq' },
  { label: 'Kontak Kami', page: 'contact' },
  { label: 'Kebijakan Privasi', page: 'privacy' },
  { label: 'Syarat & Ketentuan', page: 'terms' },
];

const CURRENT_YEAR = new Date().getFullYear();

export function Footer({ onNavigate }: FooterProps) {
  const [logoSrc, setLogoSrc] = useState<string>(defaultLogoSrc);

  const getIconSrc = (filename: string): string =>
    loadAssetByKey(pngModules, `../assets/${filename}`);

  const go = (page: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
    else window.location.href = page === 'home' ? '/' : `/${page}`;
  };

  const noop = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();

  return (
    <footer className="relative w-full overflow-hidden bg-[#2B569A] text-white">
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[40px] w-full sm:h-[70px]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36 lg:px-8 lg:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-playful text-4xl font-bold text-[#00B5D8] sm:text-5xl lg:text-6xl">
              Ikuti Kami
            </h2>
            <p className="font-clean mt-4 max-w-md text-lg leading-relaxed text-white/90 sm:text-xl">
              Kamu tidak sendirian. Mari bergabung dengan komunitas Sahabat
              Digital untuk mendapatkan cerita, pembaruan, dan energi positif
              setiap hari.
            </p>

            <div className="mt-8 flex gap-4">
              {[
                { name: 'Instagram', file: 'icon-instagram.png' },
                { name: 'Facebook', file: 'icon-facebook.png' },
                { name: 'Twitter', file: 'icon-twitter.png' },
                { name: 'LinkedIn', file: 'icon-linkedin.png' },
              ].map((social) => {
                const iconSrc = getIconSrc(social.file);
                return (
                  <a
                    key={social.name}
                    href="#"
                    onClick={noop}
                    aria-label={social.name}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#00B5D8]"
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={social.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="font-clean text-[10px] font-bold">
                        {social.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-10">
            <h3 className="font-playful mb-6 text-2xl font-bold text-white">
              Butuh Bantuan Cepat?
            </h3>
            <div className="font-clean space-y-4 text-white/80">
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00B5D8] text-xs font-bold text-[#0F294A]">
                  @
                </span>
                <span>halo@sahabatdigital.id</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00B5D8] text-xs font-bold text-[#0F294A]">
                  Tlp
                </span>
                <span>+62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00B5D8] text-xs font-bold text-[#0F294A]">
                  Lok
                </span>
                <span>Pontianak, Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#top" onClick={noop} className="flex items-center gap-3">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo Sahabat Digital"
                  onError={() => setLogoSrc('')}
                  className="h-10 w-10 rounded-lg bg-white/10 object-contain p-1 sm:h-12 sm:w-12"
                />
              ) : (
                <div className="font-playful flex h-10 w-10 items-center justify-center rounded-lg bg-[#00B5D8] text-sm font-bold text-[#0F294A] sm:h-12 sm:w-12">
                  SD
                </div>
              )}
              <span className="font-playful text-2xl font-bold tracking-wide text-white sm:text-3xl">
                Sahabat Digital
              </span>
            </a>
            <p className="font-clean mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Ruang aman bagi siswa SD untuk belajar, mengenali, dan melaporkan
              cyberbullying bersama guru pendamping.
            </p>
          </div>

          <div>
            <h4 className="font-playful text-lg font-bold text-white">
              Tautan Penting
            </h4>
            <ul className="font-clean mt-4 space-y-3 text-sm text-white/70">
              {PENTING_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={`/${l.page}`}
                    onClick={go(l.page)}
                    className="cursor-pointer transition-colors hover:text-[#00B5D8]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-playful text-lg font-bold text-white">
              Bantuan
            </h4>
            <ul className="font-clean mt-4 space-y-3 text-sm text-white/70">
              {BANTUAN_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={`/${l.page}`}
                    onClick={go(l.page)}
                    className="cursor-pointer transition-colors hover:text-[#00B5D8]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="font-clean mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:text-sm">
          <span>
            &copy; {CURRENT_YEAR} Sahabat Digital. Hak Cipta
            Dilindungi.
          </span>
          <a
            href="/admin-login"
            onClick={go('admin-login')}
            className="cursor-pointer text-[10px] text-white/30 transition hover:text-white/70"
            title="Administrator"
          >
            Administrator
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
