import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Icon from './Icon';
import { Btn, T, Tap } from './ui';
import { C } from './theme';
import { BULAN_PENDEK } from './state';
import { sfx } from './sound';

const two = (n) => String(n).padStart(2, '0');
export function fmtWhen(ts) {
  const d = new Date(ts); const now = new Date();
  const hm = `${two(d.getHours())}:${two(d.getMinutes())}`;
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return `Hari ini, ${hm}`;
  if (diff === 1) return `Kemarin, ${hm}`;
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : ''}, ${hm}`;
}
const clean = (t) => String(t || '').replace(/[*#`|_]/g, '').replace(/\s+/g, ' ').trim();
const userCount = (c) => c.msgs.filter((m) => m.role === 'user').length;

// Daftar riwayat percakapan dengan Bubo: lihat, lanjutkan, atau hapus.
export default function ChatHistory({ chats, activeId, onPick, onNew, onDelete, onClose }) {
  const [sure, setSure] = useState(null);
  const list = chats.filter((c) => userCount(c) > 0).sort((a, b) => b.updated - a.updated);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 2, borderBottomColor: C.line }}>
        <Tap onPress={() => { sfx('tab'); onClose(); }} scaleTo={0.9} sound={null} style={{ padding: 8, marginRight: 4 }}><Icon name="back" size={26} /></Tap>
        <View style={{ flex: 1 }}>
          <T style={{ fontWeight: '700', fontSize: 21 }}>Riwayat percakapan</T>
          <T style={{ color: C.sub, fontSize: 14 }}>{list.length ? `${list.length} percakapan tersimpan di HP ini` : 'Belum ada percakapan'}</T>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Btn label="+ PERCAKAPAN BARU" onPress={onNew} style={{ marginBottom: 16 }} />
        {list.length === 0 ? (
          <T style={{ color: C.sub, textAlign: 'center', lineHeight: 24, marginTop: 20 }}>Percakapanmu dengan Bubo akan muncul di sini, dan bisa dilanjutkan kapan saja.</T>
        ) : null}
        {list.map((c) => {
          const on = c.id === activeId;
          const last = [...c.msgs].reverse().find((m) => !m.err && !m.local && m.text);
          const asking = sure === c.id;
          return (
            <View key={c.id} style={{ borderWidth: 2, borderBottomWidth: 4, borderColor: on ? C.blue : C.line, backgroundColor: on ? C.blueL : '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
              <Tap onPress={() => { sfx('start'); onPick(c.id); }} scaleTo={0.98} sound={null} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <T numberOfLines={1} style={{ fontWeight: '700', fontSize: 18, flex: 1 }}>{c.title || 'Percakapan'}</T>
                  {on ? <View style={{ backgroundColor: C.blue, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1, marginLeft: 8 }}><T style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>AKTIF</T></View> : null}
                </View>
                {last ? <T numberOfLines={2} style={{ color: C.sub, fontSize: 15, lineHeight: 21, marginTop: 4 }}>{last.role === 'user' ? 'Kamu: ' : 'Bubo: '}{clean(last.text)}</T> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Icon name="clock" size={16} />
                  <T style={{ color: C.sub, fontSize: 13, marginLeft: 5, flex: 1 }}>{fmtWhen(c.updated)} · {userCount(c)} pertanyaan</T>
                </View>
              </Tap>
              <View style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: on ? '#BFE8FF' : C.line }}>
                <Tap onPress={() => { sfx('start'); onPick(c.id); }} scaleTo={0.96} sound={null} style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}>
                  <T style={{ color: C.blueD, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }}>LANJUTKAN</T>
                </Tap>
                <Tap onPress={() => { if (asking) { setSure(null); onDelete(c.id); } else { sfx('tap'); setSure(c.id); setTimeout(() => setSure((s) => (s === c.id ? null : s)), 3500); } }} scaleTo={0.96} sound={null} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderLeftWidth: 2, borderLeftColor: on ? '#BFE8FF' : C.line, backgroundColor: asking ? C.redL : 'transparent' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="trash" size={18} />
                    <T style={{ color: C.redT, fontWeight: '700', fontSize: 15, marginLeft: 6 }}>{asking ? 'YAKIN? KETUK LAGI' : 'HAPUS'}</T>
                  </View>
                </Tap>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
