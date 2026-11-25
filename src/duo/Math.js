import React, { memo } from 'react';
import { View } from 'react-native';
import { T } from './ui';
import { C } from './theme';

// Penulisan rumus bergaya buku matematika (tanpa library tambahan).
//
// Sintaks mini:
//   [pembilang|penyebut]   pecahan bersusun (boleh bersarang)      [y|x]
//   x_1  atau  x_(12)       indeks bawah                           x_1
//   x^2  atau  x^(n+1)      pangkat                                x^2
//   huruf tunggal (a, b, x, y, k) otomatis miring seperti variabel
//   kata (total, jarak, km/jam) tetap tegak
//
//   <M size={22}>{'y_2 = [y_1 × x_2|x_1]'}</M>     satu rumus
//   <Rich size={20}>{'Rumus: $y = k × x$, dengan $k = [y|x]$.'}</Rich>   teks dengan rumus di tengahnya
//   plain('y_2 = [y_1|x_1]')  ->  'y₂ = y₁ ÷ x₁'   (untuk dibagikan sebagai teks biasa)

const OPS = '×÷=−+:→≈<>≤≥±·';
const cache = new Map();

function parse(src) {
  let i = 0;
  const read = (stop) => {
    const out = [];
    while (i < src.length) {
      const ch = src[i];
      if (stop && ch === stop) break;
      if (ch === ' ') { if (out.length) out[out.length - 1].sp = true; i += 1; continue; }
      if (ch === '[') {
        i += 1; const num = read('|'); i += 1; const den = read(']'); i += 1;
        out.push({ k: 'frac', num, den }); continue;
      }
      if (ch === '_' || ch === '^') {
        i += 1;
        let inner;
        if (src[i] === '(') { i += 1; inner = read(')'); i += 1; } else {
          const m = /^[A-Za-z0-9]+/.exec(src.slice(i)); const s = m ? m[0] : '';
          i += s.length; inner = [{ k: 't', s }];
        }
        out.push({ k: ch === '_' ? 'sub' : 'sup', inner }); continue;
      }
      if (OPS.includes(ch)) { out.push({ k: 'op', s: ch }); i += 1; continue; }
      const m = /^[A-Za-zÀ-ÿ]+(?:\/[A-Za-z]+)?|^[0-9][0-9.,]*[0-9]|^[0-9]|^[\s\S]/.exec(src.slice(i));
      const s = m[0]; i += s.length;
      out.push(/^[A-Za-z]$/.test(s) ? { k: 'var', s } : { k: 't', s });
    }
    return out;
  };
  return read(null);
}
const parsed = (src) => { let p = cache.get(src); if (!p) { p = parse(src); cache.set(src, p); } return p; };

function Atom({ a, next, size, color, bold }) {
  const gap = a.sp && !(next && next.k === 'op') && a.k !== 'op' ? Math.round(size * 0.22) : 0;
  const ts = { fontSize: size, lineHeight: Math.round(size * 1.3), color, fontWeight: bold ? '700' : '400' };
  switch (a.k) {
    case 'var': return <View style={{ transform: [{ skewX: '-12deg' }], marginRight: gap + 1, marginLeft: 1 }}><T math style={ts}>{a.s}</T></View>;
    case 'op': return <T math style={[ts, { marginHorizontal: Math.round(size * (a.s === ':' ? 0.2 : 0.28)) }]}>{a.s}</T>;
    case 'sub':
    case 'sup': {
      const s = Math.round(size * 0.64);
      return <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: gap, transform: [{ translateY: a.k === 'sub' ? size * 0.26 : -size * 0.4 }] }}><Row list={a.inner} size={s} color={color} bold={bold} /></View>;
    }
    case 'frac': {
      const s = Math.round(size * 0.92);
      return (
        <View style={{ alignItems: 'center', marginHorizontal: Math.round(size * 0.16) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 3 }}><Row list={a.num} size={s} color={color} bold={bold} /></View>
          <View style={{ alignSelf: 'stretch', height: Math.max(1.5, size * 0.07), borderRadius: 1, backgroundColor: color, marginVertical: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 3 }}><Row list={a.den} size={s} color={color} bold={bold} /></View>
        </View>
      );
    }
    default: return <T math style={[ts, { marginRight: gap }]}>{a.s}</T>;
  }
}

function Row({ list, size, color, bold }) {
  return list.map((a, i) => <Atom key={i} a={a} next={list[i + 1]} size={size} color={color} bold={bold} />);
}

// Satu rumus. Bila terlalu lebar, baris dipatah antar-bagian (tidak terpotong).
export const M = memo(function M({ children, size = 22, color = C.navy, bold = true, align = 'center', style }) {
  const list = parsed(String(children));
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : 'center' }, style]}>
      <Row list={list} size={size} color={color} bold={bold} />
    </View>
  );
});

// Teks biasa dengan rumus di antara tanda $ ... $
export const Rich = memo(function Rich({ children, size = 20, color = C.ink, lineHeight, style }) {
  const s = String(children);
  const lh = lineHeight || Math.round(size * 1.45);
  if (!s.includes('$')) return <T style={[{ fontSize: size, lineHeight: lh, color }, style]}>{s}</T>;
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, style]}>
      {s.split('$').map((part, i) => (i % 2
        ? <M key={i} size={size} color={color} bold={false} style={{ marginHorizontal: 2 }}>{part}</M>
        : part.split(' ').filter(Boolean).map((w, j) => <T key={`${i}-${j}`} style={{ fontSize: size, lineHeight: lh, color }}>{`${w} `}</T>)))}
    </View>
  );
});

// Versi teks polos (untuk Bagikan / salin)
const SUBS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function plain(src) {
  let t = String(src).replace(/\$/g, '');
  const wrap = (x) => (/^[\w.,]+$/.test(x.trim()) ? x.trim() : `(${x.trim()})`);
  let prev;
  do { prev = t; t = t.replace(/\[([^[\]|]*)\|([^[\]]*)\]/g, (_, a, b) => `${wrap(a)} ÷ ${wrap(b)}`); } while (t !== prev);
  t = t.replace(/_\(([^)]*)\)|_([A-Za-z0-9]+)/g, (_, a, b) => { const x = a || b; return /^\d+$/.test(x) ? x.replace(/\d/g, (d) => SUBS[d]) : `_${x}`; });
  t = t.replace(/\^\(([^)]*)\)|\^([A-Za-z0-9]+)/g, (_, a, b) => { const x = a || b; return /^\d+$/.test(x) ? x.replace(/\d/g, (d) => SUPS[d]) : `^${x}`; });
  return t;
}

export default M;
