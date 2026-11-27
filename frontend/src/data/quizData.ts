export interface QuizQuestion {
  id: number;
  scenario: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      'Kamu melihat temanmu dikirimi pesan kasar dan ejekan di grup WhatsApp kelas. Apa yang kamu lakukan?',
    options: [
      { key: 'A', text: 'Ikut menertawakan supaya dianggap seru' },
      { key: 'B', text: 'Pura-pura tidak lihat' },
      {
        key: 'C',
        text: 'Menemani temanmu dan melaporkannya ke guru atau orang tua',
      },
      { key: 'D', text: 'Membalas pesan itu dengan kata-kata kasar juga' },
    ],
    correctAnswer: 'C',
    explanation:
      'Menemani teman yang dirundung membuat ia merasa tidak sendirian, dan melapor ke guru atau orang tua adalah langkah paling aman untuk menghentikan perundungan.',
  },
  {
    id: 2,
    scenario: 'Apa yang dimaksud dengan cyberbullying?',
    options: [
      { key: 'A', text: 'Bermain game online bersama teman' },
      {
        key: 'B',
        text: 'Menyakiti atau mengejek orang lain lewat HP atau internet',
      },
      { key: 'C', text: 'Belajar lewat video di internet' },
      { key: 'D', text: 'Mengirim foto liburan ke keluarga' },
    ],
    correctAnswer: 'B',
    explanation:
      'Cyberbullying adalah segala tindakan menyakiti, menghina, atau mempermalukan orang lain menggunakan perangkat digital dan internet.',
  },
  {
    id: 3,
    scenario:
      'Temanmu mengunggah fotomu tanpa izin lalu banyak yang mengejek. Apa yang sebaiknya kamu lakukan?',
    options: [
      {
        key: 'A',
        text: 'Memberi tahu orang tua atau guru, lalu meminta foto itu dihapus',
      },
      { key: 'B', text: 'Membalas dengan mengunggah foto jelek temanmu' },
      { key: 'C', text: 'Menangis diam-diam dan tidak cerita ke siapa pun' },
      { key: 'D', text: 'Berhenti berteman dengan semua orang' },
    ],
    correctAnswer: 'A',
    explanation:
      'Meminta bantuan orang dewasa yang dipercaya dan meminta penghapusan foto secara baik-baik akan menyelesaikan masalah tanpa memicu pertengkaran baru.',
  },
  {
    id: 4,
    scenario: 'Manakah yang termasuk contoh cyberbullying?',
    options: [
      { key: 'A', text: 'Mengirim stiker lucu ke teman' },
      { key: 'B', text: 'Mengucapkan selamat ulang tahun lewat chat' },
      { key: 'C', text: 'Meminjamkan HP kepada adik' },
      { key: 'D', text: 'Menulis komentar "kamu jelek banget" di foto teman' },
    ],
    correctAnswer: 'D',
    explanation:
      'Menulis komentar yang menghina fisik atau merendahkan teman di media sosial termasuk perundungan dunia maya karena menyakiti perasaan korban.',
  },
  {
    id: 5,
    scenario:
      'Kamu menerima pesan berisi ancaman dari orang yang tidak kamu kenal. Apa yang harus kamu lakukan pertama kali?',
    options: [
      { key: 'A', text: 'Membalas pesan itu supaya dia takut' },
      {
        key: 'B',
        text: 'Menyimpan bukti (screenshot) dan segera memberi tahu orang dewasa',
      },
      { key: 'C', text: 'Menghapus pesan lalu melupakannya' },
      { key: 'D', text: 'Menyebarkan pesan itu ke teman-teman' },
    ],
    correctAnswer: 'B',
    explanation:
      'Bukti tangkapan layar sangat penting agar orang tua atau guru dapat menindaklanjuti dan melindungimu dengan tepat.',
  },
  {
    id: 6,
    scenario:
      'Ada teman yang mengirimimu meme yang mengejek teman sekelasmu. Apa yang sebaiknya kamu lakukan?',
    options: [
      { key: 'A', text: 'Meneruskannya ke grup lain karena lucu' },
      { key: 'B', text: 'Menyimpannya di galeri' },
      {
        key: 'C',
        text: 'Tidak menyebarkannya dan memberi tahu bahwa itu tidak baik',
      },
      { key: 'D', text: 'Memberi like' },
    ],
    correctAnswer: 'C',
    explanation:
      'Berhenti menyebarkan konten ejekan dan mengingatkan teman secara sopan membantu memutus rantai cyberbullying di sekolah.',
  },
  {
    id: 7,
    scenario:
      'Kamu sendiri sedang diejek lewat media sosial. Tindakan yang tepat adalah...',
    options: [
      {
        key: 'A',
        text: 'Tidak membalas, memblokir pelaku, dan melapor ke orang dewasa',
      },
      { key: 'B', text: 'Membalas dengan ejekan yang lebih pedas' },
      { key: 'C', text: 'Mengunci diri di kamar dan tidak mau sekolah' },
      { key: 'D', text: 'Membuat akun palsu untuk membalas' },
    ],
    correctAnswer: 'A',
    explanation:
      'Tidak membalas ejekan membuat pelaku kehilangan celah, sementara memblokir dan melapor ke orang dewasa menjaga keamanan serta ketenangan dirimu.',
  },
  {
    id: 8,
    scenario:
      'Sebelum menulis komentar di media sosial, hal apa yang sebaiknya kamu pikirkan?',
    options: [
      { key: 'A', text: 'Berapa banyak orang yang akan melihat' },
      { key: 'B', text: 'Apakah komentarku akan membuatku terkenal' },
      { key: 'C', text: 'Apakah temanku akan membalas' },
      {
        key: 'D',
        text: 'Apakah kata-kataku bisa menyakiti perasaan orang lain',
      },
    ],
    correctAnswer: 'D',
    explanation:
      'Selalu berpikir sebelum mengetik memastikan bahwa setiap kata yang kita bagikan di dunia maya tetap sopan dan menghargai perasaan sesama.',
  },
  {
    id: 9,
    scenario:
      'Temanmu mengajak membuat akun palsu untuk mengejek anak lain. Jawabanmu adalah...',
    options: [
      { key: 'A', text: '"Boleh, tapi jangan bilang siapa-siapa ya"' },
      { key: 'B', text: '"Tidak mau, itu perbuatan yang menyakiti orang lain"' },
      { key: 'C', text: '"Boleh, asal aku tidak yang menulis"' },
      { key: 'D', text: '"Nanti saja kalau sudah bosan"' },
    ],
    correctAnswer: 'B',
    explanation:
      'Berani menolak ajakan buruk dengan tegas adalah ciri sahabat digital yang bertanggung jawab dan peduli pada teman.',
  },
  {
    id: 10,
    scenario:
      'Mengapa kita tidak boleh ikut menyebarkan pesan atau foto yang mengejek orang lain?',
    options: [
      { key: 'A', text: 'Karena kuota internet jadi habis' },
      { key: 'B', text: 'Karena HP bisa rusak' },
      { key: 'C', text: 'Karena membuat korban makin sedih dan malu' },
      { key: 'D', text: 'Karena guru pasti marah' },
    ],
    correctAnswer: 'C',
    explanation:
      'Menyebarkan ejekan atau foto memalukan akan memperberat luka hati korban dan membuatnya kehilangan rasa percaya diri.',
  },
];
