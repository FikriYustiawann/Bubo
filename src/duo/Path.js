import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Platform, Pressable, ScrollView, UIManager, View } from 'react-native';
import Owl from './Owl';
import Icon, { Stars } from './Icon';
import { Bar, Btn, Card, CountUp, PopIn, Reveal, Ring, T, Tap, Toast, mmss, useTick } from './ui';
import { C, useScale } from './theme';
import { ALL, UNITS } from './lessons';
import { GOAL, MAX_HEARTS, heartsNow, levelOf, nextUnreadTopic, streakNow } from './state';
import { MASCOT } from './brand';
import { sfx } from './sound';

const OFF = [0, 46, 72, 46, 0, -46, -72, -46];
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);

const Chip = ({ icon, color, bg, children, live }) => (
  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: bg || C.soft, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 6, marginHorizontal: 3 }}>
    <Icon name={icon} size={22} live={live} onPress={() => {}} />
    <T numberOfLines={1} style={{ fontWeight: '700', color, marginLeft: 5, fontSize: 15 }}>{children}</T>
  </View>
);

// Cincin berdenyut di belakang pelajaran yang sedang aktif
function Pulse({ color, w, h }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, []);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: w, height: h, borderRadius: h / 2, borderWidth: 4, borderColor: color, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }} />;
}

// Gelembung "MULAI" yang naik-turun
function StartBubble({ color }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  return (
    <Animated.View style={{ alignItems: 'center', marginBottom: 6, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }}>
      <View style={{ backgroundColor: '#fff', borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4 }}>
        <T style={{ color, fontWeight: '700', fontSize: 15, letterSpacing: 1 }}>MULAI</T>
      </View>
      <View style={{ width: 10, height: 10, backgroundColor: '#fff', borderRightWidth: 2, borderBottomWidth: 2, borderColor: C.line, transform: [{ rotate: '45deg' }], marginTop: -6 }} />
    </Animated.View>
  );
}

// Titik-titik penghubung antar pelajaran (mengikuti lekuk jalur)
function Connector({ from, to, done }) {
  const sc = useScale();
  return (
    <View style={{ alignItems: 'center', paddingTop: 4, paddingBottom: 4 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 4, marginTop: i === 1 ? 0 : 5, backgroundColor: done ? C.gold : C.line, transform: [{ translateX: (from + ((to - from) * i) / 4) * sc }] }} />
      ))}
    </View>
  );
}

