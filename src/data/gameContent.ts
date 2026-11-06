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

// Extended long Lõuna-Eesti gravel rally stage (~90 control points with flowing hills, crests & corners)
export const STAGE_CONTROL_POINTS: TrackPoint[] = [
  { x: 0, y: 0, h: 0 },
  { x: 0, y: -550, h: 4 },
  { x: 60, y: -1150, h: 24 },
  { x: 180, y: -1650, h: 52 },
  { x: 350, y: -2150, h: 32 },
  { x: 750, y: -2600, h: 8 },
  { x: 1350, y: -2750, h: 0 },
  { x: 1900, y: -2450, h: 16 },
  { x: 2250, y: -1850, h: 36 },
  { x: 2150, y: -1200, h: 22 },
  { x: 1750, y: -650, h: 2 },
  { x: 1550, y: 0, h: -8 },
  { x: 1850, y: 600, h: 12 },
  { x: 2450, y: 950, h: 46 },
  { x: 3100, y: 1100, h: 68 },
  { x: 3750, y: 1050, h: 38 },
  { x: 4350, y: 750, h: 8 },
  { x: 4750, y: 150, h: 6 },
  { x: 4650, y: -550, h: 28 },
  { x: 4250, y: -1200, h: 50 },
  { x: 4100, y: -1900, h: 34 },
  { x: 4450, y: -2550, h: 10 },
  { x: 5100, y: -2950, h: -8 },
  { x: 5850, y: -2900, h: 12 },
  { x: 6450, y: -2500, h: 44 },
  { x: 7050, y: -2000, h: 62 },
  { x: 7600, y: -1450, h: 42 },
  { x: 8150, y: -850, h: 14 },
  { x: 8500, y: -150, h: 0 },
  { x: 8300, y: 550, h: 14 },
  { x: 7750, y: 1050, h: 32 },
  { x: 7450, y: 1650, h: 26 },
  { x: 7750, y: 2250, h: 8 },
  { x: 8400, y: 2600, h: -4 },
  { x: 9150, y: 2550, h: 18 },
  { x: 9850, y: 2150, h: 52 },
  { x: 10500, y: 1650, h: 74 },
  { x: 11150, y: 1100, h: 42 },
  { x: 11750, y: 500, h: 10 },
  { x: 12100, y: -250, h: 2 },
  { x: 11900, y: -1000, h: 24 },
  { x: 11400, y: -1650, h: 42 },
  { x: 11350, y: -2350, h: 26 },
  { x: 11850, y: -2950, h: 4 },
  { x: 12600, y: -3200, h: 14 },
  { x: 13350, y: -2950, h: 48 },
  { x: 14050, y: -2500, h: 26 },
  { x: 14650, y: -1950, h: 8 },
  { x: 15250, y: -1350, h: 22 },
  { x: 15950, y: -850, h: 48 },
  { x: 16700, y: -550, h: 64 },
  { x: 17450, y: -600, h: 36 },
  { x: 18150, y: -950, h: 12 },
  { x: 18750, y: -1550, h: -4 },
  { x: 19100, y: -2250, h: 16 },
  { x: 18950, y: -2950, h: 44 },
  { x: 18450, y: -3550, h: 58 },
  { x: 18250, y: -4250, h: 32 },
  { x: 18650, y: -4850, h: 10 },
  { x: 19350, y: -5200, h: 4 },
  { x: 20150, y: -5100, h: 28 },
  { x: 20850, y: -4650, h: 56 },
  { x: 21450, y: -4050, h: 72 },
  { x: 22050, y: -3350, h: 44 },
  { x: 22600, y: -2600, h: 14 },
  { x: 22950, y: -1800, h: 0 },
  { x: 22800, y: -1000, h: 18 },
  { x: 22300, y: -300, h: 42 },
  { x: 22000, y: 450, h: 34 },
  { x: 22250, y: 1200, h: 12 },
  { x: 22900, y: 1750, h: -6 },
  { x: 23700, y: 1950, h: 14 },
  { x: 24500, y: 1750, h: 46 },
  { x: 25250, y: 1300, h: 68 },
  { x: 25950, y: 700, h: 42 },
  { x: 26600, y: 50, h: 16 },
  { x: 27150, y: -650, h: 4 },
  { x: 27450, y: -1400, h: 24 },
  { x: 27300, y: -2150, h: 50 },
  { x: 26950, y: -2850, h: 38 },
  { x: 27150, y: -3550, h: 12 },
  { x: 27800, y: -4050, h: 6 },
  { x: 28600, y: -4150, h: 30 },
  { x: 29400, y: -3850, h: 58 },
  { x: 30150, y: -3350, h: 40 },
  { x: 30850, y: -2750, h: 16 },
  { x: 31500, y: -2100, h: 6 },
  { x: 32100, y: -1450, h: 4 },
  { x: 32650, y: -800, h: 4 },
];

export const ROAD_HALF_WIDTH = 104;
