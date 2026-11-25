import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, FONT_K, fonts, useScale } from './theme';
import { sfx } from './sound';
import Icon from './Icon';

// Semua teks lewat T agar selalu Nunito (tebal = file ExtraBold asli, bukan tebal tiruan). Prop `math` = pakai serif untuk rumus.
export const T = memo(function T({ style, children, math, ...p }) {
  const sc = useScale();
  const f = StyleSheet.flatten(style) || {};
  const bold = f.fontWeight === '700' || f.fontWeight === 'bold' || f.fontWeight === '800' || f.fontWeight === '900';
  const custom = fonts.b !== fonts.r;
  const fs = (f.fontSize || 17) * sc * FONT_K;
  const extra = { fontSize: fs, fontWeight: custom ? 'normal' : bold ? 'bold' : 'normal' };
  if (f.lineHeight) extra.lineHeight = f.lineHeight * sc * FONT_K;
  // maxFontSizeMultiplier: ukuran font sistem Android ikut dihormati, tapi dibatasi agar tata letak tidak pecah
  return (
    <Text maxFontSizeMultiplier={1.2} {...p} style={[{ fontFamily: math ? (bold ? fonts.mb : fonts.m) : bold ? fonts.b : fonts.r, color: C.ink }, style, extra]}>{children}</Text>
  );
});

// Kolom isian berskala (pengganti TextInput)
export const Input = React.forwardRef(function Input({ style, ...p }, ref) {
  const sc = useScale();
  const f = StyleSheet.flatten(style) || {};
  return <TextInput ref={ref} maxFontSizeMultiplier={1.2} {...p} style={[style, f.fontSize ? { fontSize: f.fontSize * sc * FONT_K } : null]} />;
});

const PAL = {
  green: { bg: C.green, edge: C.greenD, fg: '#fff' },
  blue: { bg: C.blue, edge: C.blueD, fg: '#fff' },
  red: { bg: C.red, edge: C.redD, fg: '#fff' },
  white: { bg: '#fff', edge: C.line, fg: C.blue, border: C.line },
  gray: { bg: '#E5E7EB', edge: '#CBD0D8', fg: '#9AA3B2' },
};

