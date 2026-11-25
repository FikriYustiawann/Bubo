import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Platform, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { flushSaves, initStorage, load, saveLater } from './src/utils/storage';
import { C, useSystemFont } from './src/duo/theme';
import { T, Tap } from './src/duo/ui';
import { MASCOT } from './src/duo/brand';
import { QUESTS, dayKey, applyAnswer, applyFinish, claimQuest, heartsNow, markReflect, markRead, markWatched, normalize } from './src/duo/state';
import Icon from './src/duo/Icon';
import Materi from './src/duo/Materi';
import { preloadSfx, sfx } from './src/duo/sound';
import { FadeSlide, LoadingOverlay, Splash } from './src/duo/Transition';
import Path from './src/duo/Path';
import Practice from './src/duo/Practice';
import Quests from './src/duo/Quests';
import Lesson from './src/duo/Lesson';
import Tutor, { helloMsg } from './src/duo/Tutor';
import { Onboard } from './src/duo/Screens';
import Profil from './src/duo/Profil';

const KEY = 'mp3r:bandingbijak:v2';
const CHAT_KEY = 'mp3r:bubo:chat:v1';          // format lama: satu percakapan (dimigrasi)
const CHATS_KEY = 'mp3r:bubo:chats:v2';        // riwayat: banyak percakapan
const ACTIVE_KEY = 'mp3r:bubo:chat:active';
const TAB_KEY = 'mp3r:bubo:tab:v1';
const MAX_CHAT = 80;      // pesan per percakapan
const MAX_CHATS = 30;     // jumlah percakapan tersimpan

const newId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const makeChat = (name) => ({ id: newId(), title: '', updated: Date.now(), msgs: [helloMsg(name)] });
const hasUser = (c) => c.msgs.some((m) => m.role === 'user');
const titleOf = (msgs) => {
  const u = msgs.find((m) => m.role === 'user');
  if (!u) return '';
  const t = String(u.text || '').replace(/\s+/g, ' ').trim() || (u.fileName ? `Berkas ${u.fileName}` : 'Foto soal');
  return t.length > 42 ? `${t.slice(0, 42)}...` : t;
};
// Bersihkan sebelum disimpan: tanpa animasi mengetik, tanpa pesan gagal, tanpa foto (terlalu besar untuk penyimpanan)
const cleanChats = (chats) => chats.filter((c) => hasUser(c)).sort((a, b) => b.updated - a.updated).slice(0, MAX_CHATS)
  .map((c) => ({ ...c, msgs: c.msgs.filter((m) => !m.err).slice(-MAX_CHAT).map((m) => ({ ...m, typed: false, images: undefined })) }));

const TABS = [
  { key: 'belajar', icon: 'home', label: 'Belajar' },
  { key: 'materi', icon: 'books', label: 'Materi' },
  { key: 'latihan', icon: 'target', label: 'Latihan' },
  { key: 'misi', icon: 'trophy', label: 'Misi' },
  { key: 'tutor', icon: 'owl', label: MASCOT },
  { key: 'profil', icon: 'user', label: 'Profil' },
];

const TabBar = memo(function TabBar({ tab, onTab, badges }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, TABS.findIndex((t) => t.key === tab));
  const x = useRef(new Animated.Value(idx)).current;
  useEffect(() => { Animated.spring(x, { toValue: idx, useNativeDriver: true, friction: 8, tension: 120 }).start(); }, [idx]);
  const cw = w / TABS.length;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: C.line, backgroundColor: '#fff' }}>
      {cw ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -2, left: 0, width: cw, alignItems: 'center', transform: [{ translateX: x.interpolate({ inputRange: [0, TABS.length - 1], outputRange: [0, cw * (TABS.length - 1)] }) }] }}>
          <View style={{ width: cw * 0.52, height: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: C.blue }} />
        </Animated.View>
      ) : null}
      {TABS.map((t) => {
        const on = tab === t.key;
        const n = (badges && badges[t.key]) || 0;
        return (
          <Tap key={t.key} scaleTo={0.88} sound={null} onPress={() => onTab(t.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 7 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ paddingHorizontal: 14, paddingVertical: 3, borderRadius: 14, backgroundColor: on ? C.blueL : 'transparent' }}>
                <Icon name={t.icon} size={28} live={on} pop={on} dim={false} />
              </View>
              {n > 0 ? (
                <View style={{ position: 'absolute', top: -2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.red, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <T style={{ color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 12 }}>{n}</T>
                </View>
              ) : null}
            </View>
            <T numberOfLines={1} style={{ fontSize: 12, fontWeight: '700', color: on ? C.blueD : C.sub, marginTop: 1 }}>{t.label}</T>
          </Tap>
        );
      })}
    </View>
  );
});

