import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, ScrollView, TextInput, View } from 'react-native';
import Owl from './Owl';
import Icon from './Icon';
import { Bar, Btn, Input, Reveal, Seg, T, Tap } from './ui';
import { FadeSlide } from './Transition';
import { C, fonts } from './theme';
import { ALL } from './lessons';
import { TOPICS, VIDEOS } from './materiData';
import { BADGES, MIN_SAMPLE, levelOf, mastery, streakNow, weakest, weekDays } from './state';
import { sfx } from './sound';

const SEGS = [{ k: 'ringkas', l: 'Ringkasan', i: 'chart' }, { k: 'mampu', l: 'Kemampuan', i: 'target' }, { k: 'lencana', l: 'Lencana', i: 'medal' }];
const LV = { baru: { l: 'Belum cukup data', c: C.sub }, lemah: { l: 'Perlu latihan', c: C.redT }, cukup: { l: 'Cukup baik', c: C.orangeD }, kuat: { l: 'Kuat', c: C.greenT } };
const LV_COLOR = { kuat: C.green, cukup: C.orange, lemah: C.red, baru: C.line };

// Angka yang menghitung naik dari 0 saat layar muncul
const CountUp = memo(function CountUp({ v, suf = '', of, style }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const a = new Animated.Value(0);
    const id = a.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(a, { toValue: v, duration: 650, useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [v]);
  return <T style={style}>{n}{suf}{of != null ? `/${of}` : ''}</T>;
});

const Card = ({ children, style }) => (
  <View style={[{ borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 18, padding: 14, marginBottom: 14, backgroundColor: '#fff' }, style]}>{children}</View>
);

// ---------- kartu profil di atas ----------
function Hero({ state, lv, onRename }) {
  const [mood, setMood] = useState('happy');
  const [k, setK] = useState(0);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(state.name);
  const w = useMemo(() => weakest(state), [state]);
  const st = streakNow(state);
  const lines = useMemo(() => {
    const L = [];
    if (st > 0) L.push(`Runtutanmu ${st} hari. Pertahankan ya!`);
    if (w && w.pct < 0.85) L.push(`Bagian "${w.t}" masih bisa diperkuat. Yuk latihan sebentar!`);
    L.push('Salah itu bagian dari belajar. Yang penting mau mencoba lagi!', 'Coba jelaskan satu rumus dengan kata-katamu sendiri padaku.', 'Sedikit tiap hari lebih awet daripada sekali banyak.');
    return L;
  }, [st, w]);
  const poke = () => { sfx('pop'); setMood('cheer'); setK((x) => x + 1); setTimeout(() => setMood('happy'), 900); };
  const save = () => { const n = draft.trim(); if (n) { sfx('claim'); onRename(n); } setEdit(false); };

  return (
    <View style={{ backgroundColor: C.blue, borderBottomWidth: 6, borderBottomColor: C.blueD, borderRadius: 24, padding: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={poke} hitSlop={8} style={{ backgroundColor: '#fff', borderRadius: 24, padding: 6, marginRight: 14 }}>
          <Owl size={92} mood={mood} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {edit ? (
            <View>
              <Input value={draft} onChangeText={setDraft} maxLength={24} autoFocus onSubmitEditing={save} placeholder="Namamu" placeholderTextColor="#94A3B8"
                style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontFamily: fonts.r, fontSize: 20, color: C.ink }} />
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Btn small color="green" label="SIMPAN" onPress={save} style={{ flex: 1, marginRight: 8 }} />
                <Btn small color="white" label="BATAL" onPress={() => { setEdit(false); setDraft(state.name); }} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <Pressable onPress={() => { sfx('tap'); setDraft(state.name); setEdit(true); }} hitSlop={6}>
              <T numberOfLines={1} style={{ color: '#fff', fontWeight: '700', fontSize: 27 }}>{state.name}</T>
              <T style={{ color: '#fff', fontSize: 14, opacity: 0.9, letterSpacing: 0.5 }}>Ketuk nama untuk mengubah</T>
            </Pressable>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: C.gold, borderBottomWidth: 3, borderBottomColor: C.goldD, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 }}>
            <Icon name="medal" size={20} />
            <T style={{ fontWeight: '700', fontSize: 15, color: '#5B4300', marginLeft: 5 }}>Level {lv.n} · {lv.t}</T>
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 12, marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <T style={{ fontWeight: '700', color: C.navy, fontSize: 16 }}>{state.xp} XP</T>
          <T style={{ color: C.sub, fontSize: 14 }}>{lv.next ? `${lv.left} XP lagi menuju ${lv.next.t}` : 'Level tertinggi tercapai'}</T>
        </View>
        <Bar value={lv.pct} color={C.blue} height={14} />
      </View>

      <Pressable onPress={poke} style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }}>
        <T key={k} style={{ color: '#fff', fontSize: 16, lineHeight: 22 }}>{lines[k % lines.length]}</T>
      </Pressable>
    </View>
  );
}

