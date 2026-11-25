<div align="center">

<img src="docs/logo.png" alt="Logo Bubo" width="160" />

# Bubo

### Belajar perbandingan senilai dan berbalik nilai bersama burung hantu berkacamata biru

Aplikasi **Android** (React Native + Expo) bergaya Duolingo, dengan mentor AI yang dipandu
*Rigorous Mathematical Thinking*.

![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=white)

[Fitur](#-fitur) •
[Cara Pakai](#-cara-pakai) •
[Konfigurasi AI](#-konfigurasi-ai) •
[Struktur](#-struktur-proyek)

</div>

---

## 📖 Tentang

**Bubo** membantu siswa memahami materi **perbandingan senilai** dan **berbalik nilai**. Siswa tidak memilih pilihan ganda, tetapi **mengetik jawabannya sendiri**, ditemani maskot Bubo yang memberi petunjuk bertahap.

Repo ini berisi **kerangka (source code) proyek Android** lengkap, jadi bisa dijalankan, diubah, atau dibuild menjadi APK.

## ✨ Fitur

| Fitur | Isi |
| --- | --- |
| 🛤️ **Jalur Belajar** | 4 unit, 16 pelajaran. Kartu penjelasan lalu soal esai, bertahap Input → Elaborasi → Output |
| 🎲 **Soal Acak** | Angka selalu baru, jawaban dihitung otomatis. Menerima format `48.000`, `48000`, `Rp48.000`, `9/2`, `4,5` |
| 💡 **Petunjuk Bertingkat** | 3 level: arah berpikir, susunan hitungan, lalu langkah lengkap |
| 🏆 **XP, Level, Hati, Runtutan** | Dilengkapi 4 misi harian dan 15 lencana yang menandai kebiasaan belajar nyata |
| 🗺️ **Peta Kemampuan** | Ukuran paham per kemampuan, dengan tombol BACA MATERI / LATIHAN untuk yang lemah |
| 📚 **Materi** | 9 topik bacaan, lembar rumus (kartu bisa dibalik), 17 istilah, Lab Senilai dan Lab Berbalik Nilai, permainan "Tebak jenisnya" |
| ▶️ **Video** | 20 video YouTube penjelasan, dikelompokkan per topik |
| 🔁 **Dari Kesalahanku** | Soal yang pernah salah dibuat ulang dengan angka baru |
| 🦉 **Tanya Bubo** | Mentor AI. Bisa memotret soal atau melampirkan berkas teks |
| 🔊 **Efek Suara & Ikon 2D** | 43 ikon SVG interaktif dan efek suara di setiap aksi |

## 🚀 Cara Pakai

### 1. Coba lewat browser

Buka: **https://fikriyustiawann.github.io/mathlink/**

### 2. Jalankan di HP Android (Expo Go)

1. Pasang **Expo Go** dari Play Store di HP.
2. Di komputer, jalankan perintah di bagian "Jalankan dari kode" di bawah.
3. Jalankan `npm run tunnel`, lalu scan QR yang muncul memakai Expo Go.

Atau hubungkan HP lewat kabel USB (aktifkan *USB debugging*), lalu `npm run usb`.

### 3. Jalankan dari kode

Butuh [Node.js](https://nodejs.org) **22.13 atau lebih baru**.

```bash
git clone https://github.com/FikriYustiawann/mathlink.git
cd mathlink
npm install
npm run setup
npx expo start -c
```

Tekan `w` untuk membuka di browser, atau `a` untuk emulator Android.

### 4. Build jadi APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Setelah selesai, EAS memberi tautan unduhan file `.apk` yang bisa dipasang langsung di HP Android.

### Perintah lain

| Perintah | Fungsi |
| --- | --- |
| `npm run web` | Jalankan versi web |
| `npm run usb` | Uji di HP Android lewat kabel USB |
| `npm run tunnel` | Uji di HP lewat internet, scan QR |
| `npm run build:web` | Hasilkan situs statis ke folder `dist/` |
| `npm run doctor` | Cek masalah konfigurasi |

## 🤖 Konfigurasi AI

Fitur **Tanya Bubo** memakai API yang kompatibel dengan OpenAI. Atur lewat file `.env` di folder utama:

```env
EXPO_PUBLIC_AI_API_KEY=isi_kunci_api_kamu
EXPO_PUBLIC_AI_BASE_URL=https://alamat-api-penyedia/v1
EXPO_PUBLIC_AI_MODEL=nama-model-percakapan

# Opsional: pembaca foto soal
EXPO_PUBLIC_AI_VISION_API_KEY=
EXPO_PUBLIC_AI_VISION_BASE_URL=
EXPO_PUBLIC_AI_VISION_MODEL=nama-model-gambar
```

Setelah mengubah `.env`, jalankan ulang dengan `npx expo start -c`.

> ⚠️ **Catatan keamanan:** variabel `EXPO_PUBLIC_*` ikut tertanam di hasil build (APK dan web), sehingga bisa dibaca siapa pun yang memiliki aplikasinya. Untuk rilis publik, simpan kunci di server dan arahkan `EXPO_PUBLIC_AI_BASE_URL` ke proxy milikmu.

## 🗂️ Struktur Proyek

```
App.js                        titik masuk aplikasi
index.js                      registrasi aplikasi Expo
app.json / eas.json           konfigurasi Expo dan build APK
.env                          konfigurasi AI
.github/workflows/deploy.yml  build dan tayang otomatis ke GitHub Pages
docs/                         logo dan ringkasan RMT
assets/                       ikon, font Nunito, efek suara
src/ai.js                     klien AI (kompatibel OpenAI)
src/rmt.js                    prompt mentor berbasis RMT
src/utils/storage.js          penyimpanan progres
src/duo/
  brand.js                    nama aplikasi dan maskot
  engine.js                   pembangkit soal dan pemeriksa jawaban
  lessons.js                  unit dan pelajaran
  state.js                    XP, hati, runtutan, misi, lencana
  materiData.js               isi materi, rumus, istilah, video
  Path / Lesson / Practice    layar belajar dan latihan
  Quests / Profil / Tutor     layar misi, profil, dan chat Bubo
  Icon / Owl / Math / ui      ikon, maskot, rumus, komponen bersama
```

Mengganti nama aplikasi dan maskot cukup di `src/duo/brand.js`. Catatan pengembangan lengkap ada di [PROJECT_NOTES.md](PROJECT_NOTES.md).

## 📤 Upload ke GitHub

```bash
git add .
git commit -m "Jelaskan apa yang berubah"
git push origin main
```

Setiap `push` ke `main` otomatis membuild dan menayangkan versi web lewat GitHub Pages.

## 🎓 Landasan Pembelajaran

Perilaku mentor AI mengacu pada buku *Rigorous Mathematical Thinking* (Kinard & Kozulin): fungsi kognitif **Input → Elaborasi → Output**, serta siklus **Representasi → Manipulasi → Validasi**. Ringkasannya ada di [docs/RMT_RINGKASAN.md](docs/RMT_RINGKASAN.md).

## 👨‍💻 Pembuat

**Fikri Yustiawan** · Pendidikan Matematika, FKIP Untirta · [@FikriYustiawann](https://github.com/FikriYustiawann)
