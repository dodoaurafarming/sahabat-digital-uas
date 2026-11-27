import { useState } from 'react';

interface FAQPageProps {
  onBackHome: () => void;
}

const FAQS = [
  {
    q: 'Apa itu Sahabat Digital?',
    a: 'Sahabat Digital adalah ruang belajar aman untuk siswa SD agar memahami bahaya cyberbullying, bisa bercerita dengan guru pendamping, dan berlatih lewat soal interaktif.',
  },
  {
    q: 'Apakah cerita saya di Ruang Curhat rahasia?',
    a: 'Ya. Obrolan kamu hanya bisa dilihat oleh kamu dan guru pendamping yang kamu pilih. Kami tidak membagikan ceritamu ke siswa lain.',
  },
  {
    q: 'Kenapa Ruang Curhat hanya untuk kelas 4–6?',
    a: 'Karena fitur ini dirancang untuk kakak-kakak yang sudah lebih siap bercerita mandiri. Untuk kelas 1–3, kamu tetap bisa cerita ke Bapak/Ibu Guru di kelas atau Orang Tua di rumah.',
  },
  {
    q: 'Bagaimana cara menjadi guru di sini?',
    a: 'Guru mendaftar lalu akunnya harus disetujui oleh Administrator sekolah. Ini menjaga supaya hanya guru sungguhan yang bisa membaca cerita siswa.',
  },
  {
    q: 'Saya lupa password, harus bagaimana?',
    a: 'Tenang, minta bantuan Bapak/Ibu Guru atau Orang Tua untuk menghubungi Administrator sekolah agar akunmu bisa diatur ulang.',
  },
  {
    q: 'Apakah ada biaya untuk memakai Sahabat Digital?',
    a: 'Tidak ada. Sahabat Digital gratis untuk seluruh siswa dan guru di sekolah yang bekerja sama.',
  },
];

export function FAQPage({ onBackHome }: FAQPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#00B5D8]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#7BB642]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-[#FEF08A]/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBackHome}
          aria-label="Kembali ke Beranda"
          className="mb-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-100 bg-white text-[#2B569A] shadow-md transition-colors hover:bg-[#2B569A] hover:text-white"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h1 className="font-playful text-3xl font-bold text-[#2B569A] sm:text-5xl">
          Pertanyaan Umum
        </h1>
        <p className="font-clean mt-3 mb-10 max-w-xl text-base text-slate-600 sm:text-lg">
          Ada yang ingin kamu tanyakan? Ini jawaban untuk hal-hal yang paling sering ditanya.
        </p>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-3xl bg-white shadow-xs ring-1 ring-slate-100"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F3F8FC]"
                >
                  <span className="font-playful text-base font-bold text-[#1E3A6D] sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#2B569A] transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#00B5D8]/15' : 'bg-[#F3F8FC]'
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="font-clean border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
