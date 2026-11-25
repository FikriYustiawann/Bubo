import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import Owl from './Owl';
import Icon from './Icon';
import { Btn, Input, PopIn, Reveal, T } from './ui';
import { C, fonts } from './theme';
import { APP_NAME, MASCOT } from './brand';

const PERKS = [
  { icon: 'target', t: 'Soal selalu baru', bg: C.blueL, fg: C.blueD },
  { icon: 'flame', t: 'Misi & runtutan', bg: '#FFF1DB', fg: C.orangeD },
  { icon: 'owl', t: `Tanya ${MASCOT}`, bg: '#F6EBFF', fg: C.purpleD },
];

export function Onboard({ onDone }) {
  const [name, setName] = useState('');
  const [focus, setFocus] = useState(false);
  const ok = name.trim().length > 0;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: C.blueL, opacity: 0.7 }} />
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 40, left: -80, width: 190, height: 190, borderRadius: 95, backgroundColor: '#F6EBFF', opacity: 0.8 }} />

        <PopIn><Owl size={170} mood={ok ? 'cheer' : 'happy'} /></PopIn>
        <Reveal i={1}><T style={{ fontSize: 38, fontWeight: '700', marginTop: 14, color: C.navy, textAlign: 'center' }}>{APP_NAME}</T></Reveal>

        <Reveal i={2} style={{ alignSelf: 'stretch' }}>
          <View style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: C.line, borderRadius: 20, padding: 16, marginTop: 16, marginBottom: 6, backgroundColor: '#fff' }}>
            <T style={{ textAlign: 'center', lineHeight: 27, fontSize: 19 }}>Halo! Aku {MASCOT}, burung hantu berkacamata yang suka perbandingan. Yuk belajar senilai dan berbalik nilai bareng aku. Siapa namamu?</T>
          </View>
        </Reveal>

        <Reveal i={3} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
          {PERKS.map((p) => (
            <View key={p.t} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: p.bg, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, margin: 3 }}>
              <Icon name={p.icon} size={20} />
              <T style={{ color: p.fg, fontWeight: '700', fontSize: 13, marginLeft: 5 }}>{p.t}</T>
            </View>
          ))}
        </Reveal>

        <Reveal i={4} style={{ alignSelf: 'stretch' }}>
          <Input value={name} onChangeText={setName} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder="Namamu" placeholderTextColor="#94A3B8" maxLength={24}
            onSubmitEditing={() => { if (ok) onDone(name.trim()); }} returnKeyType="done"
            style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: focus ? C.blue : C.line, backgroundColor: focus ? C.blueL : '#fff', borderRadius: 16, padding: 14, fontFamily: fonts.r, fontSize: 22, textAlign: 'center', color: C.ink }} />
        </Reveal>

        <View style={{ minHeight: 40, justifyContent: 'center' }}>
          {ok ? <PopIn key={name.trim().length > 0 ? 'on' : 'off'}><T style={{ color: C.greenT, fontWeight: '700', fontSize: 17, textAlign: 'center' }}>Senang bertemu denganmu, {name.trim()}!</T></PopIn> : null}
        </View>

        <Reveal i={5} style={{ alignSelf: 'stretch' }}>
          <Btn label="MULAI BELAJAR" disabled={!ok} onPress={() => onDone(name.trim())} />
        </Reveal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
