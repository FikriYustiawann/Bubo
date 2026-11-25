import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, LayoutAnimation, Linking, Platform, Pressable, ScrollView, Share, View } from 'react-native';
import Icon from './Icon';
import { Bar, Btn, Card, Input, PopIn, Pill, Reveal, Seg, T, Tap } from './ui';
import { C, fonts } from './theme';
import { GameJenis, LabBerbalik, LabSenilai } from './Labs';
import { ISTILAH, RUMUS, TOPICS, VIDEOS, ytThumb, ytUrl } from './materiData';
import { XP_READ, XP_VIDEO, nextUnreadTopic } from './state';
import { RMT_PHASES } from '../rmt';
import { MASCOT } from './brand';
import { sfx } from './sound';
import { M, Rich, plain } from './Math';
import Panah from './Panah';

const SEG = [{ k: 'topik', l: 'Topik', i: 'books' }, { k: 'video', l: 'Video', i: 'play' }, { k: 'rumus', l: 'Rumus', i: 'note' }, { k: 'istilah', l: 'Istilah', i: 'glossary' }];

async function shareText(text) {
  try {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) { await navigator.share({ text }); return 'Dibagikan'; }
      if (typeof navigator !== 'undefined' && navigator.clipboard) { await navigator.clipboard.writeText(text); return 'Tersalin ke papan klip'; }
      return 'Perangkat ini belum mendukung berbagi';
    }
    await Share.share({ message: text });
    return 'Dibagikan';
  } catch (e) { return ''; }
}

const sheetText = () => `LEMBAR RUMUS PERBANDINGAN\n\n${RUMUS.map((r) => `${r.t}\n${r.f.map(plain).join('\n')}\nContoh: ${r.ex}`).join('\n\n')}`;

