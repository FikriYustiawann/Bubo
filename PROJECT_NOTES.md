# Catatan proyek: Bubo

- `src/duo/brand.js`: nama aplikasi & maskot (dipakai UI dan prompt AI).
- `src/duo/engine.js`: pembangkit soal + pemeriksa jawaban. Tambah soal baru = tambah fungsi di `GEN` (kembalikan array langkah), lalu daftarkan di `lessons.js`.
- `src/duo/lessons.js`: unit/pelajaran. `src/duo/state.js`: hati, XP, runtutan, misi, lencana (fungsi murni).
- `src/duo/Lesson.js`: pemutar pelajaran esai. `Path.js`, `Practice.js`, `Quests.js`, `Screens.js`, `Tutor.js`: layar-layar.
- `src/ai.js` + `src/rmt.js`: AI kompatibel OpenAI (saat ini Groq: `openai/gpt-oss-120b` untuk chat, `qwen/qwen3.8-27b` untuk membaca foto; foto -> teks dulu, baru dikirim ke model chat; coba ulang otomatis saat 429); balasan diawali `TAHAP: Input|Elaborasi|Output|Refleksi`.
- Data tersimpan dengan kunci `mp3r:bandingbijak:v2`.
- Pengujian: jawaban semua pembangkit diuji dengan 600 seed per jenis (bulat, positif, format diterima, jawaban salah ditolak).
- `src/duo/Icon.js`: semua ikon (SVG, kanvas 64x64). Tambah ikon = tambah satu entri di `DRAW`, lalu pakai `<Icon name="..." />`. Prop: `live` (bergerak sendiri), `onPress` (pop saat diketuk), `pop` (pop saat nilainya berubah), `mono` (siluet satu warna), `dim` (pudar). `Stars` = deretan bintang.
- `src/duo/materiData.js`: isi materi (TOPICS, RUMUS, ISTILAH, GAME). Menambah topik = tambah objek di TOPICS; jenis bagian dijelaskan di komentar atas berkas. `Materi.js` = layar, `Labs.js` = lab interaktif + permainan.
- Topik yang sudah dibaca disimpan di `state.read` (ada lencana Rajin Membaca). Tiap unit di `lessons.js` punya `materi` (id topik untuk tombol BACA MATERI).
- `src/duo/sound.js`: `sfx('nama')` memutar efek (tap, pop, tab, start, correct, wrong, combo, finish, badge, claim, flip, step, send, receive). Status hidup/mati disimpan di `mp3r:bandingbijak:sound`. Semua `Btn` otomatis berbunyi tap.
- Video: `VIDEOS` di `materiData.js` (id YouTube + topik terkait). Bagian `{ t: 'video', topic }` menampilkan video untuk topik itu.
- Sistem permainan (`state.js`): konstanta XP (`XP_READ`, `XP_VIDEO`, `XP_FIX`, `XP_REFLECT`), `LEVELS`/`levelOf`, `mastery` (Peta Kemampuan dari `state.skill`), `QUESTS` (4 misi = fase RMT), `BADGES` (field `m` = arti bagi belajar), `markRead`/`markWatched`/`markReflect`. Data lama (v2) dimigrasi otomatis oleh `normalize`.
- Hindari dua berkas yang namanya hanya beda huruf besar/kecil (mis. `materi.js` dan `Materi.js`): di macOS/Windows keduanya bertabrakan dan layar jadi putih. Data materi ada di `materiData.js`, layar di `Materi.js`.
- Menambah video: tambah objek di `VIDEOS` (`topics` = id topik; hanya video yang benar-benar ada). Topik tanpa video tidak menampilkan bagian video.
- `src/duo/Math.js`: penulisan rumus bergaya buku matematika. `<M>{'y_2 = [y_1 × x_2|x_1]'}</M>`: `[atas|bawah]` = pecahan bersusun, `x_1` = indeks bawah, `x^2` = pangkat, huruf tunggal otomatis miring, kata tetap tegak. `<Rich>` = teks biasa dengan rumus di antara `$...$`. `plain()` mengubah sintaks itu menjadi teks polos (dipakai tombol Bagikan Lembar Rumus). Rumus baru di `materiData.js` (`formula.lines`, `RUMUS.f`) cukup ditulis dengan sintaks ini.
- `src/duo/Transition.js`: `Splash` (layar pembuka), `LoadingOverlay` (saat membuka pelajaran), `FadeSlide` (transisi antar layar/soal, pakai `key`), `Dots`. Semua native driver.
- Performa: `T`, `Btn`, `Icon`, `Owl` dibungkus `React.memo`; bilah tab dipisah; penyimpanan progres ditunda 450 ms (`saveLater` di `utils/storage.js`, otomatis disimpan saat app ke latar belakang); pemutar suara dipanaskan setelah app tampil (`preloadSfx`).
- Nama aplikasi: Bubo (nama maskot burung hantu sekaligus nama aplikasi). Kunci penyimpanan `mp3r:bandingbijak:*` sengaja TIDAK diganti supaya progres pengguna lama tidak hilang.
- `src/duo/Rich.js`: penampil balasan AI (**tebal**, daftar, tabel, rapikan sisa LaTeX). `src/duo/Tutor.js`: chat + lampiran foto/berkas.
- Tampilan chat ala ChatGPT: pesan AI tanpa gelembung (avatar + teks rapi + efek mengetik), pesan siswa di gelembung kanan. Fase RMT (TAHAP: ...) tetap dibaca dari balasan tapi TIDAK ditampilkan.
- Font: UI pakai Nunito (`fonts.r` Medium, `fonts.b` ExtraBold), rumus (`Math.js`) pakai Liberation Serif lewat prop `math` pada `T`. Semua ukuran teks dikali `FONT_K` (theme.js) dan skala layar dibatasi 0.92-1.04; ubah `FONT_K` untuk membesar/mengecilkan seluruh teks sekaligus.
- `src/duo/Path.js` (menu Belajar): kartu Hero (sapaan + LANJUTKAN + progres total), kartu unit yang bisa dibuka/ditutup (unit aktif terbuka otomatis, ada progres), jalur dengan titik penghubung, cincin berdenyut + gelembung MULAI di pelajaran aktif, ketuk pelajaran terkunci = goyang + pesan. `Owl.js`: prop `hat` (topi Natal, default nyala via `HAT_ON`).
- `src/duo/Panah.js`: diagram panah (senilai naik-naik, berbalik naik-turun, `kind: "s"|"b"|"both"`). Dipakai di Materi (`{ t: "panah", kind, a, b }`), kartu pelajaran (`panah: {...}` di lessons.js), dan muncul setelah menjawab soal jenis. `src/duo/Tandai.js`: penanda info penting di soal (kuning = data, biru = yang ditanya).
- Petunjuk bertingkat 3 level otomatis di `engine.js` (`ladder`): 1) arah berpikir, 2) susunan hitungan tanpa hasil, 3) langkah lengkap. Istilah berbanding lurus/terbalik ada di materi, glosarium, kartu, dan soal jenis. Statistik (runtutan, XP, hati, target harian) dipindah ke kartu Hero di menu Belajar.

