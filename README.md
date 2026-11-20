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

### Tahap 2 — Sprint 2: Iterative Development & Integration *(Target: 27 November 2026)*
- *(Rencana)* Implementasi antarmuka interaktif React–TypeScript, REST API PHP (autentikasi, kuis, unggah media, dan *private chat* berbasis *HTTP polling*), serta integrasi *client–server*.

### Tahap Akhir — Sprint 3: Testing, User Feedback, & Deployment *(Target: 3 Desember 2026)*
- *(Rencana)* Pengujian *Black Box* & *White Box*, uji coba bersama mahasiswa PGSD di SD Negeri 03 Pontianak Timur, *bug fixing*, *merge* ke `master`, dan *deployment* produksi.