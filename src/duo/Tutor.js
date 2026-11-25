import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Owl from './Owl';
import Icon from './Icon';
import Rich from './Rich';
import { Btn, Input, Reveal, T, Tap } from './ui';
import ChatHistory from './History';
import { C, fonts } from './theme';
import { MASCOT } from './brand';
import { sfx } from './sound';
import { askRMT, readImages, aiReady, MAX_IMAGES_PER_MESSAGE as MAX_IMG } from '../ai';
import { RMT_STARTERS, parsePhase } from '../rmt';

// Paket foto/berkas dimuat longgar: bila belum terpasang, aplikasi tetap jalan dan menampilkan petunjuk.
let Picker = null, Docs = null, Manip = null;
try { Picker = require('expo-image-picker'); } catch (e) { Picker = null; }
try { Docs = require('expo-document-picker'); } catch (e) { Docs = null; }
try { Manip = require('expo-image-manipulator'); } catch (e) { Manip = null; }
const NEEDS = 'Fitur foto dan file butuh paket tambahan. Jalankan: npx expo install expo-image-picker expo-document-picker expo-image-manipulator, lalu npx expo start -c.';

const MAX_FILE_CHARS = 8000;
const MAX_SEEN_CHARS = 3000;

// perkecil foto agar cepat terkirim dan tidak melewati batas ukuran
async function shrink(uri) {
  if (!Manip) return null;
  try {
    const fmt = Manip.SaveFormat ? Manip.SaveFormat.JPEG : 'jpeg';
    if (Manip.manipulateAsync) return await Manip.manipulateAsync(uri, [{ resize: { width: 1280 } }], { compress: 0.7, format: fmt, base64: true });
    if (Manip.ImageManipulator && Manip.ImageManipulator.manipulate) {
      const ctx = Manip.ImageManipulator.manipulate(uri);
      ctx.resize({ width: 1280 });
      const ref = await ctx.renderAsync();
      return await ref.saveAsync({ compress: 0.7, format: fmt, base64: true });
    }
  } catch (e) { /* pakai hasil asli */ }
  return null;
}

async function uriToDataUri(uri) {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error('Gagal membaca foto.'));
    fr.readAsDataURL(blob);
  });
}

const isTextFile = (a) => {
  const mt = (a.mimeType || '').toLowerCase(), nm = (a.name || '').toLowerCase();
  return mt.startsWith('text/') || mt === 'application/json' || /\.(txt|md|csv|tsv|json)$/.test(nm);
};

// Efek mengetik ala ChatGPT: teks balasan muncul bertahap, lalu berhenti sendiri (maks. sekitar 2,5 detik).
function Typed({ text, onDone }) {
  const tokens = useMemo(() => String(text || '').split(/(\s+)/), [text]);
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    let i = 0;
    const step = Math.max(2, Math.ceil(tokens.length / 90));
    const id = setInterval(() => {
      i = Math.min(tokens.length, i + step);
      setN(i);
      if (i >= tokens.length) { clearInterval(id); done.current && done.current(); }
    }, 28);
    return () => clearInterval(id);
  }, [tokens]);
  return <Rich text={tokens.slice(0, n).join('')} size={18} />;
}

// Tiga titik berdenyut saat Bubo menyiapkan balasan
function Dots() {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  const c = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = [a, b, c].map((x, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 140),
      Animated.timing(x, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.delay((2 - i) * 140),
    ])));
    run.forEach((r) => r.start());
    return () => run.forEach((r) => r.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 24 }}>
      {[a, b, c].map((x, i) => (
        <Animated.View key={i} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.blue, marginRight: 6, opacity: x.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ translateY: x.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }} />
      ))}
    </View>
  );
}

// Tab mentor AI yang dipandu model Rigorous Mathematical Thinking.
// Fase RMT (Input / Elaborasi / Output / Refleksi) bekerja di belakang layar: dipakai AI untuk menyusun balasan, tidak ditampilkan ke siswa.
// Siswa bisa melampirkan foto (kamera/galeri) dan berkas teks.
export const helloMsg = (user) => ({ role: 'assistant', local: true, text: `Halo${user ? ' ' + user : ''}! Aku ${MASCOT}. Kirim soal perbandingan senilai atau berbalik nilai, boleh diketik atau difoto, lalu kita bedah bareng. Aku akan banyak bertanya, karena jawabanmulah kuncinya.` });

