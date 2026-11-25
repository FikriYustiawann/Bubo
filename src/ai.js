// Klien AI untuk penyedia mana pun yang kompatibel OpenAI (Groq, OrcaRouter, OpenRouter, dst.). Atur lewat berkas .env:
//   EXPO_PUBLIC_AI_API_KEY        kunci API
//   EXPO_PUBLIC_AI_BASE_URL       alamat API, mis. https://api.groq.com/openai/v1
//   EXPO_PUBLIC_AI_MODEL          model untuk percakapan (teks)
//   EXPO_PUBLIC_AI_VISION_MODEL   model pembaca foto (harus mendukung gambar)
//   EXPO_PUBLIC_AI_VISION_BASE_URL / EXPO_PUBLIC_AI_VISION_API_KEY   (opsional) penyedia lain khusus pembaca foto; kosong = pakai yang di atas
// Foto tidak dikirim ke model percakapan. Alurnya: model foto menyalin isi gambar jadi teks, lalu teks itu
// ditempel ke pesan siswa sehingga pertanyaan lanjutan tetap nyambung.
// PENTING: variabel EXPO_PUBLIC_* ikut tertanam di aplikasi/situs hasil build, jadi siapa pun yang
// memiliki aplikasinya bisa membacanya. Untuk rilis publik, pakai proxy yang menyimpan kunci di server.
import { buildSystemPrompt } from './rmt';

const KEY = process.env.EXPO_PUBLIC_AI_API_KEY || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const BASE = (process.env.EXPO_PUBLIC_AI_BASE_URL || 'https://api.orcarouter.ai/v1').replace(/\/$/, '');
const MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'deepseek/deepseek-v4-flash-free';
const VISION_MODEL = process.env.EXPO_PUBLIC_AI_VISION_MODEL || 'qwen/qwen3.8-27b';
const VISION_KEY = process.env.EXPO_PUBLIC_AI_VISION_API_KEY || KEY;
const VISION_BASE = (process.env.EXPO_PUBLIC_AI_VISION_BASE_URL || BASE).replace(/\/$/, '');
const IS_OSS = /gpt-oss/i.test(MODEL);   // gpt-oss: tingkat berpikir bisa diatur

export const aiReady = !!KEY;

const MAX_TURNS = 14;               // hanya kirim percakapan terakhir agar hemat
const TIMEOUT_MS = 60000;           // model gratis kadang lambat
const VISION_TIMEOUT_MS = 90000;
const MAX_RETRY_429 = 2;            // otomatis coba ulang bila kena batas pemakaian (429)
const MAX_IMAGES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const explain = (status, detail) => {
  if (status === 401) return 'Kunci API ditolak (401). Periksa EXPO_PUBLIC_AI_API_KEY di file .env.';
  if (status === 402) return 'Kredit/saldo penyedia AI tidak cukup (402).';
  if (status === 429) return 'Batas pemakaian tercapai (429). Tunggu sekitar 1 menit lalu coba lagi.' + (detail ? ` Pesan server: ${detail}` : '');
  if (status === 404) return 'Model tidak ditemukan (404). Periksa nama model di file .env.' + (detail ? ` ${detail}` : '');
  if (status === 413) return 'Foto atau pesan terlalu besar (413). Coba foto yang lebih kecil.';
  if (status >= 500) return 'Server AI sedang bermasalah. Coba lagi nanti.';
  return `Permintaan gagal (kode ${status}).` + (detail ? ` ${detail}` : '');
};

async function readDetail(res) {
  try {
    const j = await res.clone().json();
    let d = (j && j.error && (j.error.message || j.error)) || (j && j.message) || '';
    if (typeof d !== 'string') d = JSON.stringify(d);
    return d.slice(0, 200);
  } catch (_) { return ''; }
}

