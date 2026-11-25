import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { T } from './ui';
import { C, fonts } from './theme';

// Diagram panah: memperlihatkan arah perubahan dua besaran.
// kind: 's' (senilai: naik-naik) | 'b' (berbalik nilai: naik-turun) | 'both' (keduanya, ditumpuk)
// a, b: nama besaran (opsional). compact: tanpa kalimat penutup.
const Arrow = ({ up, color, size = 34 }) => (
  <View style={{ alignItems: 'center', transform: [{ rotate: up ? '0deg' : '180deg' }] }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.5, borderRightWidth: size * 0.5, borderBottomWidth: size * 0.55, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
    <View style={{ width: size * 0.34, height: size * 0.6, backgroundColor: color, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />
  </View>
);

const Side = ({ label, up, text }) => {
  const color = up ? C.green : C.red;
  return (
    <View style={{ flex: 1, alignItems: 'center', borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 16, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 6 }}>
      <T numberOfLines={2} style={{ fontWeight: '700', fontSize: 15, textAlign: 'center' }}>{label}</T>
      <View style={{ marginVertical: 8 }}><Arrow up={up} color={color} /></View>
      <T style={{ fontWeight: '700', fontSize: 13, color: up ? C.greenT : C.redT, textAlign: 'center' }}>{text}</T>
    </View>
  );
};

function One({ kind, a, b, compact }) {
  const s = kind === 's';
  const col = s ? C.blueD : C.purpleD;
  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Side label={a || 'Besaran 1'} up text="bertambah" />
        <View style={{ width: 92, alignItems: 'center', paddingHorizontal: 4 }}>
          <T style={{ fontWeight: '700', fontSize: 14, color: col, textAlign: 'center' }}>{s ? 'SENILAI' : 'BERBALIK NILAI'}</T>
          <View style={{ height: 3, alignSelf: 'stretch', backgroundColor: col, borderRadius: 2, marginVertical: 4 }} />
          <T style={{ fontSize: 12, color: C.sub, textAlign: 'center' }}>{s ? 'berbanding lurus' : 'berbanding terbalik'}</T>
        </View>
        <Side label={b || 'Besaran 2'} up={s} text={s ? 'ikut bertambah' : 'berkurang'} />
      </View>
      {compact ? null : (
        <View style={{ backgroundColor: s ? C.blueL : '#F3E8FF', borderRadius: 12, padding: 10, marginTop: 8 }}>
          <Text style={{ fontFamily: fonts.r, fontSize: 15, color: C.ink, textAlign: 'center' }}>
            {s ? 'Naik–naik: hasil bagi (y ÷ x) selalu tetap.' : 'Naik–turun: hasil kali (x × y) selalu tetap.'}
          </Text>
        </View>
      )}
    </View>
  );
}

function Panah({ kind = 's', a, b, compact }) {
  if (kind === 'both') {
    return (
      <View>
        <One kind="s" a={a} b={b} compact={compact} />
        <One kind="b" a={a} b={b} compact={compact} />
      </View>
    );
  }
  return <One kind={kind} a={a} b={b} compact={compact} />;
}

export default memo(Panah);
