import { Platform, useWindowDimensions } from 'react-native';

// Font UI: Nunito (bulat & ramah, mirip gaya Duolingo; lisensi OFL) dibundel di assets/fonts agar SAMA di Android, iOS, web.
// Rumus matematika tetap pakai Liberation Serif (gaya buku, metrik = Times New Roman): kunci m (biasa) & mb (tebal).
// Bila gagal dimuat, jatuh ke font sans/serif sistem.
export const fonts = { r: 'Nunito', b: 'Nunito-ExtraBold', m: 'TNR', mb: 'TNR-Bold' };
export const useSystemFont = () => {
  const sans = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif', default: "system-ui, 'Segoe UI', Roboto, sans-serif" });
  const serif = Platform.select({ ios: 'Times New Roman', android: 'serif', default: "'Times New Roman', Times, serif" });
  fonts.r = sans; fonts.b = sans; fonts.m = serif; fonts.mb = serif;
};

export const C = {
  bg: '#FFFFFF', ink: '#1F2A44', sub: '#64748B', line: '#E2E8F0', soft: '#F1F5FB',
  blue: '#1CB0F6', blueD: '#1899D6', blueL: '#DDF4FF', navy: '#1D3F8A',
  green: '#58CC02', greenD: '#46A302', greenL: '#D7FFB8', greenT: '#3C8C00',
  red: '#FF4B4B', redD: '#D93A3A', redL: '#FFDFE0', redT: '#C62828',
  gold: '#FFC800', goldD: '#D9A900', goldL: '#FFF4CC',
  purple: '#CE82FF', purpleD: '#A560DB', orange: '#FF9600', orangeD: '#D97C00',
};

// Skala responsif: 390dp = ukuran acuan (HP Android umum). Layar kecil (320dp) mengecil sedikit,
// layar besar membesar sedikit, dibatasi supaya tidak kekecilan/kegedean. Dinamis: ikut berubah bila lebar layar berubah
// (rotasi, layar lipat, mode split-screen). Lebar dibatasi 560 karena isi aplikasi memang maksimal selebar itu.
export const BASE_W = 390;
// FONT_K: pengecil global semua teks (ukuran terasa terlalu besar). Naikkan (mis. 0.92) bila kekecilan, turunkan bila masih besar.
export const FONT_K = 0.86;
export const scaleFor = (w) => Math.max(0.92, Math.min(1.04, Math.min(w, 560) / BASE_W));
export const useScale = () => scaleFor(useWindowDimensions().width);
