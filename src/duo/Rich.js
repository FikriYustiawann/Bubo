import React, { memo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { T } from './ui';
import { C, useScale } from './theme';

// Penampil teks balasan AI: **tebal**, *miring*, `kode`, daftar, judul, dan tabel sederhana
// ditampilkan rapi secara otomatis, sehingga tanda ** tidak pernah muncul mentah di layar.

// Rapikan sisa notasi LaTeX yang kadang terselip dari model.
export function tidy(input) {
  let s = String(input || '');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/\\\[|\\\]|\\\(|\\\)/g, '');
  s = s.replace(/\$\$/g, '');
  s = s.replace(/\$([^$\n]{1,120})\$/g, '$1');
  s = s.replace(/\\(?:text|mathrm|mathbf)\{([^}]*)\}/g, '$1');
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  s = s.replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/\\div/g, '÷');
  s = s.replace(/\\(?:Rightarrow|implies)/g, '⇒').replace(/\\(?:rightarrow|to)\b/g, '→');
  s = s.replace(/\\neq\b/g, '≠').replace(/\\leq?\b/g, '≤').replace(/\\geq?\b/g, '≥').replace(/\\approx\b/g, '≈');
  s = s.replace(/\\%/g, '%').replace(/\\[,;!]/g, ' ');
  return s;
}

const INLINE = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+`|\*[^*\s](?:[^*\n]*?[^*\s])?\*)/g;

function inline(str, size, color, kp) {
  const out = [];
  let last = 0, m, n = 0;
  INLINE.lastIndex = 0;
  const plain = (t) => t.replace(/\*\*/g, '');
  while ((m = INLINE.exec(str)) !== null) {
    if (m.index > last) out.push(plain(str.slice(last, m.index)));
    const tok = m[0];
    const k = `${kp}-${n++}`;
    if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<T key={k} style={{ fontWeight: '700', fontSize: size, color }}>{plain(tok.slice(2, -2))}</T>);
    } else if (tok.startsWith('`')) {
      out.push(<T key={k} style={{ fontSize: size - 1, color: C.navy, backgroundColor: '#EEF2F8' }}>{` ${tok.slice(1, -1)} `}</T>);
    } else {
      out.push(<T key={k} style={{ fontStyle: 'italic', fontSize: size, color }}>{tok.slice(1, -1)}</T>);
    }
    last = m.index + tok.length;
  }
  if (last < str.length) out.push(plain(str.slice(last)));
  return out;
}

const cells = (ln) => ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const isSep = (ln) => /^\s*\|?[\s:|-]+\|?\s*$/.test(ln) && ln.includes('-');
const isRow = (ln) => (ln.match(/\|/g) || []).length >= 2;

function parse(text) {
  const lines = tidy(text).split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) { if (blocks.length && blocks[blocks.length - 1].k !== 'gap') blocks.push({ k: 'gap' }); i++; continue; }
    if (isRow(ln)) {
      const rows = [];
      while (i < lines.length && isRow(lines[i])) { if (!isSep(lines[i])) rows.push(cells(lines[i])); i++; }
      if (rows.length) blocks.push({ k: 'table', rows });
      continue;
    }
    const h = /^\s{0,3}#{1,6}\s+(.*)$/.exec(ln);
    if (h) { blocks.push({ k: 'h', t: h[1] }); i++; continue; }
    const b = /^\s*[-*•]\s+(.*)$/.exec(ln);
    if (b) { blocks.push({ k: 'li', mark: '•', t: b[1] }); i++; continue; }
    const nn = /^\s*(\d+)[.)]\s+(.*)$/.exec(ln);
    if (nn) { blocks.push({ k: 'li', mark: `${nn[1]}.`, t: nn[2] }); i++; continue; }
    blocks.push({ k: 'p', t: ln.trim() }); i++;
  }
  while (blocks.length && blocks[blocks.length - 1].k === 'gap') blocks.pop();
  return blocks;
}


