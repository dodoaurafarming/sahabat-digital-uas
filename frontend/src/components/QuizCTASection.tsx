import { useState } from 'react';
import { loadAssetByKey } from '../utils/assetLoader';

interface QuizCTASectionProps {
  onStartQuiz: () => void;
}

const pngModules = import.meta.glob('../assets/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const defaultImage = loadAssetByKey(
  pngModules,
  '../assets/quiz-illustration.png',
);

export function QuizCTASection({ onStartQuiz }: QuizCTASectionProps) {
  const [imgSrc, setImgSrc] = useState<string>(defaultImage);

  return (
    <section className="relative w-full overflow-hidden bg-[#F3F8FC] pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="pointer-events-none absolute top-0 left-0 z-10 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[50px] w-full sm:h-[80px]"
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

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="w-full max-w-lg lg:w-1/2 lg:max-w-xl">
            <h2 className="font-playful text-3xl leading-tight font-bold text-[#2B569A] sm:text-4xl lg:text-5xl">
              Seberapa siap kamu <br className="hidden sm:block" /> menghadapi
              dunia digital?
            </h2>
            <p className="font-clean mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Uji pemahamanmu tentang cyberbullying lewat simulasi kasus
              sehari-hari. Pelajari konsekuensi dari setiap pilihanmu dengan
              cara yang seru dan aman.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#2B569A]/10 px-4 py-2">
              <span className="font-playful text-sm font-semibold text-[#2B569A]">
                Pilih jawabanmu, lihat akibatnya.
              </span>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onStartQuiz}
                className="font-playful inline-flex cursor-pointer items-center justify-center rounded-full bg-[#00B5D8] px-8 py-4 text-lg font-bold text-[#0F294A] shadow-md transition-colors duration-200 hover:bg-[#2B569A] hover:text-white"
              >
                Ayo Mulai Quiz
              </button>
            </div>
          </div>

          <div className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
            <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center sm:max-w-[340px]">
              <div className="absolute -bottom-4 -left-4 h-3/4 w-3/4 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-[#7BB642] opacity-40 mix-blend-multiply" />
              <div className="absolute -top-4 -right-4 h-4/5 w-4/5 rounded-[60%_40%_30%_70%/50%_60%_40%_50%] bg-[#00B5D8] opacity-40 mix-blend-multiply" />
              <div className="absolute inset-0 h-full w-full rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-[#2B569A]/10" />

              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt="Ilustrasi Quiz Sahabat Digital"
                  onError={() => setImgSrc('')}
                  className="relative z-10 h-[85%] w-[85%] rounded-[50%_50%_40%_60%/60%_40%_60%_40%] object-cover shadow-lg"
                />
              ) : (
                <div className="relative z-10 flex h-[85%] w-[85%] items-center justify-center rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-gradient-to-br from-[#00B5D8] to-[#2B569A] text-white shadow-lg">
                  <span className="font-clean px-4 text-center text-sm">
                    Ilustrasi Kuis Sahabat Digital
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full rotate-180 overflow-hidden leading-[0]">
        <svg
          className="relative block h-[50px] w-full sm:h-[80px]"
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
    </section>
  );
}

export default QuizCTASection;
