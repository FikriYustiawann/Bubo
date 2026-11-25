import { UNITS, ALL } from './lessons';
import { TOPICS } from './materiData';
import { C } from './theme';

// Semua logika data permainan ada di sini sebagai fungsi murni.
//
// Maksud tiap fitur (supaya bukan sekadar hiasan):
// - XP        = jejak usaha belajar. Didapat dari SEMUA kebiasaan belajar yang baik: mengerjakan soal,
//               membaca materi, menonton video, memperbaiki soal yang pernah salah, dan bertanya pada Bubo.
// - Level     = tahap perjalanan belajar (bukan nilai). Kemampuan sebenarnya dibaca dari Peta Kemampuan.
// - Hati      = kesempatan berpikir. Habis karena asal menjawab; pulih dengan BELAJAR (baca materi / latihan), bukan hanya menunggu.
// - Runtutan  = kebiasaan belajar sedikit tapi tiap hari (membaca dan menonton juga dihitung).
// - Misi      = 4 kebiasaan belajar sesuai alur Input - Elaborasi - Output - Refleksi.
// - Lencana   = penanda kemampuan dan kebiasaan nyata, bukan sekadar angka XP.
export const MAX_HEARTS = 5;
export const REGEN_MS = 15 * 60 * 1000;   // +1 hati tiap 15 menit
export const GOAL = 30;                    // target XP harian
export const QUEST_REWARD = 10;
export const RHYTHM_BONUS = 10;            // klaim keempat misi dalam sehari
export const XP_READ = 6;                  // pertama kali membaca satu topik
export const XP_VIDEO = 3;                 // pertama kali menonton satu video
export const XP_FIX = 2;                   // tiap soal yang pernah salah lalu berhasil diperbaiki
export const XP_REFLECT = 2;               // bertanya pada Bubo (sekali per hari)
export const MIN_SAMPLE = 5;               // jumlah jawaban minimal sebelum kemampuan dinilai

export const FRESH = {
  v: 3, name: '', xp: 0, done: {}, streak: { n: 0, last: '' }, hearts: { n: MAX_HEARTS, t: 0 },
  daily: { date: '', xp: 0, ok: 0, perfect: 0, input: 0, fixed: 0, reflect: 0 }, claimed: {}, read: {}, watched: {}, days: {}, badges: {},
  wrong: [], stats: { ok: 0, total: 0 }, skill: {}, fixed: 0, rhythm: 0,
};

// Dari mana XP berasal (ditampilkan di layar Misi agar jelas gunanya)
export const XP_SOURCES = [
  { icon: 'target', t: 'Menyelesaikan pelajaran atau latihan', v: '4 sampai 15 XP', why: 'Usaha mengerjakan soal, dan bonus bila tanpa salah.' },
  { icon: 'book', t: 'Membaca satu topik materi (pertama kali)', v: `+${XP_READ} XP dan +1 hati`, why: 'Paham dulu sebelum menghitung.' },
  { icon: 'play', t: 'Menonton satu video (pertama kali)', v: `+${XP_VIDEO} XP`, why: 'Penjelasan dari sudut pandang guru lain.' },
  { icon: 'bandage', t: 'Memperbaiki soal yang pernah salah', v: `+${XP_FIX} XP per soal`, why: 'Belajar paling banyak dari kesalahan.' },
  { icon: 'owl', t: 'Bertanya pada Bubo', v: `+${XP_REFLECT} XP per hari`, why: 'Merenungkan dan menjelaskan dengan kata sendiri.' },
];

// Level = tahap perjalanan. Nama sengaja menggambarkan kebiasaan, bukan klaim kepintaran.
export const LEVELS = [
  { t: 'Penjelajah', xp: 0 },
  { t: 'Pencari Pola', xp: 60 },
  { t: 'Pemecah Soal', xp: 150 },
  { t: 'Penalar Tekun', xp: 300 },
  { t: 'Ahli Banding', xp: 500 },
  { t: 'Juara Banding', xp: 800 },
];
export function levelOf(xp) {
  let i = 0;
  LEVELS.forEach((l, k) => { if (xp >= l.xp) i = k; });
  const cur = LEVELS[i]; const nxt = LEVELS[i + 1] || null;
  return { n: i + 1, t: cur.t, next: nxt, pct: nxt ? (xp - cur.xp) / (nxt.xp - cur.xp) : 1, left: nxt ? nxt.xp - xp : 0 };
}

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Minggu kalender: Senin sampai Minggu (minggu berjalan). Hari setelah hari ini ditandai future.
export const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const HARI_PENUH = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function weekDays(now = new Date()) {
  const todayIdx = (now.getDay() + 6) % 7; // Senin = 0 ... Minggu = 6
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx + i);
    return { i, key: dayKey(d), short: HARI_PENDEK[i], full: HARI_PENUH[i], date: `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}`, today: i === todayIdx, future: i > todayIdx };
  });
}
const yesterdayKey = (now) => { const y = new Date(now); y.setDate(y.getDate() - 1); return dayKey(y); };

