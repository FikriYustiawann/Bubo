// Mesin soal esai: soal dibangkitkan acak (bisa diulang tanpa habis), JAWABAN DIHITUNG OTOMATIS
// dari angka soal, lalu dicek dengan pemeriksa yang tahan format (48.000 / 48000 / Rp48.000 / 3/2 / 4,5).

export const mulberry = (seed) => {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const rr = (rng) => ({
  int: (a, b) => a + Math.floor(rng() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(rng() * arr.length)],
  shuf: (arr) => { const x = [...arr]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; },
});

export const fmt = (n) => {
  const r = Math.round(n * 100) / 100;
  const [i, d] = String(Math.abs(r)).split('.');
  return (r < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : '');
};
export const rp = (n) => 'Rp' + fmt(n);

// ---------- pemeriksa jawaban ----------
const conv = (x) => {
  x = x.replace(/[.,]+$/, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(x)) return parseFloat(x.replace(/\./g, '').replace(',', '.'));
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(x)) return parseFloat(x.replace(/,/g, ''));
  return parseFloat(x.replace(',', '.'));
};
export function parseNum(s) {
  const t = String(s).toLowerCase().replace(/rp\.?/g, '').replace(/\s/g, '');
  const m = t.match(/-?\d[\d.,]*(?:\/\d[\d.,]*)?/);
  if (!m) return NaN;
  const [a, b] = m[0].split('/');
  return b === undefined ? conv(a) : conv(a) / conv(b);
}
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

export function checkAnswer(ex, input) {
  const a = ex.a, s = String(input || '');
  if (!s.trim()) return false;
  if (a.t === 'num') { const x = parseNum(s); return Number.isFinite(x) && Math.abs(x - a.v) < 0.005; }
  if (a.t === 'jenis') { const n = norm(s); const got = /balik/.test(n) ? 'berbalik' : /senilai/.test(n) ? 'senilai' : null; return got === a.v; }
  if (a.t === 'pick') return norm(s).replace(/vendor|pilih|toko|paket/g, '') === a.v.toLowerCase();
  if (a.t === 'ratio') { const n = s.match(/\d+/g); return !!n && n.length === 2 && +n[0] === a.v[0] && +n[1] === a.v[1]; }
  return false;
}