// ---------- video YouTube ----------
function VideoCard({ v, watched, onWatch }) {
  const [bad, setBad] = useState(false);
  const [err, setErr] = useState(false);
  const open = async () => { sfx('start'); try { await Linking.openURL(ytUrl(v.id)); setErr(false); onWatch && onWatch(v.id); } catch (e) { setErr(true); } };
  return (
    <Pressable onPress={open} style={({ pressed }) => ({ borderWidth: 2, borderBottomWidth: 5, borderColor: C.line, borderRadius: 18, overflow: 'hidden', marginBottom: 14, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={{ height: 170, backgroundColor: '#1F2A44', alignItems: 'center', justifyContent: 'center' }}>
        {!bad ? <Image source={{ uri: ytThumb(v.id) }} onError={() => setBad(true)} resizeMode="cover" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} /> : null}
        <Icon name="play" size={60} live />
      </View>
      <View style={{ padding: 12 }}>
        <T style={{ fontWeight: '700', fontSize: 17, lineHeight: 23 }}>{v.t}</T>
        <T style={{ color: C.sub, fontSize: 15, marginTop: 2 }}>{v.d}</T>
        <T style={{ color: C.blueD, fontWeight: '700', fontSize: 14, marginTop: 6, letterSpacing: 1 }}>TONTON DI YOUTUBE</T>
        <T style={{ color: watched ? C.greenT : C.sub, fontWeight: '700', fontSize: 13, marginTop: 4 }}>{watched ? 'Sudah ditonton' : `Pertama kali ditonton: +${XP_VIDEO} XP`}</T>
        {err ? <T style={{ color: C.redT, fontSize: 14, marginTop: 4 }}>Tidak bisa membuka YouTube di perangkat ini.</T> : null}
      </View>
    </Pressable>
  );
}

// ---------- bagian-bagian isi topik ----------
const Example = memo(function Example({ s, color, edge }) {
  const [n, setN] = useState(0);
  const last = n >= s.steps.length;
  return (
    <View style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 18, padding: 14, marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon name="bulb" size={26} />
        <T style={{ fontWeight: '700', fontSize: 17, marginLeft: 8, flex: 1, color: edge }}>{s.title}</T>
      </View>
      <T style={{ fontSize: 18, lineHeight: 26, marginBottom: 8 }}>{s.q}</T>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.line, marginBottom: 4, overflow: 'hidden' }}>
        <View style={{ width: `${Math.round((Math.min(n, s.steps.length) / s.steps.length) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
      </View>
      {s.steps.slice(0, n).map((st, i) => (
        <Reveal key={i} dy={10} ms={260} style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 }}>
            <T style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{i + 1}</T>
          </View>
          <T style={{ flex: 1, fontSize: 17, lineHeight: 25 }}>{st}</T>
        </Reveal>
      ))}
      {last ? (
        <PopIn style={{ marginTop: 12 }}>
          <View style={{ backgroundColor: C.greenL, borderWidth: 2, borderBottomWidth: 4, borderColor: C.green, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="check" size={28} pop={n} live />
            <T style={{ color: C.greenT, fontWeight: '700', fontSize: 18, marginLeft: 8, flex: 1 }}>Jawaban: {s.ans}</T>
          </View>
        </PopIn>
      ) : null}
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {!last ? <Btn small color="blue" label={n === 0 ? 'LIHAT LANGKAH 1' : `LANGKAH ${n + 1}`} onPress={() => { sfx(n + 1 >= s.steps.length ? 'correct' : 'step'); setN(n + 1); }} style={{ flex: 1 }} /> : null}
        {n > 0 ? <Btn small color="white" label="ULANGI" onPress={() => setN(0)} style={{ marginLeft: last ? 0 : 10, flex: last ? 1 : 0 }} /> : null}
      </View>
    </View>
  );
});

function Callout({ icon, color, bg, title, items }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 18, borderLeftWidth: 6, borderLeftColor: color, padding: 14, marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={26} live />
        <T style={{ fontWeight: '700', fontSize: 18, color, marginLeft: 8 }}>{title}</T>
      </View>
      {items.map((x, i) => <T key={i} style={{ fontSize: 17, lineHeight: 25, marginTop: 4 }}>{`• ${x}`}</T>)}
    </View>
  );
}

function Table({ heads, rows }) {
  return (
    <View style={{ borderWidth: 2, borderColor: C.line, borderRadius: 14, overflow: 'hidden', marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', backgroundColor: C.soft }}>{heads.map((h, i) => <T key={i} style={{ flex: 1, padding: 9, fontWeight: '700', fontSize: 15, textAlign: 'center' }}>{h}</T>)}</View>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: C.line }}>
          {r.map((c, ci) => <T key={ci} style={{ flex: 1, padding: 9, textAlign: 'center', fontSize: 16 }}>{String(c)}</T>)}
        </View>
      ))}
    </View>
  );
}

const Section = memo(function Section({ s, topic, onPractice, onAsk, watched, onWatch }) {
  switch (s.t) {
    case 'p': return <T style={{ fontSize: 19, lineHeight: 28, marginVertical: 6 }}>{s.text}</T>;
    case 'h': return <T style={{ fontWeight: '700', fontSize: 22, marginTop: 16, marginBottom: 2, color: topic.edge }}>{s.text}</T>;
    case 'formula': return (
      <View style={{ backgroundColor: C.blueL, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: C.blue, paddingVertical: 14, paddingHorizontal: 12, marginVertical: 10, alignItems: 'center' }}>
        {s.lines.map((l, i) => <M key={i} size={24} style={{ marginVertical: 5 }}>{l}</M>)}
        {s.note ? <Rich size={15} color={C.sub} style={{ marginTop: 8, justifyContent: 'center' }}>{s.note}</Rich> : null}
      </View>
    );
    case 'table': return <Table heads={s.heads} rows={s.rows} />;
    case 'panah': return <Panah kind={s.kind} a={s.a} b={s.b} />;
    case 'list': return (
      <View style={{ marginVertical: 8 }}>
        {s.items.map((it, i) => {
          const ph = RMT_PHASES[it.k[0] + it.k.slice(1).toLowerCase()];
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ backgroundColor: ph ? ph.color : C.line, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, minWidth: 96, alignItems: 'center', marginRight: 10, marginTop: 3 }}>
                <T style={{ color: C.navy, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>{it.k}</T>
              </View>
              <T style={{ flex: 1, fontSize: 17, lineHeight: 25 }}>{it.d}</T>
            </View>
          );
        })}
      </View>
    );
    case 'example': return <Example s={s} color={topic.color} edge={topic.edge} />;
    case 'tips': return <Callout icon="bulb" color={C.goldD} bg={C.goldL} title="Tips" items={s.items} />;
    case 'warn': return <Callout icon="warning" color={C.redT} bg={C.redL} title="Kesalahan yang sering terjadi" items={s.items} />;
    case 'sum': return <Callout icon="sparkle" color={C.greenT} bg={C.greenL} title="Ringkasan" items={s.items} />;
    case 'lab': return s.id === 'sen' ? <LabSenilai /> : <LabBerbalik />;
    case 'game': return <GameJenis />;
    case 'video': {
      const list = VIDEOS.filter((v) => v.topics.includes(s.topic));
      if (!list.length) return null;
      return (
        <View style={{ marginTop: 14 }}>
          <T style={{ fontWeight: '700', fontSize: 22, color: topic.edge, marginBottom: 8 }}>Video belajar ({list.length})</T>
          {list.map((v) => <VideoCard key={v.id} v={v} watched={!!(watched && watched[v.id])} onWatch={onWatch} />)}
        </View>
      );
    }
    case 'practice': return <Btn label={s.label} color="green" onPress={onPractice} style={{ marginTop: 14 }} />;
    case 'ask': return <Btn label={s.label} color="white" onPress={() => onAsk(s.seed)} style={{ marginTop: 12 }} />;
    default: return null;
  }
});

function Detail({ topic, isRead, onBack, onRead, onPractice, onAsk, watched, onWatch }) {
  const ref = useRef(null);
  const sy = useRef(new Animated.Value(0)).current;
  const [dim, setDim] = useState({ c: 1, l: 1 });
  useEffect(() => { if (ref.current) ref.current.scrollTo({ y: 0, animated: false }); sy.setValue(0); }, [topic.id]);
  const span = Math.max(1, dim.c - dim.l);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: topic.color, borderBottomWidth: 5, borderBottomColor: topic.edge }}>
        <Icon name="back" size={30} mono="#fff" onPress={onBack} style={{ marginRight: 10 }} hitSlop={14} />
        <View style={{ flex: 1 }}>
          <T style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>{topic.title}</T>
          <T style={{ color: '#fff', fontSize: 15, opacity: 0.95 }}>{topic.sub} · ±{topic.menit} menit</T>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 6 }}><Icon name={topic.icon} size={36} live /></View>
      </View>
      <View style={{ height: 5, backgroundColor: C.line }}>
        <Animated.View style={{ height: 5, backgroundColor: topic.color, width: sy.interpolate({ inputRange: [0, span], outputRange: ['0%', '100%'], extrapolate: 'clamp' }) }} />
      </View>
      <ScrollView ref={ref} scrollEventThrottle={16} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: sy } } }], { useNativeDriver: false })} onContentSizeChange={(w, h) => setDim((d) => (Math.abs(d.c - h) > 2 ? { ...d, c: h } : d))} onLayout={(e) => { const h = e.nativeEvent.layout.height; setDim((d) => (Math.abs(d.l - h) > 2 ? { ...d, l: h } : d)); }} contentContainerStyle={{ padding: 18, paddingBottom: 50 }}>
        {topic.sections.map((s, i) => <Section key={i} s={s} topic={topic} onPractice={onPractice} onAsk={onAsk} watched={watched} onWatch={onWatch} />)}
        <Btn label={isRead ? 'SUDAH DIBACA' : `TANDAI SELESAI DIBACA (+${XP_READ} XP, +1 HATI)`} color={isRead ? 'gray' : 'blue'} disabled={isRead} onPress={onRead} style={{ marginTop: 22 }} />
        <T style={{ color: C.sub, textAlign: 'center', marginTop: 12, fontSize: 15 }}>Ada yang belum jelas? Tanyakan pada {MASCOT} di tab sebelah.</T>
      </ScrollView>
    </View>
  );
}

// ---------- kartu rumus yang bisa dibalik ----------
const FlipCard = memo(function FlipCard({ r }) {
  const [back, setBack] = useState(false);
  const sx = useRef(new Animated.Value(1)).current;
  const flip = () => {
    sfx('flip');
    Animated.timing(sx, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setBack((b) => !b);
      Animated.spring(sx, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }).start();
    });
  };
  return (
    <Pressable onPress={flip}>
      <Animated.View style={{ transform: [{ perspective: 900 }, { rotateY: sx.interpolate({ inputRange: [0, 1], outputRange: ['88deg', '0deg'] }) }], borderWidth: 2, borderBottomWidth: 5, borderColor: back ? C.blue : C.line, backgroundColor: back ? C.blueL : '#fff', borderRadius: 18, padding: 14, marginBottom: 12, minHeight: 92, justifyContent: 'center' }}>
        {!back ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={r.icon} size={42} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <T style={{ fontWeight: '700', fontSize: 19 }}>{r.t}</T>
              <T style={{ color: C.sub, fontSize: 14 }}>Ketuk untuk melihat rumus</T>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            {r.f.map((l, i) => <M key={i} size={23} style={{ marginVertical: 4 }}>{l}</M>)}
            <T style={{ fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 8, color: C.ink }}>Contoh: {r.ex}</T>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

function Istilah() {
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const key = q.trim().toLowerCase();
  const list = key ? ISTILAH.filter((x) => x.k.toLowerCase().includes(key) || x.d.toLowerCase().includes(key)) : ISTILAH;
  const toggle = (k) => { sfx('flip'); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(open === k ? null : k); };
  return (
    <View>
      <Input value={q} onChangeText={setQ} placeholder="Cari istilah..." placeholderTextColor="#94A3B8" autoCapitalize="none" autoCorrect={false}
        style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: q ? C.purple : C.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontFamily: fonts.r, fontSize: 17, color: C.ink, marginBottom: 12 }} />
      {list.length === 0 ? <T style={{ color: C.sub, textAlign: 'center', marginTop: 16 }}>Tidak ada istilah yang cocok. Coba kata lain.</T> : null}
      {list.map((x, i) => {
        const on = open === x.k;
        return (
          <Reveal key={x.k} i={i} step={30} dy={10}>
            <Pressable onPress={() => toggle(x.k)} style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: on ? C.purple : C.line, backgroundColor: on ? '#F6EBFF' : '#fff', borderRadius: 18, padding: 14, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: on ? C.purple : '#F6EBFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <T style={{ fontWeight: '700', fontSize: 17, color: on ? '#fff' : C.purpleD }}>{x.k.charAt(0).toUpperCase()}</T>
                </View>
                <T style={{ fontWeight: '700', fontSize: 19, flex: 1, color: on ? C.purpleD : C.ink }}>{x.k}</T>
                <T style={{ fontSize: 22, color: C.sub }}>{on ? '–' : '+'}</T>
              </View>
              {on ? <T style={{ fontSize: 17, lineHeight: 25, marginTop: 10 }}>{x.d}</T> : null}
            </Pressable>
          </Reveal>
        );
      })}
    </View>
  );
}

export default function Materi({ state, topicId, onTopic, onRead, onWatch, onPractice, onAsk }) {
  const [seg, setSeg] = useState('topik');
  const [vf, setVf] = useState('semua');
  const [note, setNote] = useState('');
  const read = state.read || {};
  const topic = TOPICS.find((t) => t.id === topicId);
  const nRead = TOPICS.filter((t) => read[t.id]).length;

  if (topic) {
    return <Detail topic={topic} isRead={!!read[topic.id]} onBack={() => onTopic(null)} onRead={() => onRead(topic.id)} onPractice={onPractice} onAsk={onAsk} watched={state.watched || {}} onWatch={onWatch} />;
  }
  const share = async () => { const m = await shareText(sheetText()); setNote(m); };

  const nxt = nextUnreadTopic(state);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Reveal>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Icon name="books" size={52} live />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <T style={{ fontWeight: '700', fontSize: 26 }}>Materi</T>
            <T style={{ color: C.sub, fontSize: 15 }}>Bacaan, rumus, dan alat bantu belajar</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Bar value={nRead / TOPICS.length} color={C.purple} height={12} />
          <T style={{ marginLeft: 10, fontWeight: '700', color: C.purpleD, fontSize: 14 }}>{nRead}/{TOPICS.length} dibaca</T>
        </View>
      </Reveal>

      <Reveal i={1}><Seg items={SEG} value={seg} onChange={setSeg} style={{ marginBottom: 16 }} /></Reveal>

      {seg === 'topik' && nxt ? (
        <Reveal i={2}>
          <Tap onPress={() => { sfx('start'); onTopic(nxt.id); }} sound={null} scaleTo={0.97} style={{ backgroundColor: nxt.color, borderBottomWidth: 6, borderBottomColor: nxt.edge, borderRadius: 22, overflow: 'hidden', marginBottom: 16 }}>
            <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
              <View pointerEvents="none" style={{ position: 'absolute', right: -24, top: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.14)' }} />
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 6, marginRight: 12 }}><Icon name={nxt.icon} size={40} live /></View>
              <View style={{ flex: 1 }}>
                <T style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1.2, opacity: 0.95 }}>{nRead === 0 ? 'MULAI DARI SINI' : 'LANJUTKAN MEMBACA'}</T>
                <T style={{ color: '#fff', fontWeight: '700', fontSize: 21 }}>{nxt.title}</T>
                <T style={{ color: '#fff', fontSize: 14, opacity: 0.95 }}>±{nxt.menit} menit · +{XP_READ} XP, +1 hati</T>
              </View>
              <T style={{ color: '#fff', fontSize: 26 }}>›</T>
            </View>
          </Tap>
        </Reveal>
      ) : null}

      {seg === 'topik' && TOPICS.map((t, ti) => (
        <Reveal key={t.id} i={ti + 2} step={45}>
          <Pressable onPress={() => { sfx('start'); onTopic(t.id); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderBottomWidth: 5, borderColor: read[t.id] ? C.green : C.line, backgroundColor: read[t.id] ? '#F7FFF0' : '#fff', borderRadius: 20, padding: 12, marginBottom: 12, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: t.color, borderBottomWidth: 5, borderBottomColor: t.edge, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 4 }}><Icon name={t.icon} size={38} /></View>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <T style={{ fontWeight: '700', fontSize: 20 }}>{t.title}</T>
              <T style={{ color: C.sub, fontSize: 15 }}>{t.sub}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <T style={{ color: t.edge, fontSize: 14, fontWeight: '700' }}>±{t.menit} menit</T>
                {!read[t.id] ? <Pill bg={C.blueL} fg={C.blueD} style={{ marginLeft: 8, paddingVertical: 0 }}>BARU</Pill> : null}
              </View>
            </View>
            {read[t.id] ? <Icon name="check" size={30} /> : <T style={{ fontSize: 26, color: C.sub }}>›</T>}
          </Pressable>
        </Reveal>
      ))}

      {seg === 'video' && (
        <View>
          <T style={{ color: C.sub, marginBottom: 10, fontSize: 16, lineHeight: 23 }}>{Object.keys(state.watched || {}).length}/{VIDEOS.length} video ditonton. Ketuk video untuk menonton di YouTube. Tontonlah sambil mencoba soalnya sendiri di kertas, lalu cocokkan.</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {[{ id: 'semua', title: 'Semua' }, ...TOPICS.filter((t) => VIDEOS.some((v) => v.topics.includes(t.id)))].map((t) => {
              const on = vf === t.id;
              return (
                <Pressable key={t.id} onPress={() => { sfx('tab'); setVf(t.id); }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 2, borderColor: on ? C.blue : C.line, backgroundColor: on ? C.blueL : '#fff' }}>
                  <T style={{ fontWeight: '700', fontSize: 15, color: on ? C.blueD : C.sub }}>{t.title}</T>
                </Pressable>
              );
            })}
          </ScrollView>
          {VIDEOS.filter((v) => vf === 'semua' || v.topics.includes(vf)).map((v) => <VideoCard key={v.id} v={v} watched={!!(state.watched && state.watched[v.id])} onWatch={onWatch} />)}
        </View>
      )}

      {seg === 'rumus' && (
        <View>
          <T style={{ color: C.sub, marginBottom: 12, fontSize: 16 }}>Ketuk kartu untuk membalik dan melihat rumus beserta contohnya.</T>
          {RUMUS.map((r) => <FlipCard key={r.id} r={r} />)}
          <Btn label="BAGIKAN LEMBAR RUMUS" color="blue" onPress={share} style={{ marginTop: 6 }} />
          {note ? <T style={{ color: C.sub, textAlign: 'center', marginTop: 10 }}>{note}</T> : null}
        </View>
      )}

      {seg === 'istilah' && <Istilah />}
    </ScrollView>
  );
}
