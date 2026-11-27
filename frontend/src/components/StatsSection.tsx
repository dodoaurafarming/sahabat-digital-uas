import { useState } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';

const imageModules = import.meta.glob('../assets/stats.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultStatsImg = loadAssetByKey(
  imageModules,
  '../assets/stats.jpg',
);

export function StatsSection() {
  const [imgSrc, setImgSrc] = useState<string>(defaultStatsImg);

  return (
    <section className="w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="w-full lg:w-1/2">
            <div className="overflow-hidden rounded-3xl shadow-lg">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt="Data Cyberbullying di Indonesia"
                  onError={() => setImgSrc('')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-[#2B569A] to-[#00B5D8] text-white">
                  <span className="font-clean text-base font-semibold">
                    Data Cyberbullying Indonesia
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <h2 className="font-playful text-3xl font-bold text-[#2B569A] sm:text-4xl">
              Data Bicara: Cyberbullying di Indonesia
            </h2>

            <p className="font-clean mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Cyberbullying bukan hal sepele. Data resmi pemerintah menunjukkan
              bahwa hampir separuh anak Indonesia pernah mengalaminya.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="font-playful text-5xl font-bold text-[#00B5D8] sm:text-6xl">
                  48%
                </p>
                <p className="font-clean mt-1 text-sm leading-relaxed text-slate-600">
                  anak Indonesia pernah mengalami perundungan online
                </p>
              </div>

              <div>
                <p className="font-playful text-5xl font-bold text-[#00B5D8] sm:text-6xl">
                  45%
                </p>
                <p className="font-clean mt-1 text-sm leading-relaxed text-slate-600">
                  perundungan terjadi lewat aplikasi chat
                </p>
              </div>
            </div>

            <p className="font-clean mt-4 text-xs text-slate-400">
              Sumber: Kementerian Komunikasi dan Digital (2025)
            </p>

            <button
              type="button"
              onClick={() => window.open('https://portal.komdigi.go.id', '_blank')}
              className="font-playful mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#2B569A] px-8 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-[#00B5D8] hover:text-[#0F294A]"
            >
              Sumber Resmi Pemerintah
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