// Tombol 3D: menekan = tombol "turun" + kilap di bagian atas. Prop baru: icon (nama ikon), tinggi tombol tetap saat ditekan.
export const Btn = memo(function Btn({ label, onPress, color = 'green', disabled, small, style, icon }) {
  const [down, setDown] = useState(false);
  const p = PAL[color] || PAL.green;
  const shine = color !== 'white' && color !== 'gray';
  const depth = small ? 4 : 5;
  return (
    <Pressable disabled={disabled} onPress={onPress} onPressIn={() => { setDown(true); if (!disabled) sfx('tap'); }} onPressOut={() => setDown(false)} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
      <View style={{ backgroundColor: p.bg, borderRadius: 16, paddingVertical: small ? 10 : 15, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', overflow: 'hidden', borderBottomWidth: down ? 0 : depth, borderBottomColor: p.edge, marginTop: down ? depth : 0, ...(p.border ? { borderWidth: 2, borderColor: p.border, borderBottomWidth: down ? 2 : depth } : {}) }}>
        {shine ? <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 14, right: 14, height: small ? 5 : 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.28)' }} /> : null}
        {icon ? <Icon name={icon} size={small ? 20 : 24} mono={shine ? '#fff' : undefined} style={{ marginRight: 8 }} /> : null}
        <T style={{ color: p.fg, fontWeight: '700', fontSize: small ? 15 : 18, letterSpacing: 0.8 }}>{label}</T>
      </View>
    </Pressable>
  );
});


// Pembungkus ketukan interaktif: mengecil saat ditekan, membal saat dilepas, ada suara tap
const INNER = ['flexDirection', 'alignItems', 'justifyContent', 'flexWrap'];
export function Tap({ children, onPress, onPressIn, style, scaleTo = 0.96, sound = 'tap', disabled, ...rest }) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (x, bounce) => Animated.spring(v, { toValue: x, useNativeDriver: true, speed: bounce ? 22 : 40, bounciness: bounce ? 12 : 0 }).start();
  const f = StyleSheet.flatten(style) || {};
  const inner = { flexGrow: 1 };
  INNER.forEach((k) => { if (f[k] !== undefined) inner[k] = f[k]; });
  return (
    <Animated.View style={[style, { transform: [{ scale: v }] }]}>
      <Pressable disabled={disabled} {...rest} style={inner}
        onPressIn={(e) => { to(scaleTo, false); if (sound && !disabled) sfx(sound); if (onPressIn) onPressIn(e); }}
        onPressOut={() => to(1, true)}
        onPress={onPress}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function Bar({ value, color = C.green, height = 16 }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: Math.max(0, Math.min(1, value || 0)), duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [value]);
  return (
    <View style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: C.line, overflow: 'hidden' }}>
      <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: color, width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}>
        <View style={{ marginTop: height / 4, marginHorizontal: 8, height: height / 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' }} />
      </Animated.View>
    </View>
  );
}

export function Confetti({ n = 22 }) {
  const H = Dimensions.get('window').height + 40;
  const items = useRef([...Array(n)].map((_, i) => ({ x: Math.random(), delay: Math.random() * 700, dur: 1800 + Math.random() * 1400, c: [C.gold, C.blue, C.green, C.red, C.purple][i % 5], v: new Animated.Value(0), rot: Math.random() * 360 }))).current;
  useEffect(() => { items.forEach((it) => Animated.timing(it.v, { toValue: 1, duration: it.dur, delay: it.delay, useNativeDriver: true }).start()); }, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((it, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: `${it.x * 100}%`, top: -20, width: 10, height: 14, borderRadius: 2, backgroundColor: it.c,
          opacity: it.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: it.v.interpolate({ inputRange: [0, 1], outputRange: [0, H] }) }, { rotate: it.v.interpolate({ inputRange: [0, 1], outputRange: [`${it.rot}deg`, `${it.rot + 540}deg`] }) }] }} />
      ))}
    </View>
  );
}

// Detik berjalan, dipakai penghitung mundur hati
export function useTick(active = true, ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => { if (!active) return undefined; const id = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(id); }, [active, ms]);
}
export const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };


// ======================================================================
// Komponen interaktif bersama (dipakai di semua layar)
// ======================================================================

// Muncul bertahap: memudar + naik. i = urutan, supaya daftar muncul satu per satu (maks. 10 langkah)
export function Reveal({ children, i = 0, dy = 18, ms = 360, step = 60, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: ms, delay: Math.min(i, 10) * step, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }] }, style]}>{children}</Animated.View>;
}

// Muncul dengan membal (skala 0.6 -> 1)
export function PopIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(v, { toValue: 1, delay, friction: 5, tension: 120, useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[{ opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }, style]}>{children}</Animated.View>;
}