export function heartsNow(h, now = Date.now()) {
  if (h.n >= MAX_HEARTS) return { n: MAX_HEARTS, t: now, next: 0 };
  const g = Math.max(0, Math.floor((now - h.t) / REGEN_MS));
  const n = Math.min(MAX_HEARTS, h.n + g);
  const t = n >= MAX_HEARTS ? now : h.t + g * REGEN_MS;
  return { n, t, next: n >= MAX_HEARTS ? 0 : REGEN_MS - (now - t) };
}

export function normalize(s, now = new Date()) {
  const st = {
    ...FRESH, ...s,
    stats: { ...FRESH.stats, ...(s && s.stats) },
    streak: { ...FRESH.streak, ...(s && s.streak) },
    daily: { ...FRESH.daily, ...(s && s.daily) },
    watched: { ...((s && s.watched) || {}) },
    skill: { ...((s && s.skill) || {}) },
  };
  const today = dayKey(now);
  if (st.daily.date !== today) { st.daily = { ...FRESH.daily, date: today }; st.claimed = {}; }
  const h = heartsNow(st.hearts || FRESH.hearts, now.getTime());
  st.hearts = { n: h.n, t: h.t };
  return st;
}

export const streakNow = (s, now = new Date()) => (s.streak.last === dayKey(now) || s.streak.last === yesterdayKey(now) ? s.streak.n : 0);

// ---- pembantu internal ----
function addHeart(s, now) {
  const h = heartsNow(s.hearts, now.getTime());
  s.hearts = { n: Math.min(MAX_HEARTS, h.n + 1), t: h.n + 1 >= MAX_HEARTS ? now.getTime() : h.t };
}
// Menambah XP dan menghitung hari ini sebagai hari belajar (runtutan)
function bump(s, xp, now) {
  const today = dayKey(now);
  s.xp += xp;
  s.daily = { ...s.daily, xp: s.daily.xp + xp };
  s.days = { ...s.days, [today]: (s.days[today] || 0) + xp };
  const keep = Object.keys(s.days).sort().slice(-30); s.days = Object.fromEntries(keep.map((k) => [k, s.days[k]]));
  if (s.streak.last !== today) s.streak = { n: s.streak.last === yesterdayKey(now) ? s.streak.n + 1 : 1, last: today };
}
function award(s, now) {
  const fresh = BADGES.filter((b) => !s.badges[b.id] && b.ok(s));
  s.badges = { ...s.badges, ...Object.fromEntries(fresh.map((b) => [b.id, dayKey(now)])) };
  return fresh;
}

// ---- peta kemampuan (dihitung dari jawaban nyata) ----
export const SKILL_GROUPS = [
  { id: 'jenis', t: 'Mengenali jenis', topic: 'bedakan', icon: 'magnify', color: C.orange },
  { id: 'rasio', t: 'Rasio dan bagian', topic: 'rasio', icon: 'pie', color: C.green },
  { id: 'senilai', t: 'Senilai', topic: 'senilai', icon: 'tag', color: C.blue },
  { id: 'berbalik', t: 'Berbalik nilai', topic: 'berbalik', icon: 'repeat', color: C.purple },
];
export function groupOf(g = '') {
  if (g === 'jenis') return 'jenis';
  if (g.startsWith('rasio')) return 'rasio';
  if (g.startsWith('ber.') || g === 'konstanta.ber') return 'berbalik';
  return 'senilai';
}
export function mastery(s) {
  const acc = {};
  Object.entries(s.skill || {}).forEach(([g, v]) => { const k = groupOf(g); const a = acc[k] || { ok: 0, total: 0 }; acc[k] = { ok: a.ok + v.ok, total: a.total + v.total }; });
  return SKILL_GROUPS.map((G) => {
    const a = acc[G.id] || { ok: 0, total: 0 };
    const pct = a.total >= MIN_SAMPLE ? a.ok / a.total : null;
    return { ...G, ok: a.ok, total: a.total, pct, level: pct == null ? 'baru' : pct >= 0.85 ? 'kuat' : pct >= 0.6 ? 'cukup' : 'lemah' };
  });
}
// Kemampuan yang paling perlu diperkuat (hanya yang sudah cukup datanya)
export const weakest = (s) => mastery(s).filter((m) => m.pct != null).sort((a, b) => a.pct - b.pct)[0] || null;
export const nextUnreadTopic = (s) => TOPICS.find((t) => !(s.read && s.read[t.id])) || null;

