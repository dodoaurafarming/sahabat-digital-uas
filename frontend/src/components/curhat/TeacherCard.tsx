import { useState } from 'react';

export interface TeacherCardProps {
  name: string;
  subject: string;
  isOnline: boolean;
  avatarSrc?: string;
  colorTheme: string;
  onStartChat: () => void;
}

export function TeacherCard({
  name,
  subject,
  isOnline,
  avatarSrc,
  colorTheme,
  onStartChat,
}: TeacherCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      style={{
        boxShadow: isCardHovered
          ? `0 25px 35px -5px ${colorTheme}40, 0 10px 15px -5px ${colorTheme}26`
          : `0 20px 25px -5px ${colorTheme}33, 0 8px 10px -6px ${colorTheme}1A`,
      }}
      className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl transition-all duration-300 hover:-translate-y-3"
    >
      <div
        style={{ backgroundColor: colorTheme }}
        className="relative h-32 w-full"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-6 h-14 w-14 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              {avatarSrc && !imgError ? (
                <img
                  src={avatarSrc}
                  alt={name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  style={{ backgroundColor: colorTheme }}
                  className="font-playful flex h-full w-full items-center justify-center text-2xl font-bold text-white"
                >
                  {getInitials(name)}
                </div>
              )}
            </div>

            <div className="absolute -top-1 -right-6 flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 shadow-md">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline ? 'animate-pulse bg-[#7BB642]' : 'bg-slate-300'
                }`}
              />
              <span
                className={`font-clean text-[11px] font-bold ${
                  isOnline ? 'text-[#166534]' : 'text-slate-500'
                }`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center bg-white px-6 pt-14 pb-7 text-center">
        <h2 className="font-playful text-2xl font-bold text-[#0F294A]">
          {name}
        </h2>
        <p className="font-clean mt-1 text-sm font-medium text-slate-500">
          {subject}
        </p>

        <button
          type="button"
          onClick={onStartChat}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          style={{
            backgroundColor: isButtonHovered ? '#0F294A' : colorTheme,
          }}
          className="font-playful mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          <span>Mulai Curhat</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TeacherCard;
