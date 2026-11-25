import React from 'react';
import { Text } from 'react-native';
import { T } from './ui';
import { C, fonts } from './theme';

// Penanda informasi penting pada soal cerita:
// kuning = data (angka + satuan), biru = hal yang ditanyakan.
const RE = /(Berapa[^?]*\?|Apakah[^?]*\?|Vendor mana[^?]*\?|Manakah[^?]*\?|Rp\s?\d[\d.]*|\d[\d.,]*(?:\s?[A-Za-z]+(?:\/[A-Za-z]+)?)?)/g;

export function hasMarks(text) { RE.lastIndex = 0; const r = RE.test(String(text || '')); RE.lastIndex = 0; return r; }

export default function Tandai({ children, style }) {
  const parts = String(children || '').split(RE);
  return (
    <T style={style}>
      {parts.map((p, i) => {
        if (!p) return null;
        if (i % 2 === 0) return p;
        const ask = /^(Berapa|Apakah|Vendor mana|Manakah)/.test(p);
        return ask
          ? <Text key={i} style={{ fontFamily: fonts.b, color: C.blueD }}>{p}</Text>
          : <Text key={i} style={{ fontFamily: fonts.b, backgroundColor: '#FFE98A', color: C.ink }}>{p}</Text>;
      })}
    </T>
  );
}