// Dipanggil tiap satu jawaban diperiksa
export function applyAnswer(s0, ex, ok, mode, now = new Date()) {
  const s = normalize(s0, now);
  s.stats = { ok: s.stats.ok + (ok ? 1 : 0), total: s.stats.total + 1 };
  if (ok) s.daily = { ...s.daily, ok: s.daily.ok + 1 };
  if (ex.g) { const p = s.skill[ex.g] || { ok: 0, total: 0 }; s.skill = { ...s.skill, [ex.g]: { ok: p.ok + (ok ? 1 : 0), total: p.total + 1 } }; }
  const k = `${ex.g}:${ex.si}`;
  const wasWrong = s.wrong.some((w) => `${w.g}:${w.si}` === k);
  const rest = s.wrong.filter((w) => `${w.g}:${w.si}` !== k);
  s.wrong = ok ? rest : [{ g: ex.g, s: ex.s, si: ex.si }, ...rest].slice(0, 30);
  // Memperbaiki kesalahan lama (di sesi latihan) dihargai, karena itulah belajar yang sebenarnya
  if (ok && wasWrong && mode !== 'lesson') {
    s.fixed = (s.fixed || 0) + 1;
    s.daily = { ...s.daily, fixed: s.daily.fixed + 1 };
    bump(s, XP_FIX, now);
  }
  if (!ok && mode === 'lesson') {
    const h = heartsNow(s.hearts, now.getTime());
    s.hearts = { n: Math.max(0, h.n - 1), t: h.n >= MAX_HEARTS ? now.getTime() : h.t };
  }
  return s;
}

const unitDone = (s, i) => UNITS[i].lessons.every((l) => s.done[l.id]);
const acc = (s) => (s.stats.total ? s.stats.ok / s.stats.total : 0);

// d = cara mendapatkan, m = artinya bagi belajarmu
export const BADGES = [
  { id: 'first', t: 'Langkah Pertama', d: 'Selesaikan 1 pelajaran', m: 'Awal yang paling sulit sudah lewat.', icon: 'sprout', ok: (s) => Object.keys(s.done).length >= 1 },
  { id: 's3', t: 'Api Kecil', d: 'Belajar 3 hari berturut-turut', m: 'Sedikit tiap hari lebih awet daripada sekali banyak.', icon: 'flame', ok: (s) => s.streak.n >= 3 },
  { id: 's7', t: 'Api Besar', d: 'Belajar 7 hari berturut-turut', m: 'Belajar sudah menjadi kebiasaan.', icon: 'volcano', ok: (s) => s.streak.n >= 7 },
  { id: 'perfect', t: 'Sempurna', d: 'Raih 3 bintang dalam satu pelajaran', m: 'Kamu bisa mengerjakan tanpa salah.', icon: 'sparkle', ok: (s) => Object.values(s.done).includes(3) },
  { id: 'teliti', t: 'Teliti', d: 'Ketepatan 85% atau lebih (min. 30 jawaban)', m: 'Bukan cuma banyak menjawab, tapi benar.', icon: 'target', ok: (s) => s.stats.total >= 30 && acc(s) >= 0.85 },
  { id: 'ok50', t: 'Jago Hitung', d: '50 jawaban benar', m: 'Latihan berulang membangun kelancaran.', icon: 'calc', ok: (s) => s.stats.ok >= 50 },
  { id: 'fix', t: 'Pemeriksa Diri', d: 'Perbaiki 10 soal yang pernah salah', m: 'Mau kembali ke kesalahan adalah tanda belajar sungguhan.', icon: 'bandage', ok: (s) => (s.fixed || 0) >= 10 },
  { id: 'u1', t: 'Detektif Jenis', d: 'Selesaikan Unit 1', m: 'Bisa menentukan senilai atau berbalik nilai.', icon: 'magnify', ok: (s) => unitDone(s, 0) },
  { id: 'u2', t: 'Ahli Senilai', d: 'Selesaikan Unit 2', m: 'Menguasai hubungan naik bersama.', icon: 'tag', ok: (s) => unitDone(s, 1) },
  { id: 'u3', t: 'Raja Berbalik', d: 'Selesaikan Unit 3', m: 'Menguasai hubungan satu naik, satu turun.', icon: 'repeat', ok: (s) => unitDone(s, 2) },
  { id: 'u4', t: 'Penakluk Tantangan', d: 'Selesaikan Unit 4', m: 'Bisa memilih cara yang tepat pada soal campuran.', icon: 'medal', ok: (s) => unitDone(s, 3) },
  { id: 'baca', t: 'Rajin Membaca', d: 'Baca semua topik materi', m: 'Paham konsepnya, bukan hanya rumusnya.', icon: 'books', ok: (s) => TOPICS.every((x) => s.read && s.read[x.id]) },
  { id: 'tonton', t: 'Penonton Cerdas', d: 'Tonton 5 video penjelasan', m: 'Belajar dari beberapa sudut pandang.', icon: 'play', ok: (s) => Object.keys(s.watched || {}).length >= 5 },
  { id: 'ritme', t: 'Ritme Lengkap', d: 'Klaim keempat misi dalam satu hari', m: 'Membaca, berlatih, dan merenung seimbang.', icon: 'gem', ok: (s) => (s.rhythm || 0) >= 1 },
  { id: 'all', t: 'Juara Banding', d: 'Selesaikan semua pelajaran', m: 'Seluruh jalur belajar tuntas.', icon: 'trophy', ok: (s) => ALL.every((l) => s.done[l.id]) },
];