function LessonNode({ l, u, done, open, current, off, onStart, onLocked }) {
  const [poke, setPoke] = useState(0);
  const sc = useScale();
  const shake = useRef(new Animated.Value(0)).current;
  const col = done ? { bg: C.gold, edge: C.goldD } : open ? { bg: u.color, edge: u.edge } : { bg: '#E5E7EB', edge: '#CBD0D8' };
  const W = 78 * sc, H = 70 * sc;
  const press = () => {
    if (open) { sfx('start'); onStart(l); return; }
    sfx('pop');
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    onLocked(l);
  };
  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: off * sc }] }}>
      {current ? <StartBubble color={u.edge} /> : null}
      <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }) }] }}>
        <Pressable onPressIn={() => setPoke((p) => p + 1)} onPress={press} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.92 : 1 }] })}>
          <View style={{ width: W, height: H }}>
            {current ? <Pulse color={u.color} w={W} h={H} /> : null}
            {done ? <View pointerEvents="none" style={{ position: 'absolute', top: -5, left: -5, width: W + 10, height: H + 10, borderRadius: (H + 10) / 2, backgroundColor: C.goldL }} /> : null}
            <View style={{ width: W, height: H, borderRadius: H / 2, backgroundColor: col.bg, borderBottomWidth: 7, borderBottomColor: col.edge, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {open || done ? <View pointerEvents="none" style={{ position: 'absolute', top: 5, left: W * 0.22, right: W * 0.22, height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' }} /> : null}
              {done ? <Icon name="star" size={38} mono="#fff" pop={poke} /> : open ? <Icon name={l.icon} size={40} live={current} pop={poke} /> : <Icon name="lock" size={30} />}
            </View>
          </View>
        </Pressable>
      </Animated.View>
      <T style={{ marginTop: 8, fontSize: 16, color: open ? C.ink : C.sub, fontWeight: '700', textAlign: 'center', maxWidth: 150 * sc }}>{l.title}</T>
      {done ? <Stars n={done} size={16} /> : null}
      {current ? <View pointerEvents="none" style={{ position: 'absolute', top: 6, ...(off > 0 ? { left: -100 * sc } : { right: -100 * sc }) }}><Owl size={70} /></View> : null}
    </View>
  );
}

// Kartu unit: bisa dibuka/ditutup, menampilkan progres
function UnitCard({ u, ui, doneN, expanded, pending, onToggle, onMateri }) {
  const total = u.lessons.length;
  const pct = total ? doneN / total : 0;
  return (
    <Tap onPress={onToggle} sound="tab" scaleTo={0.98} style={{ backgroundColor: u.color, borderBottomWidth: 5, borderBottomColor: u.edge, borderRadius: 20, overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: -26, top: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.13)' }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: 52, bottom: -34, width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.10)' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <T style={{ color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 1.2, opacity: 0.9 }}>UNIT {ui + 1}{pending ? '  ·  TERKUNCI' : doneN === total ? '  ·  SELESAI' : ''}</T>
            <T style={{ color: '#fff', fontWeight: '700', fontSize: 24 }}>{u.title}</T>
            <T style={{ color: '#fff', fontSize: 15, opacity: 0.95 }}>{u.sub}</T>
          </View>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 10, height: 10, borderRightWidth: 3, borderBottomWidth: 3, borderColor: '#fff', marginTop: expanded ? 4 : -3, transform: [{ rotate: expanded ? '225deg' : '45deg' }] }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.16)', overflow: 'hidden' }}>
            <View style={{ width: `${Math.round(pct * 100)}%`, height: 10, borderRadius: 5, backgroundColor: '#fff', minWidth: pct > 0 ? 10 : 0 }} />
          </View>
          <T style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 10 }}>{doneN}/{total}</T>
        </View>
        {onMateri && u.materi ? (
          <Pressable onPress={() => onMateri(u.materi)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 10, paddingVertical: 5, marginTop: 12 }}>
            <Icon name="book" size={20} />
            <T style={{ color: u.edge, fontWeight: '700', fontSize: 13, letterSpacing: 1, marginLeft: 6 }}>BACA MATERI</T>
          </Pressable>
        ) : null}
      </View>
    </Tap>
  );
}

// Kartu sapaan + tombol lanjut. Cincin = target XP hari ini.
function Hero({ state, current, doneCount, onStart, onGoPractice }) {
  const all = doneCount === ALL.length;
  const h = heartsNow(state.hearts);
  useTick(h.n < MAX_HEARTS);
  const dxp = Math.min(state.daily.xp, GOAL);
  const daily = Math.min(1, state.daily.xp / GOAL);
  const goal = ALL.length ? doneCount / ALL.length : 0;
  const lv = levelOf(state.xp);
  return (
    <Card style={{ padding: 14, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Owl size={58} mood={all || daily >= 1 ? 'cheer' : 'happy'} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <T style={{ fontWeight: '700', fontSize: 18 }}>{state.name ? `Halo, ${state.name}!` : 'Halo!'}</T>
          <T style={{ color: C.sub, fontSize: 13, lineHeight: 18 }}>{all ? 'Semua pelajaran sudah selesai. Hebat!' : daily >= 1 ? 'Target hari ini tercapai. Keren!' : `${MASCOT} menunggumu di setiap pelajaran. Semangat!`}</T>
        </View>
        <View style={{ alignItems: 'center', marginLeft: 6 }}>
          <Ring size={62} stroke={7} value={daily} color={daily >= 1 ? C.green : C.gold}>
            <T style={{ fontWeight: '700', fontSize: 16, color: daily >= 1 ? C.greenT : C.ink }}>{dxp}</T>
            <T style={{ fontSize: 10, color: C.sub, marginTop: -3 }}>/{GOAL} XP</T>
          </Ring>
          <T style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>hari ini</T>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12, marginHorizontal: -3 }}>
        <Chip icon="flame" color={C.orangeD} bg="#FFF1DB" live={streakNow(state) > 0}>{streakNow(state)}</Chip>
        <Chip icon="star" color={C.goldD} bg={C.goldL}>Lv {lv.n}</Chip>
        <Chip icon="heart" color={C.redT} bg={C.redL} live>{h.n}{h.n < MAX_HEARTS ? `  ${mmss(h.next)}` : ''}</Chip>
      </View>

      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <T style={{ color: C.sub, fontSize: 12 }}>Pelajaran selesai</T>
          <T style={{ color: C.sub, fontSize: 12, fontWeight: '700' }}>{doneCount}/{ALL.length}</T>
        </View>
        <Bar value={goal} color={C.green} height={10} />
        {!all && current ? <T numberOfLines={1} style={{ fontWeight: '700', fontSize: 14, color: C.blueD, marginTop: 8 }}>Berikutnya: {current.title}</T> : null}
      </View>
      <Btn small icon={all ? 'target' : 'play'} label={all ? 'BERLATIH' : 'LANJUTKAN'} onPress={() => (all || !current ? onGoPractice() : onStart(current))} style={{ marginTop: 12 }} />
    </Card>
  );
}