// Satu panggilan chat/completions. Mencoba ulang saat 429, dan membuang reasoning_effort bila model menolaknya.
async function post(body, signal, cfg = { base: BASE, key: KEY }) {
  const headers = { 'Content-Type': 'application/json', ...(cfg.base.includes('openrouter.ai') ? { 'X-Title': 'Bubo' } : {}), ...(cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {}) };
  let b = body;
  let tries429 = 0;
  for (;;) {
    const res = await fetch(`${cfg.base}/chat/completions`, { method: 'POST', headers, body: JSON.stringify(b), signal });
    if (res.ok) return res.json();
    const detail = await readDetail(res);
    if ((res.status === 400 || res.status === 422) && 'reasoning_effort' in b && /reason|effort/i.test(detail)) {
      const { reasoning_effort, ...rest } = b; b = rest; continue;
    }
    if (res.status === 429 && tries429 < MAX_RETRY_429) {
      const ra = Number(res.headers && res.headers.get && res.headers.get('retry-after'));
      const wait = ra > 0 ? Math.min(ra, 20) * 1000 : 3000 * (tries429 + 1) * (tries429 + 1);   // 3 dtk, lalu 12 dtk
      tries429++;
      await sleep(wait);
      continue;
    }
    throw new Error(explain(res.status, detail));
  }
}

async function guarded(ms, fn) {
  if (!aiReady) throw new Error('Kunci API belum diisi. Isi EXPO_PUBLIC_AI_API_KEY di file .env lalu jalankan ulang aplikasi (npx expo start -c).');
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
  try {
    return await fn(ctrl ? ctrl.signal : undefined);
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('Terlalu lama menunggu AI. Periksa koneksi lalu coba lagi.');
    if (e instanceof TypeError) throw new Error('Tidak bisa terhubung ke AI. Periksa internet (di web, bisa juga terblokir CORS: pakai proxy).');
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function textOf(data) {
  const m = data && data.choices && data.choices[0] && data.choices[0].message;
  let out = m && m.content;
  if (Array.isArray(out)) out = out.map((p) => (p && p.text) || '').join('');
  if (typeof out !== 'string') return '';
  return out.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*$/i, '').trim();
}

// history: [{ role: 'user' | 'assistant', content }]
export async function askRMT(history, { user } = {}) {
  return guarded(TIMEOUT_MS, async (signal) => {
    const data = await post({
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(user) }, ...history.slice(-MAX_TURNS)],
      temperature: 0.6,
      max_tokens: 2000,     // model penalaran butuh ruang ekstra agar jawaban tidak terpotong
      stream: false,
      ...(IS_OSS ? { reasoning_effort: 'medium' } : {}),   // gpt-oss: berpikir sedang (ganti 'low' bila ingin lebih cepat)
    }, signal);
    const out = textOf(data);
    if (!out) throw new Error('Balasan kosong dari AI. Coba kirim ulang.');
    return out;
  });
}

const VISION_PROMPT = `Kamu bertugas membaca foto/tangkapan layar milik siswa SMP dan menyalinnya menjadi teks. Tuliskan ulang SEMUA isi gambar seakurat mungkin dalam bahasa aslinya: teks soal, angka, satuan, tanda baca, pilihan jawaban, dan tabel (satu baris teks per baris tabel, kolom dipisah "|"). Bila ada gambar atau diagram, jelaskan singkat apa yang tampak (mis. grafik, bangun datar, label angka). Bila ada tulisan tangan berupa jawaban atau langkah pengerjaan siswa, salin juga dan beri label "Pekerjaan siswa:". Bila ada bagian yang tidak terbaca, tulis [tidak terbaca]. JANGAN menyelesaikan soal, jangan menilai, jangan menambah komentar atau salam. Bila gambar bukan soal atau pekerjaan, cukup jelaskan singkat isinya.`;

// images: [{ dataUri }] (data:image/jpeg;base64,...). Mengembalikan isi gambar sebagai teks.
export async function readImages(images, caption = '') {
  const list = (images || []).slice(0, MAX_IMAGES);
  if (!list.length) return '';
  return guarded(VISION_TIMEOUT_MS, async (signal) => {
    const content = [
      { type: 'text', text: VISION_PROMPT + (caption ? `\n\nPesan siswa untuk foto ini: ${caption}` : '') },
      ...list.map((im) => ({ type: 'image_url', image_url: { url: im.dataUri } })),
    ];
    const data = await post({
      model: VISION_MODEL,
      messages: [{ role: 'user', content }],
      temperature: 0.1,
      max_tokens: 3000,
      stream: false,
      reasoning_effort: 'none',   // cukup menyalin; bila model menolak parameter ini, otomatis dibuang
    }, signal, { base: VISION_BASE, key: VISION_KEY });
    const out = textOf(data);
    if (!out) throw new Error('Foto belum bisa dibaca. Coba foto lebih jelas dan terang, atau ketik soalnya.');
    return out;
  });
}

export const MAX_IMAGES_PER_MESSAGE = MAX_IMAGES;
