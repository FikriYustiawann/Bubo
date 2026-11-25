import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Owl from './Owl';
import { T } from './ui';
import { C } from './theme';
import { APP_NAME } from './brand';

// Semua animasi di sini memakai native driver (jalan di thread UI, tidak membebani JS).

// Masuk halus: memudar + naik sedikit. Pakai dengan `key` agar animasi diputar ulang tiap isi berganti.
export function FadeSlide({ children, dy = 14, ms = 230, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[{ flex: 1, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

// Tiga titik berdenyut bergantian
export const Dots = memo(function Dots({ color = C.blue, size = 10 }) {
  const vs = useRef([0, 1, 2].map(() => new Animated.Value(0.25))).current;
  useEffect(() => {
    const loops = vs.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 160),
      Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.25, duration: 320, useNativeDriver: true }),
      Animated.delay((2 - i) * 160),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: size * 2 }}>
      {vs.map((v, i) => (
        <Animated.View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, marginHorizontal: size * 0.35, opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0.25, 1], outputRange: [0.7, 1.15] }) }] }} />
      ))}
    </View>
  );
});

// Batang loading yang meluncur (tanpa angka palsu)
function Slider({ width = 190 }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.timing(x, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, []);
  const w = width * 0.45;
  return (
    <View style={{ width, height: 12, borderRadius: 6, backgroundColor: C.line, overflow: 'hidden' }}>
      <Animated.View style={{ width: w, height: 12, borderRadius: 6, backgroundColor: C.green, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-w, width] }) }] }} />
    </View>
  );
}

// Layar pembuka: tampil saat aplikasi memuat data & font, lalu memudar hilang
export function Splash({ leaving, onGone }) {
  const op = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start(); }, []);
  useEffect(() => {
    if (leaving) Animated.timing(op, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => onGone && onGone());
  }, [leaving]);
  return (
    <Animated.View pointerEvents={leaving ? 'none' : 'auto'} style={[StyleSheet.absoluteFill, { opacity: op, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', zIndex: 50 }]}>
      <View pointerEvents="none" style={{ position: 'absolute', top: -70, left: -60, width: 210, height: 210, borderRadius: 105, backgroundColor: C.blueL, opacity: 0.75 }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: -60, right: -50, width: 190, height: 190, borderRadius: 95, backgroundColor: '#F6EBFF', opacity: 0.85 }} />
      <Animated.View style={{ alignItems: 'center', opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
        <Owl size={150} mood="happy" />
        <T style={{ fontSize: 34, fontWeight: '700', color: C.navy, marginTop: 14 }}>{APP_NAME}</T>
        <T style={{ color: C.sub, fontSize: 16, marginTop: 4, marginBottom: 26 }}>Menyiapkan pelajaranmu</T>
        <Slider />
      </Animated.View>
    </Animated.View>
  );
}

// Penutup singkat saat membuka pelajaran / latihan
export function LoadingOverlay({ text = 'Menyiapkan soal' }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 180, useNativeDriver: true }).start(); }, []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: v, backgroundColor: 'rgba(255,255,255,0.97)', alignItems: 'center', justifyContent: 'center', zIndex: 40 }]}>
      <Owl size={110} mood="think" />
      <T style={{ fontSize: 20, fontWeight: '700', color: C.navy, marginTop: 12, marginBottom: 6 }}>{text}</T>
      <Dots />
    </Animated.View>
  );
}
