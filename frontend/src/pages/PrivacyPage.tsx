interface PrivacyPageProps {
  onBackHome: () => void;
}

const SECTIONS = [
  {
    icon: '🔒',
    title: 'Data yang Kami Kumpulkan',
    body: 'Kami menyimpan nama, email, kelas, dan jenis kelamin untuk membuat akunmu. Untuk guru, kami menyimpan NIP dan mata pelajaran sebagai identitas resmi.',
  },
  {
    icon: '💬',
    title: 'Rahasia Ruang Curhat',
    body: 'Cerita kamu di Ruang Curhat hanya bisa dilihat oleh kamu dan guru pendamping yang kamu pilih. Kami tidak menjual atau membagikan isi obrolan kepada pihak lain.',
  },
  {
    icon: '📷',
    title: 'Foto & Lampiran',
    body: 'Gambar yang kamu kirim disimpan dengan aman di penyimpanan server kami. Kamu atau guru dapat menghapusnya kapan saja dari obrolan.',
  },
  {
    icon: '👀',
    title: 'Persetujuan Guru',
    body: 'Setiap akun guru harus disetujui Administrator sekolah sebelum bisa masuk. Ini memastikan hanya guru terpercaya yang dapat membaca cerita siswa.',
  },
  {
    icon: '🗑️',
    title: 'Menghapus Data',
    body: 'Kamu dapat meminta akun dan datamu dihapus dengan menghubungi Administrator sekolah. Data yang dihapus tidak dapat dikembalikan.',
  },
];

export function PrivacyPage({ onBackHome }: PrivacyPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#00B5D8]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-[#7BB642]/20 blur-3xl"
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
          Kebijakan Privasi
        </h1>
        <p className="font-clean mt-3 mb-10 max-w-xl text-base text-slate-600 sm:text-lg">
          Keamanan dan kenyamanan kamu adalah prioritas kami. Ini cara kami menjaga datamu.
        </p>

        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-100 sm:p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8FC] text-2xl">
                {s.icon}
              </span>
              <div>
                <h3 className="font-playful text-base font-bold text-[#1E3A6D] sm:text-lg">
                  {s.title}
                </h3>
                <p className="font-clean mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="font-clean mt-8 text-center text-xs text-slate-400">
          Terakhir diperbarui: November 2026
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
