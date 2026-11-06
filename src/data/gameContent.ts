export type CarId = 'skoda' | 'peugeot' | 'audi' | 'subaru' | 'mercedes';
export type GameMode = 'time_attack' | 'split_screen';

export interface CarOption {
  id: CarId;
  name: string;
  subtitle: string;
  accentColor: string;
  badgeText: string;
}

export interface LeaderboardEntry {
  id: string;
  mode: GameMode;
  timeMs: number | null;
  drinks: number;
  carName: string;
  winnerText?: string;
  dateStr: string;
}

export const CAR_OPTIONS: CarOption[] = [
  {
    id: 'skoda',
    name: '2020 Škoda Scala',
    subtitle: 'Eesti tänavaseade • 515 TKW',
    accentColor: '#dc2626',
    badgeText: '515 TKW',
  },
  {
    id: 'peugeot',
    name: 'Peugeot 205 T16',
    subtitle: 'Peugeot Talbot Sport Group B Livery',
    accentColor: '#2563eb',
    badgeText: '#2 PTS',
  },
  {
    id: 'audi',
    name: 'Audi Quattro S1',
    subtitle: 'Audi Sport HB Rally Livery',
    accentColor: '#eab308',
    badgeText: '#1 HB',
  },
  {
    id: 'subaru',
    name: 'Subaru Impreza 22B',
    subtitle: '555 World Rally Team Livery',
    accentColor: '#1d4ed8',
    badgeText: '#3 555',
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz 190E Evo II',
    subtitle: 'DTM Sonax / AMG Racing Livery',
    accentColor: '#71717a',
    badgeText: '#4 DTM',
  },
];

export const GAME_TEXT = {
  title: 'JOOMARALLY',
  subtitle: 'Eesti kruusaralli seltskonnamäng',
  modeSingle: 'ÜKSINDA (TIME ATTACK)',
  modeSplit: 'KAHEKESI (SPLIT SCREEN)',
  mainStartButton: 'START — VALI AUTO',
  rulesTitle: 'MÄNGU REEGLID',
  rulesList: [
    'Auto liigub nooleklahvide abil (Split Screenil vasakul WASD ja paremal nooled).',
    'Kui sõidad rajalt välja ja toimub avarii, võtad shoti ja lükkad järgmise sõitja rooli!',
    'Kui sõidad 25 sekundit järjest ilma avariita, tuleb võtta lonks, sest sõidad liiga hästi!',
    'Split Screenis jagatakse tiim kaheks väiksemaks — see, kes hetkel roolis ei ole, joob! Võidab see, kes esimesena lõpetab.',
  ],
  leaderboardTitle: 'EELMISED SÕIDUD & JOODUD JOOGID',
  leaderboardEmpty: 'Ühtegi sõitu pole veel tehtud. Vajuta START ja tee esimene aeg!',
  selectCarTitle: 'VALI AUTO',
  player1Label: 'TIIM 1 (VASAK — WASD)',
  player2Label: 'TIIM 2 (PAREM — NOOLED)',
  p1ControlsHint: 'WASD — juhtimine   |   SHIFT — käsipidur   |   SPACE — jätka pärast pausi/avariid',
  p2ControlsHint: 'NOOLED — juhtimine   |   ENTER — jätka pärast pausi/avariid',
  singleControlsHint: 'NOOLED — juhtimine   |   SPACE — käsipidur   |   ENTER — jätka pärast pausi/avariid',
  startButton: 'ALUSTA SÕITU',
  backToMenu: 'TAGASI AVALEHELE',
  crashTitle: 'AVARII! võta shot ja lükka järgmine sõitja rooli!',
  tooGoodTitle: 'joo veidi, sa sõidad liiga hästi.',
  hitFriendsTitle:
    'Sõitsid Nadimile, Kertile ja Hansule otsa. Nüüd nad on su peale niii pahased ja üritavad sind šaboteerida',
  hitJakobTitle:
    'Häbi sul olgu! Sõitsid vaesele Jakobile otsa! Nüüd on sul eriti kiire, sest pead Jakobi EMO-sse viima',
  hitLaureenTitle:
    'AVARII! Sõitsid Laureenile otsa, viinapudel läks katki ja viin lendas sulle suhu',
  crashContinueEnter: 'Jätkamiseks vajuta ENTER',
  crashContinueSpace: 'Jätkamiseks vajuta SPACE',
  finishTitle: 'FINIŠ!',
  p1WinsTitle: 'VASAK TIIM (P1) VÕITIS!',
  p2WinsTitle: 'PAREM TIIM (P2) VÕITIS!',
  newRecord: 'UUS RAJAREKORD!',
  playAgainHint: 'Uuesti sõitmiseks vajuta ENTER või kliki siia',
  bestTimeLabel: 'PARIM AEG',
  timeLabel: 'AEG',
  progressLabel: 'RADA',
  crashesLabel: 'JOOGID',
} as const;

export interface TrackPoint {
  x: number;
  y: number;
  h: number;
}

