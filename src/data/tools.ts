/**
 * Web araçları (YKS Sayacı, Net Hesaplama): uygulamayla aynı veriler.
 * Kaynak (flutter_application_1):
 *   lib/screens/ana_panel.dart        YksSayacWidget: oturum saatleri, Android widget yüzdesi
 *   lib/screens/net_wizard_screen.dart  Net Sihirbazı: dersler, soru sayıları, D − Y/4
 *
 * ÖSYM 2027 takvimini açıklamadı (1 Ekim 2026 itibarıyla osym.gov.tr'de 2026 takvimi var:
 * TYT 20.06.2026 cumartesi, AYT ve YDT 21.06.2026 pazar). 2027 tarihleri bu düzene göre
 * tahmindir; takvim açıklanınca hem burada hem uygulamada güncellenir.
 */

export interface Session {
  key: 'tyt' | 'ayt' | 'ydt';
  short: string;
  name: string;
  /** Oturumun başlangıcı, Türkiye saati */
  iso: string;
  day: string;
  time: string;
  detail: string;
  /** Bir önceki YKS'deki aynı oturum: hazırlık yılının başlangıcı (Android widget yüzdesi) */
  prevIso: string;
}

export const sessions: Session[] = [
  {
    key: 'tyt',
    short: 'TYT',
    name: 'Temel Yeterlilik Testi',
    iso: '2027-06-19T10:15:00+03:00',
    day: '19 Haziran 2027 Cumartesi',
    time: '10.15',
    detail: '120 soru, 165 dakika',
    prevIso: '2026-06-20T10:15:00+03:00',
  },
  {
    key: 'ayt',
    short: 'AYT',
    name: 'Alan Yeterlilik Testleri',
    iso: '2027-06-20T10:15:00+03:00',
    day: '20 Haziran 2027 Pazar',
    time: '10.15',
    detail: '160 soru, 180 dakika',
    prevIso: '2026-06-21T10:15:00+03:00',
  },
  {
    key: 'ydt',
    short: 'YDT',
    name: 'Yabancı Dil Testi',
    iso: '2027-06-20T15:45:00+03:00',
    day: '20 Haziran 2027 Pazar',
    time: '15.45',
    detail: '80 soru, 120 dakika',
    prevIso: '2026-06-21T15:45:00+03:00',
  },
];

export type Area = 'TYT' | 'SAY' | 'EA' | 'SÖZ' | 'DİL';
export const areas: Area[] = ['TYT', 'SAY', 'EA', 'SÖZ', 'DİL'];

export interface Subject {
  key: string;
  name: string;
  /** Soru sayısı */
  q: number;
  /** AYT dersinin göründüğü puan türleri */
  areas?: Area[];
}

/** TYT: uygulamadaki sırayla (Türkçe, Matematik, Sosyal, Fen) */
export const tytSubjects: Subject[] = [
  { key: 'tyt_tur', name: 'Türkçe', q: 40 },
  { key: 'tyt_mat', name: 'Matematik', q: 40 },
  { key: 'tyt_sos', name: 'Sosyal Bilimler', q: 20 },
  { key: 'tyt_fen', name: 'Fen Bilimleri', q: 20 },
];

/** AYT ve YDT: SAY, EA ve SÖZ'deki sıralar uygulamadakiyle aynı çıkar */
export const aytSubjects: Subject[] = [
  { key: 'ayt_mat', name: 'Matematik', q: 40, areas: ['SAY', 'EA'] },
  { key: 'ayt_fiz', name: 'Fizik', q: 14, areas: ['SAY'] },
  { key: 'ayt_kim', name: 'Kimya', q: 13, areas: ['SAY'] },
  { key: 'ayt_biy', name: 'Biyoloji', q: 13, areas: ['SAY'] },
  { key: 'ayt_edb', name: 'Edebiyat', q: 24, areas: ['EA', 'SÖZ'] },
  { key: 'ayt_tar1', name: 'Tarih-1', q: 10, areas: ['EA', 'SÖZ'] },
  { key: 'ayt_cog1', name: 'Coğrafya-1', q: 6, areas: ['EA', 'SÖZ'] },
  { key: 'ayt_tar2', name: 'Tarih-2', q: 11, areas: ['SÖZ'] },
  { key: 'ayt_cog2', name: 'Coğrafya-2', q: 11, areas: ['SÖZ'] },
  { key: 'ayt_fel', name: 'Felsefe Grubu', q: 12, areas: ['SÖZ'] },
  { key: 'ayt_din', name: 'Din Kültürü', q: 6, areas: ['SÖZ'] },
  { key: 'ayt_dil', name: 'Yabancı Dil', q: 80, areas: ['DİL'] },
];

/** Soru dağılımı (ÖSYM): Net Hesaplama sayfasındaki başvuru bölümü */
export const distribution = [
  {
    test: 'TYT',
    total: '120 soru, 165 dakika',
    parts: [
      { name: 'Türkçe', q: 40 },
      { name: 'Sosyal Bilimler', q: 20, sub: 'Tarih 5, Coğrafya 5, Felsefe 5, Din Kültürü 5' },
      { name: 'Temel Matematik', q: 40 },
      { name: 'Fen Bilimleri', q: 20, sub: 'Fizik 7, Kimya 7, Biyoloji 6' },
    ],
  },
  {
    test: 'AYT',
    total: '160 soru, 180 dakika',
    parts: [
      { name: 'Matematik', q: 40 },
      { name: 'Fen Bilimleri', q: 40, sub: 'Fizik 14, Kimya 13, Biyoloji 13' },
      { name: 'Edebiyat ve Sosyal Bilimler-1', q: 40, sub: 'Edebiyat 24, Tarih-1 10, Coğrafya-1 6' },
      { name: 'Sosyal Bilimler-2', q: 40, sub: 'Tarih-2 11, Coğrafya-2 11, Felsefe Grubu 12, Din Kültürü 6' },
    ],
  },
  {
    test: 'YDT',
    total: '80 soru, 120 dakika',
    parts: [{ name: 'Yabancı Dil', q: 80, sub: 'İngilizce, Almanca, Arapça, Fransızca ya da Rusça' }],
  },
];
