interface TermsPageProps {
  onBackHome: () => void;
}

const TERMS = [
  {
    num: '01',
    title: 'Siapa yang Boleh Pakai',
    body: 'Sahabat Digital untuk siswa SD kelas 4–6 dan guru yang sudah disetujui Administrator. Kelas 1–3 tetap bisa memakai Pusat Materi dan Latihan Soal.',
  },
  {
    num: '02',
    title: 'Bertingkah Sopan',
    body: 'Dilarang memakai ruang curhat atau chat untuk mengejek, mengancam, atau merundung orang lain. Justru di sinilah kita belajar menjadi sahabat baik.',
  },
  {
    num: '03',
    title: 'Cerita yang Benar',
    body: 'Ceritakan apa yang kamu alami dengan jujur. Guru akan membantu semampu mereka, tapi untuk keadaan darurat (bahaya fisik), segera hubungi Orang Tua atau Guru di sekolah.',
  },
  {
    num: '04',
    title: 'Jaga Akunmu',
    body: 'Jangan bagikan email dan password kepada teman. Kamu bertanggung jawab atas apa yang terjadi di akunmu.',
  },
  {
    num: '05',
    title: 'Perubahan Aturan',
    body: 'Aturan ini bisa diperbarui sewaktu-waktu demi keamanan bersama. Kami akan memberi tahu jika ada perubahan penting.',
  },
];

export function TermsPage({ onBackHome }: TermsPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#7BB642]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#00B5D8]/20 blur-3xl"
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
          Syarat &amp; Ketentuan
        </h1>
        <p className="font-clean mt-3 mb-10 max-w-xl text-base text-slate-600 sm:text-lg">
          Aturan sederhana supaya semua orang tetap aman dan nyaman belajar bersama.
        </p>

        <div className="space-y-4">
          {TERMS.map((t) => (
            <div
              key={t.num}
              className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-100 sm:p-6"
            >
              <span className="font-playful flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2B569A] text-sm font-bold text-white">
                {t.num}
              </span>
              <div>
                <h3 className="font-playful text-base font-bold text-[#1E3A6D] sm:text-lg">
                  {t.title}
                </h3>
                <p className="font-clean mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-[#2B569A] p-6 text-center shadow-md">
          <p className="font-playful text-lg font-bold text-white">
            Dengan memakai Sahabat Digital, kamu setuju untuk menjadi sahabat yang baik. 🤝
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
