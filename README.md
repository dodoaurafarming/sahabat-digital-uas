# Sahabat Digital — Aplikasi Web Edukasi Cyberbullying dan Konseling Siswa Sekolah Dasar

Proyek UAS Pemrograman Web (Semester 5) berupa aplikasi web responsif untuk membantu siswa sekolah dasar memahami bahaya *cyberbullying* sekaligus menyediakan kanal obrolan privat (*private chat*) dengan guru. Aplikasi ini dirancang untuk diujicobakan secara kolaboratif bersama mahasiswa PGSD di SD Negeri 03 Pontianak Timur (Jalan Tanjung Raya II).

## Arsitektur & Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** PHP (PDO REST API)
- **Database:** MySQL
- **Metodologi:** SDLC Agile (Iteratif & Inkremental — 3 Sprint Mingguan)

## Progres Milestone

### Tahap 1 — Sprint 1: Planning & System Design (20 November 2026)
1. Penyusunan draf Proposal Kerja Praktek sesuai panduan Prodi Teknik Informatika UNTAN (mencakup *product backlog*, arsitektur *frontend* React–TypeScript dan *backend* PHP PDO MySQL, serta rencana kolaborasi uji coba bersama mahasiswa PGSD di SD Negeri 03 Pontianak Timur).
2. Perancangan struktur komponen antarmuka *frontend* (halaman beranda ramah anak, autentikasi siswa dan guru, modul materi edukasi & kuis *cyberbullying*, serta tata letak *private chat* responsif) beserta perancangan skema basis data relasional MySQL (`schema.sql`: `users`, `chat_rooms`, `messages`, `notifications`, `quiz_scores`).
3. Inisialisasi struktur proyek *full-stack* (*setup* proyek React–TypeScript dan kerangka *backend* PHP), konfigurasi koneksi PDO MySQL, serta *helper* CORS dan respons JSON pada *branch* fitur Tahap 1.

### Tahap 2 (21–27 Nov 2026) — Pengembangan Iteratif & Integrasi (`feat/tahap-2-implementasi`)
1. **Autentikasi & REST API Backend PHP PDO:** Mengimplementasikan autentikasi berbasis JWT (HS256) untuk 3 peran (`siswa`, `guru`, `admin`), seluruh endpoint REST API PHP PDO murni (`auth`, `users`, `quiz`, `chats`, `messages`, `notifications`, `upload`, `admin`), serta skrip migrasi basis data (`migration_tahap_2.sql`).
2. **Antarmuka Frontend React–TypeScript:** Membangun seluruh halaman responsif ramah anak dengan React, TypeScript, dan Tailwind CSS v4 mencakup beranda edukatif, autentikasi 3 peran, profil dan unggah avatar, 6 modul materi *cyberbullying*, kuis interaktif 10 soal, ruang curhat siswa, kotak masuk guru, serta dasbor persetujuan admin.
3. **Integrasi Full-Stack & HTTP Polling:** Menghubungkan seluruh halaman frontend ke REST API PHP melalui klien HTTP terketik (`api.ts`), menerapkan sinkronisasi *private chat* dan notifikasi menggunakan HTTP Polling berbasis `after_id` dengan pencegahan duplikasi pesan, serta validasi unggah media aman (maksimal 2 MB).
4. **Verifikasi Integrasi Lokal (Sprint Review):** Memastikan seluruh alur siswa, guru, dan admin lulus kompilasi TypeScript/Vite (`npm run build`), *linting*, pemeriksaan sintaks PHP, pengujian endpoint di Postman, dan uji coba lokal pada Laragon.

### Tahap Akhir — Sprint 3: Testing, User Feedback, & Deployment *(Target: 3 Desember 2026)*
- *(Rencana)* Pengujian *Black Box* & *White Box*, uji coba bersama mahasiswa PGSD di SD Negeri 03 Pontianak Timur, *bug fixing*, *merge* ke `master`, dan *deployment* produksi.