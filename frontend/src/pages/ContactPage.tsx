import { useState, type FormEvent } from 'react';

interface ContactPageProps {
  onBackHome: () => void;
}

const CONTACT_INFO = [
  {
    icon: '📧',
    label: 'Email',
    value: 'halo@sahabatdigital.id',
    desc: 'Kami balas dalam 1–2 hari kerja.',
  },
  {
    icon: '📞',
    label: 'Telepon Sekolah',
    value: '+62 812 3456 7890',
    desc: 'Senin–Jumat, pukul 08.00–15.00 WIB.',
  },
  {
    icon: '📍',
    label: 'Alamat',
    value: 'SD Negeri 03 Pontianak Timur',
    desc: 'Jl. Tanjung Raya II, Pontianak, Kalimantan Barat.',
  },
];

export function ContactPage({ onBackHome }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 900);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#F3F8FC] py-10 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#7BB642]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#00B5D8]/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
          Kontak Kami
        </h1>
        <p className="font-clean mt-3 mb-10 max-w-xl text-base text-slate-600 sm:text-lg">
          Punya pertanyaan atau masukan? Kami senang mendengarnya.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-xs ring-1 ring-slate-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F8FC] text-2xl">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-clean text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="font-playful truncate text-base font-bold text-[#1E3A6D] sm:text-lg">
                    {item.value}
                  </p>
                  <p className="font-clean mt-0.5 text-xs text-slate-500 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-slate-100 sm:p-8">
            {isSent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <div className="text-6xl">💌</div>
                <h3 className="font-playful mt-4 text-xl font-bold text-[#7BB642]">
                  Pesan Terkirim!
                </h3>
                <p className="font-clean mt-2 text-sm text-slate-600">
                  Terima kasih sudah menghubungi kami. Tim Sahabat Digital akan segera membalas pesanmu.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="font-playful mt-6 cursor-pointer rounded-full bg-[#00B5D8] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2B569A]"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-playful text-lg font-bold text-[#2B569A] sm:text-xl">
                  Tulis Pesan
                </h3>
                <div>
                  <label className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nama kamu"
                    className="font-clean w-full rounded-full border border-slate-200 bg-[#F3F8FC] px-5 py-3 text-sm text-[#1E3A6D] transition outline-none focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                  />
                </div>
                <div>
                  <label className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@contoh.com"
                    className="font-clean w-full rounded-full border border-slate-200 bg-[#F3F8FC] px-5 py-3 text-sm text-[#1E3A6D] transition outline-none focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                  />
                </div>
                <div>
                  <label className="font-clean mb-1.5 block text-xs font-semibold text-[#1E3A6D]">
                    Pesan
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Tulis pesan atau pertanyaanmu di sini..."
                    className="font-clean w-full resize-none rounded-2xl border border-slate-200 bg-[#F3F8FC] px-5 py-3 text-sm text-[#1E3A6D] transition outline-none focus:border-[#00B5D8] focus:ring-2 focus:ring-[#00B5D8]/25"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="font-playful w-full cursor-pointer rounded-full bg-[#7BB642] px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#2B569A] disabled:opacity-70"
                >
                  {isSending ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
