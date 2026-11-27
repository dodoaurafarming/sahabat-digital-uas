import { useState } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';

interface QuizIntroPageProps {
  onStartQuiz: () => void;
  onBackHome: () => void;
}

const assetModules = import.meta.glob(
  '../assets/*.{png,jpg,jpeg,webp,svg}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

const defaultIntroImg =
  assetModules['../assets/quiz-intro.png'] ??
  assetModules['../assets/quiz-intro.jpg'] ??
  loadAssetByKey(assetModules, '../assets/quiz-intro.jpg');

const arrowLeftSrc = assetModules['../assets/icon-arrow-left.png'] ?? '';
const warningIconSrc = assetModules['../assets/icon-warning.png'] ?? '';

export function QuizIntroPage({
  onStartQuiz,
  onBackHome,
}: QuizIntroPageProps) {
  const [introImgSrc, setIntroImgSrc] = useState<string>(defaultIntroImg);

  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(() => {});
  };

  const handleStart = () => {
    playClickSound();
    onStartQuiz();
  };

  const handleBack = () => {
    playClickSound();
    onBackHome();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F3F8FC] px-4 py-12 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00B5D8]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#7BB642]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-[#2B569A]/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[3rem] bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mb-4 flex justify-start">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali ke Beranda"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#F3F8FC] text-[#2B569A] shadow-sm transition-transform hover:scale-105"
          >
            {arrowLeftSrc ? (
              <img
                src={arrowLeftSrc}
                alt="Kembali"
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-playful text-xl font-bold">&larr;</span>
            )}
          </button>
        </div>

        <div className="mx-auto mb-6 flex max-w-[220px] justify-center sm:max-w-[260px]">
          {introImgSrc ? (
            <img
              src={introImgSrc}
              alt="Persiapan Quiz Sahabat Digital"
              onError={() => setIntroImgSrc('')}
              className="h-auto w-full rounded-3xl object-contain drop-shadow-md"
            />
          ) : (
            <div className="flex aspect-4/3 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[#00B5D8] to-[#7BB642] p-6 text-white shadow-md">
              <span className="font-playful text-2xl font-bold">
                Siap Beraksi?
              </span>
            </div>
          )}
        </div>

        <div className="inline-block rounded-full bg-[#E0F2FE] px-5 py-2 text-sm font-bold text-[#0369A1]">
          Total 10 Soal &bull; Pilihan Ganda
        </div>

        <h1 className="font-playful mt-4 text-3xl leading-tight font-bold text-[#2B569A] sm:text-5xl">
          Siap Uji Pemahamanmu?
        </h1>

        <p className="font-clean mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
          Jangan takut salah! Di sini kita belajar bersama untuk melindungi diri
          dan teman dari cyberbullying.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-orange-300 bg-rose-50/70 p-5 text-left sm:flex-row sm:items-start sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            {warningIconSrc ? (
              <img
                src={warningIconSrc}
                alt="Peringatan"
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-playful text-2xl font-bold">!</span>
            )}
          </div>
          <p className="font-clean text-center text-sm leading-relaxed font-medium text-orange-950 sm:text-left sm:text-base">
            Jangan lupa, kerjakan dengan jujur ya! Dilarang mencari jawaban di
            internet atau bertanya ke teman. Kita mau lihat seberapa hebat kamu!
          </p>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleStart}
            className="font-playful w-full cursor-pointer rounded-full bg-[#00B5D8] py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Mulai Ujian!
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizIntroPage;
