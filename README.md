<div align="center">

<img src="docs/logo.png" alt="Logo Bubo" width="150" />

# Bubo

**Belajar perbandingan senilai dan berbalik nilai bersama burung hantu berkacamata biru.**

Aplikasi Android bergaya Duolingo dengan mentor AI yang dipandu *Rigorous Mathematical Thinking*.

[![Buka Aplikasi](https://img.shields.io/badge/Buka%20Aplikasi-fikriyustiawann.github.io%2Fbubo-1CB0F6?style=for-the-badge&logo=github&logoColor=white)](https://fikriyustiawann.github.io/bubo/)

![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=flat-square&logo=react&logoColor=black)
![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat-square&logo=android&logoColor=white)

</div>

---

## Tentang Bubo

Bubo membantu siswa memahami materi **perbandingan senilai** dan **berbalik nilai** dengan cara yang tidak membosankan. Siswa tidak memilih pilihan ganda, melainkan **mengetik jawabannya sendiri**, sementara Bubo memberi petunjuk bertahap saat siswa kesulitan.

Aplikasi ini berjalan di Android, dan juga bisa dibuka lewat browser.

## Fitur

### Jalur belajar

- **4 unit dan 16 pelajaran**, dimulai dari kartu penjelasan lalu soal esai.
- Setiap soal mengikuti tiga tahap berpikir: **Input**, **Elaborasi**, dan **Output**.
- **Soal selalu baru.** Angka diacak setiap kali, dan jawaban dihitung otomatis.
- **Pemeriksa jawaban fleksibel.** Format `48.000`, `48000`, `Rp48.000`, `9/2`, dan `4,5` sama-sama diterima.
- **Petunjuk tiga tingkat:** arah berpikir, susunan hitungan, lalu langkah lengkap.

### Latihan

- Latihan tanpa batas untuk soal senilai, berbalik nilai, dan campuran.
- Fitur **Dari Kesalahanku** membuat ulang soal yang pernah salah dengan angka baru.
- Latihan tidak mengurangi hati, dan menyelesaikan satu sesi justru menambah satu hati.

### Materi

- **9 topik bacaan** dengan contoh soal berlangkah: rasio, tiga besaran, senilai, skala, berbalik nilai, laju jarak waktu, grafik, cara membedakan keduanya, dan strategi 4 langkah.
- **Lab Senilai** dan **Lab Berbalik Nilai** untuk mencoba sendiri dan melihat perubahannya.
- **Lembar rumus** berupa 17 kartu yang bisa dibalik dan dibagikan.
- **Glosarium** 17 istilah yang bisa dicari.
- **Permainan Tebak Jenisnya** untuk melatih membedakan senilai dan berbalik nilai.
- **20 video YouTube** yang dikelompokkan per topik.

### Tanya Bubo

- Mentor AI yang membimbing lewat pertanyaan, bukan langsung memberi jawaban.
- Siswa bisa **memotret soal** dari kamera atau galeri, atau melampirkan berkas teks.
- Balasan tampil rapi lengkap dengan huruf tebal, daftar, dan tabel.

### Motivasi belajar

- **XP dan level** dari Penjelajah sampai Juara Banding, sebagai jejak usaha belajar.
- **Hati** sebagai kesempatan berpikir. Kalau habis, siswa bisa memulihkannya dengan membaca materi atau berlatih.
- **Runtutan harian** dengan target 30 XP per hari.
- **4 misi harian** yang mengikuti tahap Input, Elaborasi, Output, dan Refleksi.
- **15 lencana** untuk kebiasaan belajar yang nyata.
- **Peta Kemampuan** di Profil yang menunjukkan kemampuan mana yang sudah kuat dan mana yang perlu diperkuat.

### Tampilan

- Maskot Bubo, ikon 2D interaktif, dan transisi yang halus.
- Efek suara pada tombol, jawaban benar dan salah, kombo, lencana, dan lainnya.
- Rumus matematika ditulis bergaya buku, dengan pecahan bersusun.

## Cara Memakai

### Lewat browser

Buka **https://fikriyustiawann.github.io/bubo/**, lalu masukkan nama dan mulai belajar. Progres tersimpan di browser yang dipakai.

### Di HP Android dengan Expo Go

1. Pasang **Expo Go** dari Play Store.
2. Di komputer, jalankan proyek (lihat bagian berikutnya) dengan `npm run tunnel`.
3. Scan kode QR yang muncul memakai Expo Go.

### Menjalankan dari kode

Butuh [Node.js](https://nodejs.org) versi 22.13 atau lebih baru.

```bash
git clone https://github.com/FikriYustiawann/bubo.git
cd bubo
npm install
npm run setup
npx expo start -c
```

Tekan `w` untuk membuka di browser atau `a` untuk emulator Android.

### Membuat APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Setelah build selesai, EAS memberikan tautan untuk mengunduh file APK yang bisa langsung dipasang di HP Android.

## Konfigurasi AI

Fitur Tanya Bubo memakai API yang kompatibel dengan OpenAI. Atur lewat file `.env`:

```env
EXPO_PUBLIC_AI_API_KEY=isi_kunci_api_kamu
EXPO_PUBLIC_AI_BASE_URL=https://alamat-api-penyedia/v1
EXPO_PUBLIC_AI_MODEL=nama-model-percakapan

# Opsional, untuk membaca foto soal
EXPO_PUBLIC_AI_VISION_API_KEY=
EXPO_PUBLIC_AI_VISION_BASE_URL=
EXPO_PUBLIC_AI_VISION_MODEL=nama-model-gambar
```

Jalankan ulang dengan `npx expo start -c` setelah mengubah `.env`.

> **Catatan keamanan.** Variabel `EXPO_PUBLIC_*` ikut tertanam di hasil build, sehingga bisa dibaca siapa pun yang memiliki aplikasinya. Untuk rilis publik, simpan kunci di server dan arahkan `EXPO_PUBLIC_AI_BASE_URL` ke proxy milikmu.

## Landasan Pembelajaran

Perilaku mentor AI mengacu pada buku *Rigorous Mathematical Thinking* karya Kinard dan Kozulin, yaitu fungsi kognitif Input, Elaborasi, dan Output, serta siklus Representasi, Manipulasi, dan Validasi. Ringkasannya ada di [docs/RMT_RINGKASAN.md](docs/RMT_RINGKASAN.md).

## Pembuat

**Fikri Yustiawan**
Pendidikan Matematika, FKIP Universitas Sultan Ageng Tirtayasa
GitHub: [@FikriYustiawann](https://github.com/FikriYustiawann)
