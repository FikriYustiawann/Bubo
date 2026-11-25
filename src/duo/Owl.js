import React, { memo, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useScale } from './theme';

// Maskot (nama di brand.js), burung hantu berkacamata biru. Digambar dari View (tanpa gambar/library tambahan).
// mood: 'happy' | 'cheer' (melompat senang) | 'sad' (menggeleng) | 'think'
// hat: topi Natal (default nyala). Matikan: <Owl hat={false} />, atau hapus HAT_ON di bawah untuk mematikan di seluruh aplikasi.
const HAT_ON = true;
const BODY = '#A8713A', WING = '#8A5A2B', CREAM = '#FFF1D6', BLUE = '#1CB0F6', GOLD = '#FFB800';

function Owl({ size: sizeProp = 120, mood = 'happy', hat = HAT_ON, style }) {
  const size = sizeProp * useScale();
  const u = size / 100;
  const HT = hat ? 20 : 0;   // ruang di atas kepala untuk topi
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const wob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);

  useEffect(() => {
    let t;
    const loop = () => {
      t = setTimeout(() => {
        Animated.sequence([
          Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start(loop);
      }, 2200 + Math.random() * 2000);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mood === 'cheer') {
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(hop, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(hop, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(hop, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start();
    } else if (mood === 'sad') {
      Animated.sequence([
        Animated.timing(wob, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(wob, { toValue: -1, duration: 120, useNativeDriver: true }),
        Animated.timing(wob, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(wob, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [mood]);

  const sad = mood === 'sad', think = mood === 'think';
  const px = think ? 3 * u : 0;
  const py = sad ? 3 * u : think ? -3 * u : 0;
  const box = (l, t, w, h, r, bg, extra) => ({ position: 'absolute', left: l * u, top: t * u, width: w * u, height: h * u, borderRadius: r * u, backgroundColor: bg, ...extra });

  const ring = (left) => (
    <View key={left}>
      <View style={box(left, 28, 34, 34, 17, '#fff', { borderWidth: 3.5 * u, borderColor: BLUE })} />
      <Animated.View style={box(left + 10, 38, 14, 14, 7, '#1B1F3B', { transform: [{ translateX: px }, { translateY: py }, { scaleY: blink }] })}>
        <View style={box(2.5, 2.5, 4.5, 4.5, 2.5, '#fff')} />
      </Animated.View>
    </View>
  );

  return (
    <Animated.View style={[{ width: size, height: (106 + HT) * u }, style, {
      transform: [
        { translateY: Animated.add(bob.interpolate({ inputRange: [0, 1], outputRange: [0, -3 * u] }), hop.interpolate({ inputRange: [0, 1], outputRange: [0, -16 * u] })) },
        { rotate: wob.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] }) },
      ],
    }]}>
      <View style={{ position: 'absolute', left: 0, top: HT * u, width: size, height: 106 * u }}>
      {/* jambul telinga */}
      <View style={box(14, 6, 20, 24, 8, BODY, { transform: [{ rotate: '-18deg' }] })} />
      <View style={box(66, 6, 20, 24, 8, BODY, { transform: [{ rotate: '18deg' }] })} />
      {/* badan, sayap, perut */}
      <View style={box(8, 14, 84, 80, 42, BODY)} />
      <View style={box(3, 46, 20, 38, 12, WING, { transform: [{ rotate: '8deg' }] })} />
      <View style={box(77, 46, 20, 38, 12, WING, { transform: [{ rotate: '-8deg' }] })} />
      <View style={box(26, 58, 48, 34, 24, CREAM)} />
      {/* kacamata biru */}
      {ring(15)}
      {ring(51)}
      <View style={box(48, 41, 4, 3.5, 1, BLUE)} />
      {sad && (<>
        <View style={box(18, 20, 22, 4, 2, '#5B3A1A', { transform: [{ rotate: '-16deg' }] })} />
        <View style={box(60, 20, 22, 4, 2, '#5B3A1A', { transform: [{ rotate: '16deg' }] })} />
      </>)}
      {!sad && (<>
        <View style={box(11, 54, 9, 6, 4, '#FF9DB5', { opacity: 0.6 })} />
        <View style={box(80, 54, 9, 6, 4, '#FF9DB5', { opacity: 0.6 })} />
      </>)}
      {/* paruh & kaki */}
      <View style={{ position: 'absolute', left: 44 * u, top: 54 * u, width: 0, height: 0, borderLeftWidth: 6 * u, borderRightWidth: 6 * u, borderTopWidth: 10 * u, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: GOLD }} />
      <View style={box(30, 94, 16, 7, 4, GOLD)} />
      <View style={box(54, 94, 16, 7, 4, GOLD)} />
      </View>
      {/* topi Natal */}
      {hat && (
        <View style={{ position: 'absolute', left: 0, top: 0, width: size, height: 44 * u, transform: [{ rotate: '9deg' }] }}>
          <View style={box(34, 20, 32, 14, 7, '#C62828')} />
          <View style={{ position: 'absolute', left: 28 * u, top: 6 * u, width: 0, height: 0, borderLeftWidth: 22 * u, borderRightWidth: 22 * u, borderBottomWidth: 26 * u, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#E53935' }} />
          <View style={box(44, 0, 13, 13, 6.5, '#fff', { borderWidth: 0.8 * u, borderColor: '#E2E8F0' })} />
          <View style={box(22, 28, 56, 12, 6, '#fff', { borderWidth: 0.8 * u, borderColor: '#E2E8F0' })} />
        </View>
      )}
    </Animated.View>
  );
}

export default memo(Owl);