const MIN_SPLASH = 1200;   // ms: supaya animasi pembuka terlihat utuh, tidak berkedip
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [ready, setReady] = useState(false);
  const [splash, setSplash] = useState(true);
  const [loading, setLoading] = useState(null);   // teks penutup saat membuka pelajaran
  const [state, setState] = useState(normalize({}));
  const ref = useRef(state);
  const [tab, setTab] = useState('belajar');
  const [chats, setChats] = useState([]);       // riwayat percakapan Bubo (disimpan di perangkat)
  const [activeId, setActiveId] = useState(null);
  const chatReady = useRef(false);
  const [run, setRun] = useState(null);       // { lesson, id }
  const [recap, setRecap] = useState(null);
  const [seed, setSeed] = useState('');
  const [topic, setTopic] = useState(null);   // topik Materi yang sedang dibuka
  const tabRef = useRef(tab); tabRef.current = tab;
  const busy = useRef(false);

  useEffect(() => {
    (async () => {
      const t0 = Date.now();
      try {
        await Font.loadAsync({
          Nunito: require('./assets/fonts/Nunito_500Medium.ttf'), 'Nunito-ExtraBold': require('./assets/fonts/Nunito_800ExtraBold.ttf'),
          TNR: require('./assets/fonts/LiberationSerif-Regular.ttf'), 'TNR-Bold': require('./assets/fonts/LiberationSerif-Bold.ttf'),
        });
      } catch (e) { useSystemFont(); }
      try { await initStorage(); } catch (e) { /* lanjut tanpa data lama */ }
      const s = normalize(load(KEY, {}));
      ref.current = s; setState(s);
      let list = load(CHATS_KEY, null);
      if (!Array.isArray(list)) {
        // pindahkan percakapan format lama (bila ada) menjadi satu entri riwayat
        const old = load(CHAT_KEY, []);
        list = Array.isArray(old) && old.some((m) => m.role === 'user') ? [{ id: newId(), title: titleOf(old), updated: Date.now(), msgs: old }] : [];
      }
      const fresh = makeChat(s.name);
      const wanted = load(ACTIVE_KEY, null);
      const keep = list.find((c) => c.id === wanted);
      setChats(keep ? list : [fresh, ...list]);
      setActiveId(keep ? keep.id : fresh.id);
      chatReady.current = true;
      const savedTab = load(TAB_KEY, 'belajar');
      if (TABS.some((t) => t.key === savedTab)) setTab(savedTab);
      const left = MIN_SPLASH - (Date.now() - t0);
      if (left > 0) await sleep(left);
      setReady(true); preloadSfx();
    })();
    // Pindah hari saat aplikasi terbuka: segarkan target harian, misi, dan hati
    const rollDay = () => { if (ref.current.daily.date !== dayKey()) { const n = normalize(ref.current); ref.current = n; setState(n); saveLater(KEY, n); } };
    const sub = AppState.addEventListener('change', (st) => { if (st !== 'active') flushSaves(); else rollDay(); });
    const tick = setInterval(rollDay, 60000);
    // Web: pastikan data tertulis walau tab/jendela langsung ditutup
    const onHide = () => flushSaves();
    if (Platform.OS === 'web' && typeof window !== 'undefined') { window.addEventListener('pagehide', onHide); window.addEventListener('beforeunload', onHide); }
    return () => {
      flushSaves(); clearInterval(tick); if (sub && sub.remove) sub.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') { window.removeEventListener('pagehide', onHide); window.removeEventListener('beforeunload', onHide); }
    };
  }, []);

  // Simpan chat (tanpa animasi mengetik dan tanpa pesan yang gagal) dan tab terakhir
  useEffect(() => {
    if (!chatReady.current) return;
    saveLater(CHATS_KEY, cleanChats(chats));
  }, [chats]);
  useEffect(() => { if (chatReady.current && activeId) saveLater(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => { if (chatReady.current) saveLater(TAB_KEY, tab); }, [tab]);

  const commit = useCallback((s) => { ref.current = s; setState(s); saveLater(KEY, s); }, []);

  const start = useCallback((lesson) => {
    if (lesson.mode !== 'practice' && heartsNow(ref.current.hearts).n <= 0) { setTab('latihan'); return; }
    if (busy.current) return;
    busy.current = true;
    setRecap(null);
    setLoading(lesson.mode === 'practice' ? 'Menyiapkan latihan' : 'Menyiapkan soal');
    setTimeout(() => { setRun({ lesson: { mode: 'lesson', ...lesson }, id: Date.now() }); setLoading(null); busy.current = false; }, 520);
  }, []);

  const onAnswer = (ex, ok) => commit(applyAnswer(ref.current, ex, ok, run.lesson.mode));
  const onComplete = (res) => { const r = applyFinish(ref.current, res); commit(r.state); setRecap({ newBadges: r.newBadges }); };
  const onExit = (to) => {
    const title = run && run.lesson.title;
    setRun(null); setRecap(null);
    if (to === 'tutor') { newChat(); setSeed(`Aku baru selesai "${title}". Ajak aku refleksi: apa yang sudah kupahami dan bagian mana yang masih membingungkan?`); setTab('tutor'); }
    else if (to === 'latihan') setTab('latihan');
  };

  // Perbarui satu percakapan lewat id-nya, jadi balasan AI yang telat datang tetap masuk ke percakapan asalnya
  const updateChat = useCallback((id, fn) => setChats((prev) => prev.map((c) => {
    if (c.id !== id) return c;
    const msgs = fn(c.msgs);
    return { ...c, msgs, title: c.title || titleOf(msgs), updated: msgs.length !== c.msgs.length ? Date.now() : c.updated };
  })), []);
  const newChat = useCallback(() => {
    const cur = chats.find((c) => c.id === activeId);
    if (cur && !hasUser(cur)) return;                  // percakapan aktif masih kosong, tidak perlu membuat lagi
    const c = makeChat(ref.current.name);
    setChats((prev) => [c, ...prev]); setActiveId(c.id);
  }, [chats, activeId]);
  const pickChat = useCallback((id) => { setActiveId(id); }, []);
  const deleteChat = useCallback((id) => {
    const rest = chats.filter((c) => c.id !== id);
    if (id === activeId) {
      const next = rest.filter(hasUser).sort((a, b) => b.updated - a.updated)[0] || rest.find((c) => !hasUser(c));
      if (next) { setChats(rest); setActiveId(next.id); }
      else { const c = makeChat(ref.current.name); setChats([c]); setActiveId(c.id); }
    } else setChats(rest);
  }, [chats, activeId]);

  const openMateri = useCallback((id) => { setTopic(id); setTab('materi'); }, []);
  const askBubo = useCallback((text) => { newChat(); setSeed(text); setTab('tutor'); }, [newChat]);
  const goPractice = useCallback(() => setTab('latihan'), []);
  const onTab = useCallback((k) => { if (tabRef.current !== k) { sfx('tab'); setTab(k); } }, []);

  let body;
  if (!ready) body = <View style={{ flex: 1 }} />;
  else if (!state.name) body = <FadeSlide key="onboard"><Onboard onDone={(name) => { commit({ ...state, name }); setChats((prev) => prev.map((c) => (hasUser(c) ? c : { ...c, msgs: [helloMsg(name)] }))); }} /></FadeSlide>;
  else if (run) body = <FadeSlide key={`run${run.id}`}><Lesson key={run.id} lesson={run.lesson} mode={run.lesson.mode} hearts={heartsNow(state.hearts).n} onAnswer={onAnswer} onComplete={onComplete} recap={recap} onExit={onExit} /></FadeSlide>;
  else body = (
    <View style={{ flex: 1 }}>
      <FadeSlide key={tab === 'materi' ? `materi:${topic || ''}` : tab} dy={12} ms={210}>
        {tab === 'belajar' && <Path state={state} onStart={start} onGoPractice={goPractice} onMateri={openMateri} />}
        {tab === 'materi' && <Materi state={state} topicId={topic} onTopic={setTopic} onRead={(id) => { sfx('claim'); commit(markRead(ref.current, id)); }} onWatch={(id) => commit(markWatched(ref.current, id))} onPractice={goPractice} onAsk={askBubo} />}
        {tab === 'latihan' && <Practice state={state} onStart={start} />}
        {tab === 'misi' && <Quests state={state} onClaim={(id) => commit(claimQuest(ref.current, id))} onGo={setTab} />}
        {tab === 'tutor' && <Tutor user={state.name} seed={seed} onSeedUsed={() => setSeed('')} onAsked={() => commit(markReflect(ref.current))} chats={chats} activeId={activeId} updateChat={updateChat} onPick={pickChat} onNew={newChat} onDelete={deleteChat} />}
        {tab === 'profil' && <Profil state={state} onMateri={openMateri} onPractice={goPractice} onRename={(name) => commit({ ...ref.current, name })} />}
      </FadeSlide>
      <TabBar tab={tab} onTab={onTab} badges={{ misi: QUESTS.filter((q) => q.get(state.daily) >= q.goal && !state.claimed[q.id]).length }} />
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#EEF3FA' }}>
        <SafeAreaView style={{ flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: C.bg }}>
          {body}
          {loading ? <LoadingOverlay text={loading} /> : null}
          {splash ? <Splash leaving={ready} onGone={() => setSplash(false)} /> : null}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}
