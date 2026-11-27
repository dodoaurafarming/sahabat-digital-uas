import { useState } from 'react';
import {
  MATERIAL_DATA,
  type MaterialSectionItem,
} from '../data/materialData';

import iconPengertian from '../assets/icon-pengertian.png';
import iconContoh from '../assets/icon-contoh.png';
import iconDampak from '../assets/icon-dampak.png';
import iconPencegahan from '../assets/icon-pencegahan.png';
import iconCaraMenghadapi from '../assets/icon-cara-menghadapi.png';
import iconBantuTeman from '../assets/icon-bantu-teman.png';
import iconArrowLeft from '../assets/icon-arrow-left.png';
import materiHero from '../assets/materi-hero.png';

interface MaterialDetailPageProps {
  onStartQuiz: () => void;
  onBackHome?: () => void;
}

interface CardColorTheme {
  cardBg: string;
  headingText: string;
  bodyText: string;
  numberText: string;
  shapePrimary: string;
  shapeSecondary: string;
}

const CARD_THEMES: Record<string, CardColorTheme> = {
  pengertian: {
    cardBg: 'bg-[#E0F2FE]',
    headingText: 'text-[#0F294A]',
    bodyText: 'text-[#1E3A6D]',
    numberText: 'text-[#0F294A]',
    shapePrimary: 'bg-[#0284C7]/15',
    shapeSecondary: 'bg-white/60',
  },
  contoh: {
    cardBg: 'bg-[#ECFCCB]',
    headingText: 'text-[#14532D]',
    bodyText: 'text-[#166534]',
    numberText: 'text-[#14532D]',
    shapePrimary: 'bg-[#65A30D]/15',
    shapeSecondary: 'bg-white/60',
  },
  dampak: {
    cardBg: 'bg-[#FCE7F3]',
    headingText: 'text-[#831843]',
    bodyText: 'text-[#9D174D]',
    numberText: 'text-[#831843]',
    shapePrimary: 'bg-[#DB2777]/15',
    shapeSecondary: 'bg-white/60',
  },
  pencegahan: {
    cardBg: 'bg-[#FEF9C3]',
    headingText: 'text-[#713F12]',
    bodyText: 'text-[#854D0E]',
    numberText: 'text-[#713F12]',
    shapePrimary: 'bg-[#CA8A04]/15',
    shapeSecondary: 'bg-white/60',
  },
  'cara-menghadapi': {
    cardBg: 'bg-[#CFFAFE]',
    headingText: 'text-[#164E63]',
    bodyText: 'text-[#155E75]',
    numberText: 'text-[#164E63]',
    shapePrimary: 'bg-[#0891B2]/15',
    shapeSecondary: 'bg-white/60',
  },
  'bantu-teman': {
    cardBg: 'bg-[#FFEDD5]',
    headingText: 'text-[#7C2D12]',
    bodyText: 'text-[#9A3412]',
    numberText: 'text-[#7C2D12]',
    shapePrimary: 'bg-[#EA580C]/15',
    shapeSecondary: 'bg-white/60',
  },
};

const ICON_MAP: Record<string, string> = {
  pengertian: iconPengertian,
  contoh: iconContoh,
  dampak: iconDampak,
  pencegahan: iconPencegahan,
  'cara-menghadapi': iconCaraMenghadapi,
  'bantu-teman': iconBantuTeman,
};

function cleanNumberPrefix(text: string): string {
  return text.replace(/^\d+\.\s*/, '');
}

interface BentoCardProps {
  section: MaterialSectionItem;
  singleColumnList?: boolean;
  className?: string;
}

