import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Owl from './Owl';
import Icon, { Stars } from './Icon';
import { Bar, Btn, Confetti, CountUp, Input, PopIn, Reveal, T } from './ui';
import { C, fonts } from './theme';
import { checkAnswer, makeEx } from './engine';
import { RMT_PHASES } from '../rmt';
import { MASCOT } from './brand';
import { sfx } from './sound';
import { Rich } from './Math';
import { FadeSlide } from './Transition';
import Panah from './Panah';
import Tandai from './Tandai';

const PLACE = { num: 'Ketik jawabanmu', jenis: 'senilai atau berbalik nilai', pick: 'A, B, atau C', ratio: 'contoh: 3 : 4' };

function Grid({ heads, rows }) {
  return (
    <View style={{ borderWidth: 2, borderColor: C.line, borderRadius: 14, overflow: 'hidden', marginTop: 14 }}>
      <View style={{ flexDirection: 'row', backgroundColor: C.soft }}>
        {heads.map((h, i) => <T key={i} style={{ flex: 1, padding: 10, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>{h}</T>)}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: C.line }}>
          {r.map((c, ci) => <T key={ci} style={{ flex: 1, padding: 10, textAlign: 'center' }}>{String(c)}</T>)}
        </View>
      ))}
    </View>
  );
}

