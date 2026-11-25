import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { sfx } from './sound';
import { useScale } from './theme';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

// Ikon 2D bergaya datar (gambar vektor SVG) pengganti emoji. Semua digambar di kanvas 64x64.
//   <Icon name="flame" size={28} />                     gambar diam
//   <Icon name="flame" live />                           bergerak sendiri (api berkedip, hati berdenyut, dst.)
//   <Icon name="star" onPress={...} />                   bisa diketuk: "pop" + goyang
//   <Icon name="home" pop={tab === 'belajar'} />         "pop" otomatis tiap nilai pop berubah
//   <Icon name="star" mono="#fff" />                     siluet satu warna
//   <Icon name="star" dim />                             versi pudar (belum diraih)

const INK = '#1F2A44';
const pts = (cx, cy, R, r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / n; const d = i % 2 ? r : R;
  return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`;
}).join(' ');

// Setiap ikon menerima f(warna) -> warna asli, atau satu warna bila mode mono dipakai.
const DRAW = {
  home: (f) => (<>
    <Rect x="12" y="28" width="40" height="28" rx="4" fill={f('#FFF1D6')} />
    <Polygon points="5,32 32,8 59,32" fill={f('#1CB0F6')} stroke={f('#1899D6')} strokeWidth="3" strokeLinejoin="round" />
    <Rect x="27" y="38" width="11" height="18" rx="3" fill={f('#1899D6')} />
    <Rect x="16" y="34" width="8" height="8" rx="2" fill={f('#DDF4FF')} />
    <Rect x="42" y="34" width="6" height="8" rx="2" fill={f('#DDF4FF')} />
  </>),
  target: (f) => (<>
    <Circle cx="30" cy="34" r="25" fill={f('#FF4B4B')} />
    <Circle cx="30" cy="34" r="18" fill={f('#fff')} />
    <Circle cx="30" cy="34" r="11" fill={f('#FF4B4B')} />
    <Circle cx="30" cy="34" r="4.5" fill={f('#fff')} />
    <Line x1="31" y1="33" x2="54" y2="10" stroke={f(INK)} strokeWidth="3.5" strokeLinecap="round" />
    <Polygon points="52,6 58,6 58,12 54,10" fill={f('#FFC800')} />
    <Polygon points="46,12 52,6 54,10 48,16" fill={f('#FF9600')} />
  </>),
  trophy: (f) => (<>
    <Path d="M18 16 H8 C8 30 14 34 22 34" fill="none" stroke={f('#D9A900')} strokeWidth="5" strokeLinecap="round" />
    <Path d="M46 16 H56 C56 30 50 34 42 34" fill="none" stroke={f('#D9A900')} strokeWidth="5" strokeLinecap="round" />
    <Path d="M16 6 H48 V26 C48 38 41 44 32 44 C23 44 16 38 16 26 Z" fill={f('#FFC800')} />
    <Rect x="28" y="44" width="8" height="8" fill={f('#D9A900')} />
    <Rect x="19" y="51" width="26" height="8" rx="3" fill={f('#D9A900')} />
    <Polygon points={pts(32, 23, 9, 4)} fill={f('#fff')} />
  </>),
  owl: (f) => (<>
    <Polygon points="12,12 24,20 14,28" fill={f('#8A5A2B')} />
    <Polygon points="52,12 40,20 50,28" fill={f('#8A5A2B')} />
    <Ellipse cx="32" cy="36" rx="23" ry="22" fill={f('#A8713A')} />
    <Ellipse cx="32" cy="48" rx="13" ry="9" fill={f('#FFF1D6')} />
    <Circle cx="21" cy="30" r="10" fill={f('#fff')} stroke={f('#1CB0F6')} strokeWidth="3.5" />
    <Circle cx="43" cy="30" r="10" fill={f('#fff')} stroke={f('#1CB0F6')} strokeWidth="3.5" />
    <Circle cx="22" cy="31" r="4.5" fill={f(INK)} />
    <Circle cx="42" cy="31" r="4.5" fill={f(INK)} />
    <Polygon points="28,38 36,38 32,46" fill={f('#FFB800')} />
  </>),
  user: (f) => (<>
    <Path d="M8 60 C8 44 18 38 32 38 C46 38 56 44 56 60 Z" fill={f('#1CB0F6')} />
    <Circle cx="32" cy="22" r="14" fill={f('#FFD7A8')} />
    <Path d="M18 20 C18 8 46 8 46 20 C40 16 24 16 18 20 Z" fill={f('#5B3A1A')} />
  </>),
  flame: (f) => (<>
    <Path d="M32 3 C35 16 47 20 47 37 C47 49 40 59 32 59 C24 59 17 49 17 38 C17 30 22 26 24 19 C27 23 29 26 30 29 C31 20 30 12 32 3 Z" fill={f('#FF9600')} />
    <Path d="M32 28 C34 35 41 39 41 47 C41 53 37 57 32 57 C27 57 23 53 23 47 C23 41 30 37 32 28 Z" fill={f('#FFC800')} />
  </>),
  star: (f) => <Polygon points={pts(32, 34, 28, 12)} fill={f('#FFC800')} stroke={f('#D9A900')} strokeWidth="3" strokeLinejoin="round" />,
  heart: (f) => (<>
    <Path d="M32 57 C10 41 5 28 5 21 C5 12 12 6 20 6 C26 6 30 9 32 14 C34 9 38 6 44 6 C52 6 59 12 59 21 C59 28 54 41 32 57 Z" fill={f('#FF4B4B')} />
    <Ellipse cx="19" cy="20" rx="5" ry="3.5" fill={f('#fff')} opacity="0.55" transform="rotate(-35 19 20)" />
  </>),
  lock: (f) => (<>
    <Path d="M20 30 V21 C20 13 25 8 32 8 C39 8 44 13 44 21 V30" fill="none" stroke={f('#8E98A8')} strokeWidth="6" />
    <Rect x="12" y="28" width="40" height="29" rx="7" fill={f('#AEB6C4')} />
    <Circle cx="32" cy="41" r="5" fill={f('#6B7686')} />
    <Rect x="30" y="43" width="4" height="8" rx="2" fill={f('#6B7686')} />
  </>),
  book: (f) => (<>
    <Path d="M4 14 V52 C14 49 24 50 32 56 C40 50 50 49 60 52 V14 Z" fill={f('#1899D6')} />
    <Path d="M32 14 C24 8 13 8 7 11 V48 C14 46 24 46 32 51 Z" fill={f('#fff')} />
    <Path d="M32 14 C40 8 51 8 57 11 V48 C50 46 40 46 32 51 Z" fill={f('#F1F5FB')} />
    <Line x1="13" y1="20" x2="26" y2="21" stroke={f('#9AA3B2')} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="13" y1="28" x2="26" y2="29" stroke={f('#9AA3B2')} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="38" y1="21" x2="51" y2="20" stroke={f('#9AA3B2')} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="38" y1="29" x2="51" y2="28" stroke={f('#9AA3B2')} strokeWidth="2.5" strokeLinecap="round" />
  </>),
  books: (f) => (<>
    <Rect x="7" y="14" width="13" height="44" rx="3" fill={f('#FF4B4B')} />
    <Rect x="7" y="22" width="13" height="4" fill={f('#fff')} opacity="0.7" />
    <Rect x="22" y="8" width="14" height="50" rx="3" fill={f('#1CB0F6')} />
    <Rect x="22" y="18" width="14" height="4" fill={f('#fff')} opacity="0.7" />
    <G transform="rotate(14 50 56)"><Rect x="40" y="14" width="13" height="44" rx="3" fill={f('#58CC02')} /><Rect x="40" y="24" width="13" height="4" fill={f('#fff')} opacity="0.7" /></G>
    <Rect x="3" y="57" width="58" height="4" rx="2" fill={f('#8A5A2B')} />
  </>),
  scale: (f) => (<>
    <Rect x="29" y="12" width="6" height="42" fill={f('#64748B')} />
    <Rect x="18" y="53" width="28" height="7" rx="3" fill={f('#475569')} />
    <Line x1="8" y1="17" x2="56" y2="17" stroke={f('#64748B')} strokeWidth="5" strokeLinecap="round" />
    <Line x1="12" y1="18" x2="6" y2="36" stroke={f('#8E98A8')} strokeWidth="2.5" /><Line x1="12" y1="18" x2="22" y2="36" stroke={f('#8E98A8')} strokeWidth="2.5" />
    <Line x1="52" y1="18" x2="42" y2="36" stroke={f('#8E98A8')} strokeWidth="2.5" /><Line x1="52" y1="18" x2="58" y2="36" stroke={f('#8E98A8')} strokeWidth="2.5" />
    <Path d="M3 36 H25 C25 45 20 48 14 48 C8 48 3 45 3 36 Z" fill={f('#58CC02')} />
    <Path d="M39 36 H61 C61 45 56 48 50 48 C44 48 39 45 39 36 Z" fill={f('#CE82FF')} />
    <Circle cx="32" cy="10" r="5" fill={f('#FFC800')} />
  </>),
  pie: (f) => (<>
    <Path d="M30 34 L44.1 53.4 A24 24 0 1 1 30 10 Z" fill={f('#1CB0F6')} />
    <Path d="M30 34 L30 10 A24 24 0 0 1 44.1 53.4 Z" fill={f('#FFC800')} transform="translate(5 -2)" />
  </>),
  tag: (f) => (<>
    <Path d="M8 8 H31 L58 35 L35 58 L8 31 Z" fill={f('#FF9600')} stroke={f('#D97C00')} strokeWidth="3" strokeLinejoin="round" />
    <Circle cx="20" cy="20" r="5" fill={f('#fff')} />
    <Path d="M30 30 L40 40 M34 26 L44 36" stroke={f('#fff')} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
  </>),
  fuel: (f) => (<>
    <Rect x="8" y="8" width="32" height="50" rx="5" fill={f('#FF4B4B')} />
    <Rect x="13" y="14" width="22" height="14" rx="3" fill={f('#fff')} />
    <Rect x="4" y="54" width="40" height="7" rx="3" fill={f('#D93A3A')} />
    <Path d="M40 22 H46 C50 22 52 25 52 29 V44 C52 48 58 48 58 44 V26 L52 18" fill="none" stroke={f(INK)} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M24 33 C28 38 30 41 30 44 C30 47 27 49 24 49 C21 49 18 47 18 44 C18 41 20 38 24 33 Z" fill={f('#FFC800')} />
  </>),
  cart: (f) => (<>
    <Path d="M3 9 H12 L18 40 H50" fill="none" stroke={f(INK)} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 16 H58 L52 36 H19 Z" fill={f('#58CC02')} stroke={f('#46A302')} strokeWidth="3" strokeLinejoin="round" />
    <Line x1="30" y1="19" x2="31" y2="33" stroke={f('#46A302')} strokeWidth="2.5" /><Line x1="42" y1="19" x2="41" y2="33" stroke={f('#46A302')} strokeWidth="2.5" />
    <Circle cx="22" cy="50" r="5.5" fill={f(INK)} /><Circle cx="46" cy="50" r="5.5" fill={f(INK)} />
  </>),
  bolt: (f) => <Polygon points="37,3 12,36 28,36 23,61 52,25 35,25" fill={f('#FFC800')} stroke={f('#D9A900')} strokeWidth="3" strokeLinejoin="round" />,
  worker: (f) => (<>
    <Path d="M14 62 C14 46 21 42 32 42 C43 42 50 46 50 62 Z" fill={f('#FF9600')} />
    <Rect x="28" y="42" width="8" height="20" fill={f('#FFC800')} />
    <Circle cx="32" cy="31" r="12" fill={f('#FFD7A8')} />
    <Circle cx="27.5" cy="32" r="1.8" fill={f(INK)} /><Circle cx="36.5" cy="32" r="1.8" fill={f(INK)} />
    <Path d="M29 37 Q32 39.5 35 37" fill="none" stroke={f(INK)} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M18 28 C18 12 46 12 46 28 Z" fill={f('#FFC800')} />
    <Rect x="13" y="27" width="38" height="5" rx="2.5" fill={f('#D9A900')} />
    <Rect x="29" y="10" width="6" height="8" rx="2" fill={f('#D9A900')} />
  </>),
  car: (f) => (<>
    <Path d="M4 42 L10 27 C11 23 14 21 18 21 H46 C50 21 53 23 54 27 L60 42 V50 H4 Z" fill={f('#CE82FF')} />
    <Path d="M15 27 H29 V36 H11 Z" fill={f('#DDF4FF')} /><Path d="M33 27 H49 L53 36 H33 Z" fill={f('#DDF4FF')} />
    <Rect x="52" y="40" width="7" height="5" rx="2" fill={f('#FFC800')} />
    <Circle cx="17" cy="51" r="8" fill={f(INK)} /><Circle cx="47" cy="51" r="8" fill={f(INK)} />
    <Circle cx="17" cy="51" r="3" fill={f('#CBD0D8')} /><Circle cx="47" cy="51" r="3" fill={f('#CBD0D8')} />
  </>),
  faucet: (f) => (<>
    <Rect x="20" y="6" width="18" height="6" rx="3" fill={f('#FF4B4B')} /><Rect x="26" y="11" width="6" height="9" fill={f('#8E98A8')} />
    <Path d="M6 28 H38 C45 28 48 31 48 38" fill="none" stroke={f('#8E98A8')} strokeWidth="10" strokeLinecap="butt" />
    <Rect x="2" y="21" width="9" height="14" rx="2" fill={f('#64748B')} />
    <Rect x="42" y="36" width="12" height="7" rx="2" fill={f('#64748B')} />
    <Path d="M48 47 C52 52 54 55 54 57.5 C54 60 51.5 62 48 62 C44.5 62 42 60 42 57.5 C42 55 44 52 48 47 Z" fill={f('#1CB0F6')} />
  </>),
  crane: (f) => (<>
    <Rect x="10" y="8" width="7" height="52" fill={f('#FFC800')} />
    <Path d="M10 22 L17 14 M10 34 L17 26 M10 46 L17 38" stroke={f('#D9A900')} strokeWidth="2.5" />
    <Rect x="4" y="8" width="56" height="6" rx="2" fill={f('#FF9600')} />
    <Rect x="4" y="14" width="10" height="7" fill={f('#64748B')} />
    <Line x1="50" y1="14" x2="50" y2="34" stroke={f(INK)} strokeWidth="2.5" />
    <Rect x="43" y="34" width="14" height="9" rx="2" fill={f('#FF4B4B')} />
    <Rect x="30" y="50" width="26" height="10" fill={f('#CBD0D8')} /><Rect x="34" y="44" width="18" height="7" fill={f('#AEB6C4')} />
    <Rect x="2" y="59" width="60" height="4" rx="2" fill={f('#8A5A2B')} />
  </>),
  repeat: (f) => (<>
    <Path d="M12 30 C12 18 21 11 32 11 C38 11 43 13 46 17" fill="none" stroke={f('#A560DB')} strokeWidth="7" strokeLinecap="round" />
    <Polygon points="40,8 56,14 44,26" fill={f('#A560DB')} />
    <Path d="M52 34 C52 46 43 53 32 53 C26 53 21 51 18 47" fill="none" stroke={f('#CE82FF')} strokeWidth="7" strokeLinecap="round" />
    <Polygon points="24,56 8,50 20,38" fill={f('#CE82FF')} />
  </>),
  dice: (f) => (<>
    <Rect x="8" y="8" width="48" height="48" rx="11" fill={f('#FF9600')} stroke={f('#D97C00')} strokeWidth="3" />
    <Circle cx="21" cy="21" r="4.5" fill={f('#fff')} /><Circle cx="43" cy="21" r="4.5" fill={f('#fff')} /><Circle cx="32" cy="32" r="4.5" fill={f('#fff')} />
    <Circle cx="21" cy="43" r="4.5" fill={f('#fff')} /><Circle cx="43" cy="43" r="4.5" fill={f('#fff')} />
  </>),
  puzzle: (f) => (<>
    <Path d="M8 18 H24 C22 8 38 8 36 18 H54 V34 C44 32 44 48 54 46 V58 H8 Z" fill={f('#1CB0F6')} stroke={f('#1899D6')} strokeWidth="3" strokeLinejoin="round" />
    <Circle cx="22" cy="40" r="4" fill={f('#DDF4FF')} />
  </>),
  bandage: (f) => (
    <G transform="rotate(-40 32 32)">
      <Rect x="2" y="20" width="60" height="24" rx="12" fill={f('#F6C9A0')} stroke={f('#E0A878')} strokeWidth="2.5" />
      <Rect x="22" y="20" width="20" height="24" fill={f('#FFE9D0')} />
      <Circle cx="12" cy="28" r="1.8" fill={f('#E0A878')} /><Circle cx="12" cy="36" r="1.8" fill={f('#E0A878')} /><Circle cx="52" cy="28" r="1.8" fill={f('#E0A878')} /><Circle cx="52" cy="36" r="1.8" fill={f('#E0A878')} />
    </G>),
  sprout: (f) => (<>
    <Path d="M32 56 V28" stroke={f('#46A302')} strokeWidth="4.5" strokeLinecap="round" />
    <Path d="M32 32 C32 18 20 12 8 14 C8 28 18 34 32 32 Z" fill={f('#58CC02')} />
    <Path d="M32 26 C32 14 42 8 56 10 C56 22 46 28 32 26 Z" fill={f('#7BE02A')} />
    <Ellipse cx="32" cy="57" rx="18" ry="5" fill={f('#8A5A2B')} />
  </>),
  volcano: (f) => (<>
    <Path d="M3 59 L22 24 H42 L61 59 Z" fill={f('#8A5A2B')} />
    <Path d="M22 24 H42 L44 31 C40 28 36 35 32 30 C28 35 24 28 20 31 Z" fill={f('#FF4B4B')} />
    <Path d="M32 4 C34 10 40 11 40 17 C40 21 37 23 32 23 C27 23 24 21 24 17 C24 13 30 10 32 4 Z" fill={f('#FF9600')} />
    <Circle cx="12" cy="14" r="3" fill={f('#FFC800')} /><Circle cx="52" cy="10" r="3.5" fill={f('#FF9600')} />
  </>),
  sparkle: (f) => (<>
    <Polygon points={pts(32, 34, 24, 10)} fill={f('#FFC800')} stroke={f('#D9A900')} strokeWidth="3" strokeLinejoin="round" />
    <Path d="M10 6 L12 12 L18 14 L12 16 L10 22 L8 16 L2 14 L8 12 Z" fill={f('#1CB0F6')} />
    <Path d="M54 4 L56 9 L61 11 L56 13 L54 18 L52 13 L47 11 L52 9 Z" fill={f('#CE82FF')} />
  </>),
  calc: (f) => (<>
    <Rect x="10" y="4" width="44" height="56" rx="8" fill={f('#1D3F8A')} />
    <Rect x="16" y="10" width="32" height="14" rx="3" fill={f('#D7FFB8')} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={17 + c * 11} y={30 + r * 9} width="8" height="6" rx="2" fill={f(c === 2 ? '#FFC800' : '#DDF4FF')} />))}
  </>),
  gem: (f) => (<>
    <Polygon points="16,8 48,8 60,24 32,58 4,24" fill={f('#1CB0F6')} stroke={f('#1899D6')} strokeWidth="3" strokeLinejoin="round" />
    <Polygon points="16,8 22,24 32,8" fill={f('#DDF4FF')} opacity="0.8" /><Polygon points="48,8 42,24 32,8" fill={f('#8ADBFF')} />
    <Polygon points="4,24 22,24 32,58" fill={f('#1899D6')} opacity="0.55" /><Polygon points="60,24 42,24 32,58" fill={f('#1899D6')} opacity="0.3" />
    <Line x1="4" y1="24" x2="60" y2="24" stroke={f('#DDF4FF')} strokeWidth="2" />
  </>),
  magnify: (f) => (<>
    <Line x1="40" y1="40" x2="57" y2="57" stroke={f('#8A5A2B')} strokeWidth="9" strokeLinecap="round" />
    <Circle cx="26" cy="26" r="19" fill={f('#DDF4FF')} stroke={f('#1CB0F6')} strokeWidth="6" />
    <Path d="M16 24 C17 18 21 15 27 14" fill="none" stroke={f('#fff')} strokeWidth="3.5" strokeLinecap="round" />
  </>),
  check: (f) => (<>
    <Circle cx="32" cy="32" r="28" fill={f('#58CC02')} />
    <Polyline points="18,33 28,43 46,22" fill="none" stroke={f('#fff')} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  close: (f) => <Path d="M14 14 L50 50 M50 14 L14 50" stroke={f('#94A3B8')} strokeWidth="8" strokeLinecap="round" />,
  bulb: (f) => (<>
    <Path d="M32 4 C19 4 11 13 11 24 C11 32 16 37 20 42 C22 44 22 47 22 49 H42 C42 47 42 44 44 42 C48 37 53 32 53 24 C53 13 45 4 32 4 Z" fill={f('#FFC800')} />
    <Path d="M20 18 C21 13 25 10 30 9" fill="none" stroke={f('#fff')} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
    <Rect x="22" y="50" width="20" height="5" rx="2.5" fill={f('#8E98A8')} /><Rect x="25" y="56" width="14" height="5" rx="2.5" fill={f('#64748B')} />
  </>),
  party: (f) => (<>
    <Path d="M6 58 L20 22 L42 44 Z" fill={f('#FF9600')} stroke={f('#D97C00')} strokeWidth="2.5" strokeLinejoin="round" />
    <Path d="M12 44 L24 30 M18 52 L33 36" stroke={f('#FFC800')} strokeWidth="3.5" strokeLinecap="round" />
    <Circle cx="38" cy="14" r="3.5" fill={f('#1CB0F6')} /><Circle cx="52" cy="26" r="3.5" fill={f('#FF4B4B')} /><Circle cx="50" cy="8" r="2.5" fill={f('#58CC02')} /><Circle cx="58" cy="40" r="2.5" fill={f('#CE82FF')} />
    <Path d="M30 20 C34 24 38 22 40 28 M44 34 C48 30 52 34 56 32" fill="none" stroke={f('#58CC02')} strokeWidth="3" strokeLinecap="round" />
  </>),
  medal: (f) => (<>
    <Polygon points="16,2 28,2 34,24 22,24" fill={f('#FF4B4B')} /><Polygon points="48,2 36,2 30,24 42,24" fill={f('#1CB0F6')} />
    <Circle cx="32" cy="40" r="19" fill={f('#FFC800')} stroke={f('#D9A900')} strokeWidth="3.5" />
    <Polygon points={pts(32, 40, 11, 5)} fill={f('#fff')} />
  </>),
  note: (f) => (<>
    <Rect x="10" y="8" width="44" height="52" rx="6" fill={f('#fff')} stroke={f('#1CB0F6')} strokeWidth="3.5" />
    <Rect x="10" y="8" width="44" height="12" rx="6" fill={f('#1CB0F6')} />
    <Circle cx="22" cy="10" r="3" fill={f('#fff')} /><Circle cx="32" cy="10" r="3" fill={f('#fff')} /><Circle cx="42" cy="10" r="3" fill={f('#fff')} />
    <Path d="M19 30 H45 M19 39 H45 M19 48 H34" stroke={f('#9AA3B2')} strokeWidth="3.5" strokeLinecap="round" />
  </>),
  glossary: (f) => (<>
    <Rect x="9" y="5" width="42" height="54" rx="6" fill={f('#CE82FF')} />
    <Rect x="9" y="5" width="8" height="54" rx="4" fill={f('#A560DB')} />
    <Rect x="22" y="14" width="22" height="16" rx="3" fill={f('#fff')} />
    <Path d="M27 26 L31 18 L35 26 M28.5 23 H33.5" fill="none" stroke={f('#A560DB')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 40 H44 M22 47 H38" stroke={f('#fff')} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    <Polygon points="40,59 40,46 46,51 52,46 52,59" fill={f('#FFC800')} transform="translate(0 -2)" />
  </>),
  flask: (f) => (<>
    <Path d="M24 6 H40 M26 6 V24 L8 54 C6 58 8 60 12 60 H52 C56 60 58 58 56 54 L38 24 V6" fill={f('#DDF4FF')} stroke={f('#1899D6')} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
    <Path d="M15 44 H49 L55 54 C57 58 55 60 52 60 H12 C9 60 7 58 9 54 Z" fill={f('#58CC02')} />
    <Circle cx="26" cy="50" r="3" fill={f('#fff')} opacity="0.7" /><Circle cx="38" cy="53" r="2.2" fill={f('#fff')} opacity="0.7" />
  </>),
  chart: (f) => (<>
    <Rect x="6" y="34" width="12" height="24" rx="3" fill={f('#58CC02')} /><Rect x="22" y="20" width="12" height="38" rx="3" fill={f('#1CB0F6')} />
    <Rect x="38" y="8" width="12" height="50" rx="3" fill={f('#FF9600')} /><Rect x="3" y="58" width="58" height="4" rx="2" fill={f('#64748B')} />
  </>),
  warning: (f) => (<>
    <Path d="M32 5 L61 56 H3 Z" fill={f('#FFC800')} stroke={f('#D9A900')} strokeWidth="4" strokeLinejoin="round" />
    <Rect x="29" y="22" width="6" height="19" rx="3" fill={f(INK)} /><Circle cx="32" cy="48" r="3.6" fill={f(INK)} />
  </>),
  share: (f) => (<>
    <Circle cx="14" cy="32" r="8" fill={f('#1CB0F6')} /><Circle cx="48" cy="12" r="8" fill={f('#58CC02')} /><Circle cx="48" cy="52" r="8" fill={f('#FF9600')} />
    <Path d="M20 28 L42 15 M20 36 L42 49" stroke={f('#64748B')} strokeWidth="3.5" strokeLinecap="round" />
  </>),
  play: (f) => (<>
    <Circle cx="32" cy="32" r="29" fill={f('#FF4B4B')} />
    <Polygon points="25,17 25,47 49,32" fill={f('#fff')} strokeLinejoin="round" />
  </>),
  speaker: (f) => (<>
    <Polygon points="6,24 18,24 32,12 32,52 18,40 6,40" fill={f('#1CB0F6')} stroke={f('#1899D6')} strokeWidth="2.5" strokeLinejoin="round" />
    <Path d="M40 22 C45 28 45 36 40 42" fill="none" stroke={f('#1CB0F6')} strokeWidth="5" strokeLinecap="round" />
    <Path d="M47 14 C56 24 56 40 47 50" fill="none" stroke={f('#8ADBFF')} strokeWidth="5" strokeLinecap="round" />
  </>),
  mute: (f) => (<>
    <Polygon points="6,24 18,24 32,12 32,52 18,40 6,40" fill={f('#AEB6C4')} stroke={f('#8E98A8')} strokeWidth="2.5" strokeLinejoin="round" />
    <Path d="M42 24 L58 40 M58 24 L42 40" stroke={f('#FF4B4B')} strokeWidth="5.5" strokeLinecap="round" />
  </>),
  camera: (f) => (<>
    <Path d="M8 22 C8 18 11 16 14 16 H20 L24 10 H40 L44 16 H50 C54 16 56 18 56 22 V48 C56 52 54 54 50 54 H14 C10 54 8 52 8 48 Z" fill={f('#1CB0F6')} />
    <Circle cx="32" cy="35" r="13" fill={f('#fff')} />
    <Circle cx="32" cy="35" r="7.5" fill={f('#1899D6')} />
    <Circle cx="48" cy="24" r="2.8" fill={f('#FFC800')} />
  </>),
  image: (f) => (<>
    <Rect x="6" y="10" width="52" height="44" rx="8" fill={f('#DDF4FF')} stroke={f('#1CB0F6')} strokeWidth="3.5" />
    <Circle cx="21" cy="25" r="6" fill={f('#FFC800')} />
    <Polygon points="10,48 27,29 38,41 45,34 54,48" fill={f('#58CC02')} strokeLinejoin="round" />
  </>),
  file: (f) => (<>
    <Path d="M14 6 H38 L52 20 V54 C52 56 50 58 48 58 H14 C12 58 10 56 10 54 V10 C10 8 12 6 14 6 Z" fill={f('#fff')} stroke={f('#64748B')} strokeWidth="3.5" strokeLinejoin="round" />
    <Path d="M38 6 V20 H52" fill="none" stroke={f('#64748B')} strokeWidth="3.5" strokeLinejoin="round" />
    <Path d="M18 32 H44 M18 40 H44 M18 48 H34" stroke={f('#1CB0F6')} strokeWidth="4" strokeLinecap="round" />
  </>),
  back: (f) => <Polyline points="40,10 18,32 40,54" fill="none" stroke={f('#64748B')} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />,
  clock: (f) => <G><Circle cx="32" cy="32" r="22" fill="none" stroke={f('#64748B')} strokeWidth="6" /><Polyline points="32,18 32,33 42,40" fill="none" stroke={f('#64748B')} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></G>,
  plus: (f) => <G><Line x1="32" y1="12" x2="32" y2="52" stroke={f('#1CB0F6')} strokeWidth="9" strokeLinecap="round" /><Line x1="12" y1="32" x2="52" y2="32" stroke={f('#1CB0F6')} strokeWidth="9" strokeLinecap="round" /></G>,
  trash: (f) => <G><Rect x="17" y="22" width="30" height="31" rx="5" fill="none" stroke={f('#D93A3A')} strokeWidth="5" /><Line x1="12" y1="20" x2="52" y2="20" stroke={f('#D93A3A')} strokeWidth="5" strokeLinecap="round" /><Line x1="25" y1="12" x2="39" y2="12" stroke={f('#D93A3A')} strokeWidth="5" strokeLinecap="round" /><Line x1="27" y1="30" x2="27" y2="45" stroke={f('#D93A3A')} strokeWidth="4" strokeLinecap="round" /><Line x1="37" y1="30" x2="37" y2="45" stroke={f('#D93A3A')} strokeWidth="4" strokeLinecap="round" /></G>,
};

export const ICON_NAMES = Object.keys(DRAW);

// gerak "hidup" per ikon (aktif bila prop live)
const IDLE = { flame: 'flicker', heart: 'beat', star: 'twinkle', sparkle: 'twinkle', gem: 'twinkle', bulb: 'beat', repeat: 'spin', crane: 'sway', scale: 'sway', owl: 'sway', dice: 'sway', flask: 'sway' };

function IconBase({ name, size: sizeProp = 32, live = false, onPress, pop, mono, dim, style, hitSlop }) {
  const sc = useScale();
  const size = sizeProp * sc;
  const draw = DRAW[name] || DRAW.star;
  const v = useRef(new Animated.Value(0)).current;     // gerak berulang 0..1
  const s = useRef(new Animated.Value(1)).current;     // skala "pop"
  const r = useRef(new Animated.Value(0)).current;     // goyang -1..1
  const first = useRef(true);
  const kind = IDLE[name] || 'bob';

  useEffect(() => {
    if (!live) { v.setValue(0); return undefined; }
    const dur = { flicker: 420, beat: 650, twinkle: 900, spin: 3200, sway: 1100, bob: 1000 }[kind];
    const loop = kind === 'spin'
      ? Animated.loop(Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }))
      : Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]));
    loop.start();
    return () => loop.stop();
  }, [live, kind]);

  const play = () => {
    s.setValue(0.72);
    Animated.parallel([
      Animated.spring(s, { toValue: 1, friction: 3, tension: 190, useNativeDriver: true }),
      Animated.sequence([-1, 1, -0.6, 0.6, 0].map((x) => Animated.timing(r, { toValue: x, duration: 70, useNativeDriver: true }))),
    ]).start();
  };
  useEffect(() => { if (first.current) { first.current = false; return; } if (pop) play(); }, [pop]);

  const idleStyle = (() => {
    if (!live) return [];
    if (kind === 'flicker') return [{ scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) }];
    if (kind === 'beat') return [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] }) }];
    if (kind === 'twinkle') return [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }];
    if (kind === 'spin') return [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }];
    if (kind === 'sway') return [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) }];
    return [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.06] }) }];
  })();

  const f = mono ? () => mono : (c) => c;
  const body = (
    <Animated.View style={[{ width: size, height: size, opacity: dim ? 0.22 : 1 }, style, { transform: [{ scale: s }, { rotate: r.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) }, ...idleStyle] }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">{draw(f)}</Svg>
    </Animated.View>
  );
  if (!onPress) return body;
  return <Pressable hitSlop={hitSlop || 8} onPressIn={() => { play(); sfx('pop'); }} onPress={onPress}>{body}</Pressable>;
}

const Icon = memo(IconBase);
export default Icon;

// Deretan bintang 1-3 (pengganti karakter ★)
const STAR_GAP = { marginHorizontal: 1 };
export function Stars({ n = 0, size = 20, max = 3, style }) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'center' }, style]}>
      {Array.from({ length: max }, (_, i) => <Icon key={i} name="star" size={size} dim={i >= n} style={STAR_GAP} />)}
    </View>
  );
}
