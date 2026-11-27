import { useEffect, useState } from 'react';

interface RewardPageProps {
  score: number;
  totalQuestions?: number;
  onRestart: () => void;
  onBackHome: () => void;
}

const assetModules = import.meta.glob(
  '../assets/*.{png,jpg,jpeg,webp,svg}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>;

const getIconSrc = (filename: string): string =>
  assetModules[`../assets/${filename}`] ?? '';

export function RewardPage({
  score,
  totalQuestions = 10,
  onRestart,
  onBackHome,
}: RewardPageProps) {
  const [trophyError, setTrophyError] = useState<boolean>(false);
  const trophySrc = getIconSrc('icon-trophy.png');

  useEffect(() => {
    const bgMusic = new Audio('/sounds/win-music.mp3');
    bgMusic.volume = 0.5;
    bgMusic.play().catch(() => {});

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  const playClickSound = () => {
    const clickAudio = new Audio('/sounds/click.mp3');
    clickAudio.play().catch(() => {});
  };

  const handleRestartClick = () => {
    playClickSound();
    onRestart();
  };

  const handleBackHomeClick = () => {
    playClickSound();
    onBackHome();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B569A] via-[#00B5D8] to-[#7BB642] px-4 py-12 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-10 h-6 w-6 animate-bounce rounded-full bg-[#FEF08A]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-16 h-8 w-8 animate-bounce rounded-2xl bg-[#FECDD3]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 left-20 h-7 w-7 animate-bounce rounded-xl bg-[#BBF7D0]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-24 bottom-16 h-6 w-6 animate-bounce rounded-full bg-[#FEF08A]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 h-5 w-5 animate-bounce rounded-full bg-white/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-1/3 h-5 w-5 animate-bounce rounded-full bg-[#BAE6FD]"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[3rem] border border-white/20 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-md sm:p-14">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white/20 shadow-inner">
          {trophySrc && !trophyError ? (
            <img
              src={trophySrc}
              alt="Piala Penghargaan"
              onError={() => setTrophyError(true)}
              className="h-20 w-20 object-contain"
            />
          ) : (
            <span className="font-playful text-6xl font-bold text-[#FEF08A]">
              ★
            </span>
          )}
        </div>

        <h1 className="font-playful text-5xl font-bold text-white">
          Luar Biasa!
        </h1>

        <p className="font-clean mx-auto mt-3 max-w-md text-base text-white/90 sm:text-lg">
          Kamu sudah menyelesaikan seluruh tantangan studi kasus Sahabat
          Digital!
        </p>

        <div className="my-8">
          <p className="font-playful text-5xl font-bold text-[#FEF08A] sm:text-7xl">
            Skor Kamu: {score}/{totalQuestions}
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleRestartClick}
            className="font-playful w-full cursor-pointer rounded-full bg-white px-8 py-4 text-lg font-bold text-[#2B569A] shadow-lg transition-transform hover:scale-105 active:scale-95 sm:w-auto"
          >
            Main Lagi
          </button>
          <button
            type="button"
            onClick={handleBackHomeClick}
            className="font-playful w-full cursor-pointer rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 hover:bg-white/10 active:scale-95 sm:w-auto"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default RewardPage;