// ---------- grafik minggu ini (Senin - Minggu) ----------
const BarCol = memo(function BarCol({ d, h, on, onPress }) {
  const g = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(g, { toValue: h, useNativeDriver: false, bounciness: 8 }).start(); }, [h]);
  return (
    <Tap onPress={onPress} scaleTo={0.9} sound="tab" style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 120, opacity: d.future ? 0.4 : 1 }}>
      <T style={{ fontSize: 13, fontWeight: '700', color: on ? C.blueD : 'transparent', marginBottom: 3 }}>{d.xp}</T>
      <Animated.View style={{ width: '62%', height: g, borderRadius: 8, backgroundColor: d.xp === 0 ? C.line : on ? C.blue : '#8ADBFF', borderBottomWidth: d.xp === 0 ? 0 : 3, borderBottomColor: on ? C.blueD : '#5CC6F5' }} />
      <T style={{ fontSize: 13, marginTop: 5, color: d.today ? C.blueD : C.sub, fontWeight: d.today || on ? '700' : '400' }}>{d.short}</T>
    </Tap>
  );
});

function Week({ state }) {
  const base = useMemo(() => weekDays(), []);
  const [sel, setSel] = useState(base.findIndex((d) => d.today));
  const days = useMemo(() => base.map((d) => ({ ...d, xp: (state.days && state.days[d.key]) || 0 })), [base, state.days]);
  const max = Math.max(30, ...days.map((d) => d.xp));
  const total = days.reduce((a, d) => a + d.xp, 0);
  const active = days.filter((d) => d.xp > 0).length;
  const sd = days[sel];
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <T style={{ fontWeight: '700', fontSize: 20, flex: 1 }}>Aktivitas minggu ini</T>
        <View style={{ backgroundColor: C.goldL, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 }}><T style={{ color: C.goldD, fontWeight: '700', fontSize: 14 }}>{total} XP</T></View>
      </View>
      <T style={{ color: C.sub, fontSize: 14, marginBottom: 10 }}>{active > 0 ? `Kamu belajar ${active} hari minggu ini (Senin sampai Minggu). Ketuk batang untuk detail.` : 'Belum ada aktivitas minggu ini. Satu pelajaran kecil sudah cukup untuk memulai.'}</T>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
        {days.map((d, i) => <BarCol key={d.key} d={d} h={Math.max(6, Math.round((d.xp / max) * 84))} on={sel === i} onPress={() => setSel(i)} />)}
      </View>
      <View style={{ marginTop: 10, backgroundColor: C.soft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 }}>
        <T style={{ fontWeight: '700', fontSize: 15, color: C.navy }}>{sd.full}, {sd.date}{sd.today ? ' (hari ini)' : ''}</T>
        <T style={{ fontSize: 14, color: C.sub }}>{sd.future ? 'Belum tiba.' : sd.xp > 0 ? `${sd.xp} XP didapat hari itu.` : 'Belum ada aktivitas.'}</T>
      </View>
    </Card>
  );
}

