import { AnimatedSection } from './AnimatedSection';
import type { User } from '../types/models';
import { isCurhatRestrictedForUser } from '../utils/accessControl';

const imageModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const getImgSrc = (filename: string): string =>
  imageModules[`../assets/${filename}`] ?? '';

interface FeaturesSectionProps {
  currentUser: User | null;
  onStartCurhat: () => void;
  onOpenMaterial: () => void;
  onStartQuiz: () => void;
}

export function FeaturesSection({
  currentUser,
  onStartCurhat,
  onOpenMaterial,
  onStartQuiz,
}: FeaturesSectionProps) {
  const paperPlaneSrc = getImgSrc('paper-plane.png');
  const isRestricted = isCurhatRestrictedForUser(currentUser);

  return (
    <section className="w-full overflow-hidden bg-white pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Bagian 1: Grid Kartu Fitur */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 place-items-center justify-center gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {/* Kartu 1: Curhat (Hijau) */}
          <AnimatedSection delay={0} className="flex h-full w-full justify-center">
            <div className="flex h-full min-h-80 w-full max-w-70 flex-col justify-between rounded-3xl bg-[#7BB642] p-6 text-left shadow-sm transition-transform hover:-translate-y-1 sm:p-8 md:max-w-none">
              <div>
                <h3 className="font-playful text-2xl font-bold text-[#1E3A6D]">
                  Butuh Teman Curhat?
                </h3>
                <p className="font-clean mt-3 text-sm leading-relaxed text-[#1E3A6D]/90 sm:text-base">
                  Ceritakan perasaanmu dengan aman. Guru akan siap mendengarkan
                  dan membantumu.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartCurhat}
                className="font-clean mt-8 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#2B569A] shadow-sm transition-colors duration-200 hover:bg-[#2B569A] hover:text-white"
              >
                {isRestricted ? 'Khusus Kelas 4-6' : 'Mulai Curhat'}
              </button>
            </div>
          </AnimatedSection>

          {/* Kartu 2: Materi (Biru) */}
          <AnimatedSection delay={200} className="flex h-full w-full justify-center">
            <div className="flex h-full min-h-80 w-full max-w-70 flex-col justify-between rounded-3xl bg-[#2B569A] p-6 text-left shadow-sm transition-transform hover:-translate-y-1 sm:p-8 md:max-w-none">
              <div>
                <h3 className="font-playful text-2xl font-bold text-white">
                  Pusat Materi
                </h3>
                <p className="font-clean mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                  Pelajari apa itu cyberbullying, dampaknya, dan cara melindungi
                  diri.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenMaterial}
                className="font-clean mt-8 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#2B569A] shadow-sm transition-colors duration-200 hover:bg-[#7BB642] hover:text-white"
              >
                Buka Materi
              </button>
            </div>
          </AnimatedSection>

          {/* Kartu 3: Latihan Soal (Cyan) */}
          <AnimatedSection delay={400} className="flex h-full w-full justify-center">
            <div className="flex h-full min-h-80 w-full max-w-70 flex-col justify-between rounded-3xl bg-[#00B5D8] p-6 text-left shadow-sm transition-transform hover:-translate-y-1 sm:p-8 md:max-w-none">
              <div>
                <h3 className="font-playful text-2xl font-bold text-[#1E3A6D]">
                  Latihan Soal
                </h3>
                <p className="font-clean mt-3 text-sm leading-relaxed text-[#1E3A6D]/90 sm:text-base">
                  Uji pemahamanmu lewat studi kasus interaktif dengan penjelasan
                  konsekuensi.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartQuiz}
                className="font-clean mt-8 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#2B569A] shadow-sm transition-colors duration-200 hover:bg-[#2B569A] hover:text-white"
              >
                Mulai Latihan
              </button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bagian 2: Teks Edukasi Singkat & Gambar Pesawat Kertas */}
      <div className="relative mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <div className="w-full text-left lg:w-3/5">
            <h2 className="font-playful text-3xl font-bold text-[#2B569A] sm:text-4xl lg:text-5xl">
              Kamu tidak sendirian.
            </h2>
            <h3 className="font-clean mt-4 text-2xl font-semibold text-[#00B5D8] sm:text-3xl lg:text-4xl">
              Bersama kita hentikan cyberbullying.
            </h3>
            <p className="font-clean mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Sahabat Digital hadir untuk membantu siswa SD memahami bahaya
              cyberbullying. Kami menyediakan ruang aman untuk bercerita, materi
              edukasi yang mudah dipahami, serta latihan soal interaktif. Jika
              kamu ingin memahami lebih dalam tentang cara melindungi diri dan
              teman-temanmu, pelajari materi lengkapnya di sini.
            </p>
            <div className="mt-8 flex justify-start">
              <button
                type="button"
                onClick={onOpenMaterial}
                className="font-playful inline-flex cursor-pointer items-center justify-center rounded-full bg-[#00B5D8] px-8 py-3.5 text-base font-bold text-[#0F294A] shadow-md transition-colors duration-200 hover:bg-[#2B569A] hover:text-white"
              >
                Pelajari Materi
              </button>
            </div>
          </div>

          <div className="relative hidden w-full justify-center lg:flex lg:w-2/5 lg:justify-end">
            {paperPlaneSrc ? (
              <div className="relative aspect-video w-full max-w-[200px] sm:max-w-[280px] lg:max-w-md">
                <img
                  src={paperPlaneSrc}
                  alt="Ilustrasi Pesawat Kertas"
                  className="h-full w-full animate-pulse object-contain drop-shadow-xl"
                  style={{ animationDuration: '3s' }}
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full max-w-[200px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-100 sm:max-w-[280px] lg:max-w-md">
                <span className="font-clean text-center text-sm text-slate-400">
                  Ilustrasi Pesawat Kertas
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