// ---------- pembangkit soal ----------
// Petunjuk bertingkat (3 tingkat): 1) arah berpikir, 2) susunan hitungan tanpa hasil, 3) langkah lengkap.
const ladder = (o) => {
  const hs = [...(o.hints || [])];
  const w = o.why;
  if (w && hs.length < 3) {
    const k = w.lastIndexOf('=');
    if (hs.length < 2 && k > 0) hs.push('Susun hitungannya: ' + w.slice(0, k + 1).trim() + ' …');
    if (hs.length < 3) hs.push('Langkah lengkap: ' + w);
  }
  return hs;
};
const E = (o) => ({ phase: null, ...o, hints: ladder(o) });
const NUM = (v, unit, money) => ({ a: { t: 'num', v }, unit: money ? '' : unit || '', money: !!money, show: money ? rp(v) : fmt(v) + (unit ? ' ' + unit : '') });
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const SCEN = [
  { a: 'senilai', q: 'Sebuah mobil menempuh 60 km dengan 5 liter bensin. Mobil yang sama menempuh 120 km dengan 10 liter bensin.', why: 'Jarak 2 kali, bensin ikut 2 kali; tiap liter tetap 12 km. Naik–naik: senilai.' },
  { a: 'berbalik', q: '6 orang menyelesaikan sebuah pekerjaan dalam 8 hari. Jika 12 orang yang mengerjakan, pekerjaan selesai dalam 4 hari.', why: 'Orang 2 kali, hari menjadi setengahnya; hasil kali tetap (6 × 8 = 48 = 12 × 4). Naik–turun: berbalik nilai.' },
  { a: 'senilai', q: 'Harga 3 kg jeruk Rp45.000 dan harga 5 kg jeruk Rp75.000.', why: 'Harga tiap kg tetap Rp15.000 (45.000 ÷ 3 = 75.000 ÷ 5). Naik–naik: senilai.' },
  { a: 'berbalik', q: 'Waktu tempuh berbanding terbalik dengan kecepatan. Sebuah motor menempuh jarak tertentu dalam 3 jam dengan kecepatan 40 km/jam.', why: 'Berbanding terbalik sama dengan berbalik nilai: kecepatan × waktu = jarak yang tetap (40 × 3 = 120 km).' },
  { a: 'senilai', q: 'Banyak bensin berbanding lurus dengan jarak tempuh. Sebuah motor memakai 2 liter untuk menempuh 30 km.', why: 'Berbanding lurus sama dengan senilai: jarak ÷ bensin tetap, yaitu 15 km tiap liter.' },
  { a: 'berbalik', q: 'Sebuah kolam diisi oleh 4 pompa dalam 9 jam. Jika dipakai 6 pompa, kolam terisi dalam 6 jam.', why: 'Pompa bertambah, waktu berkurang; hasil kali tetap (4 × 9 = 36 = 6 × 6). Naik–turun: berbalik nilai.' },
  { a: 'senilai', q: 'Sebuah motor memakai 3 liter bensin untuk menempuh 45 km. Makin jauh jarak tempuh, makin banyak bensin yang terpakai.', why: 'Jarak bertambah, bensin ikut bertambah dengan perbandingan tetap (45 ÷ 3 = 15 km tiap liter). Naik–naik: senilai.' },
  { a: 'senilai', q: '2 buku harganya Rp10.000. Jika membeli 4 buku, harga totalnya ikut bertambah.', why: 'Banyak buku naik, harga ikut naik; harga tiap buku tetap Rp5.000. Naik–naik: senilai.' },
  { a: 'senilai', q: '2 porsi kue memerlukan 100 gram tepung. Untuk 6 porsi diperlukan tepung yang lebih banyak.', why: 'Porsi naik, tepung ikut naik; tiap porsi selalu 50 gram. Naik–naik: senilai.' },
  { a: 'senilai', q: 'Upah Rina Rp25.000 per jam. Makin lama ia bekerja, makin besar upahnya.', why: 'Jam kerja naik, upah ikut naik dengan perbandingan tetap. Naik–naik: senilai.' },
  { a: 'senilai', q: '1 kg beras harganya Rp14.000. Makin banyak beras yang dibeli, makin besar total harganya.', why: 'Berat naik, harga ikut naik dengan perbandingan tetap. Naik–naik: senilai.' },
  { a: 'senilai', q: 'Sebuah mesin fotokopi menghasilkan 40 lembar tiap menit. Makin lama mesin menyala, makin banyak lembar yang dihasilkan.', why: 'Waktu naik, lembar ikut naik dengan laju tetap. Naik–naik: senilai.' },
  { a: 'berbalik', q: '4 pekerja menyelesaikan sebuah bangunan dalam 12 hari. Jika pekerjanya 8 orang, pekerjaan selesai lebih cepat.', why: 'Pekerja bertambah, hari malah berkurang; hasil kali tetap (4 × 12 = 8 × 6 = 48). Naik–turun: berbalik nilai.' },
  { a: 'berbalik', q: 'Mobil melaju 60 km/jam dan tiba dalam 4 jam. Jika kecepatannya dinaikkan, waktu tempuh untuk jarak yang sama berkurang.', why: 'Kecepatan naik, waktu turun; hasil kali tetap sama dengan jarak. Naik–turun: berbalik nilai.' },
  { a: 'berbalik', q: 'Persediaan makanan untuk 20 orang cukup 12 hari. Jika orangnya bertambah, makanan habis lebih cepat.', why: 'Orang bertambah, hari bertahan berkurang; hasil kali tetap (20 × 12 = 240). Naik–turun: berbalik nilai.' },
  { a: 'berbalik', q: 'Biaya sewa vila dibagi rata. Makin banyak orang yang ikut patungan, makin sedikit uang yang dibayar tiap orang.', why: 'Orang naik, bayar per orang turun; hasil kali tetap sama dengan total biaya. Naik–turun: berbalik nilai.' },
  { a: 'berbalik', q: '2 keran mengisi sebuah bak hingga penuh dalam 6 jam. Makin banyak keran yang dibuka, makin cepat bak penuh.', why: 'Keran bertambah, waktu berkurang; hasil kali tetap (2 × 6 = 12). Naik–turun: berbalik nilai.' },
  { a: 'berbalik', q: 'Sebuah kolam dikuras dengan 3 pompa selama 8 jam. Dengan lebih banyak pompa, waktu menguras lebih singkat.', why: 'Pompa naik, waktu turun; hasil kali tetap (3 × 8 = 24). Naik–turun: berbalik nilai.' },
];
const ITEMS = [['buku tulis', [3000, 3500, 4000, 4500, 5000]], ['pensil', [1500, 2000, 2500, 3000]], ['permen cokelat', [2000, 2500, 3000]], ['kue', [4000, 5000, 6000, 7500]]];
const RATIOS = [[2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [5, 6], [3, 7], [5, 7]];

const search = (tries, fn, fallback) => { for (let i = 0; i < tries; i++) { const v = fn(); if (v) return v; } return fallback; };

export const GEN = {
  jenis: (r) => {
    const s = r.pick(SCEN);
    return [E({ q: `${s.q}\n\nApakah ini senilai atau berbalik nilai?`, a: { t: 'jenis', v: s.a }, show: s.a === 'senilai' ? 'Senilai' : 'Berbalik nilai', why: s.why, phase: 'Input',
      hints: ['Lihat arah perubahannya: bila besaran pertama bertambah, besaran kedua ikut bertambah atau malah berkurang?', 'Uji 2 kali lipat: besaran pertama menjadi 2 kali, besaran kedua ikut 2 kali (senilai) atau menjadi setengah (berbalik nilai)?'] })];
  },

  'sen.satuan': (r) => {
    const [item, prices] = r.pick(ITEMS); const u = r.pick(prices); const a = r.int(2, 6), b = r.int(7, 14);
    const ctx = `${a} ${item} harganya ${rp(a * u)}.`;
    return [
      E({ ctx, q: `Berapa harga 1 ${item}?`, ...NUM(u, '', true), why: `Nilai satuan = ${rp(a * u)} ÷ ${a} = ${rp(u)}.`, hints: ['Untuk mencari nilai 1 satuan, bagi total harga dengan banyaknya barang.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa harga ${b} ${item}?`, ...NUM(u * b, '', true), why: `Senilai: ${rp(u)} × ${b} = ${rp(u * b)}.`, hints: ['Kalikan harga 1 barang dengan banyaknya barang.'], phase: 'Output' }),
    ];
  },

  'sen.bensin': (r) => {
    const k = r.pick([15, 20, 25, 30, 40, 45]); const l1 = r.int(2, 5), l2 = l1 + r.int(2, 8);
    const ctx = `Sebuah motor menghabiskan ${l1} liter bensin untuk menempuh ${k * l1} km.`;
    return [
      E({ ctx, q: 'Berapa km yang ditempuh motor tiap 1 liter?', ...NUM(k, 'km'), why: `${k * l1} km ÷ ${l1} liter = ${k} km tiap liter.`, hints: ['Bagi jarak dengan banyaknya bensin.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa liter bensin yang dibutuhkan untuk menempuh ${k * l2} km?`, ...NUM(l2, 'liter'), why: `Senilai: ${k * l2} km ÷ ${k} km tiap liter = ${l2} liter.`, hints: ['Bagi jarak yang baru dengan jarak tiap liter.'], phase: 'Output' }),
    ];
  },

  'sen.resep': (r) => {
    const p = r.pick([25, 40, 50, 75, 100]); const x = r.int(2, 5), z = x + r.int(2, 7);
    const ctx = `${x} porsi kue memerlukan ${x * p} gram tepung.`;
    return [
      E({ ctx, q: 'Berapa gram tepung untuk 1 porsi?', ...NUM(p, 'gram'), why: `${x * p} ÷ ${x} = ${p} gram.`, hints: ['Bagi tepung dengan banyaknya porsi.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa gram tepung untuk ${z} porsi?`, ...NUM(z * p, 'gram'), why: `Senilai: ${p} × ${z} = ${z * p} gram.`, hints: ['Kalikan tepung 1 porsi dengan banyaknya porsi.'], phase: 'Output' }),
    ];
  },

  'sen.upah': (r) => {
    const u = r.pick([12500, 15000, 17500, 20000, 25000]); const h1 = r.int(2, 4), h2 = r.int(5, 9);
    const ctx = `Rina dibayar ${rp(u * h1)} untuk ${h1} jam kerja.`;
    return [
      E({ ctx, q: 'Berapa upah Rina tiap 1 jam?', ...NUM(u, '', true), why: `${rp(u * h1)} ÷ ${h1} = ${rp(u)}.`, hints: ['Bagi upah dengan banyaknya jam.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa upah Rina untuk ${h2} jam kerja?`, ...NUM(u * h2, '', true), why: `Senilai: ${rp(u)} × ${h2} = ${rp(u * h2)}.`, hints: ['Kalikan upah 1 jam dengan banyaknya jam.'], phase: 'Output' }),
    ];
  },

  bandingkan: (r) => {
    const item = r.pick(['kaos', 'topi', 'tas']);
    const us = r.shuf([40000, 42500, 45000, 47500, 50000, 52500, 55000]).slice(0, 3);
    const cs = [r.pick([10, 12, 15]), r.pick([16, 20, 24]), r.pick([25, 30, 40])];
    const L = ['A', 'B', 'C'];
    const ctx = `Kelas ingin membuat ${item} dan memilih vendor dengan harga per ${item} paling murah.\n` + L.map((v, i) => `Vendor ${v}: ${cs[i]} ${item} seharga ${rp(cs[i] * us[i])}.`).join('\n');
    const best = us.indexOf(Math.min(...us));
    return [
      ...L.map((v, i) => E({ ctx, q: `Berapa harga per ${item} di vendor ${v}?`, ...NUM(us[i], '', true), why: `${rp(cs[i] * us[i])} ÷ ${cs[i]} = ${rp(us[i])}.`, hints: [`Bagi harga paket dengan jumlah ${item}.`], phase: 'Elaborasi' })),
      E({ ctx, q: 'Vendor mana yang paling murah? (jawab dengan huruf A, B, atau C)', a: { t: 'pick', v: L[best] }, show: 'Vendor ' + L[best], why: `Harga per ${item}: ${L.map((v, i) => `${v} = ${rp(us[i])}`).join(', ')}. Paling murah: vendor ${L[best]}.`, hints: ['Bandingkan tiga harga satuan yang sudah kamu hitung.'], phase: 'Output' }),
    ];
  },

  'konstanta.sen': (r) => {
    const k = r.pick([3, 4, 5, 6, 8, 12]); const xs = [2, 3, 4]; const x2 = r.int(6, 12);
    const ctx = `Dua besaran senilai: x = ${xs.join(', ')} dan y = ${xs.map((x) => x * k).join(', ')}.`;
    return [
      E({ ctx, q: 'Berapa konstanta k (hasil bagi y ÷ x)?', ...NUM(k, ''), why: `Senilai: ${xs[0] * k} ÷ ${xs[0]} = ${k}. Hasil bagi selalu sama.`, hints: ['Bagi y dengan x pada salah satu pasangan.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa nilai y jika x = ${x2}?`, ...NUM(k * x2, ''), why: `y = k × x = ${k} × ${x2} = ${k * x2}.`, hints: ['Pakai y = k × x.'], phase: 'Output' }),
    ];
  },

  'konstanta.ber': (r) => {
    const P = r.pick([12, 24, 36, 48, 60]); const ds = [2, 3, 4, 6].filter((d) => P % d === 0).slice(0, 3);
    const x2 = r.pick([2, 3, 4, 6].filter((d) => P % d === 0 && !ds.includes(d)).concat([ds[ds.length - 1]]));
    const ctx = `Dua besaran berbalik nilai: x = ${ds.join(', ')} dan y = ${ds.map((x) => P / x).join(', ')}.`;
    return [
      E({ ctx, q: 'Berapa konstanta k (hasil kali x × y)?', ...NUM(P, ''), why: `Berbalik nilai: ${ds[0]} × ${P / ds[0]} = ${P}. Hasil kali selalu sama.`, hints: ['Kalikan x dengan y pada salah satu pasangan.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Berapa nilai y jika x = ${x2}?`, ...NUM(P / x2, ''), why: `y = k ÷ x = ${P} ÷ ${x2} = ${P / x2}.`, hints: ['Pakai y = k ÷ x.'], phase: 'Output' }),
    ];
  },

  'ber.pekerja': (r) => {
    const w1 = r.pick([4, 6, 8, 10, 12]), d1 = r.pick([6, 8, 10, 12, 14, 16, 18]); const T = w1 * d1;
    const cand = []; for (let w = w1 + 2; w <= 30; w++) if (T % w === 0) cand.push(w);
    const w2 = r.pick(cand.length ? cand : [2 * w1]);
    const ctx = `${w1} pekerja dapat menyelesaikan sebuah pekerjaan dalam ${d1} hari.`;
    return [
      E({ ctx, q: 'Berapa total pekerjaan itu dalam satuan pekerja-hari (pekerja × hari)?', ...NUM(T, 'pekerja-hari'), why: `Berbalik nilai: pekerja × hari tetap. ${w1} × ${d1} = ${T}.`, hints: ['Kalikan banyaknya pekerja dengan banyaknya hari.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Jika dikerjakan ${w2} pekerja dengan kecepatan sama, berapa hari pekerjaan selesai?`, ...NUM(T / w2, 'hari'), why: `${T} ÷ ${w2} = ${T / w2} hari. Pekerja bertambah, hari berkurang.`, hints: ['Bagi total pekerjaan dengan banyaknya pekerja yang baru.'], phase: 'Output' }),
    ];
  },

  'ber.laju': (r) => {
    const [v1, t1, v2] = search(200, () => {
      const a = r.pick([40, 50, 60, 80]), b = r.pick([3, 4, 5, 6]); const s = a * b;
      const c = r.pick([50, 60, 75, 80, 90, 100, 120, 150]);
      return c > a && s % c === 0 ? [a, b, c] : null;
    }, [60, 4, 80]);
    const s = v1 * t1;
    const ctx = `Sebuah mobil melaju ${v1} km/jam dan tiba di tujuan dalam ${t1} jam.`;
    return [
      E({ ctx, q: 'Berapa jarak tempuhnya?', ...NUM(s, 'km'), why: `Jarak = kecepatan × waktu = ${v1} × ${t1} = ${s} km (tetap).`, hints: ['Jarak = kecepatan × waktu.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Jika kecepatannya ${v2} km/jam, berapa jam waktu tempuhnya?`, ...NUM(s / v2, 'jam'), why: `Berbalik nilai: ${s} ÷ ${v2} = ${s / v2} jam.`, hints: ['Bagi jarak dengan kecepatan yang baru.'], phase: 'Output' }),
    ];
  },

  'ber.porsi': (r) => {
    const [n, d, n2] = search(200, () => {
      const a = r.pick([10, 12, 15, 20, 24, 30]), b = r.pick([6, 8, 10, 12, 15, 18, 20]);
      const c = a + r.int(2, 30);
      return (a * b) % c === 0 ? [a, b, c] : null;
    }, [10, 12, 20]);
    const ctx = `Persediaan makanan untuk ${n} orang cukup selama ${d} hari.`;
    return [
      E({ ctx, q: 'Berapa total persediaan dalam satuan orang-hari (orang × hari)?', ...NUM(n * d, 'orang-hari'), why: `${n} × ${d} = ${n * d}. Hasil kali tetap.`, hints: ['Kalikan banyaknya orang dengan banyaknya hari.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Jika jumlah orang menjadi ${n2}, persediaan cukup untuk berapa hari?`, ...NUM((n * d) / n2, 'hari'), why: `Berbalik nilai: ${n * d} ÷ ${n2} = ${(n * d) / n2} hari.`, hints: ['Bagi total persediaan dengan jumlah orang yang baru.'], phase: 'Output' }),
    ];
  },

  'ber.keran': (r) => {
    const [p, t, q] = search(200, () => {
      const a = r.pick([2, 3, 4, 6]), b = r.pick([6, 8, 12, 15, 18, 24]); const c = a + r.int(1, 8);
      return (a * b) % c === 0 ? [a, b, c] : null;
    }, [2, 6, 3]);
    const ctx = `${p} keran dapat memenuhi sebuah bak dalam ${t} jam.`;
    return [
      E({ ctx, q: 'Berapa total pekerjaan itu dalam satuan keran-jam (keran × jam)?', ...NUM(p * t, 'keran-jam'), why: `${p} × ${t} = ${p * t}. Hasil kali tetap.`, hints: ['Kalikan banyaknya keran dengan banyaknya jam.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Jika dibuka ${q} keran, berapa jam bak penuh?`, ...NUM((p * t) / q, 'jam'), why: `Berbalik nilai: ${p * t} ÷ ${q} = ${(p * t) / q} jam.`, hints: ['Bagi total dengan banyaknya keran yang baru.'], phase: 'Output' }),
    ];
  },

  'ber.patungan': (r) => {
    const [T, n, m] = search(200, () => {
      const a = r.pick([120000, 150000, 180000, 240000, 300000, 360000]);
      const ns = [3, 4, 5, 6, 8, 10, 12, 15].filter((x) => a % x === 0);
      const x = r.pick(ns), y = r.pick(ns);
      return x !== y ? [a, x, y] : null;
    }, [240000, 4, 8]);
    const ctx = `Biaya sewa vila ${rp(T)} dibagi rata oleh ${n} orang.`;
    return [
      E({ ctx, q: 'Berapa yang dibayar tiap orang?', ...NUM(T / n, '', true), why: `${rp(T)} ÷ ${n} = ${rp(T / n)}.`, hints: ['Bagi total biaya dengan banyaknya orang.'], phase: 'Input' }),
      E({ ctx, q: `Jika ternyata yang ikut ${m} orang, berapa yang dibayar tiap orang?`, ...NUM(T / m, '', true), why: `Berbalik nilai: ${rp(T)} ÷ ${m} = ${rp(T / m)}.`, hints: ['Total biaya tetap, bagi dengan banyaknya orang yang baru.'], phase: 'Output' }),
    ];
  },

  'ber.tambah': (r) => {
    const [N, D, a, b] = search(400, () => {
      const n = r.pick([10, 12, 15, 16, 20]), d = r.pick([20, 24, 30, 36]), x = r.int(6, 12), y = r.int(2, 6);
      const rem = d - x - y; if (rem <= 0) return null;
      const W = n * (d - x); return W % rem === 0 && W / rem > n ? [n, d, x, y] : null;
    }, [15, 24, 10, 4]);
    const W = N * (D - a), rem = D - a - b, need = W / rem;
    const ctx = `Pembangunan kelas direncanakan selesai dalam ${D} hari oleh ${N} pekerja. Setelah ${a} hari, pekerjaan berhenti ${b} hari karena cuaca. Agar tetap selesai tepat waktu, pekerja harus ditambah.`;
    return [
      E({ ctx, q: 'Berapa hari sisa waktu yang tersedia untuk bekerja?', ...NUM(rem, 'hari'), why: `${D} − ${a} − ${b} = ${rem} hari.`, hints: ['Kurangi rencana dengan hari yang sudah lewat DAN hari berhenti.'], phase: 'Input' }),
      E({ ctx, q: `Menurut rencana, sisa pekerjaan setara berapa pekerja-hari? (${N} pekerja untuk ${D - a} hari sisa rencana)`, ...NUM(W, 'pekerja-hari'), why: `${N} × ${D - a} = ${W} pekerja-hari.`, hints: ['Kalikan pekerja awal dengan hari yang tersisa menurut rencana.'], phase: 'Elaborasi' }),
      E({ ctx, q: `Agar selesai dalam ${rem} hari, berapa pekerja yang dibutuhkan?`, ...NUM(need, 'pekerja'), why: `Berbalik nilai: ${W} ÷ ${rem} = ${need} pekerja.`, hints: ['Bagi sisa pekerjaan dengan sisa waktu.'], phase: 'Elaborasi' }),
      E({ ctx, q: 'Berapa pekerja tambahan yang diperlukan?', ...NUM(need - N, 'pekerja'), why: `${need} − ${N} = ${need - N} pekerja tambahan.`, hints: ['Kurangi pekerja yang dibutuhkan dengan pekerja awal.'], phase: 'Output' }),
    ];
  },

  rasio: (r) => {
    const g = r.int(2, 7); const [p, q] = r.pick(RATIOS);
    const form = r.int(0, 1);
    const qs = form ? `Di sebuah kelas ada ${g * p} siswa laki-laki dan ${g * q} siswa perempuan. Berapa perbandingan siswa laki-laki dan perempuan dalam bentuk paling sederhana? (tulis a : b)` : `Sederhanakan perbandingan ${g * p} : ${g * q}. (tulis a : b)`;
    return [E({ q: qs, a: { t: 'ratio', v: [p, q] }, show: `${p} : ${q}`, why: `Bagi kedua bilangan dengan FPB-nya (${g}): ${g * p} ÷ ${g} = ${p} dan ${g * q} ÷ ${g} = ${q}. Jadi ${p} : ${q}.`, hints: ['Bagi kedua bilangan dengan faktor persekutuan terbesarnya.'], phase: 'Output' })];
  },

  'rasio.bagi': (r) => {
    const [p, q] = r.pick(RATIOS); const m = r.int(2, 8); const N = (p + q) * m * 1000; const one = N / (p + q);
    const ctx = `Uang ${rp(N)} dibagi untuk Adi dan Budi dengan perbandingan ${p} : ${q}.`;
    return [
      E({ ctx, q: 'Berapa nilai satu bagian?', ...NUM(one, '', true), why: `Jumlah bagian = ${p} + ${q} = ${p + q}. Satu bagian = ${rp(N)} ÷ ${p + q} = ${rp(one)}.`, hints: ['Jumlahkan dulu semua bagian, lalu bagi total uang.'], phase: 'Elaborasi' }),
      E({ ctx, q: 'Berapa bagian yang diterima Budi?', ...NUM(q * one, '', true), why: `Budi mendapat ${q} bagian: ${q} × ${rp(one)} = ${rp(q * one)}.`, hints: ['Kalikan nilai satu bagian dengan bagian milik Budi.'], phase: 'Output' }),
    ];
  },
};

export const SENILAI_POOL = ['sen.satuan', 'sen.bensin', 'sen.resep', 'sen.upah', 'bandingkan', 'konstanta.sen'];
export const BERBALIK_POOL = ['ber.pekerja', 'ber.laju', 'ber.porsi', 'ber.keran', 'ber.patungan', 'ber.tambah', 'konstanta.ber'];
export const CAMPUR_POOL = [...SENILAI_POOL, ...BERBALIK_POOL, 'jenis', 'jenis', 'rasio', 'rasio.bagi'];

// Bangkitkan latihan g dengan seed s. si = ambil satu langkah saja (dipakai untuk mengulang soal salah).
export function makeEx(g, s, si) {
  const arr = GEN[g](rr(mulberry(s))).map((e, i) => ({ ...e, type: 'essay', g, s, si: i }));
  return si == null ? arr : [arr[Math.min(si, arr.length - 1)]];
}

export function buildFromGens(gens, seed) {
  return gens.flatMap((g, k) => makeEx(g, seed + k * 101));
}

export function buildPractice(mode, wrong, seed) {
  if (mode === 'salah') return wrong.slice(0, 8).flatMap((w, k) => makeEx(w.g, seed + k * 131, w.si)).map((e, i) => ({ ...e, wk: `${e.g}:${e.si}` }));
  const pool = mode === 'senilai' ? SENILAI_POOL : mode === 'berbalik' ? BERBALIK_POOL : CAMPUR_POOL;
  const rng = rr(mulberry(seed));
  const gens = rng.shuf(pool).slice(0, 4);
  return buildFromGens(gens, seed).slice(0, 10);
}