export default function Path({ state, onStart, onGoPractice, onMateri }) {
  const firstOpen = ALL.findIndex((l) => !state.done[l.id]);
  const idxOf = (id) => ALL.findIndex((l) => l.id === id);
  const noHeart = heartsNow(state.hearts).n <= 0;
  const nextUnread = nextUnreadTopic(state);
  const current = firstOpen >= 0 ? ALL[firstOpen] : null;
  const curUnit = current ? UNITS.findIndex((u) => u.lessons.some((l) => l.id === current.id)) : UNITS.length - 1;
  const doneCount = Object.keys(state.done).filter((k) => ALL.some((l) => l.id === k)).length;
  const [exp, setExp] = useState({});
  const [toast, setToast] = useState(null);
  const tt = useRef(null);
  useEffect(() => () => clearTimeout(tt.current), []);
  const isOpen = (u, ui) => (exp[u.id] === undefined ? ui === curUnit : exp[u.id]);
  const toggle = (u, ui) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExp((e) => ({ ...e, [u.id]: !isOpen(u, ui) }));
  };
  const locked = (l) => {
    const gi = idxOf(l.id);
    setToast(`Selesaikan "${ALL[gi - 1].title}" dulu ya`);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToast(null), 2200);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView removeClippedSubviews={false} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Reveal><Hero state={state} current={current} doneCount={doneCount} onStart={onStart} onGoPractice={onGoPractice} /></Reveal>
        {noHeart ? (
          <View style={{ backgroundColor: C.redL, borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <T style={{ color: C.redT, fontWeight: '700', fontSize: 18 }}>Hatimu habis</T>
            <T style={{ color: C.redT, marginVertical: 6, lineHeight: 22 }}>Hati habis berarti banyak jawaban meleset. Saatnya memperkuat pemahaman: baca satu topik materi (+1 hati) atau berlatih tanpa risiko (+1 hati). Hati juga pulih sendiri tiap 15 menit.</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {onMateri && nextUnread ? <Btn small label="BACA MATERI" color="red" onPress={() => onMateri(nextUnread.id)} style={{ marginRight: 10, marginTop: 6 }} /> : null}
              <Btn small label="BERLATIH" color="white" onPress={onGoPractice} style={{ marginTop: 6 }} />
            </View>
          </View>
        ) : null}
        {UNITS.map((u, ui) => {
          const expanded = isOpen(u, ui);
          const doneN = u.lessons.filter((l) => state.done[l.id]).length;
          const pending = ui > curUnit;
          return (
            <Reveal key={u.id} i={ui + 1} style={{ marginBottom: 18 }}>
              <UnitCard u={u} ui={ui} doneN={doneN} expanded={expanded} pending={pending} onToggle={() => toggle(u, ui)} onMateri={onMateri} />
              {expanded ? (
                <View style={{ paddingTop: 20 }}>
                  {u.lessons.map((l, j) => {
                    const gi = idxOf(l.id);
                    const done = state.done[l.id];
                    const open = gi === 0 || !!state.done[ALL[gi - 1].id];
                    const off = OFF[j % OFF.length];
                    return (
                      <View key={l.id}>
                        {j > 0 ? <Connector from={OFF[(j - 1) % OFF.length]} to={off} done={!!state.done[u.lessons[j - 1].id] && !!done} /> : null}
                        <LessonNode l={l} u={u} done={done} open={open} current={gi === firstOpen} off={off} onStart={onStart} onLocked={locked} />
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </Reveal>
          );
        })}
      </ScrollView>
      {toast ? <Toast key={toast} text={toast} /> : null}
    </View>
  );
}
