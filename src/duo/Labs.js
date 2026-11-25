import React, { useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SText } from 'react-native-svg';
import Icon, { Stars } from './Icon';
import { Bar, Btn, PopIn, Reveal, T } from './ui';
import { C, fonts } from './theme';
import { M, Rich } from './Math';
import { fmt } from './engine';
import { GAME } from './materiData';
import { sfx } from './sound';

const Box = ({ children, color = C.line, style }) => (
  <View style={[{ borderWidth: 2, borderBottomWidth: 4, borderColor: color, borderRadius: 18, padding: 14, marginVertical: 12, backgroundColor: '#fff' }, style]}>{children}</View>
);

const Round = ({ label, onPress, disabled, color = C.blue }) => (
  <Pressable disabled={disabled} onPress={() => { sfx('step'); onPress(); }} style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 23, backgroundColor: disabled ? '#E5E7EB' : color, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, transform: [{ scale: pressed ? 0.9 : 1 }] })}>
    <T style={{ color: '#fff', fontWeight: '700', fontSize: 26, lineHeight: 30 }}>{label}</T>
  </Pressable>
);

const Chip = ({ label, on, onPress, color = C.blue }) => (
  <Pressable onPress={() => { sfx('tap'); onPress(); }} style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: on ? color : C.line, backgroundColor: on ? C.blueL : '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
    <T style={{ fontWeight: '700', fontSize: 15, color: on ? C.navy : C.sub }}>{label}</T>
  </Pressable>
);

// Grafik sederhana: titik-titik data, satu titik disorot dengan garis bantu putus-putus
function Graph({ pointsFn, xs, xMax, yMax, sel, color, line, xLabel, yLabel }) {
  const X0 = 40, Y0 = 164, W = 250, H = 148;
  const px = (x) => X0 + (x / xMax) * W;
  const py = (y) => Y0 - (y / yMax) * H;
  const d = line.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(' ');
  const s = sel;
  return (
    <Svg width="100%" height={200} viewBox="0 0 300 200">
      <Line x1={X0} y1={Y0} x2={X0 + W + 6} y2={Y0} stroke="#94A3B8" strokeWidth="2" />
      <Line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 8} stroke="#94A3B8" strokeWidth="2" />
      {[0, 0.5, 1].map((t) => <Line key={t} x1={X0} y1={py(yMax * t)} x2={X0 + W} y2={py(yMax * t)} stroke="#E2E8F0" strokeWidth="1" />)}
      <Path d={d} stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x) => <Circle key={x} cx={px(x)} cy={py(pointsFn(x))} r="3.5" fill={color} opacity="0.55" />)}
      <Line x1={px(s.x)} y1={py(s.y)} x2={px(s.x)} y2={Y0} stroke={color} strokeWidth="1.8" strokeDasharray="4 4" />
      <Line x1={X0} y1={py(s.y)} x2={px(s.x)} y2={py(s.y)} stroke={color} strokeWidth="1.8" strokeDasharray="4 4" />
      <Circle cx={px(s.x)} cy={py(s.y)} r="8" fill="#fff" stroke={color} strokeWidth="4" />
      <SText x={X0 + W / 2} y="195" fontSize="13" fill="#64748B" textAnchor="middle" fontFamily={fonts.r}>{xLabel}</SText>
      <SText x={X0 - 6} y={Y0 + 14} fontSize="12" fill="#64748B" textAnchor="end" fontFamily={fonts.r}>0</SText>
      <SText x={X0 - 6} y={py(yMax) + 4} fontSize="12" fill="#64748B" textAnchor="end" fontFamily={fonts.r}>{yLabel}</SText>
      <SText x={px(s.x)} y={Y0 + 14} fontSize="12" fill={color} textAnchor="middle" fontWeight="bold" fontFamily={fonts.b}>{s.x}</SText>
    </Svg>
  );
}

