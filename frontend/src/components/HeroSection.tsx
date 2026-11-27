import { useState } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';

const imageModules = import.meta.glob('../assets/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultHeroSrc = loadAssetByKey(
  imageModules,
  '../assets/hero-sahabat-digital.png',
);

interface HeroSectionProps {
  onStartCurhat: () => void;
}

export function HeroSection({ onStartCurhat }: HeroSectionProps) {
  const [heroSrc, setHeroSrc] = useState<string>(defaultHeroSrc);

  return (
    <section
      id="top"
      className={`relative flex min-h-120 w-full items-center overflow-hidden sm:min-h-135 lg:min-h-150 ${
        heroSrc
          ? 'bg-[#F3F8FC]'
          : 'bg-linear-to-br from-[#2B569A] via-[#00B5D8] to-[#7BB642]'
      }`}
    >
      {heroSrc && (
        <img
          src={heroSrc}
          alt="Hero Sahabat Digital"
          onError={() => setHeroSrc('')}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-[#F3F8FC]/95 via-[#F3F8FC]/80 to-[#2B569A]/25 md:via-[#F3F8FC]/75 md:to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-3xl leading-tight sm:text-5xl lg:text-[3.35rem]">
            <span className="font-playful block font-bold text-[#00B5D8]">
              Kamu nggak sendirian,
            </span>
            <span className="font-clean mt-1 block font-extrabold text-[#2B569A]">
              ruang aman untuk cerita &amp; belajar
            </span>
          </h1>

          <p className="font-clean mt-4 max-w-md text-sm leading-relaxed font-medium text-[#1E3A6D] sm:text-base">
            <span className="font-playful font-semibold text-[#7BB642]">
              Sahabat Digital
            </span>{' '}
            hadir menemani siswa SD mengenali cyberbullying dan berbagi cerita
            bersama guru.
          </p>

          <div className="mt-7">
            <button
              type="button"
              onClick={onStartCurhat}
              className="font-playful inline-flex cursor-pointer items-center justify-center rounded-full bg-[#00B5D8] px-7 py-3.5 text-base font-bold text-[#0F294A] shadow-md transition hover:bg-[#7BB642] hover:text-white sm:px-8 sm:py-4 sm:text-lg"
            >
              Ayo Mulai Curhat
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[60px] w-full sm:h-[100px]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