// msgs/setMsgs dipegang App (dan disimpan di perangkat), jadi riwayat chat tidak hilang saat pindah tab atau menutup aplikasi.
export default function Tutor({ user, seed, onSeedUsed, onAsked, chats, activeId, updateChat, onPick, onNew, onDelete }) {
  const chat = chats.find((c) => c.id === activeId) || chats[0];
  const msgs = chat ? chat.msgs : [];
  const cid = chat ? chat.id : null;
  const setMsgs = (fn) => updateChat(cid, fn);
  const [hist, setHist] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('pikir');
  const [images, setImages] = useState([]);   // [{ uri, dataUri }]
  const [file, setFile] = useState(null);     // { name, text }
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState('');
  const [loadingPick, setLoadingPick] = useState(false);
  const [focus, setFocus] = useState(false);
  const scroller = useRef(null);

  useEffect(() => { if (seed) { setInput(seed); onSeedUsed && onSeedUsed(); } }, [seed]);

  const addImage = async (asset) => {
    let uri = asset.uri, dataUri = null;
    const s = await shrink(uri);
    if (s && s.base64) { dataUri = `data:image/jpeg;base64,${s.base64}`; uri = s.uri || uri; }
    else if (asset.base64) dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
    else dataUri = await uriToDataUri(uri);
    if (!dataUri) throw new Error('Foto tidak bisa dibaca.');
    if (dataUri.length > 5200000) throw new Error('Foto terlalu besar. Coba foto yang lebih kecil.');
    setImages((p) => [...p, { uri, dataUri }].slice(0, MAX_IMG));
  };

  const withPick = async (fn) => {
    setMenu(false); setNote(''); setLoadingPick(true);
    try { await fn(); } catch (e) { setNote((e && e.message) || 'Gagal membuka.'); } finally { setLoadingPick(false); }
  };

  const camera = () => withPick(async () => {
    if (!Picker) { setNote(NEEDS); return; }
    if (images.length >= MAX_IMG) { setNote(`Maksimal ${MAX_IMG} foto per pesan.`); return; }
    const perm = await Picker.requestCameraPermissionsAsync();
    if (perm && perm.granted === false) { setNote('Izin kamera ditolak. Aktifkan izin kamera untuk aplikasi ini di pengaturan HP.'); return; }
    const r = await Picker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, base64: true });
    if (!r.canceled && r.assets && r.assets[0]) await addImage(r.assets[0]);
  });

  const gallery = () => withPick(async () => {
    if (!Picker) { setNote(NEEDS); return; }
    const left = MAX_IMG - images.length;
    if (left <= 0) { setNote(`Maksimal ${MAX_IMG} foto per pesan.`); return; }
    const r = await Picker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: left, quality: 0.7, base64: true });
    if (!r.canceled && r.assets) for (const a of r.assets.slice(0, left)) await addImage(a);
  });

  const pickFile = () => withPick(async () => {
    if (!Docs) { setNote(NEEDS); return; }
    const r = await Docs.getDocumentAsync({ type: ['image/*', 'text/*', 'application/json', 'application/pdf'], copyToCacheDirectory: true, multiple: false });
    if (r.canceled || !r.assets || !r.assets[0]) return;
    const a = r.assets[0];
    const mt = (a.mimeType || '').toLowerCase();
    if (mt.startsWith('image/')) {
      if (images.length >= MAX_IMG) { setNote(`Maksimal ${MAX_IMG} foto per pesan.`); return; }
      await addImage({ uri: a.uri, mimeType: a.mimeType });
    } else if (mt === 'application/pdf' || /\.pdf$/i.test(a.name || '')) {
      setNote('PDF belum bisa dibaca langsung. Foto atau screenshot halaman soalnya, lalu kirim lewat Kamera atau Galeri ya.');
    } else if (isTextFile(a)) {
      let t = await (await fetch(a.uri)).text();
      t = t.trim();
      if (!t) { setNote('Berkasnya kosong.'); return; }
      if (t.length > MAX_FILE_CHARS) t = t.slice(0, MAX_FILE_CHARS) + '\n[...dipotong]';
      setFile({ name: a.name || 'berkas.txt', text: t });
    } else {
      setNote('Jenis berkas ini belum didukung. Pakai foto (JPG/PNG) atau berkas teks (.txt, .md, .csv).');
    }
  });

  const send = async (txt) => {
    const starter = txt != null;
    const text = (starter ? txt : input).trim();
    const imgs = starter ? [] : images;
    const fl = starter ? null : file;
    if ((!text && !imgs.length && !fl) || busy) return;
    setInput(''); setImages([]); setFile(null); setMenu(false); setNote('');
    sfx('send'); onAsked && onAsked();

    const shown = { role: 'user', text, raw: text, images: imgs.map((i) => i.uri), fileName: fl ? fl.name : null };
    const prior = msgs.filter((m) => !m.err && !m.local).map((m) => ({ role: m.role, content: m.raw }));
    const to = cid; const put = (fn) => updateChat(to, fn);
    put((p) => [...p, shown]);
    setBusy(true); setStage(imgs.length ? 'baca' : 'pikir');
    try {
      let raw = text || (imgs.length ? 'Ini foto soalku. Tolong bantu aku.' : 'Ini berkas soalku. Tolong bantu aku.');
      if (fl) raw += `\n\n[Isi file "${fl.name}"]\n${fl.text}`;
      if (imgs.length) {
        const seen = await readImages(imgs, text);
        raw += `\n\n[Isi foto yang dikirim siswa, dibaca otomatis]\n${seen.slice(0, MAX_SEEN_CHARS)}`;
        setStage('pikir');
      }
      put((p) => p.map((m) => (m === shown ? { ...m, raw } : m)));
      const reply = await askRMT([...prior, { role: 'user', content: raw }], { user });
      const { phase, text: body } = parsePhase(reply);
      put((p) => [...p, { role: 'assistant', text: body, phase, raw: reply, typed: true }]); sfx('receive');
    } catch (e) {
      put((p) => [...p, { role: 'assistant', text: e.message || 'Terjadi kesalahan.', err: true }]);
    } finally { setBusy(false); setStage('pikir'); }
  };

  const finishTyping = (k) => setMsgs((p) => p.map((x, i) => (i === k ? { ...x, typed: false } : x)));

  const hasAttach = images.length > 0 || !!file;
  const canSend = !busy && !loadingPick && (!!input.trim() || hasAttach);

  const MenuItem = ({ icon, label, onPress }) => (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 4 }}>
      <Icon name={icon} size={26} />
      <T style={{ marginLeft: 8, color: C.blueD, fontSize: 16 }}>{label}</T>
    </Pressable>
  );

  if (hist) return <ChatHistory chats={chats} activeId={cid} onPick={(id) => { setHist(false); onPick(id); }} onNew={() => { setHist(false); onNew(); }} onDelete={onDelete} onClose={() => setHist(false)} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 2, borderBottomColor: C.line }}>
        <Owl size={52} mood={busy ? 'think' : 'happy'} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <T style={{ fontWeight: '700', fontSize: 21 }}>Tanya {MASCOT}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: busy ? C.gold : C.green, marginRight: 6 }} />
            <T numberOfLines={1} style={{ color: C.sub, fontSize: 14, flex: 1 }}>{busy ? `${MASCOT} sedang berpikir...` : chat && chat.title ? chat.title : 'Percakapan baru'}</T>
          </View>
        </View>
        <Tap onPress={() => { sfx('tab'); setHist(true); }} scaleTo={0.88} sound={null} style={{ alignItems: 'center', padding: 8 }}>
          <Icon name="clock" size={26} />
          <T style={{ fontSize: 11, color: C.sub, fontWeight: '700' }}>Riwayat</T>
        </Tap>
        <Tap onPress={() => { sfx('start'); onNew(); }} scaleTo={0.88} sound={null} style={{ alignItems: 'center', padding: 8 }}>
          <Icon name="plus" size={26} />
          <T style={{ fontSize: 11, color: C.blueD, fontWeight: '700' }}>Baru</T>
        </Tap>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroller.current && scroller.current.scrollToEnd({ animated: true })}>
        {!aiReady && (
          <View style={{ backgroundColor: C.redL, borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <T style={{ color: C.redT, fontSize: 16 }}>Kunci API belum diisi. Isi EXPO_PUBLIC_AI_API_KEY di file .env, lalu jalankan ulang aplikasi.</T>
          </View>
        )}
        {msgs.map((m, k) => <Reveal key={k} dy={10} ms={240} step={0}>{(() => {
          if (m.role === 'user') {
            return (
              <View key={k} style={{ alignItems: 'flex-end', marginBottom: 16 }}>
                <View style={{ maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, borderBottomRightRadius: 6, backgroundColor: C.blueL, borderWidth: 2, borderColor: '#BFE8FF' }}>
                  {m.images && m.images.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: m.text || m.fileName ? 6 : 0 }}>
                      {m.images.map((u, i) => <Image key={i} source={{ uri: u }} style={{ width: 96, height: 96, borderRadius: 12, marginRight: 6, marginBottom: 6, backgroundColor: '#fff' }} />)}
                    </View>
                  ) : null}
                  {m.fileName ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: m.text ? 8 : 0, alignSelf: 'flex-start' }}>
                      <Icon name="file" size={22} /><T style={{ marginLeft: 6, fontSize: 15, color: C.sub }} numberOfLines={1}>{m.fileName}</T>
                    </View>
                  ) : null}
                  {m.text ? <T selectable style={{ lineHeight: 26, fontSize: 18 }}>{m.text}</T> : null}
                </View>
              </View>
            );
          }
          return (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
              <View style={{ width: 34, marginRight: 10, marginTop: 1 }}><Icon name="owl" size={32} /></View>
              <View style={{ flex: 1 }}>
                {m.err ? (
                  <View style={{ backgroundColor: C.redL, borderRadius: 14, padding: 12 }}>
                    <T selectable style={{ lineHeight: 25, fontSize: 17, color: C.redT }}>{m.text}</T>
                  </View>
                ) : m.typed ? <Typed text={m.text} onDone={() => finishTyping(k)} /> : <Rich text={m.text} size={18} />}
              </View>
            </View>
          );
        })()}</Reveal>)}
        {busy ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 34, marginRight: 10 }}><Icon name="owl" size={32} /></View>
            <Dots />
            {stage === 'baca' ? <T style={{ marginLeft: 10, color: C.sub, fontSize: 16 }}>{MASCOT} sedang membaca fotomu...</T> : null}
          </View>
        ) : null}
        {msgs.length <= 1 && !busy ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {RMT_STARTERS.map((q, qi) => (
              <Reveal key={q.label} i={qi + 1} step={70} dy={12}>
                <Pressable onPress={() => send(q.text)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, marginRight: 8, marginBottom: 8, backgroundColor: pressed ? C.blueL : '#fff', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                  <Icon name="sparkle" size={20} />
                  <T style={{ color: C.blueD, fontSize: 16, marginLeft: 7 }}>{q.label}</T>
                </Pressable>
              </Reveal>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {note ? (
        <View style={{ marginHorizontal: 12, marginTop: 8, backgroundColor: C.goldL, borderRadius: 12, padding: 10 }}>
          <T style={{ fontSize: 15, color: '#7A5B00' }}>{note}</T>
        </View>
      ) : null}

      {hasAttach ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10, alignItems: 'center' }}>
          {images.map((im, i) => (
            <View key={i} style={{ marginRight: 10 }}>
              <Image source={{ uri: im.uri }} style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: C.soft }} />
              <Pressable onPress={() => setImages((p) => p.filter((_, j) => j !== i))} hitSlop={8} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={12} />
              </Pressable>
            </View>
          ))}
          {file ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: C.line, borderRadius: 12, paddingHorizontal: 10, minHeight: 44, marginRight: 10 }}>
              <Icon name="file" size={24} />
              <T style={{ marginLeft: 8, fontSize: 15, maxWidth: 160 }} numberOfLines={1}>{file.name}</T>
              <Pressable onPress={() => setFile(null)} hitSlop={8} style={{ marginLeft: 8 }}><Icon name="close" size={14} /></Pressable>
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {menu ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 10 }}>
          <MenuItem icon="camera" label="Kamera" onPress={camera} />
          <MenuItem icon="image" label="Galeri" onPress={gallery} />
          <MenuItem icon="file" label="File" onPress={pickFile} />
        </View>
      ) : null}

      <View style={{ padding: 12, borderTopWidth: 2, borderTopColor: C.line, flexDirection: 'row', alignItems: 'flex-end' }}>
        <Pressable onPress={() => { sfx('tap'); setMenu((v) => !v); }} disabled={busy} hitSlop={6} style={{ width: 48, height: 48, borderRadius: 14, borderWidth: 2, borderColor: menu ? C.blue : C.line, backgroundColor: menu ? C.blueL : '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, opacity: busy ? 0.5 : 1 }}>
          {loadingPick ? <ActivityIndicator color={C.blue} /> : <Icon name="camera" size={28} />}
        </Pressable>
        <Input value={input} onChangeText={setInput} placeholder={hasAttach ? 'Tambah pesan (boleh kosong)...' : 'Tulis soal atau jawabanmu...'} placeholderTextColor="#94A3B8" multiline editable={!busy} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 2, borderBottomWidth: 4, borderColor: focus ? C.blue : C.line, backgroundColor: focus ? '#F4FBFF' : '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, fontFamily: fonts.r, fontSize: 18, color: C.ink, marginRight: 10 }} />
        <Tap disabled={!canSend} scaleTo={0.88} sound={null} onPress={() => send()} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: canSend ? C.blue : '#E5E7EB', borderBottomWidth: canSend ? 4 : 0, borderBottomColor: C.blueD, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 22, height: 22 }}>
            <View style={{ position: 'absolute', left: 9.25, top: 3, width: 3.5, height: 18, borderRadius: 2, backgroundColor: canSend ? '#fff' : '#9AA3B2' }} />
            <View style={{ position: 'absolute', left: 5.5, top: 3.5, width: 11, height: 11, borderLeftWidth: 3.5, borderTopWidth: 3.5, borderColor: canSend ? '#fff' : '#9AA3B2', borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
          </View>
        </Tap>
      </View>
    </KeyboardAvoidingView>
  );
}