## Pembaruan UI v22 (tampilan lebih interaktif)
- `src/duo/ui.js` punya komponen bersama baru: `Reveal` (muncul bertahap, prop `i` = urutan), `PopIn` (muncul membal), `CountUp` (angka menghitung naik), `Ring` (cincin progres SVG), `Card`, `Pill`, `Seg` (pilihan segmen dengan penanda meluncur), `Burst` (ledakan titik warna untuk klaim), `Toast`. `Btn` kini berkilap dan menerima prop `icon`; `Bar` beranimasi dari 0.
- Belajar (`Path.js`): kartu Hero dengan cincin target XP harian, node pelajaran berkilap, node selesai bercahaya emas, unit muncul bertahap.
- Soal (`Lesson.js`): gelembung maskot berekor, kolom jawaban menyala saat fokus, petunjuk muncul halus, lembar umpan balik melengkung, layar selesai dengan bintang muncul satu per satu + XP menghitung naik.
- Latihan (`Practice.js`): strip statistik (hati, ketepatan, soal dijawab) dan kartu mode berwarna penuh. Misi (`Quests.js`): cincin level, kartu misi berwarna sesuai status, ledakan warna saat klaim.
- Materi (`Materi.js`): kartu "Lanjutkan membaca", bilah progres baca mengikuti gulir, contoh berlangkah beranimasi, kartu rumus berputar 3D, Istilah bisa dicari. Lab dan permainan: item muncul membal, angka berdenyut, pesan hasil berkotak.
- Profil, Tanya Bubo, Onboard, Splash, dan bilah tab (penanda meluncur + lencana jumlah misi siap klaim) ikut diperbarui. Tidak ada paket baru yang perlu dipasang.