// mode: 'lesson' (hati berkurang bila salah) | 'practice' (tanpa risiko hati; selesai = +1 hati)
export default function Lesson({ lesson, mode = 'lesson', hearts, onAnswer, onComplete, recap, onExit }) {
  const init = useMemo(() => lesson.build(Date.now() % 100000000), [lesson]);
  const [queue, setQueue] = useState(init);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const [hintN, setHintN] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [first, setFirst] = useState(0);
  const [combo, setCombo] = useState(0);
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState(false);
  const sheet = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const sent = useRef(false);

  const cur = queue[i];
  const finished = !failed && i >= queue.length;
  const isEssay = cur && cur.type === 'essay';
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const xp = 4 + first * 2 + (mistakes === 0 ? 5 : 0);

  useEffect(() => { if (status) Animated.spring(sheet, { toValue: 1, useNativeDriver: true, friction: 8 }).start(); else sheet.setValue(0); }, [status]);
  useEffect(() => {
    if (finished && !sent.current) { sent.current = true; sfx('finish'); onComplete({ stars, xp, mistakes, mode, lessonId: lesson.id }); }
  }, [finished]);

  const nb = recap && recap.newBadges ? recap.newBadges.length : 0;
  useEffect(() => { if (nb > 0) { const t = setTimeout(() => sfx('badge'), 900); return () => clearTimeout(t); } return undefined; }, [nb]);

  const check = () => {
    if (status || !text.trim()) return;
    const ok = checkAnswer(cur, text);
    setStatus(ok ? 'right' : 'wrong');
    onAnswer(cur, ok);
    if (ok) { if (!cur.retry) setFirst((f) => f + 1); sfx(combo + 1 === 3 || combo + 1 === 5 || combo + 1 === 8 ? 'combo' : 'correct'); setCombo((c) => c + 1); return; }
    sfx('wrong'); setCombo(0); setMistakes((m) => m + 1);
    setQueue((q) => [...q, { ...makeEx(cur.g, cur.s + 7919, cur.si)[0], retry: true, wk: cur.wk }]);
    Animated.sequence([-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true }))).start();
  };

  const next = () => {
    if (status === 'wrong' && mode === 'lesson' && hearts <= 0) { setFailed(true); return; }
    setI((n) => n + 1); setText(''); setStatus(null); setHintN(0);
  };

  const restart = () => { sent.current = false; setQueue(lesson.build(Date.now() % 100000000)); setI(0); setText(''); setStatus(null); setHintN(0); setMistakes(0); setFirst(0); setCombo(0); setFailed(false); };

  if (failed) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Owl size={150} mood="sad" />
        <T style={{ fontSize: 28, fontWeight: '700', marginTop: 20 }}>Hatimu habis</T>
        <T style={{ color: C.sub, textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 24 }}>Tidak apa-apa, salah itu bagian dari belajar. Isi hati dengan berlatih (tanpa risiko), atau tunggu hati pulih sendiri.</T>
        <Btn label="BERLATIH UNTUK ISI HATI" onPress={() => onExit('latihan')} style={{ alignSelf: 'stretch' }} />
        <Btn label="KELUAR" color="white" onPress={() => onExit()} style={{ alignSelf: 'stretch', marginTop: 12 }} />
      </View>
    );
  }

  if (finished) {
    const badges = (recap && recap.newBadges) || [];
    const msg = stars === 3 ? 'Sempurna!' : stars === 2 ? 'Bagus sekali!' : 'Terus semangat!';
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <PopIn><Owl size={150} mood="cheer" /></PopIn>
          <Reveal i={1}><T style={{ fontSize: 30, fontWeight: '700', marginTop: 12, textAlign: 'center' }}>{mode === 'lesson' ? 'Pelajaran selesai!' : 'Sesi latihan selesai!'}</T></Reveal>
          <Reveal i={2}><T style={{ color: C.sub, fontSize: 17, textAlign: 'center' }}>{msg}</T></Reveal>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 14 }}>
            {[0, 1, 2].map((k) => (
              <PopIn key={k} delay={350 + k * 260} style={{ marginHorizontal: 4, marginBottom: k === 1 ? 10 : 0 }}>
                <Icon name="star" size={k === 1 ? 64 : 50} dim={k >= stars} live={k < stars} />
              </PopIn>
            ))}
          </View>
          <Reveal i={3} style={{ flexDirection: 'row', marginBottom: 14, alignSelf: 'stretch' }}>
            <View style={{ flex: 1, backgroundColor: C.goldL, borderWidth: 2, borderBottomWidth: 4, borderColor: C.gold, borderRadius: 18, paddingVertical: 10, alignItems: 'center', marginRight: 6 }}>
              <T style={{ color: C.goldD, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>XP DIDAPAT</T>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}><T style={{ color: C.goldD, fontWeight: '700', fontSize: 26 }}>+</T><CountUp v={xp} style={{ color: C.goldD, fontWeight: '700', fontSize: 26 }} /></View>
            </View>
            <View style={{ flex: 1, backgroundColor: C.greenL, borderWidth: 2, borderBottomWidth: 4, borderColor: C.green, borderRadius: 18, paddingVertical: 10, alignItems: 'center', marginLeft: 6 }}>
              <T style={{ color: C.greenT, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>BENAR PERTAMA</T>
              <CountUp v={first} style={{ color: C.greenT, fontWeight: '700', fontSize: 26 }} />
            </View>
          </Reveal>
          {mode !== 'lesson' ? <Reveal i={4} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}><T style={{ color: C.red, fontWeight: '700' }}>+1 </T><Icon name="heart" size={24} live /><T style={{ color: C.red, fontWeight: '700' }}> hati terisi</T></Reveal> : null}
          <Reveal i={4}>
            {mistakes > 0 ? <T style={{ color: C.sub, textAlign: 'center', lineHeight: 22, marginBottom: 12 }}>{mistakes} soal belum tepat. Tidak apa-apa: soal itu disimpan di Latihan, pada "Dari kesalahanku", dengan angka baru. Memperbaikinya memberi bonus XP.</T> : <T style={{ color: C.greenT, textAlign: 'center', lineHeight: 22, marginBottom: 12 }}>Tanpa salah! Coba jelaskan dengan kata sendiri pada {MASCOT} supaya pemahamanmu makin kuat.</T>}
          </Reveal>
          {badges.map((b, bi) => (
            <PopIn key={b.id} delay={900 + bi * 200} style={{ alignSelf: 'stretch' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderBottomWidth: 4, borderColor: C.gold, backgroundColor: C.goldL, borderRadius: 18, padding: 12, marginBottom: 10 }}>
                <Icon name={b.icon} size={48} live style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}><T style={{ fontWeight: '700', color: C.goldD }}>Lencana baru: {b.t}</T><T style={{ fontSize: 15, color: C.sub }}>{b.d}</T></View>
              </View>
            </PopIn>
          ))}
          <View style={{ height: 10 }} />
          <Reveal i={5} style={{ alignSelf: 'stretch' }}>
            <Btn label="LANJUT" onPress={() => onExit()} />
            <Btn label={`REFLEKSI BARENG ${MASCOT.toUpperCase()}`} color="white" onPress={() => onExit('tutor')} style={{ marginTop: 12 }} />
          </Reveal>
        </ScrollView>
        <Confetti n={34} />
      </View>
    );
  }

  const ok = status === 'right';
  const hint = hintN > 0 && cur.hints && cur.hints[Math.min(hintN, cur.hints.length) - 1];
  const ph = isEssay && cur.phase ? RMT_PHASES[cur.phase] : null;
  const edge = ok ? C.green : status === 'wrong' ? C.red : C.line;
  const total = Math.max(1, queue.length);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior="padding">
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 }}>
        <Pressable onPress={() => onExit()} hitSlop={12} style={{ marginRight: 14 }}><Icon name="close" size={26} /></Pressable>
        <Bar value={Math.min(1, i / total)} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}><Icon name={mode === 'lesson' ? 'heart' : 'target'} size={26} live={mode === 'lesson'} pop={mode === 'lesson' ? hearts : 0} /><T style={{ fontWeight: '700', color: mode === 'lesson' ? C.red : C.blue, marginLeft: 6, fontSize: 18 }}>{mode === 'lesson' ? Math.max(0, hearts) : 'Latihan'}</T></View>
      </View>
      {combo >= 3 ? <PopIn key={combo} style={{ alignSelf: 'center' }}><View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.orange, borderBottomWidth: 3, borderBottomColor: C.orangeD, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 3 }}><Icon name="flame" size={22} live /><T style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 4 }}>Beruntun x{combo}</T></View></PopIn> : null}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <FadeSlide key={i} dy={10} ms={200} style={{ flex: 0 }}>
        {cur.type === 'card' && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Owl size={84} mood="happy" />
              <View style={{ flex: 1, marginLeft: 14, marginBottom: 10, borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 18, padding: 14, backgroundColor: '#fff' }}>
                <View pointerEvents="none" style={{ position: 'absolute', left: -9, bottom: 16, width: 14, height: 14, backgroundColor: '#fff', borderLeftWidth: 2, borderBottomWidth: 2, borderColor: C.line, transform: [{ rotate: '45deg' }] }} />
                <T style={{ fontWeight: '700', fontSize: 21 }}>{cur.title}</T>
              </View>
            </View>
            <Rich size={20} lineHeight={28} style={{ marginTop: 18 }}>{cur.body}</Rich>
            {cur.panah ? <Panah {...cur.panah} /> : null}
            {cur.table ? <Grid heads={cur.table.heads} rows={cur.table.rows} /> : null}
          </View>
        )}

        {isEssay && (
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <T style={{ color: C.sub, fontWeight: '700', letterSpacing: 1, fontSize: 14 }}>JAWAB DENGAN KATA/ANGKA SENDIRI</T>
              {ph ? <View style={{ marginLeft: 8, backgroundColor: ph.color, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1 }}><T style={{ color: C.navy, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{ph.label}</T></View> : null}
            </View>
            {cur.ctx ? (
              <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 14, marginBottom: 12 }}>
                <Tandai style={{ fontSize: 18, lineHeight: 26 }}>{cur.ctx}</Tandai>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 }}>
              <Owl size={80} mood={ok ? 'cheer' : status === 'wrong' ? 'sad' : 'think'} />
              <View style={{ flex: 1, marginLeft: 14, marginBottom: 8, borderWidth: 2, borderBottomWidth: 4, borderColor: ok ? C.green : status === 'wrong' ? C.red : C.line, borderRadius: 18, padding: 14, backgroundColor: '#fff' }}>
                <View pointerEvents="none" style={{ position: 'absolute', left: -9, bottom: 16, width: 14, height: 14, backgroundColor: '#fff', borderLeftWidth: 2, borderBottomWidth: 2, borderColor: ok ? C.green : status === 'wrong' ? C.red : C.line, transform: [{ rotate: '45deg' }] }} />
                <Tandai style={{ fontSize: 20, lineHeight: 28 }}>{cur.q}</Tandai>
                <T style={{ fontSize: 12, color: C.sub, marginTop: 8 }}>Kuning = data penting · Biru = yang ditanya</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {cur.money ? <T style={{ fontSize: 24, marginRight: 8, color: C.sub }}>Rp</T> : null}
              <Input
                key={i} value={text} onChangeText={setText} editable={!status} autoFocus={Platform.OS === 'web'} autoCapitalize="none" autoCorrect={false}
                onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onSubmitEditing={() => (status ? next() : check())} returnKeyType="done" placeholder={PLACE[cur.a.t]} placeholderTextColor="#94A3B8"
                style={{ flex: 1, borderWidth: 2, borderBottomWidth: 4, borderColor: status ? edge : focus ? C.blue : C.line, backgroundColor: ok ? C.greenL : status === 'wrong' ? C.redL : focus ? '#F4FBFF' : '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.r, fontSize: 24, color: C.ink }}
              />
              {cur.unit ? <T style={{ marginLeft: 10, fontSize: 20, color: C.sub }}>{cur.unit}</T> : null}
            </View>
            {hint ? (
              <Reveal key={hintN} dy={8} ms={240} style={{ marginTop: 14 }}>
              <View style={{ backgroundColor: C.goldL, borderWidth: 2, borderBottomWidth: 4, borderColor: C.gold, borderRadius: 16, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}><Icon name="bulb" size={26} live style={{ marginRight: 8, marginTop: 1 }} /><View style={{ flex: 1 }}><T style={{ color: C.goldD, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 2 }}>PETUNJUK {Math.min(hintN, cur.hints.length)} DARI {cur.hints.length}</T><T style={{ color: C.goldD, fontSize: 17, lineHeight: 24 }}>{hint}</T></View></View>
              </View>
              </Reveal>
            ) : null}
            {status && cur.a && cur.a.t === 'jenis' ? <View style={{ marginTop: 14 }}><Panah kind={cur.a.v === 'senilai' ? 's' : 'b'} /></View> : null}
          </Animated.View>
        )}
        </FadeSlide>
      </ScrollView>

      {!status && (
        <View style={{ padding: 16, borderTopWidth: 2, borderTopColor: C.line, flexDirection: 'row' }}>
          {cur.type === 'card' ? (
            <Btn label="LANJUT" color="blue" onPress={() => { setI((n) => n + 1); }} style={{ flex: 1 }} />
          ) : (
            <>
              {cur.hints && cur.hints.length > 0 ? <Btn label={hintN > 0 ? `PETUNJUK ${Math.min(hintN, cur.hints.length)}/${cur.hints.length}` : 'PETUNJUK'} color="white" disabled={hintN >= cur.hints.length} onPress={() => setHintN((h) => Math.min(h + 1, cur.hints.length))} style={{ marginRight: 12 }} /> : null}
              <Btn label="PERIKSA" disabled={!text.trim()} onPress={check} style={{ flex: 1 }} />
            </>
          )}
        </View>
      )}

      {status && (
        <Animated.View style={{ backgroundColor: ok ? C.greenL : C.redL, padding: 18, paddingBottom: 22, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 3, borderTopColor: ok ? C.green : C.red, transform: [{ translateY: sheet.interpolate({ inputRange: [0, 1], outputRange: [160, 0] }) }] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 5 }}><Icon name={ok ? 'party' : 'bulb'} size={32} pop={status} live /></View><T style={{ fontSize: 23, fontWeight: '700', color: ok ? C.greenT : C.redT, marginLeft: 10 }}>{ok ? 'Benar! Keren sekali' : 'Belum tepat'}</T></View>
          {!ok ? <T style={{ color: C.redT, fontSize: 19, fontWeight: '700', marginTop: 6 }}>Jawaban yang benar: {cur.show}</T> : null}
          <T style={{ color: ok ? C.greenT : C.redT, marginTop: 6, marginBottom: 14, lineHeight: 24 }}>{cur.why}</T>
          <Btn label="LANJUT" color={ok ? 'green' : 'red'} onPress={next} />
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}