// Tabel balasan AI: lebar kolom menyesuaikan isi; bila tabel lebih lebar dari layar, bisa digeser ke samping
// (tidak lagi dijepit sampai teks terpotong-potong). Bila muat, kolom dilebarkan agar memenuhi lebar.
const plain = (t) => String(t || '').replace(/\*\*|__|`/g, '').replace(/\*/g, '');
function Table({ rows, size, color, kp }) {
  const sc = useScale();
  const [avail, setAvail] = useState(0);
  const fs = Math.max(13, size - 4);
  const n = Math.max(...rows.map((r) => r.length), 1);
  let widths = Array.from({ length: n }, (_, ci) => {
    const longest = Math.max(...rows.map((r) => plain(r[ci]).length), 3);
    const longestWord = Math.max(...rows.map((r) => Math.max(...plain(r[ci]).split(/\s+/).map((w) => w.length), 1)));
    const want = Math.min(longest, 26) * fs * 0.5 * sc + 20;      // kolom lebar sampai ~26 huruf lalu teks turun baris
    const least = longestWord * fs * 0.52 * sc + 20;               // satu kata utuh tidak boleh terpotong
    return Math.min(210, Math.max(want, least, 56));
  });
  const total = widths.reduce((a, b) => a + b, 0);
  if (avail > 0 && total < avail) widths = widths.map((w) => (w * (avail - 4)) / total);
  const wide = avail > 0 && total > avail;
  return (
    <View onLayout={(e) => setAvail(Math.round(e.nativeEvent.layout.width))} style={{ borderWidth: 1.5, borderColor: C.line, borderRadius: 10, overflow: 'hidden', marginVertical: 4 }}>
      <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={wide} removeClippedSubviews={false}>
        <View>
          {rows.map((r, ri) => (
            <View key={ri} style={{ flexDirection: 'row', backgroundColor: ri === 0 ? C.soft : '#fff', borderTopWidth: ri ? 1.5 : 0, borderTopColor: C.line }}>
              {widths.map((w, ci) => (
                <View key={ci} style={{ width: w, paddingVertical: 6, paddingHorizontal: 8, borderLeftWidth: ci ? 1.5 : 0, borderLeftColor: C.line }}>
                  <T selectable style={{ fontSize: fs, lineHeight: Math.round(fs * 1.35), fontWeight: ri === 0 ? '700' : 'normal', color }}>{inline(r[ci] || '', fs, color, `${kp}-${ri}-${ci}`)}</T>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {wide ? <T style={{ fontSize: 12, color: C.sub, textAlign: 'right', paddingHorizontal: 8, paddingBottom: 4 }}>geser ke samping ›</T> : null}
    </View>
  );
}

function Rich({ text, size = 18, color = C.ink }) {
  const lh = Math.round(size * 1.5);
  const blocks = parse(text);
  return (
    <View>
      {blocks.map((b, k) => {
        if (b.k === 'gap') return <View key={k} style={{ height: 10 }} />;
        if (b.k === 'h') return <T key={k} selectable style={{ fontWeight: '700', fontSize: size + 1, lineHeight: lh, color }}>{inline(b.t, size + 1, color, k)}</T>;
        if (b.k === 'li') {
          return (
            <View key={k} style={{ flexDirection: 'row', marginTop: 4 }}>
              <T style={{ width: b.mark.length > 2 ? 28 : 20, fontSize: size, lineHeight: lh, color: C.blueD }}>{b.mark}</T>
              <View style={{ flex: 1 }}><T selectable style={{ fontSize: size, lineHeight: lh, color }}>{inline(b.t, size, color, k)}</T></View>
            </View>
          );
        }
        if (b.k === 'table') return <Table key={k} rows={b.rows} size={size} color={color} kp={k} />;
        return <T key={k} selectable style={{ fontSize: size, lineHeight: lh, color }}>{inline(b.t, size, color, k)}</T>;
      })}
    </View>
  );
}

export default memo(Rich);
