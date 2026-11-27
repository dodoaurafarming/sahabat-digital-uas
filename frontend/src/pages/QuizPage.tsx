import { useState } from 'react';
import { QUIZ_DATA } from '../data/quizData';
import { quizApi } from '../services/api';

interface QuizPageProps {
  onFinish: (score: number) => void;
  onBackHome?: () => void;
}

const assetModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const getIconSrc = (filename: string): string =>
  assetModules[`../assets/${filename}`] ?? '';

const OPTION_BADGE_COLORS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'bg-[#FEF08A] text-[#713F12]',
  B: 'bg-[#BBF7D0] text-[#14532D]',
  C: 'bg-[#BAE6FD] text-[#0F294A]',
  D: 'bg-[#FECDD3] text-[#881337]',
};

export function QuizPage({ onFinish, onBackHome }: QuizPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const totalQuestions = QUIZ_DATA.length;
  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play().catch(() => {});
  };

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;

    playSound('click');
    setSelectedOption(key);
    setIsAnswered(true);

    if (key === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  const handleNextQuestion = async () => {
    playSound('click');
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = score;
      try {
        await quizApi.submitScore({
          score: finalScore,
          total_questions: totalQuestions,
          module_slug: 'cyberbullying-dasar',
        });
      } catch {
        // Tetap tampilkan halaman penghargaan meski backend offline
      }
      onFinish(finalScore);
    }
  };

  const arrowLeftSrc = getIconSrc('icon-arrow-left.png');
  const checkIconSrc = getIconSrc('icon-check.png');
  const crossIconSrc = getIconSrc('icon-cross.png');

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F3F8FC] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00B5D8]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -right-28 h-[28rem] w-[28rem] rounded-[60%_40%_30%_70%/50%_60%_40%_50%] bg-[#7BB642]/20 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#00B5D8]/15 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {onBackHome && (
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onBackHome();
                }}
                aria-label="Kembali"
                className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                {arrowLeftSrc ? (
                  <img
                    src={arrowLeftSrc}
                    alt="Kembali"
                    className="h-6 w-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="font-playful text-xl font-bold text-[#2B569A]">&larr;</span>
                )}
              </button>
            )}
            <div>
              <span className="font-playful text-2xl font-bold text-[#2B569A] sm:text-3xl">
                Soal {currentQuestionIndex + 1} dari {totalQuestions}
              </span>
            </div>
          </div>

          <div className="h-5 w-full overflow-hidden rounded-full bg-white p-1 shadow-inner sm:max-w-xs">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="h-full rounded-full bg-[#7BB642] transition-all duration-500 ease-out"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl sm:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FEF08A]/40" />

          <h1 className="font-playful relative z-10 text-2xl leading-snug font-bold text-[#2B569A] sm:text-3xl">
            {currentQuestion.scenario}
          </h1>

          <div className="relative z-10 mt-8 space-y-4">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.key;
              const isThisCorrect = option.key === currentQuestion.correctAnswer;

              let buttonStateClass =
                'border-2 border-slate-200 bg-white hover:-translate-y-1 hover:border-[#00B5D8] hover:bg-[#F3F8FC] hover:shadow-md active:scale-95';

              if (isAnswered) {
                if (isSelected && isCorrect) buttonStateClass = 'border-4 border-[#7BB642] bg-[#DCFCE7]/50 shadow-md scale-[1.01]';
                else if (isSelected && !isCorrect) buttonStateClass = 'border-4 border-[#EF4444] bg-[#FEE2E2]/50 shadow-md';
                else if (isThisCorrect) buttonStateClass = 'border-4 border-[#7BB642] bg-[#DCFCE7]/30';
                else buttonStateClass = 'border-2 border-slate-100 bg-white opacity-60';
              }

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option.key)}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 ${buttonStateClass}`}
                >
                  <span
                    className={`font-playful flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${OPTION_BADGE_COLORS[option.key]}`}
                  >
                    {option.key}
                  </span>
                  <span className="font-clean text-base font-semibold text-[#0F294A] sm:text-lg">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="relative z-10 mt-8 space-y-6">
              <div
                className={`flex items-start gap-4 rounded-3xl p-6 shadow-lg transition-all duration-300 ${
                  isCorrect
                    ? 'bg-[#DCFCE7] text-[#166534]'
                    : 'bg-[#FEE2E2] text-[#991B1B]'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                  {isCorrect ? (
                    checkIconSrc ? (
                      <img
                        src={checkIconSrc}
                        alt="Benar"
                        className="h-7 w-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="font-playful text-2xl font-bold text-[#166534]">&#10003;</span>
                    )
                  ) : crossIconSrc ? (
                    <img
                      src={crossIconSrc}
                      alt="Kurang Tepat"
                      className="h-7 w-7 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="font-playful text-2xl font-bold text-[#991B1B]">&#10005;</span>
                  )}
                </div>

                <div>
                  <h2 className="font-playful text-xl font-bold sm:text-2xl">
                    {isCorrect ? 'Jawabanmu Tepat!' : 'Belum Tepat!'}
                  </h2>
                  <p className="font-clean mt-1 text-sm leading-relaxed font-medium sm:text-base">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="font-playful cursor-pointer rounded-full bg-[#2B569A] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#00B5D8] hover:text-[#0F294A] active:scale-95"
                >
                  {currentQuestionIndex + 1 < totalQuestions
                    ? 'Lanjut Soal'
                    : 'Lihat Hasil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
