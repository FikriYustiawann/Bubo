import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Icon from './Icon';
import { Bar, Btn, Burst, Card as UiCard, CountUp, Reveal, Ring, T, Tap } from './ui';
import { C } from './theme';
import { sfx } from './sound';
import { RMT_PHASES } from '../rmt';
import { BADGES, GOAL, QUESTS, QUEST_REWARD, RHYTHM_BONUS, XP_SOURCES, levelOf, streakNow, weekDays } from './state';

const Card = ({ children, style }) => (
  <View style={[{ borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 20, padding: 14, marginBottom: 12 }, style]}>{children}</View>
);

export default function Quests({ state, onClaim, onGo }) {
  const days = weekDays();
  const [sel, setSel] = useState(days.findIndex((d) => d.today));
  const [boom, setBoom] = useState(null);   // { id, n } kartu misi yang baru diklaim
  const sd = days[sel]; const sxp = state.days[sd.key] || 0;
  const info = sd.future ? 'Belum tiba. Semangat menyambutnya!' : sxp >= GOAL ? `${sxp} XP · target tercapai` : sxp > 0 ? `${sxp} XP · ${GOAL - sxp} XP lagi menuju target` : 'Belum belajar hari itu';
  const lv = levelOf(state.xp);
  const allClaimed = QUESTS.every((q) => state.claimed[q.id]);
  const earned = BADGES.filter((b) => state.badges[b.id]).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <T style={{ fontWeight: '700', fontSize: 24, marginBottom: 4 }}>Misi</T>
      <T style={{ color: C.sub, marginBottom: 14 }}>Runtutan {streakNow(state)} hari · target harian {GOAL} XP</T>

      <Reveal>
      <Card style={{ borderColor: C.blue, backgroundColor: C.blueL }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ring size={74} stroke={8} value={lv.pct} color={C.blue} track="#fff">
            <Icon name="star" size={34} live />
          </Ring>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <T style={{ color: C.blueD, fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>LEVEL {lv.n}</T>
            <T style={{ fontWeight: '700', fontSize: 21, color: C.navy }}>{lv.t}</T>
            <T style={{ color: C.sub, fontSize: 14 }}>{state.xp} XP{lv.next ? ` · ${lv.left} XP lagi menuju ${lv.next.t}` : ' · level tertinggi'}</T>
          </View>
        </View>
        <T style={{ color: C.sub, fontSize: 14, marginTop: 10, lineHeight: 20 }}>Level menunjukkan seberapa tekun kamu belajar. Seberapa paham kamu dilihat di Profil, pada Peta Kemampuan.</T>
      </Card>
      </Reveal>

      <Reveal i={1}>
      <View style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 20, padding: 10, marginBottom: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          {days.map((d) => {
            const xp = state.days[d.key] || 0; const full = xp >= GOAL; const on = sel === d.i;
            return (
              <Tap key={d.key} scaleTo={0.9} sound="tab" onPress={() => setSel(d.i)} style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: on ? C.blueL : 'transparent', opacity: d.future ? 0.45 : 1 }}>
                <T style={{ fontSize: 14, color: d.today ? C.blueD : C.sub, fontWeight: '700' }}>{d.short}</T>
                <View style={{ width: 34, height: 34, borderRadius: 17, marginTop: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: full ? C.green : xp > 0 ? C.goldL : C.soft, borderWidth: d.today ? 3 : 0, borderColor: C.blue }}>
                  {full ? <Icon name="check" size={24} mono="#fff" /> : xp > 0 ? <Icon name="flame" size={20} /> : null}
                </View>
                <T style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{d.date.split(' ')[0]}</T>
              </Tap>
            );
          })}
        </View>
        <View style={{ marginTop: 8, backgroundColor: C.soft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 }}>
          <T style={{ fontWeight: '700', fontSize: 15, color: C.navy }}>{sd.full}, {sd.date}{sd.today ? ' (hari ini)' : ''}</T>
          <T style={{ fontSize: 14, color: C.sub }}>{info}</T>
        </View>
      </View>
      </Reveal>
      <T style={{ color: C.sub, fontSize: 14, marginBottom: 20, lineHeight: 20 }}>Lingkaran hijau = target {GOAL} XP tercapai. Api = kamu belajar hari itu (membaca dan menonton juga dihitung). Belajar sedikit tiap hari lebih ampuh daripada sekali banyak.</T>

      <T style={{ fontWeight: '700', fontSize: 21, marginBottom: 4 }}>Misi harian</T>
      <T style={{ color: C.sub, marginBottom: 12, lineHeight: 22 }}>Empat kebiasaan belajar, urut seperti cara {`Bubo`} membimbing: Input, Elaborasi, Output, Refleksi. Klaim keempatnya: bonus +{RHYTHM_BONUS} XP dan semua hati terisi penuh.</T>
      {QUESTS.map((q, qi) => {
        const v = Math.min(q.goal, q.get(state.daily)); const done = v >= q.goal; const got = state.claimed[q.id];
        const ph = RMT_PHASES[q.phase];
        return (
          <Reveal key={q.id} i={qi + 2}>
          <Card style={got ? { backgroundColor: C.greenL, borderColor: C.green } : done ? { borderColor: C.gold, backgroundColor: C.goldL } : null}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ backgroundColor: ph.color, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                <T style={{ color: C.navy, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>{ph.label}</T>
              </View>
              <T style={{ color: C.sub, fontSize: 14, marginLeft: 8, flex: 1 }}>{q.why}</T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: got ? C.green : done ? C.gold : C.line, marginRight: 12 }}>
                <Icon name={got ? 'check' : q.icon} size={36} live={done && !got} onPress={() => {}} />
                {boom && boom.id === q.id ? <Burst key={boom.n} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontWeight: '700', fontSize: 18, lineHeight: 23 }}>{q.t}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Bar value={v / q.goal} color={got || done ? C.green : C.blue} height={14} />
                  <T style={{ marginLeft: 10, fontSize: 15, color: C.sub, fontWeight: '700' }}>{v}/{q.goal}</T>
                </View>
              </View>
            </View>
            {done && !got ? <Btn small icon="gem" label={`KLAIM +${QUEST_REWARD} XP`} onPress={() => { sfx('claim'); setBoom({ id: q.id, n: Date.now() }); onClaim(q.id); }} style={{ marginTop: 12 }} /> : null}
            {!done && onGo ? <Btn small color="white" label="KERJAKAN SEKARANG" onPress={() => onGo(q.go)} style={{ marginTop: 12 }} /> : null}
            {got ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}><T style={{ color: C.greenT, fontWeight: '700' }}>Hadiah sudah diklaim</T></View> : null}
          </Card>
          </Reveal>
        );
      })}
      {allClaimed ? <T style={{ color: C.greenT, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Ritme belajar hari ini lengkap. Hebat!</T> : null}

      <T style={{ fontWeight: '700', fontSize: 21, marginTop: 8, marginBottom: 4 }}>Dari mana XP berasal?</T>
      <T style={{ color: C.sub, marginBottom: 10, lineHeight: 22 }}>XP bukan skor ujian. XP adalah tanda usaha belajarmu, dan didapat dari kebiasaan belajar yang baik, bukan hanya dari menjawab soal.</T>
      {XP_SOURCES.map((x) => (
        <Tap key={x.t} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Icon name={x.icon} size={34} onPress={() => {}} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ fontWeight: '700', fontSize: 16 }}>{x.t}</T>
            <T style={{ color: C.sub, fontSize: 14 }}>{x.v} · {x.why}</T>
          </View>
        </Tap>
      ))}

      <Card style={{ backgroundColor: C.soft, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}><Icon name="heart" size={26} /><T style={{ fontWeight: '700', fontSize: 17, marginLeft: 8 }}>Untuk apa hati?</T></View>
        <T style={{ color: C.sub, fontSize: 15, lineHeight: 22 }}>Hati adalah kesempatan berpikir. Hati berkurang bila menjawab salah di pelajaran, supaya kamu tidak asal menebak. Kalau habis, jangan hanya menunggu: baca satu topik materi (+1 hati) atau berlatih (+1 hati) lalu coba lagi dengan pemahaman baru.</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 }}><Icon name="flame" size={26} /><T style={{ fontWeight: '700', fontSize: 17, marginLeft: 8 }}>Untuk apa runtutan?</T></View>
        <T style={{ color: C.sub, fontSize: 15, lineHeight: 22 }}>Otak mengingat lebih lama bila belajar dicicil. Runtutan mengingatkanmu belajar sedikit tapi rutin, bukan menumpuk sebelum ulangan.</T>
      </Card>

      <T style={{ fontWeight: '700', fontSize: 21, marginTop: 14, marginBottom: 4 }}>Lencana ({earned}/{BADGES.length})</T>
      <T style={{ color: C.sub, marginBottom: 10 }}>Tiap lencana menandai kemampuan atau kebiasaan belajar yang nyata.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {BADGES.map((b, bi) => {
          const got = !!state.badges[b.id];
          return (
            <Reveal key={b.id} i={Math.floor(bi / 2)} step={40} style={{ width: '50%' }}>
            <Tap scaleTo={0.94} sound={got ? 'badge' : 'tap'} style={{ padding: 4 }}>
              <View style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: got ? C.gold : C.line, backgroundColor: got ? C.goldL : C.soft, borderRadius: 18, padding: 12, alignItems: 'center', minHeight: 150 }}>
                <Icon name={b.icon} size={48} dim={!got} live={got} onPress={() => {}} />
                <T style={{ fontWeight: '700', fontSize: 16, textAlign: 'center', color: got ? C.goldD : C.sub }}>{b.t}</T>
                <T style={{ fontSize: 13, textAlign: 'center', color: C.sub }}>{b.d}</T>
                {got ? <T style={{ fontSize: 13, textAlign: 'center', color: C.goldD, marginTop: 4 }}>{b.m}</T> : null}
              </View>
            </Tap>
            </Reveal>
          );
        })}
      </View>
    </ScrollView>
  );
}