// ---------- Lab senilai ----------
export function LabSenilai() {
  const [qty, setQty] = useState(2);
  const [ki, setKi] = useState(1);
  const [msg, setMsg] = useState('');
  const K = [3000, 5000, 8000][ki];
  const y = qty * K;
  const set = (n) => { setQty(Math.max(1, Math.min(10, n))); setMsg(''); };
  const dbl = () => { if (qty * 2 <= 10) { setMsg(`Buku ${qty} menjadi ${qty * 2} (2×), harga Rp${fmt(y)} menjadi Rp${fmt(y * 2)} (juga 2×). Itu ciri senilai.`); setQty(qty * 2); } };
  const line = [[0, 0], [10, K * 10]];
  return (
    <Box color={C.blue}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name="flask" size={30} live />
        <T style={{ fontWeight: '700', fontSize: 19, marginLeft: 10 }}>Lab Senilai</T>
      </View>
      <T style={{ color: C.sub, fontSize: 15, marginBottom: 8 }}>Harga satu buku:</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[3000, 5000, 8000].map((v, i) => <Chip key={v} label={`Rp${fmt(v)}`} on={ki === i} onPress={() => { setKi(i); setMsg(''); }} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', minHeight: 70, marginVertical: 6 }}>
        {Array.from({ length: qty }, (_, i) => <PopIn key={i}><Icon name="book" size={30} onPress={() => {}} style={{ margin: 3 }} /></PopIn>)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
        <Round label="-" onPress={() => set(qty - 1)} disabled={qty <= 1} />
        <View style={{ alignItems: 'center', minWidth: 110 }}>
          <PopIn key={qty}><T style={{ fontWeight: '700', fontSize: 32, color: C.blueD }}>{qty}</T></PopIn>
          <T style={{ color: C.sub, fontSize: 14 }}>buku (x)</T>
        </View>
        <Round label="+" onPress={() => set(qty + 1)} disabled={qty >= 10} />
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: C.blueL, borderRadius: 14, padding: 12, justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}><T style={{ color: C.sub, fontSize: 13 }}>Harga (y)</T><PopIn key={y}><T style={{ fontWeight: '700', fontSize: 20 }}>Rp{fmt(y)}</T></PopIn></View>
        <View style={{ alignItems: 'center' }}><M size={17} color={C.sub} bold={false}>[y|x]</M><T style={{ fontWeight: '700', fontSize: 20, color: C.greenT }}>{fmt(K)}</T></View>
      </View>
      <Rich size={15} color={C.sub} style={{ justifyContent: 'center', marginTop: 6 }}>{'Berapa pun $x$, $[y|x]$ tetap sama.'}</Rich>
      <Graph pointsFn={(x) => x * K} xs={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} xMax={10} yMax={K * 10} sel={{ x: qty, y }} color={C.blue} line={line} xLabel="banyak buku (x)" yLabel={`${fmt(K * 10 / 1000)}rb`} />
      <T style={{ color: C.sub, fontSize: 14, textAlign: 'center' }}>Garis lurus yang melewati titik 0 adalah ciri grafik senilai.</T>
      <Btn small label="UJI 2 KALI LIPAT" color="blue" disabled={qty * 2 > 10} onPress={dbl} style={{ marginTop: 12 }} />
      {msg ? <Reveal key={msg} dy={8} ms={260}><View style={{ backgroundColor: C.greenL, borderRadius: 14, padding: 12, marginTop: 10 }}><T style={{ color: C.greenT, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>{msg}</T></View></Reveal> : null}
    </Box>
  );
}

// ---------- Lab berbalik ----------
const WORKERS = [1, 2, 3, 4, 6, 8, 12];
const TOTAL = 48;

export function LabBerbalik() {
  const [wi, setWi] = useState(2);
  const [msg, setMsg] = useState('');
  const w = WORKERS[wi];
  const days = TOTAL / w;
  const move = (n) => { setWi(Math.max(0, Math.min(WORKERS.length - 1, n))); setMsg(''); };
  const dbl = () => { const j = WORKERS.indexOf(w * 2); if (j >= 0) { setMsg(`Pekerja ${w} menjadi ${w * 2} (2×), hari ${days} menjadi ${days / 2} (½×). Itu ciri berbalik nilai.`); setWi(j); } };
  const curve = useMemo(() => Array.from({ length: 45 }, (_, i) => { const x = 1 + (i * 11) / 44; return [x, TOTAL / x]; }), []);
  const canDbl = WORKERS.indexOf(w * 2) >= 0;
  return (
    <Box color={C.purple}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name="flask" size={30} live />
        <T style={{ fontWeight: '700', fontSize: 19, marginLeft: 10 }}>Lab Berbalik Nilai</T>
      </View>
      <T style={{ color: C.sub, fontSize: 15, marginBottom: 8 }}>Satu gedung perlu {TOTAL} pekerja-hari. Tambah pekerja, lihat hari yang dibutuhkan.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', minHeight: 40 }}>
        {Array.from({ length: w }, (_, i) => <PopIn key={i}><Icon name="worker" size={30} onPress={() => {}} style={{ margin: 2 }} /></PopIn>)}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
        <Round label="-" color={C.purpleD} onPress={() => move(wi - 1)} disabled={wi <= 0} />
        <View style={{ alignItems: 'center', minWidth: 110 }}>
          <PopIn key={w}><T style={{ fontWeight: '700', fontSize: 32, color: C.purpleD }}>{w}</T></PopIn>
          <T style={{ color: C.sub, fontSize: 14 }}>pekerja (x)</T>
        </View>
        <Round label="+" color={C.purpleD} onPress={() => move(wi + 1)} disabled={wi >= WORKERS.length - 1} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <T style={{ color: C.sub, fontSize: 14, width: 44 }}>Hari</T>
        <Bar value={days / TOTAL} color={C.purple} height={18} />
        <T style={{ fontWeight: '700', marginLeft: 10, width: 28, textAlign: 'right' }}>{days}</T>
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: '#F6EBFF', borderRadius: 14, padding: 12, justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}><T style={{ color: C.sub, fontSize: 13 }}>Hari (y)</T><PopIn key={days}><T style={{ fontWeight: '700', fontSize: 20 }}>{days}</T></PopIn></View>
        <View style={{ alignItems: 'center' }}><M size={16} color={C.sub} bold={false}>x × y</M><T style={{ fontWeight: '700', fontSize: 20, color: C.greenT }}>{w} × {days} = {TOTAL}</T></View>
      </View>
      <Rich size={15} color={C.sub} style={{ justifyContent: 'center', marginTop: 6 }}>{`Berapa pun $x$, hasil $x × y$ tetap ${TOTAL}.`}</Rich>
      <Graph pointsFn={(x) => TOTAL / x} xs={WORKERS} xMax={12} yMax={TOTAL} sel={{ x: w, y: days }} color={C.purpleD} line={curve} xLabel="banyak pekerja (x)" yLabel="48" />
      <T style={{ color: C.sub, fontSize: 14, textAlign: 'center' }}>Garis melengkung turun adalah ciri grafik berbalik nilai.</T>
      <Btn small label="UJI 2 KALI LIPAT" color="blue" disabled={!canDbl} onPress={dbl} style={{ marginTop: 12 }} />
      {msg ? <Reveal key={msg} dy={8} ms={260}><View style={{ backgroundColor: '#F6EBFF', borderRadius: 14, padding: 12, marginTop: 10 }}><T style={{ color: C.purpleD, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>{msg}</T></View></Reveal> : null}
    </Box>
  );
}

// ---------- Permainan tebak jenis ----------
const OPT = [{ k: 's', l: 'Senilai' }, { k: 'b', l: 'Berbalik nilai' }, { k: 'n', l: 'Bukan keduanya' }];

export function GameJenis() {
  const mk = () => [...GAME].sort(() => Math.random() - 0.5).slice(0, 6);
  const [deck, setDeck] = useState(mk);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const fin = useRef(false);
  const done = i >= deck.length;
  const cur = deck[i];
  const ok = pick && pick === cur.a;
  const again = () => { fin.current = false; setDeck(mk()); setI(0); setPick(null); setScore(0); };
  if (done && !fin.current) { fin.current = true; sfx('finish'); }
  if (done) {
    const st = score >= deck.length ? 3 : score >= deck.length - 2 ? 2 : score >= 2 ? 1 : 0;
    return (
      <Box color={C.orange} style={{ alignItems: 'center' }}>
        <Icon name="trophy" size={64} live />
        <T style={{ fontWeight: '700', fontSize: 22, marginTop: 8 }}>Skor {score}/{deck.length}</T>
        <Stars n={st} size={30} style={{ marginVertical: 8 }} />
        <Btn label="MAIN LAGI" onPress={again} style={{ alignSelf: 'stretch' }} />
      </Box>
    );
  }
  return (
    <Box color={C.orange}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon name="dice" size={30} live />
        <T style={{ fontWeight: '700', fontSize: 19, marginLeft: 10, flex: 1 }}>Tebak jenisnya</T>
        <T style={{ color: C.sub, fontSize: 15, fontWeight: '700' }}>{i + 1}/{deck.length}</T>
      </View>
      <View style={{ marginBottom: 12 }}><Bar value={i / deck.length} color={C.orange} height={10} /></View>
      <Reveal key={`q${i}`} dy={10} ms={260}><T style={{ fontSize: 19, lineHeight: 27, marginBottom: 12 }}>{cur.q}</T></Reveal>
      {OPT.map((o, oi) => {
        const chosen = pick === o.k; const right = pick && o.k === cur.a;
        return (
          <Reveal key={`${i}-${o.k}`} i={oi} step={55} dy={10}>
          <Pressable disabled={!!pick} onPress={() => { setPick(o.k); sfx(o.k === cur.a ? 'correct' : 'wrong'); if (o.k === cur.a) setScore((s) => s + 1); }}
            style={{ borderWidth: 2, borderBottomWidth: 4, borderRadius: 14, padding: 12, marginBottom: 8, borderColor: right ? C.green : chosen ? C.red : C.line, backgroundColor: right ? C.greenL : chosen ? C.redL : '#fff', flexDirection: 'row', alignItems: 'center' }}>
            <T style={{ fontWeight: '700', flex: 1, color: right ? C.greenT : chosen ? C.redT : C.ink }}>{o.l}</T>
            {right ? <Icon name="check" size={24} pop={pick} /> : null}
          </Pressable>
          </Reveal>
        );
      })}
      {pick ? (
        <PopIn key={`f${i}`} style={{ marginTop: 4 }}>
        <View style={{ backgroundColor: ok ? C.greenL : C.goldL, borderRadius: 16, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Icon name={ok ? 'party' : 'bulb'} size={26} pop={pick} />
            <T style={{ fontWeight: '700', marginLeft: 8, color: ok ? C.greenT : C.goldD }}>{ok ? 'Tepat sekali!' : 'Belum tepat, ini alasannya'}</T>
          </View>
          <T style={{ fontSize: 16, lineHeight: 23 }}>{cur.why}</T>
          <Btn small label="LANJUT" onPress={() => { setI(i + 1); setPick(null); }} style={{ marginTop: 10 }} />
        </View>
        </PopIn>
      ) : null}
    </Box>
  );
}
