import { Platform } from 'react-native';

// Efek suara (berkas WAV di assets/sounds, dibuat sintetis, bebas hak cipta).
// sfx('correct') memutar suara; aman dipanggil di mana saja (gagal diam-diam bila audio tak tersedia).
// Pemutar dibuat sekali per suara lalu dipakai ulang. Suara selalu menyala (tidak ada pengaturan).
let audio = null;
try { audio = require('expo-audio'); } catch (e) { audio = null; }

const FILES = {
  tap: require('../../assets/sounds/tap.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  tab: require('../../assets/sounds/tab.wav'),
  start: require('../../assets/sounds/start.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  finish: require('../../assets/sounds/finish.wav'),
  badge: require('../../assets/sounds/badge.wav'),
  claim: require('../../assets/sounds/claim.wav'),
  flip: require('../../assets/sounds/flip.wav'),
  step: require('../../assets/sounds/step.wav'),
  send: require('../../assets/sounds/send.wav'),
  receive: require('../../assets/sounds/receive.wav'),
};

const players = {};

try { if (audio && audio.setAudioModeAsync && Platform.OS !== 'web') audio.setAudioModeAsync({ playsInSilentMode: true }); } catch (e) { /* abaikan */ }

export function sfx(name) {
  if (!audio || !FILES[name]) return;
  try {
    let p = players[name];
    if (!p) { p = audio.createAudioPlayer(FILES[name]); players[name] = p; }
    try { p.seekTo(0); } catch (e) { /* pemutar baru */ }
    p.play();
  } catch (e) { /* audio tidak tersedia: abaikan */ }
}

// Siapkan semua pemutar sedikit demi sedikit setelah aplikasi tampil, agar ketukan pertama tidak tersendat.
export function preloadSfx() {
  if (!audio) return;
  Object.keys(FILES).forEach((name, i) => setTimeout(() => {
    try { if (!players[name]) players[name] = audio.createAudioPlayer(FILES[name]); } catch (e) { /* abaikan */ }
  }, 120 * i));
}