// Long, ultra-smooth flowing Lõuna-Eesti gravel rally stage (140+ points with gentle sweeping curves & smooth hills)
export const STAGE_CONTROL_POINTS: TrackPoint[] = [
  { x: 0, y: 0, h: 0 },
  { x: 0, y: -600, h: 4 },
  { x: 50, y: -1200, h: 16 },
  { x: 160, y: -1800, h: 32 },
  { x: 350, y: -2350, h: 24 },
  { x: 700, y: -2800, h: 10 },
  { x: 1250, y: -3000, h: 2 },
  { x: 1850, y: -2850, h: 12 },
  { x: 2350, y: -2350, h: 28 },
  { x: 2550, y: -1700, h: 20 },
  { x: 2400, y: -1000, h: 6 },
  { x: 2250, y: -300, h: -4 },
  { x: 2450, y: 350, h: 10 },
  { x: 2950, y: 850, h: 32 },
  { x: 3600, y: 1150, h: 48 },
  { x: 4300, y: 1150, h: 30 },
  { x: 4950, y: 850, h: 10 },
  { x: 5450, y: 250, h: 4 },
  { x: 5600, y: -450, h: 20 },
  { x: 5400, y: -1150, h: 38 },
  { x: 5250, y: -1850, h: 26 },
  { x: 5500, y: -2550, h: 8 },
  { x: 6050, y: -3050, h: -4 },
  { x: 6750, y: -3200, h: 10 },
  { x: 7450, y: -2950, h: 32 },
  { x: 8100, y: -2450, h: 46 },
  { x: 8700, y: -1850, h: 30 },
  { x: 9250, y: -1200, h: 12 },
  { x: 9600, y: -450, h: 2 },
  { x: 9550, y: 300, h: 14 },
  { x: 9200, y: 950, h: 28 },
  { x: 8950, y: 1650, h: 22 },
  { x: 9150, y: 2350, h: 6 },
  { x: 9700, y: 2850, h: -2 },
  { x: 10450, y: 2950, h: 14 },
  { x: 11200, y: 2700, h: 38 },
  { x: 11900, y: 2200, h: 54 },
  { x: 12550, y: 1600, h: 32 },
  { x: 13150, y: 950, h: 10 },
  { x: 13550, y: 200, h: 2 },
  { x: 13500, y: -550, h: 18 },
  { x: 13150, y: -1250, h: 34 },
  { x: 13050, y: -2000, h: 22 },
  { x: 13450, y: -2650, h: 4 },
  { x: 14150, y: -3050, h: 12 },
  { x: 14950, y: -3000, h: 36 },
  { x: 15700, y: -2600, h: 24 },
  { x: 16350, y: -2050, h: 8 },
  { x: 17000, y: -1450, h: 18 },
  { x: 17700, y: -900, h: 38 },
  { x: 18450, y: -550, h: 48 },
  { x: 19250, y: -550, h: 28 },
  { x: 20000, y: -850, h: 10 },
  { x: 20650, y: -1450, h: -2 },
  { x: 21050, y: -2150, h: 14 },
  { x: 21050, y: -2900, h: 34 },
  { x: 20750, y: -3650, h: 44 },
  { x: 20650, y: -4400, h: 26 },
  { x: 21050, y: -5050, h: 8 },
  { x: 21750, y: -5450, h: 4 },
  { x: 22550, y: -5450, h: 22 },
  { x: 23350, y: -5050, h: 44 },
  { x: 24050, y: -4450, h: 56 },
  { x: 24700, y: -3750, h: 34 },
  { x: 25300, y: -2950, h: 12 },
  { x: 25700, y: -2100, h: 0 },
  { x: 25650, y: -1250, h: 14 },
  { x: 25300, y: -450, h: 32 },
  { x: 25100, y: 350, h: 26 },
  { x: 25350, y: 1150, h: 10 },
  { x: 26000, y: 1750, h: -4 },
  { x: 26800, y: 2050, h: 12 },
  { x: 27650, y: 1950, h: 36 },
  { x: 28450, y: 1550, h: 52 },
  { x: 29200, y: 950, h: 34 },
  { x: 29900, y: 250, h: 12 },
  { x: 30450, y: -500, h: 4 },
  { x: 30750, y: -1300, h: 20 },
  { x: 30650, y: -2100, h: 40 },
  { x: 30350, y: -2850, h: 30 },
  { x: 30550, y: -3600, h: 10 },
  { x: 31200, y: -4150, h: 4 },
  { x: 32050, y: -4300, h: 24 },
  { x: 32900, y: -4050, h: 46 },
  { x: 33700, y: -3550, h: 32 },
  { x: 34450, y: -2900, h: 12 },
  { x: 35150, y: -2200, h: 4 },
  { x: 35850, y: -1500, h: 18 },
  { x: 36600, y: -850, h: 38 },
  { x: 37450, y: -400, h: 50 },
  { x: 38350, y: -250, h: 30 },
  { x: 39200, y: -450, h: 10 },
  { x: 39950, y: -950, h: 0 },
  { x: 40500, y: -1650, h: 16 },
  { x: 40750, y: -2450, h: 36 },
  { x: 40650, y: -3250, h: 28 },
  { x: 40950, y: -4000, h: 8 },
  { x: 41650, y: -4500, h: -2 },
  { x: 42500, y: -4600, h: 18 },
  { x: 43350, y: -4300, h: 42 },
  { x: 44100, y: -3700, h: 54 },
  { x: 44800, y: -2950, h: 32 },
  { x: 45450, y: -2150, h: 10 },
  { x: 45950, y: -1300, h: 2 },
  { x: 46200, y: -450, h: 16 },
  { x: 46150, y: 400, h: 34 },
  { x: 46450, y: 1200, h: 24 },
  { x: 47100, y: 1800, h: 6 },
  { x: 47950, y: 2050, h: 14 },
  { x: 48800, y: 1900, h: 38 },
  { x: 49600, y: 1400, h: 28 },
  { x: 50350, y: 750, h: 10 },
  { x: 51050, y: 50, h: 4 },
  { x: 51700, y: -650, h: 4 },
];

export const ROAD_HALF_WIDTH = 112;