function BentoMaterialCard({
  section,
  singleColumnList = false,
  className = '',
}: BentoCardProps) {
  const iconSrc = ICON_MAP[section.id] ?? '';
  const theme = CARD_THEMES[section.id] ?? CARD_THEMES.pengertian;

  return (
    <article
      id={section.id}
      className={`group relative flex scroll-mt-28 flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-10 ${theme.cardBg} ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-14 -right-14 h-48 w-48 rounded-full transition-transform duration-500 group-hover:scale-110 ${theme.shapePrimary}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-16 -left-12 h-40 w-56 rounded-[60%_40%_50%_50%] transition-transform duration-500 group-hover:scale-110 ${theme.shapeSecondary}`}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4">
          {iconSrc && (
            <img
              src={iconSrc}
              alt={section.title}
              className="h-12 w-12 shrink-0 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <h2
            className={`font-playful text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl ${theme.headingText}`}
          >
            {section.title}
          </h2>
        </div>

        {section.paragraphs && section.paragraphs.length > 0 && (
          <div className="mt-6 space-y-4">
            {section.paragraphs.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className={`font-clean text-base leading-relaxed sm:text-lg ${theme.bodyText}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {section.list && section.list.length > 0 && (
          <div
            className={`mt-8 grid grid-cols-1 gap-8 ${
              singleColumnList ? '' : 'md:grid-cols-2'
            }`}
          >
            {section.list.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <span
                  className={`font-playful shrink-0 text-4xl leading-none font-bold opacity-30 ${theme.numberText}`}
                >
                  {idx + 1}
                </span>
                <div>
                  <h3
                    className={`font-playful text-lg font-bold sm:text-xl ${theme.headingText}`}
                  >
                    {cleanNumberPrefix(item.title)}
                  </h3>
                  <p
                    className={`font-clean mt-1.5 text-sm leading-relaxed sm:text-base ${theme.bodyText}`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function MaterialDetailPage({
  onStartQuiz,
  onBackHome,
}: MaterialDetailPageProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    MATERIAL_DATA[0].id,
  );

  const handleScrollToSection = (id: string) => {
    setActiveSectionId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pengertianSection = MATERIAL_DATA.find((s) => s.id === 'pengertian');
  const contohSection = MATERIAL_DATA.find((s) => s.id === 'contoh');
  const dampakSection = MATERIAL_DATA.find((s) => s.id === 'dampak');
  const pencegahanSection = MATERIAL_DATA.find((s) => s.id === 'pencegahan');
  const menghadapiSection = MATERIAL_DATA.find(
    (s) => s.id === 'cara-menghadapi',
  );
  const bantuTemanSection = MATERIAL_DATA.find((s) => s.id === 'bantu-teman');

  return (
    <div className="min-h-screen w-full bg-[#F3F8FC] pb-24">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F3F8FC] via-white to-[#F3F8FC] pt-10 pb-14 sm:pt-14 sm:pb-18">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-8 h-72 w-72 animate-pulse rounded-full bg-[#00B5D8]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-12 bottom-0 h-64 w-64 animate-pulse rounded-full bg-[#7BB642]/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              aria-label="Kembali"
              className="mb-8 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-slate-100 bg-white shadow-md transition-transform hover:scale-105"
            >
              <img
                src={iconArrowLeft}
                alt="Kembali"
                className="h-6 w-6 object-contain"
              />
            </button>
          )}

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="font-playful text-4xl leading-tight font-bold text-[#2B569A] sm:text-5xl lg:text-6xl">
                Kenali Cyberbullying
              </h1>

              <p className="font-clean mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Yuk, pelajari cara melindungi diri dan teman-temanmu di dunia
                digital dengan cara yang mudah, seru, dan menyenangkan!
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="mx-auto max-w-[280px] overflow-hidden rounded-[2.5rem] bg-white shadow-xl sm:max-w-[350px] lg:mr-0 lg:ml-auto">
                <img
                  src={materiHero}
                  alt="Ilustrasi Kenali Cyberbullying"
                  className="aspect-4/3 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Navigasi bagian materi"
        className="sticky top-16 z-30 border-y border-slate-200/60 bg-white/85 py-3.5 backdrop-blur-md sm:top-20"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto px-4 sm:justify-center sm:px-6 lg:px-8">
          {MATERIAL_DATA.map((section) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleScrollToSection(section.id)}
                className={`font-playful shrink-0 cursor-pointer rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                  isActive
                    ? 'border border-[#2B569A] bg-[#2B569A] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-[#2B569A] hover:border-[#00B5D8] hover:bg-[#F3F8FC]'
                }`}
              >
                {section.navLabel}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto mt-12 max-w-7xl space-y-8 px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {pengertianSection && (
            <BentoMaterialCard
              section={pengertianSection}
              singleColumnList
              className="lg:col-span-5"
            />
          )}
          {contohSection && (
            <BentoMaterialCard
              section={contohSection}
              className="lg:col-span-7"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {dampakSection && (
            <BentoMaterialCard section={dampakSection} singleColumnList />
          )}
          {pencegahanSection && (
            <BentoMaterialCard section={pencegahanSection} singleColumnList />
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {menghadapiSection && (
            <BentoMaterialCard section={menghadapiSection} singleColumnList />
          )}
          {bantuTemanSection && (
            <BentoMaterialCard section={bantuTemanSection} singleColumnList />
          )}
        </div>

        <div className="group relative mt-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2B569A] via-[#1E437A] to-[#00B5D8] p-10 text-center text-white shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-[#7BB642]/20 transition-transform duration-500 group-hover:scale-110"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-playful text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
              Sudah paham materinya? Uji pemahamanmu sekarang!
            </h2>
            <p className="font-clean mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              Yuk, ikuti latihan soal interaktif dan lihat langsung konsekuensi
              dari setiap pilihanmu.
            </p>
            <button
              type="button"
              onClick={onStartQuiz}
              className="font-playful mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-10 py-4 text-base font-bold text-[#2B569A] shadow-lg transition-transform duration-300 hover:scale-105 sm:text-lg"
            >
              Mulai Latihan Soal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialDetailPage;
