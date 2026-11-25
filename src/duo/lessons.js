import { C } from './theme';
import { buildFromGens } from './engine';

// Jalur belajar: tiap pelajaran = kartu penjelasan (opsional) + soal esai yang dibangkitkan acak.
const SEN = [
  { title: 'Senilai: naik bersama', body: 'Dua besaran disebut senilai jika yang satu bertambah, yang lain ikut bertambah dengan perbandingan yang sama. Contoh: makin banyak buku yang dibeli, makin besar total harganya. Nama lainnya: berbanding lurus.' },
  { title: 'Ciri senilai', panah: { kind: 's', a: 'Banyak buku', b: 'Harga' }, body: 'Hasil bagi kedua besaran selalu tetap. Rumus: $y = k × x$, dengan $k = [y|x]$.', table: { heads: ['Buku (x)', 'Harga (y)', 'y ÷ x'], rows: [['1', '5.000', '5.000'], ['2', '10.000', '5.000'], ['3', '15.000', '5.000']] } },
  { title: 'Cara nilai satuan', body: 'Cari nilai untuk 1 satuan, lalu kalikan. Contoh: 3 liter bensin untuk 45 km, jadi 45 ÷ 3 = 15 km tiap liter. Untuk 120 km: 120 ÷ 15 = 8 liter.' },
];
const BER = [
  { title: 'Berbalik nilai: satu naik, satu turun', body: 'Dua besaran berbalik nilai jika yang satu bertambah, yang lain berkurang, dan hasil kalinya selalu tetap. Contoh: makin banyak pekerja, makin sedikit hari yang dibutuhkan. Nama lainnya: berbanding terbalik.' },
  { title: 'Ciri berbalik nilai', panah: { kind: 'b', a: 'Pekerja', b: 'Hari' }, body: 'Hasil kali kedua besaran selalu tetap. Rumus: $y = [k|x]$, dengan $k = x × y$.', table: { heads: ['Pekerja (x)', 'Hari (y)', 'x × y'], rows: [['2', '12', '24'], ['3', '8', '24'], ['4', '6', '24'], ['6', '4', '24']] } },
  { title: 'Cara total pekerjaan', body: '4 pekerja menyelesaikan bangunan dalam 12 hari. Total pekerjaan = 4 × 12 = 48 pekerja-hari. Jika pekerjanya 8 orang: 48 ÷ 8 = 6 hari.' },
];
const UJI = [{ title: 'Uji 2 kali lipat', panah: { kind: 'both' }, body: 'Jadikan besaran pertama 2 kali. Jika besaran kedua ikut menjadi 2 kali, itu senilai. Jika besaran kedua menjadi setengahnya, itu berbalik nilai.' }];
const RAS = [
  { title: 'Perbandingan (rasio)', body: 'a : b membandingkan dua nilai. Sederhanakan dengan membagi kedua bilangan dengan FPB-nya. Contoh: 18 : 24, FPB = 6, jadi 3 : 4.' },
  { title: 'Membagi menurut perbandingan', body: 'Uang Rp60.000 dibagi 2 : 3. Jumlah bagian = 5, satu bagian = 60.000 ÷ 5 = 12.000. Bagian pertama 2 × 12.000 = 24.000 dan bagian kedua 3 × 12.000 = 36.000.' },
];

const L = (id, title, icon, cards, gens) => ({ id, title, icon, cards, gens, build: (seed) => [...cards.map((c) => ({ type: 'card', ...c })), ...buildFromGens(gens, seed)] });

export const UNITS = [
  { id: 'u1', materi: 'bedakan', title: 'Kenali Jenisnya', sub: 'Senilai atau berbalik nilai?', color: C.green, edge: C.greenD, lessons: [
    L('1-1', 'Senilai itu apa?', 'book', SEN, ['jenis', 'konstanta.sen', 'sen.satuan']),
    L('1-2', 'Berbalik nilai itu apa?', 'books', BER, ['jenis', 'konstanta.ber', 'ber.pekerja']),
    L('1-3', 'Bedakan keduanya', 'scale', UJI, ['jenis', 'jenis', 'jenis', 'jenis', 'jenis', 'jenis']),
    L('1-4', 'Rasio dan bagian', 'pie', RAS, ['rasio', 'rasio', 'rasio.bagi', 'rasio.bagi']),
  ] },
  { id: 'u2', materi: 'senilai', title: 'Senilai', sub: 'Naik bersama, hasil bagi tetap', color: C.blue, edge: C.blueD, lessons: [
    L('2-1', 'Harga satuan', 'tag', [], ['sen.satuan', 'sen.satuan', 'sen.upah', 'sen.upah']),
    L('2-2', 'Bensin dan resep', 'fuel', [], ['sen.bensin', 'sen.resep', 'sen.bensin', 'sen.resep']),
    L('2-3', 'Pilih yang termurah', 'cart', [], ['bandingkan', 'bandingkan']),
    L('2-4', 'Ulangan senilai', 'bolt', [], ['sen.satuan', 'sen.bensin', 'sen.resep', 'bandingkan', 'konstanta.sen']),
  ] },
  { id: 'u3', materi: 'berbalik', title: 'Berbalik Nilai', sub: 'Satu naik, satu turun, hasil kali tetap', color: C.purple, edge: C.purpleD, lessons: [
    L('3-1', 'Pekerja dan hari', 'worker', [], ['ber.pekerja', 'ber.pekerja', 'ber.pekerja']),
    L('3-2', 'Laju dan persediaan', 'car', [], ['ber.laju', 'ber.porsi', 'ber.laju', 'ber.porsi']),
    L('3-3', 'Keran dan patungan', 'faucet', [], ['ber.keran', 'ber.patungan', 'ber.keran', 'ber.patungan']),
    L('3-4', 'Tambah pekerja', 'crane', [], ['ber.tambah', 'ber.pekerja']),
    L('3-5', 'Ulangan berbalik', 'repeat', [], ['ber.pekerja', 'ber.laju', 'ber.porsi', 'ber.patungan', 'konstanta.ber']),
  ] },
  { id: 'u4', materi: 'strategi', title: 'Tantangan Akhir', sub: 'Campuran semua jenis', color: C.orange, edge: C.orangeD, lessons: [
    L('4-1', 'Campuran 1', 'target', [], ['jenis', 'sen.satuan', 'ber.pekerja', 'jenis', 'sen.bensin', 'ber.laju']),
    L('4-2', 'Campuran 2', 'puzzle', [], ['jenis', 'bandingkan', 'ber.porsi', 'rasio.bagi', 'ber.keran']),
    L('4-3', 'Ujian Akhir', 'trophy', [], ['jenis', 'jenis', 'sen.resep', 'bandingkan', 'ber.tambah', 'ber.patungan', 'rasio.bagi']),
  ] },
];

export const ALL = UNITS.flatMap((u) => u.lessons);
