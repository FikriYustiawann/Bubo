# Ringkasan Rigorous Mathematical Thinking (RMT)

Sumber: *Rigorous Mathematical Thinking: Conceptual Formation in the Mathematics Classroom*
(James T. Kinard, Sr. & Alex Kozulin). Ringkasan ini dipakai sebagai dasar perilaku
Bubo (mentor AI) di Bubo (`src/rmt.js`).

## Bab 1 - Culture of Mathematics
- Budaya matematika tumbuh dari sistem kebutuhan sosiokultural; cara berpikirnya berbeda dari cara sehari-hari, jadi harus dibangun lewat pendidikan.
- Alat simbolik (jari, sempoa, sistem koordinat) berkembang dari alat fisik menjadi alat kognitif internal (*psychological tools*).
- Aktivitas Belajar (*Learning Activity*) harus: (1) mengubah struktur pemahaman, (2) membentuk konsep ilmiah yang teoretis-sistematis-generatif, (3) mengenalkan bahasa dan aturan matematika.
- Tiga tingkat pengetahuan: prosedur/operasi, konsep, wawasan (*insight*).
- Empat alat psikologis matematika: tanda & simbol; organizer grafis (nilai tempat, garis bilangan, tabel, bidang koordinat); rumus & persamaan; bahasa matematika.
- *Rigor* = keterlibatan kritis yang gigih untuk memahami mendalam: fokus tajam, definisi jelas dan lengkap, presisi, akurasi, kedalaman.

## Bab 2 - Tujuan Pendidikan Matematika
- Pengajaran tradisional cenderung mekanis dan hafalan; standar sering berorientasi hasil, berpusat pada guru/buku, dan minim kesempatan berpikir kritis.
- Pemahaman mendalam (Liping Ma): ide dasar, keterhubungan, representasi berganda, koherensi longitudinal.
- Tiga kebutuhan: berpikir tingkat tinggi yang ketat, memahami ide besar, komunikasi yang presisi.

## Bab 3 - Teori Sosiokultural Vygotsky
- Belajar itu ter-mediasi: oleh manusia lain, oleh alat simbolik, oleh aktivitas belajar terorganisir.
- ZPD: sasarkan fungsi yang sedang tumbuh; ZPD juga dialog antara konsep sehari-hari dan konsep ilmiah.
- Tiga elemen Aktivitas Belajar: **analisis tugas -> perencanaan tindakan -> refleksi**.
- Bilangan dikenalkan lewat pengukuran/perbandingan kuantitas (rasio), bukan sekadar menghitung benda; skema bagian-keseluruhan membantu soal cerita.

## Bab 4 - Feuerstein: SCM & MLE
- Kognisi itu plastis; yang dimodifikasi adalah struktur berpikir, bukan sekadar hafalan.
- Tiga kriteria MLE: **intensionalitas & resiprositas**, **transendensi**, **pemberian makna**.
- Fungsi kognitif tiga fase: **Input** (persepsi jelas, orientasi, akurasi data), **Elaborasi** (sebab-akibat, bagian-keseluruhan, penalaran hipotetis), **Output** (komunikasi jelas, tanpa trial-and-error, bahasa tepat).
- Peta kognitif 7 dimensi: isi, modalitas, operasi mental, fungsi prasyarat, kompleksitas, abstraksi, efisiensi.
- Asesmen dinamis (LPAD): uji - mediasi - uji ulang.

## Bab 5 - Model RMT
- Sintesis Vygotsky (alat psikologis, konsep ilmiah, Learning Activity) + Feuerstein (MLE, fungsi kognitif).
- Tiga pilar: fungsi kognitif spesifik matematika, alat psikologis spesifik matematika, MLE.
- Guru memediasi *cara berpikir* lewat pertanyaan terpimpin dan dialog reflektif; kesulitan siswa didiagnosis per fase (Input/Elaborasi/Output).
- Metakognisi: siswa memantau dan mengevaluasi strateginya sendiri.

## Bab 6 & Simpulan
- Hasil empiris: perubahan disposisi, kognisi, skor konsep, dan refleksi siswa; guru bergeser dari penyampaian algoritma ke pengajaran konseptual ter-mediasi.
- Siklus penyelidikan: **Representasi -> Manipulasi -> Validasi**.
- Simpulan: kemampuan kognitif dan penalaran tinggi harus dikonstruksi lewat mediasi, bukan menunggu pematangan alami.

## Pemetaan RMT ke Bubo
| Konsep RMT | Wujud di aplikasi |
|---|---|
| Alat psikologis (tabel, rumus, nilai satuan) | Kartu penjelasan tiap unit; soal meminta siswa menghitung nilai satuan/konstanta lebih dulu |
| Learning Activity (analisis - rencana - refleksi) | Soal bertahap (langkah demi langkah) dan tombol "Refleksi bareng Bubo" di akhir pelajaran |
| MLE: intensionalitas, transendensi, makna | Bubo menyebut tujuan langkah, mengaitkan ke aturan umum, menjelaskan mengapa penting |
| Fungsi kognitif Input/Elaborasi/Output | Tiap soal diberi lencana fase (INPUT/ELABORASI/OUTPUT); balasan AI juga diberi lencana fase |
| Anti trial-and-error, rigor | Jawaban esai (bukan pilihan ganda), petunjuk bertingkat, penjelasan langkah saat salah |
| Representasi - Manipulasi - Validasi | Susun tabel/rumus -> hitung -> cek masuk akal; soal salah diulang dengan angka baru |
