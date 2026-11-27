export interface MaterialListItem {
  title: string;
  desc: string;
}

export interface MaterialSectionItem {
  id: string;
  navLabel: string;
  title: string;
  iconType: 'shield' | 'chat' | 'heart' | 'lock' | 'spark' | 'users';
  accentColor: string;
  badgeText: string;
  paragraphs?: string[];
  list?: MaterialListItem[];
}

export const MATERIAL_DATA: MaterialSectionItem[] = [
  {
    id: 'pengertian',
    navLabel: 'Pengertian',
    title: 'Apa itu Cyberbullying?',
    iconType: 'shield',
    accentColor: '#00B5D8',
    badgeText: 'Tahap 1 • Kenali Dasar',
    paragraphs: [
      'Cyberbullying atau perundungan di dunia maya adalah tindakan menyakiti, mengejek, mengancam, atau mempermalukan orang lain melalui internet dan perangkat digital, seperti HP, tablet, dan komputer.',
      'Cyberbullying dapat terjadi melalui pesan WhatsApp, media sosial, kolom komentar, atau permainan online.',
      'Contohnya, ketika seseorang terus-menerus mengejek temannya di grup kelas melalui pesan atau menyebarkan foto temannya untuk ditertawakan.',
    ],
  },
  {
    id: 'contoh',
    navLabel: 'Contoh',
    title: 'Contoh Cyberbullying',
    iconType: 'chat',
    accentColor: '#7BB642',
    badgeText: 'Tahap 2 • Waspadai Bentuknya',
    list: [
      {
        title: '1. Mengejek melalui pesan',
        desc: 'Mengirim kata-kata kasar atau menghina teman melalui chat.',
      },
      {
        title: '2. Menyebarkan foto memalukan',
        desc: 'Mengunggah atau membagikan foto teman untuk membuat orang lain menertawakannya tanpa izin.',
      },
      {
        title: '3. Mengucilkan teman di dunia maya',
        desc: 'Sengaja mengajak orang lain menjauhi atau mempermalukan seorang teman melalui grup atau permainan online.',
      },
      {
        title: '4. Berpura-pura menjadi orang lain',
        desc: 'Membuat akun palsu atas nama teman untuk mengirim pesan jahat atau membuat masalah.',
      },
    ],
  },
  {
    id: 'dampak',
    navLabel: 'Dampak',
    title: 'Apa Dampak Cyberbullying?',
    iconType: 'heart',
    accentColor: '#2B569A',
    badgeText: 'Tahap 3 • Pahami Perasaan Teman',
    paragraphs: [
      'Cyberbullying dapat membuat seseorang merasa sedih dan tidak nyaman. Dampaknya antara lain:',
    ],
    list: [
      {
        title: '1. Sedih dan malu',
        desc: 'Merasa sakit hati karena diejek orang lain.',
      },
      {
        title: '2. Kehilangan rasa percaya diri',
        desc: 'Merasa dirinya tidak berharga atau takut berteman.',
      },
      {
        title: '3. Sulit berkonsentrasi',
        desc: 'Menjadi susah fokus saat belajar.',
      },
      {
        title: '4. Takut menggunakan internet',
        desc: 'Khawatir mendapatkan pesan atau komentar yang menyakitkan.',
      },
      {
        title: '5. Sulit tidur',
        desc: 'Terus memikirkan perkataan buruk yang diterima.',
      },
    ],
  },
  {
    id: 'pencegahan',
    navLabel: 'Pencegahan',
    title: 'Bagaimana Cara Mencegah Cyberbullying?',
    iconType: 'lock',
    accentColor: '#00B5D8',
    badgeText: 'Tahap 4 • Jaga Diri & Etika',
    list: [
      {
        title: '1. Berpikir sebelum mengetik',
        desc: 'Pastikan kata-kata yang kita tulis tidak menghina atau menyakiti orang lain.',
      },
      {
        title: '2. Bersikap baik di internet',
        desc: 'Gunakan bahasa yang sopan dan hargai perasaan orang lain.',
      },
      {
        title: '3. Jangan takut meminta bantuan',
        desc: 'Ceritakan kepada orang tua atau guru jika mengalami atau melihat cyberbullying.',
      },
      {
        title: '4. Jaga informasi pribadi',
        desc: 'Jangan sembarangan membagikan alamat rumah, kata sandi, nomor telepon, atau informasi pribadi lainnya.',
      },
    ],
  },
  {
    id: 'cara-menghadapi',
    navLabel: 'Cara Menghadapi',
    title: 'Apa yang Harus Dilakukan Jika Mengalami Cyberbullying?',
    iconType: 'spark',
    accentColor: '#7BB642',
    badgeText: 'Tahap 5 • Langkah Berani',
    paragraphs: ['Ingat langkah sederhana berikut ini:'],
    list: [
      {
        title: '1. Jangan membalas dengan hinaan',
        desc: 'Tetap tenang dan jangan ikut menyakiti orang lain.',
      },
      {
        title: '2. Simpan bukti',
        desc: 'Minta bantuan orang dewasa untuk menyimpan tangkapan layar pesan atau komentar yang menyakitkan.',
      },
      {
        title: '3. Blokir dan laporkan',
        desc: 'Jika diperlukan, blokir akun pelaku dan laporkan konten tersebut dengan bantuan orang dewasa.',
      },
      {
        title: '4. Ceritakan kepada orang yang dipercaya',
        desc: 'Mintalah bantuan orang tua, guru, atau orang dewasa yang dapat melindungimu.',
      },
    ],
  },
  {
    id: 'bantu-teman',
    navLabel: 'Bantu Teman',
    title: 'Apa yang Harus Dilakukan Jika Melihat Teman Mengalami Cyberbullying?',
    iconType: 'users',
    accentColor: '#2B569A',
    badgeText: 'Tahap 6 • Jadi Sahabat Baik',
    paragraphs: ['Kita juga dapat membantu teman dengan cara:'],
    list: [
      {
        title: '1. Tidak ikut menertawakan atau menyebarkan',
        desc: 'Jangan ikut menertawakan atau menyebarkan konten yang mempermalukan teman.',
      },
      {
        title: '2. Memberikan dukungan kepada korban',
        desc: 'Berikan semangat dan temani teman yang sedang menjadi korban agar tidak merasa sendirian.',
      },
      {
        title: '3. Melaporkan kejadian',
        desc: 'Segera laporkan kejadian yang kamu lihat kepada guru atau orang tua.',
      },
      {
        title: '4. Mengajak teman lain berbuat baik',
        desc: 'Ajak teman lain untuk menggunakan internet dengan sopan dan bertanggung jawab.',
      },
    ],
  },
];