// Empat misi harian = empat fase Input - Elaborasi - Output - Refleksi (sama dengan cara Bubo membimbing)
export const QUESTS = [
  { id: 'input', phase: 'Input', t: 'Baca 1 topik materi atau tonton 1 video', why: 'Pahami dulu sebelum menghitung.', goal: 1, get: (d) => d.input, icon: 'book', go: 'materi' },
  { id: 'ok', phase: 'Elaborasi', t: 'Jawab 10 soal dengan benar', why: 'Berlatih memakai konsep pada soal baru.', goal: 10, get: (d) => d.ok, icon: 'target', go: 'latihan' },
  { id: 'perfect', phase: 'Output', t: 'Selesaikan 1 sesi tanpa salah', why: 'Buktikan kamu bisa mengerjakan sendiri.', goal: 1, get: (d) => d.perfect, icon: 'medal', go: 'latihan' },
  { id: 'reflect', phase: 'Refleksi', t: 'Tanya Bubo 1 kali, atau perbaiki 3 soal yang pernah salah', why: 'Mengecek dan menjelaskan dengan kata sendiri.', goal: 1, get: (d) => (d.reflect > 0 || d.fixed >= 3 ? 1 : 0), icon: 'owl', go: 'tutor' },
];

// res = { stars, xp, mistakes, mode, lessonId }
export function applyFinish(s0, res, now = new Date()) {
  const s = normalize(s0, now);
  bump(s, res.xp, now);
  s.daily = { ...s.daily, perfect: s.daily.perfect + (res.mistakes === 0 ? 1 : 0) };
  if (res.mode === 'lesson') s.done = { ...s.done, [res.lessonId]: Math.max(res.stars, s.done[res.lessonId] || 0) };
  else addHeart(s, now);
  const fresh = award(s, now);
  return { state: s, newBadges: fresh };
}

export function claimQuest(s0, id, now = new Date()) {
  const s = normalize(s0, now); const q = QUESTS.find((x) => x.id === id);
  if (!q || s.claimed[id] || q.get(s.daily) < q.goal) return s;
  s.claimed = { ...s.claimed, [id]: true }; s.xp += QUEST_REWARD;
  // Keempat misi (membaca, berlatih, menunjukkan, merenung) selesai: ritme belajar seimbang, hati penuh kembali
  if (QUESTS.every((x) => s.claimed[x.id])) { s.rhythm = (s.rhythm || 0) + 1; s.xp += RHYTHM_BONUS; s.hearts = { n: MAX_HEARTS, t: now.getTime() }; }
  award(s, now);
  return s;
}

// Menandai satu topik materi sudah dibaca (pertama kali: XP + 1 hati)
export function markRead(s0, id, now = new Date()) {
  const s = normalize(s0, now);
  if (s.read[id]) return s;
  s.read = { ...s.read, [id]: dayKey(now) };
  s.daily = { ...s.daily, input: s.daily.input + 1 };
  bump(s, XP_READ, now);
  addHeart(s, now);
  award(s, now);
  return s;
}

// Menandai satu video sudah dibuka/ditonton (pertama kali: XP)
export function markWatched(s0, id, now = new Date()) {
  const s = normalize(s0, now);
  if (s.watched[id]) return s;
  s.watched = { ...s.watched, [id]: dayKey(now) };
  s.daily = { ...s.daily, input: s.daily.input + 1 };
  bump(s, XP_VIDEO, now);
  award(s, now);
  return s;
}

// Mengirim pertanyaan ke Bubo (XP hanya untuk yang pertama tiap hari)
export function markReflect(s0, now = new Date()) {
  const s = normalize(s0, now);
  s.daily = { ...s.daily, reflect: s.daily.reflect + 1 };
  if (s.daily.reflect === 1) bump(s, XP_REFLECT, now);
  return s;
}