// ---------- kartu statistik ----------
const Stat = memo(function Stat({ icon, v, suf, of, label, bg, fg, i = 0 }) {
  const [t, setT] = useState(0);
  return (
    <Reveal i={i} step={50} style={{ width: '50%' }}>
      <Tap onPress={() => setT((x) => x + 1)} scaleTo={0.93} style={{ padding: 5 }}>
        <View style={{ backgroundColor: bg, borderRadius: 20, borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.08)', padding: 12, minHeight: 112, justifyContent: 'space-between' }}>
          <View pointerEvents="none" style={{ position: 'absolute', right: -16, top: -18, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          <Icon name={icon} size={36} pop={t} />
          <View>
            <CountUp v={v} suf={suf} of={of} style={{ fontWeight: '700', fontSize: 26, color: fg }} />
            <T style={{ color: fg, fontSize: 14, opacity: 0.85 }}>{label}</T>
          </View>
        </View>
      </Tap>
    </Reveal>
  );
});

function Ringkasan({ state, setSeg }) {
  const stars = Object.values(state.done).reduce((a, b) => a + b, 0);
  const acc = state.stats.total ? Math.round((state.stats.ok / state.stats.total) * 100) : 0;
  const nRead = TOPICS.filter((t) => state.read && state.read[t.id]).length;
  const nWatch = Object.keys(state.watched || {}).length;
  const next = BADGES.find((b) => !state.badges[b.id]);
  const earned = BADGES.length - BADGES.filter((b) => !state.badges[b.id]).length;
  return (
    <View>
      <Week state={state} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -5, marginBottom: 9 }}>
        <Stat i={0} icon="flame" v={streakNow(state)} label="Hari beruntun" bg="#FFF1DB" fg={C.orangeD} />
        <Stat i={1} icon="target" v={acc} suf="%" label="Ketepatan jawaban" bg={C.greenL} fg={C.greenT} />
        <Stat i={2} icon="books" v={Object.keys(state.done).length} of={ALL.length} label="Pelajaran selesai" bg={C.blueL} fg={C.blueD} />
        <Stat i={3} icon="sparkle" v={stars} label="Bintang" bg={C.goldL} fg={C.goldD} />
        <Stat i={4} icon="book" v={nRead} of={TOPICS.length} label="Topik dibaca" bg="#F6EBFF" fg={C.purpleD} />
        <Stat i={5} icon="play" v={nWatch} of={VIDEOS.length} label="Video ditonton" bg={C.redL} fg={C.redT} />
        <Stat i={6} icon="bandage" v={state.fixed || 0} label="Kesalahan diperbaiki" bg={C.soft} fg={C.navy} />
        <Stat i={7} icon="calc" v={state.stats.ok} label="Jawaban benar" bg={C.greenL} fg={C.greenT} />
      </View>
      <Pressable onPress={() => { sfx('start'); setSeg('lencana'); }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', borderColor: C.gold, backgroundColor: C.goldL }}>
          {next ? <Icon name={next.icon} size={52} dim /> : <Icon name="trophy" size={52} live />}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ color: C.goldD, fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>{next ? 'LENCANA BERIKUTNYA' : 'SEMUA LENCANA DIRAIH'}</T>
            <T style={{ fontWeight: '700', fontSize: 19 }}>{next ? next.t : 'Luar biasa!'}</T>
            <T style={{ color: C.sub, fontSize: 15 }}>{next ? next.d : `${earned} dari ${BADGES.length} lencana terkumpul.`}</T>
          </View>
          <T style={{ fontSize: 26, color: C.sub }}>›</T>
        </Card>
      </Pressable>
    </View>
  );
}

// ---------- peta kemampuan ----------
const Skill = memo(function Skill({ m, open, onToggle, onMateri, onPractice }) {
  const st = LV[m.level];
  return (
    <Pressable onPress={onToggle}>
      <Card style={{ borderColor: open ? m.color : C.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 4, borderWidth: 2, borderColor: C.line, marginRight: 10 }}><Icon name={m.icon} size={32} /></View>
          <View style={{ flex: 1 }}>
            <T style={{ fontWeight: '700', fontSize: 18 }}>{m.t}</T>
            <T style={{ fontWeight: '700', fontSize: 14, color: st.c }}>{st.l}</T>
          </View>
          <T style={{ fontSize: 22, color: C.sub }}>{open ? '–' : '+'}</T>
        </View>
        <Bar value={m.pct == null ? 0 : m.pct} color={LV_COLOR[m.level]} height={12} />
        {open ? (
          <View style={{ marginTop: 10 }}>
            <T style={{ color: C.sub, fontSize: 15, lineHeight: 22 }}>
              {m.total ? `${m.ok} benar dari ${m.total} jawaban${m.pct != null ? ` (${Math.round(m.pct * 100)}%).` : `. Kemampuan dinilai setelah ${MIN_SAMPLE} jawaban.`}` : `Belum ada jawaban. Kemampuan dinilai setelah ${MIN_SAMPLE} jawaban.`}
            </T>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Btn small color="white" label="BACA MATERI" onPress={() => onMateri(m.topic)} style={{ flex: 1, marginRight: 10 }} />
              <Btn small label="LATIHAN" onPress={onPractice} style={{ flex: 1 }} />
            </View>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
});

function Kemampuan({ state, onMateri, onPractice }) {
  const map = useMemo(() => mastery(state), [state]);
  const w = useMemo(() => weakest(state), [state]);
  const [open, setOpen] = useState(w ? w.id : null);
  return (
    <View>
      <T style={{ color: C.sub, fontSize: 15, lineHeight: 22, marginBottom: 12 }}>Dihitung dari jawabanmu yang sebenarnya (minimal {MIN_SAMPLE} jawaban per bagian). Inilah ukuran paham, bukan XP. Ketuk kartu untuk detail.</T>
      {w && w.pct < 0.85 ? (
        <Card style={{ backgroundColor: C.goldL, borderColor: C.gold, flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="bulb" size={34} live />
          <T style={{ flex: 1, marginLeft: 10, fontSize: 16, lineHeight: 23 }}>Fokus berikutnya: <T style={{ fontWeight: '700', fontSize: 16 }}>{w.t}</T>. Berlatih di bagian ini paling cepat menaikkan pemahamanmu.</T>
        </Card>
      ) : null}
      {map.map((m) => <Skill key={m.id} m={m} open={open === m.id} onToggle={() => { sfx('flip'); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(open === m.id ? null : m.id); }} onMateri={onMateri} onPractice={onPractice} />)}
    </View>
  );
}

// ---------- lencana ----------
const fmtDate = (k) => { const [y, m, d] = String(k).split('-'); const B = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']; return `${+d} ${B[+m - 1]} ${y}`; };

function Lencana({ state }) {
  const [sel, setSel] = useState(() => (BADGES.find((b) => state.badges[b.id]) || BADGES[0]).id);
  const b = BADGES.find((x) => x.id === sel);
  const got = !!state.badges[b.id];
  const n = BADGES.filter((x) => state.badges[x.id]).length;
  return (
    <View>
      <Card style={{ alignItems: 'center', backgroundColor: got ? C.goldL : C.soft, borderColor: got ? C.gold : C.line }}>
        <Icon key={b.id} name={b.icon} size={84} live={got} dim={!got} pop={b.id} />
        <T style={{ fontWeight: '700', fontSize: 23, marginTop: 8, textAlign: 'center' }}>{b.t}</T>
        <T style={{ color: C.sub, fontSize: 16, textAlign: 'center', marginTop: 2 }}>{b.d}</T>
        <T style={{ fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 8, color: got ? C.goldD : C.sub }}>{got ? b.m : 'Belum diraih. Terus belajar, kamu pasti bisa!'}</T>
        {got ? <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3, marginTop: 10 }}><T style={{ color: C.greenT, fontWeight: '700', fontSize: 14 }}>Diraih {fmtDate(state.badges[b.id])}</T></View> : null}
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <T style={{ fontWeight: '700', fontSize: 20, flex: 1 }}>Koleksi lencana</T>
        <T style={{ color: C.sub, fontWeight: '700' }}>{n}/{BADGES.length}</T>
      </View>
      <Bar value={n / BADGES.length} color={C.gold} height={12} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4, marginTop: 10 }}>
        {BADGES.map((x, xi) => {
          const g = !!state.badges[x.id]; const on = sel === x.id;
          return (
            <Reveal key={x.id} i={Math.floor(xi / 3)} step={45} dy={12} style={{ width: '33.333%' }}>
            <Pressable onPress={() => { sfx(g ? 'badge' : 'tab'); setSel(x.id); }} style={{ padding: 4 }}>
              <View style={{ alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 16, borderWidth: 2, borderBottomWidth: 4, borderColor: on ? C.blue : g ? C.gold : C.line, backgroundColor: on ? C.blueL : g ? C.goldL : '#fff' }}>
                <Icon name={x.icon} size={46} dim={!g} />
                <T numberOfLines={2} style={{ fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4, color: g ? C.ink : C.sub, lineHeight: 16 }}>{x.t}</T>
              </View>
            </Pressable>
            </Reveal>
          );
        })}
      </View>
    </View>
  );
}

export default function Profil({ state, onMateri, onPractice, onRename }) {
  const [seg, setSeg] = useState('ringkas');
  const lv = useMemo(() => levelOf(state.xp), [state.xp]);
  const pick = useCallback((k) => { setSeg(k); }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Hero state={state} lv={lv} onRename={onRename} />

      <Seg items={SEGS} value={seg} onChange={pick} style={{ marginBottom: 16 }} />

      <FadeSlide key={seg} dy={10} ms={200} style={{ flex: 0 }}>
        {seg === 'ringkas' && <Ringkasan state={state} setSeg={setSeg} />}
        {seg === 'mampu' && <Kemampuan state={state} onMateri={onMateri} onPractice={onPractice} />}
        {seg === 'lencana' && <Lencana state={state} />}
      </FadeSlide>

    </ScrollView>
  );
}