// Angka menghitung naik
export const CountUp = memo(function CountUp({ v, suf = '', of, style, ms = 700 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const a = new Animated.Value(0);
    const id = a.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(a, { toValue: v, duration: ms, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [v]);
  return <T style={style}>{n}{suf}{of != null ? `/${of}` : ''}</T>;
});

// Cincin progres (SVG). children tampil di tengah.
const ACircle = Animated.createAnimatedComponent(Circle);
export const Ring = memo(function Ring({ size = 64, stroke = 8, value = 0, color = C.green, track = C.line, children }) {
  const sc = useScale();
  const s = size * sc, r = (s - stroke) / 2, circ = 2 * Math.PI * r;
  const a = useRef(new Animated.Value(0)).current;
  const v = Math.max(0, Math.min(1, value || 0));
  useEffect(() => { Animated.timing(a, { toValue: v, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [v]);
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={s / 2} cy={s / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <ACircle cx={s / 2} cy={s / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" opacity={v > 0 ? 1 : 0} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={a.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] })} />
      </Svg>
      {children}
    </View>
  );
});

// Kartu bergaris tebal di bawah. Bila ada onPress: mengecil saat ditekan.
export function Card({ children, style, color = C.line, onPress, sound = 'tap' }) {
  const base = { borderWidth: 2, borderBottomWidth: 4, borderColor: color, borderRadius: 20, padding: 14, backgroundColor: '#fff' };
  if (onPress) return <Tap onPress={onPress} scaleTo={0.975} sound={sound} style={[base, style]}>{children}</Tap>;
  return <View style={[base, style]}>{children}</View>;
}

// Label kecil berwarna
export function Pill({ children, bg = C.blueL, fg = C.blueD, icon, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }, style]}>
      {icon ? <Icon name={icon} size={16} style={{ marginRight: 4 }} /> : null}
      <T style={{ color: fg, fontWeight: '700', fontSize: 13 }}>{children}</T>
    </View>
  );
}

// Pilihan segmen dengan penanda yang meluncur. items: [{ k, l, i }]
export function Seg({ items, value, onChange, style }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, items.findIndex((x) => x.k === value));
  const x = useRef(new Animated.Value(idx)).current;
  useEffect(() => { Animated.spring(x, { toValue: idx, useNativeDriver: true, friction: 8, tension: 130 }).start(); }, [idx]);
  const cw = w ? (w - 8) / items.length : 0;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[{ flexDirection: 'row', backgroundColor: C.soft, borderRadius: 18, padding: 4 }, style]}>
      {cw ? <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: cw, borderRadius: 14, backgroundColor: '#fff', borderBottomWidth: 3, borderBottomColor: C.line, transform: [{ translateX: x.interpolate({ inputRange: [0, Math.max(1, items.length - 1)], outputRange: [0, cw * Math.max(1, items.length - 1)] }) }] }} /> : null}
      {items.map((it) => {
        const on = it.k === value;
        return (
          <Pressable key={it.k} onPress={() => { if (!on) { sfx('tab'); onChange(it.k); } }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9 }}>
            {it.i ? <Icon name={it.i} size={20} pop={on} /> : null}
            <T numberOfLines={1} style={{ fontWeight: '700', marginLeft: it.i ? 6 : 0, fontSize: 15, color: on ? C.blueD : C.sub }}>{it.l}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

// Ledakan titik warna dari tengah (rayakan klaim/lencana). Pakai dengan key baru untuk memutar ulang.
export function Burst({ n = 12, r = 54, size = 9, colors }) {
  const cols = colors || [C.gold, C.blue, C.green, C.red, C.purple, C.orange];
  const items = useRef([...Array(n)].map((_, i) => ({ a: (i / n) * Math.PI * 2, v: new Animated.Value(0), c: cols[i % cols.length] }))).current;
  useEffect(() => { Animated.parallel(items.map((it) => Animated.timing(it.v, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }))).start(); }, []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
      {items.map((it, i) => (
        <Animated.View key={i} style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2, backgroundColor: it.c,
          opacity: it.v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateX: it.v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(it.a) * r] }) }, { translateY: it.v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(it.a) * r] }) }, { scale: it.v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }] }} />
      ))}
    </View>
  );
}

// Pemberitahuan singkat yang naik dari bawah. Render dengan key = teks agar animasi diputar ulang.
export function Toast({ text, bottom = 16 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(v, { toValue: 1, friction: 7, tension: 110, useNativeDriver: true }).start(); }, []);
  if (!text) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom, alignItems: 'center', opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
      <View style={{ backgroundColor: C.ink, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="lock" size={18} style={{ marginRight: 8 }} mono="#fff" />
        <T style={{ color: '#fff', fontWeight: '700', fontSize: 15, flexShrink: 1 }}>{text}</T>
      </View>
    </Animated.View>
  );
}
