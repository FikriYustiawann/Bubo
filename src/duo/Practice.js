import React from 'react';
import { ScrollView, View } from 'react-native';
import Owl from './Owl';
import Icon from './Icon';
import { Card, CountUp, Reveal, T, Tap } from './ui';
import { C } from './theme';
import { buildPractice } from './engine';
import { MAX_HEARTS, heartsNow } from './state';
import { MASCOT } from './brand';
import { sfx } from './sound';

const MODES = [
  { key: 'senilai', title: 'Senilai', sub: 'Harga, bensin, resep, upah', icon: 'bolt', color: C.blue, edge: C.blueD },
  { key: 'berbalik', title: 'Berbalik nilai', sub: 'Pekerja, laju, persediaan, patungan', icon: 'repeat', color: C.purple, edge: C.purpleD },
  { key: 'campur', title: 'Campuran', sub: 'Semua jenis, termasuk membedakan', icon: 'dice', color: C.orange, edge: C.orangeD },
];

// Kartu mode latihan: warna penuh, kilap, lingkaran hias, ikon hidup
function ModeCard({ icon, title, sub, color, edge, onPress, disabled, tag }) {
  return (
    <Tap disabled={disabled} scaleTo={0.96} sound={null} onPress={() => { sfx('start'); onPress(); }} style={{ opacity: disabled ? 0.5 : 1, backgroundColor: color, borderBottomWidth: 6, borderBottomColor: edge, borderRadius: 22, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <View pointerEvents="none" style={{ position: 'absolute', right: -24, top: -34, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.13)' }} />
        <View pointerEvents="none" style={{ position: 'absolute', left: 34, right: 70, top: 5, height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 7, marginRight: 14, borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.12)' }}><Icon name={icon} size={42} live={!disabled} /></View>
        <View style={{ flex: 1 }}>
          {tag ? <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1, marginBottom: 3 }}><T style={{ color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>{tag}</T></View> : null}
          <T style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>{title}</T>
          <T style={{ color: '#fff', fontSize: 15, opacity: 0.95, lineHeight: 20 }}>{sub}</T>
        </View>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
          <T style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginTop: -2 }}>›</T>
        </View>
      </View>
    </Tap>
  );
}

// Latihan tanpa batas: soal selalu baru, tanpa risiko hati. Selesai satu sesi = +1 hati.
export default function Practice({ state, onStart }) {
  const h = heartsNow(state.hearts);
  const acc = state.stats.total ? Math.round((state.stats.ok / state.stats.total) * 100) : 0;
  const start = (m) => onStart({ id: 'p-' + m.key, title: m.title, mode: 'practice', build: (seed) => buildPractice(m.key, state.wrong, seed) });
  const nWrong = state.wrong.length;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Reveal>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Owl size={72} mood="think" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T style={{ fontWeight: '700', fontSize: 26 }}>Latihan</T>
            <T style={{ color: C.sub, fontSize: 15, lineHeight: 21 }}>Soal selalu baru dan tanpa risiko hati. Satu sesi selesai = +1 hati.</T>
          </View>
        </View>
      </Reveal>

      <Reveal i={1}>
        <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 14 }}>
          {[
            { icon: 'heart', bg: C.redL, fg: C.redT, v: h.n, of: MAX_HEARTS, l: 'Hati' },
            { icon: 'target', bg: C.greenL, fg: C.greenT, v: acc, suf: '%', l: 'Ketepatan' },
            { icon: 'calc', bg: C.blueL, fg: C.blueD, v: state.stats.total, l: 'Soal dijawab' },
          ].map((x) => (
            <View key={x.l} style={{ flex: 1, backgroundColor: x.bg, borderRadius: 18, padding: 10, marginHorizontal: 4, alignItems: 'center' }}>
              <Icon name={x.icon} size={26} onPress={() => {}} />
              <CountUp v={x.v} suf={x.suf} of={x.of} style={{ fontWeight: '700', fontSize: 21, color: x.fg, marginTop: 2 }} />
              <T style={{ color: x.fg, fontSize: 12, opacity: 0.85 }}>{x.l}</T>
            </View>
          ))}
        </View>
      </Reveal>

      {MODES.map((m, i) => (
        <Reveal key={m.key} i={i + 2} style={{ marginBottom: 14 }}>
          <ModeCard icon={m.icon} title={m.title} sub={m.sub} color={m.color} edge={m.edge} onPress={() => start(m)} />
        </Reveal>
      ))}

      <Reveal i={5}>
        <ModeCard icon="bandage" title="Dari kesalahanku" tag={nWrong ? `${nWrong} SOAL` : null}
          sub={nWrong ? 'Dibuat ulang dengan angka baru. Tiap yang berhasil +2 XP' : `Belum ada kesalahan. ${MASCOT} bangga padamu!`} color={C.red} edge={C.redD} disabled={!nWrong}
          onPress={() => onStart({ id: 'p-salah', title: 'Dari kesalahanku', mode: 'practice', build: (seed) => buildPractice('salah', state.wrong, seed) })} />
      </Reveal>

      <Reveal i={6}>
        <Card style={{ marginTop: 18, backgroundColor: C.soft, flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="bulb" size={30} live />
          <T style={{ flex: 1, marginLeft: 10, color: C.sub, fontSize: 14, lineHeight: 20 }}>Tips: ketik jawabanmu dulu, baru buka PETUNJUK. Petunjuk 1 hanya memberi arah berpikir, bukan hasilnya.</T>
        </Card>
      </Reveal>
    </ScrollView>
  );
}
