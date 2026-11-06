import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Trophy, Flag, Users, User } from 'lucide-react';
import {
  CAR_OPTIONS,
  GAME_TEXT,
  ROAD_HALF_WIDTH,
  type CarId,
  type GameMode,
  type LeaderboardEntry,
} from './data/gameContent';
import { buildTrackSpline, sampleRoadSurface } from './utils/track';
import {
  buildFriendsBench,
  buildGateArch,
  buildHillyTerrainMesh,
  buildJakobSpot,
  buildLaureenSpot,
  buildRoadRibbonMesh,
  buildSceneryMeshes,
  createSportsBallPool,
} from './utils/scene3d';
import { buildCarModel3D, createCarEnvironmentTexture, type Car3D } from './utils/carModel3d';
import { CarPreview3D } from './components/CarPreview3D';
import { sound } from './utils/sound';
import nadimKertHansImg from './assets/nadim_kert_hans.jpg';
import jakobImg from './assets/jakob.jpg';
import laureenImg from './assets/laureen.jpg';

type ScreenState = 'menu' | 'car_select' | 'racing' | 'finished';

interface PlayerPhysicsState {
  crashed: boolean;
  tooGoodPause: boolean;
  hitFriendsCrash: boolean;
  hitJakobCrash: boolean;
  hitLaureenCrash: boolean;
  jakobSpeedEffect: boolean;
  sabotaged: boolean;
  sabotageTimerMs: number;
  cleanDriveMs: number;
  carX: number;
  carY: number;
  carH: number;
  vVert: number;
  isAirborne: boolean;
  moveAngle: number;
  velAngle: number;
  slipAngle: number;
  carAngle: number;
  carPitch: number;
  speed: number;
  steerAngle: number;
  wheelRotation: number;
  suspensionPitch: number;
  suspensionRoll: number;
  suspensionBounce: number;
  trackIndex: number;
  drunkLevel: number;
  camAngle: number;
  camBaseH: number;
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    handbrake: boolean;
  };
}

const STORAGE_KEY = 'joomarally_best_time_v2';
const LEADERBOARD_KEY = 'joomarally_leaderboard_v1';

function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hundredths = Math.floor((ms % 1000) / 10);
  const minStr = minutes > 0 ? `${minutes}:` : '';
  const secStr = minutes > 0 ? String(seconds).padStart(2, '0') : String(seconds);
  const hunStr = String(hundredths).padStart(2, '0');
  return `${minStr}${secStr}.${hunStr}s`;
}

function shortestAngleDiff(from: number, to: number): number {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function createInitialPlayerState(
  startX: number,
  startY: number,
  startH: number,
  startAngle: number,
  startPitch: number
): PlayerPhysicsState {
  return {
    crashed: false,
    tooGoodPause: false,
    hitFriendsCrash: false,
    hitJakobCrash: false,
    hitLaureenCrash: false,
    jakobSpeedEffect: false,
    sabotaged: false,
    sabotageTimerMs: 0,
    cleanDriveMs: 0,
    carX: startX,
    carY: startY,
    carH: startH,
    vVert: 0,
    isAirborne: false,
    moveAngle: startAngle,
    velAngle: startAngle,
    slipAngle: 0,
    carAngle: startAngle,
    carPitch: startPitch,
    speed: 0,
    steerAngle: 0,
    wheelRotation: 0,
    suspensionPitch: 0,
    suspensionRoll: 0,
    suspensionBounce: 0,
    trackIndex: 2,
    drunkLevel: 0,
    camAngle: startAngle,
    camBaseH: startH,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      handbrake: false,
    },
  };
}

export function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const timeTextRef = useRef<HTMLDivElement | null>(null);
  const p1ProgressRef = useRef<HTMLDivElement | null>(null);
  const p2ProgressRef = useRef<HTMLDivElement | null>(null);
  const track = useMemo(() => buildTrackSpline(), []);

  const [screen, setScreen] = useState<ScreenState>('menu');
  const [mode, setMode] = useState<GameMode>('time_attack');
  const [p1Car, setP1Car] = useState<CarId>('skoda');
  const [p2Car, setP2Car] = useState<CarId>('subaru');

  const [p1Crashed, setP1Crashed] = useState<boolean>(false);
  const [p2Crashed, setP2Crashed] = useState<boolean>(false);
  const [p1TooGood, setP1TooGood] = useState<boolean>(false);
  const [p2TooGood, setP2TooGood] = useState<boolean>(false);
  const [p1HitFriends, setP1HitFriends] = useState<boolean>(false);
  const [p2HitFriends, setP2HitFriends] = useState<boolean>(false);
  const [p1HitJakob, setP1HitJakob] = useState<boolean>(false);
  const [p2HitJakob, setP2HitJakob] = useState<boolean>(false);
  const [p1HitLaureen, setP1HitLaureen] = useState<boolean>(false);
  const [p2HitLaureen, setP2HitLaureen] = useState<boolean>(false);
  const [p1Drunk, setP1Drunk] = useState<number>(0);
  const [p2Drunk, setP2Drunk] = useState<number>(0);

  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [finalTimeMs, setFinalTimeMs] = useState<number>(0);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(() => {
    try {
      localStorage.removeItem('joomarally_best_time_ms');
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  const gameRef = useRef<{
    screen: ScreenState;
    mode: GameMode;
    elapsedMs: number;
    p1: PlayerPhysicsState;
    p2: PlayerPhysicsState;
  }>({
    screen: 'menu',
    mode: 'time_attack',
    elapsedMs: 0,
    p1: createInitialPlayerState(
      track.points[2].x,
      track.points[2].y,
      track.points[2].h,
      track.points[2].angle,
      track.points[2].pitch
    ),
    p2: createInitialPlayerState(
      track.points[2].x,
      track.points[2].y,
      track.points[2].h,
      track.points[2].angle,
      track.points[2].pitch
    ),
  });

  const recordLeaderboardEntry = (entry: LeaderboardEntry) => {
    setLeaderboard((prev) => {
      const updated = [entry, ...prev].slice(0, 15);
      try {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  };

  const goToCarSelect = () => {
    sound.init();
    gameRef.current.mode = mode;
    gameRef.current.screen = 'car_select';
    setScreen('car_select');
  };

  const startRace = () => {
    sound.init();
    const startPt = track.points[2];
    const g = gameRef.current;
    g.screen = 'racing';
    g.mode = mode;
    g.elapsedMs = 0;

    if (mode === 'time_attack') {
      g.p1 = createInitialPlayerState(
        startPt.x,
        startPt.y,
        startPt.h,
        startPt.angle,
        startPt.pitch
      );
    } else {
      const laneOffset = 24;
      g.p1 = createInitialPlayerState(
        startPt.x - startPt.nx * laneOffset,
        startPt.y - startPt.ny * laneOffset,
        startPt.h,
        startPt.angle,
        startPt.pitch
      );
      g.p2 = createInitialPlayerState(
        startPt.x + startPt.nx * laneOffset,
        startPt.y + startPt.ny * laneOffset,
        startPt.h,
        startPt.angle,
        startPt.pitch
      );
    }

    setP1Crashed(false);
    setP2Crashed(false);
    setP1TooGood(false);
    setP2TooGood(false);
    setP1HitFriends(false);
    setP2HitFriends(false);
    setP1HitJakob(false);
    setP2HitJakob(false);
    setP1HitLaureen(false);
    setP2HitLaureen(false);
    setP1Drunk(0);
    setP2Drunk(0);
    setWinner(null);
    setFinalTimeMs(0);
    setIsNewRecord(false);
    setScreen('racing');
  };

  const resumePlayerAfterCrash = (playerNum: 1 | 2) => {
    const g = gameRef.current;
    const p = playerNum === 1 ? g.p1 : g.p2;
    if (!p.crashed && !p.tooGoodPause) return;

    const indexJump =
      p.hitFriendsCrash || p.hitJakobCrash || p.hitLaureenCrash ? 10 : 0;
    const safeIdx = Math.min(track.points.length - 6, Math.max(2, p.trackIndex + indexJump));
    const centerPt = track.points[safeIdx];

    p.drunkLevel += p.hitLaureenCrash ? 2 : 1;
    p.crashed = false;
    p.tooGoodPause = false;
    p.hitFriendsCrash = false;
    p.hitJakobCrash = false;
    p.hitLaureenCrash = false;
    p.cleanDriveMs = 0;
    p.carX = centerPt.x;
    p.carY = centerPt.y;
    p.carH = centerPt.h;
    p.vVert = 0;
    p.isAirborne = false;
    p.moveAngle = centerPt.angle;
    p.velAngle = centerPt.angle;
    p.slipAngle = 0;
    p.carAngle = centerPt.angle;
    p.carPitch = centerPt.pitch;
    p.speed = 0;
    p.steerAngle = 0;
    p.suspensionPitch = 0;
    p.suspensionRoll = 0;
    p.suspensionBounce = 0;
    p.camAngle = centerPt.angle;
    p.camBaseH = centerPt.h;
    p.keys = { up: false, down: false, left: false, right: false, handbrake: false };

    if (playerNum === 1) {
      setP1Drunk(p.drunkLevel);
      setP1Crashed(false);
      setP1TooGood(false);
      setP1HitFriends(false);
      setP1HitJakob(false);
      setP1HitLaureen(false);
    } else {
      setP2Drunk(p.drunkLevel);
      setP2Crashed(false);
      setP2TooGood(false);
      setP2HitFriends(false);
      setP2HitJakob(false);
      setP2HitLaureen(false);
    }
  };

  const toggleMute = () => {
    sound.init();
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  const cycleCar = (current: CarId, dir: -1 | 1): CarId => {
    const idx = CAR_OPTIONS.findIndex((c) => c.id === current);
    const nextIdx = (idx + dir + CAR_OPTIONS.length) % CAR_OPTIONS.length;
    return CAR_OPTIONS[nextIdx].id;
  };

  // Keyboard bindings:
  // - Singleplayer: Arrows (or WASD), Space handbrake, Enter to continue after crash
  // - Split Screen:
  //   * Left player (P1): WASD to drive, LeftShift/Q/E handbrake, SPACE to continue after crash
  //   * Right player (P2): Arrows to drive, RightShift handbrake, ENTER to continue after crash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;

      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'Space'
      ) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        if (g.screen === 'racing') {
          if (g.mode === 'split_screen' && (g.p1.crashed || g.p1.tooGoodPause)) {
            resumePlayerAfterCrash(1);
            return;
          }
          if (g.mode === 'time_attack' && (g.p1.crashed || g.p1.tooGoodPause)) {
            resumePlayerAfterCrash(1);
            return;
          }
        }
      }

      if (e.code === 'Enter') {
        e.preventDefault();
        if (g.screen === 'racing') {
          if (g.mode === 'time_attack' && (g.p1.crashed || g.p1.tooGoodPause)) {
            resumePlayerAfterCrash(1);
            return;
          }
          if (g.mode === 'split_screen' && (g.p2.crashed || g.p2.tooGoodPause)) {
            resumePlayerAfterCrash(2);
            return;
          }
          return;
        }
        if (g.screen === 'car_select' || g.screen === 'finished') {
          startRace();
          return;
        }
      }

      if (g.screen !== 'racing') return;
      sound.init();

      if (g.mode === 'time_attack') {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') g.p1.keys.up = true;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') g.p1.keys.down = true;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') g.p1.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') g.p1.keys.right = true;
        if (e.code === 'Space') g.p1.keys.handbrake = true;
      } else {
        // Left screen (Player 1): WASD + LeftShift
        if (e.code === 'KeyW') g.p1.keys.up = true;
        if (e.code === 'KeyS') g.p1.keys.down = true;
        if (e.code === 'KeyA') g.p1.keys.left = true;
        if (e.code === 'KeyD') g.p1.keys.right = true;
        if (e.code === 'ShiftLeft' || e.code === 'KeyQ' || e.code === 'KeyE') {
          g.p1.keys.handbrake = true;
        }

        // Right screen (Player 2): Arrow keys + RightShift
        if (e.code === 'ArrowUp') g.p2.keys.up = true;
        if (e.code === 'ArrowDown') g.p2.keys.down = true;
        if (e.code === 'ArrowLeft') g.p2.keys.left = true;
        if (e.code === 'ArrowRight') g.p2.keys.right = true;
        if (e.code === 'ShiftRight' || e.code === 'ControlRight') {
          g.p2.keys.handbrake = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (g.mode === 'time_attack') {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') g.p1.keys.up = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') g.p1.keys.down = false;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') g.p1.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') g.p1.keys.right = false;
        if (e.code === 'Space') g.p1.keys.handbrake = false;
      } else {
        if (e.code === 'KeyW') g.p1.keys.up = false;
        if (e.code === 'KeyS') g.p1.keys.down = false;
        if (e.code === 'KeyA') g.p1.keys.left = false;
        if (e.code === 'KeyD') g.p1.keys.right = false;
        if (e.code === 'ShiftLeft' || e.code === 'KeyQ' || e.code === 'KeyE') {
          g.p1.keys.handbrake = false;
        }

        if (e.code === 'ArrowUp') g.p2.keys.up = false;
        if (e.code === 'ArrowDown') g.p2.keys.down = false;
        if (e.code === 'ArrowLeft') g.p2.keys.left = false;
        if (e.code === 'ArrowRight') g.p2.keys.right = false;
        if (e.code === 'ShiftRight' || e.code === 'ControlRight') {
          g.p2.keys.handbrake = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [track, mode]);

  // Main 3D WebGL Scene (active during racing & finished states)
  useEffect(() => {
    if (screen !== 'racing' && screen !== 'finished') {
      sound.stopContinuous();
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9b99b);
    scene.fog = new THREE.FogExp2(0xd9b99b, 0.00038);

    const cam1 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 4000);
    const cam2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 4000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envMap = createCarEnvironmentTexture(renderer);
    scene.environment = envMap;

    const hemiLight = new THREE.HemisphereLight(0xfff3d6, 0x4f6840, 0.95);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffe4b5, 1.45);
    dirLight.position.set(400, 900, 350);
    dirLight.castShadow = false;
    scene.add(dirLight);

    scene.add(buildHillyTerrainMesh(track.points));
    scene.add(buildRoadRibbonMesh(track.points));
    scene.add(buildGateArch(track.points[2], 'START', false));
    scene.add(buildGateArch(track.points[track.points.length - 5], 'FINIŠ', true));
    scene.add(buildSceneryMeshes(track.scenery));

    // Nadim, Kert & Hans sitting on a roadside bench watching the rally
    const friendsBench = buildFriendsBench(track.points, nadimKertHansImg);
    scene.add(friendsBench.group);

    // Jakob lying on the roadside further along the stage
    const jakobSpot = buildJakobSpot(track.points, jakobImg);
    scene.add(jakobSpot.group);

    // Laureen standing on the roadside further along the stage
    const laureenSpot = buildLaureenSpot(track.points, laureenImg);
    scene.add(laureenSpot.group);

    // Pool of 3D footballs and basketballs for sabotage after hitting Nadim, Kert & Hans
    interface RollingBall {
      mesh: THREE.Mesh;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      baseH: number;
      active: boolean;
      hit: boolean;
      life: number;
    }
    const ballMeshes = createSportsBallPool(scene, 18);
    const rollingBalls: RollingBall[] = ballMeshes.map((mesh) => ({
      mesh,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      baseH: 0,
      active: false,
      hit: false,
      life: 0,
    }));
    let ballPoolIdx = 0;

    const spawnSabotageBallWave = (p: PlayerPhysicsState) => {
      // Spawn 6 footballs and basketballs rolling across the road ahead of the car
      for (let k = 0; k < 6; k++) {
        const b = rollingBalls[ballPoolIdx];
        ballPoolIdx = (ballPoolIdx + 1) % rollingBalls.length;

        const aheadIdx = Math.min(track.points.length - 8, p.trackIndex + 8 + k * 5);
        const roadPt = track.points[aheadIdx];
        const fromSide = k % 2 === 0 ? -1 : 1;
        const startOffset = (ROAD_HALF_WIDTH + 30) * fromSide;

        b.x = roadPt.x + roadPt.nx * startOffset;
        b.z = roadPt.y + roadPt.ny * startOffset;
        b.baseH = roadPt.h;
        b.y = roadPt.h + 9.5;

        const crossSpeed = 88 + (k % 3) * 24;
        b.vx = -roadPt.nx * fromSide * crossSpeed;
        b.vz = -roadPt.ny * fromSide * crossSpeed;
        b.vy = 0;
        b.active = true;
        b.hit = false;
        b.life = 0;
        b.mesh.position.set(b.x, b.y, b.z);
        b.mesh.visible = true;
      }
    };

    const car1Mesh = buildCarModel3D(p1Car);
    scene.add(car1Mesh.root);

    let car2Mesh: Car3D | null = null;
    if (mode === 'split_screen') {
      car2Mesh = buildCarModel3D(p2Car);
      scene.add(car2Mesh.root);
    }

    // 3D Gravel Tire Skid/Rut Ribbons Pool
    const maxTireMarks = 360;
    const tireMarkMeshes: THREE.Mesh[] = [];
    const tireMarkGeo = new THREE.PlaneGeometry(3.5, 10.5);
    tireMarkGeo.rotateX(-Math.PI / 2);
    const tireMarkMat = new THREE.MeshBasicMaterial({
      color: 0x573d24,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    });
    for (let i = 0; i < maxTireMarks; i++) {
      const m = new THREE.Mesh(tireMarkGeo, tireMarkMat);
      m.visible = false;
      scene.add(m);
      tireMarkMeshes.push(m);
    }
    let tireMarkIdx = 0;

    const dropTireMark = (x: number, y: number, z: number, angle: number, pitch: number) => {
      const m = tireMarkMeshes[tireMarkIdx];
      tireMarkIdx = (tireMarkIdx + 1) % maxTireMarks;
      m.position.set(x, y + 0.55, z);
      m.rotation.set(pitch, -angle + Math.PI / 2, 0, 'YXZ');
      m.visible = true;
    };

    // 3D Gravel Dust Particles Pool
    interface Dust3D {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }
    const dustPool: Dust3D[] = [];
    const dustGeo = new THREE.DodecahedronGeometry(3.5, 0);
    for (let i = 0; i < 80; i++) {
      const dustMat = new THREE.MeshLambertMaterial({
        color: 0xdcc39c,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(dustGeo, dustMat);
      mesh.visible = false;
      scene.add(mesh);
      dustPool.push({ mesh, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 });
    }
    let dustIdx = 0;

    const spawnDust = (x: number, y: number, z: number, vx: number, vz: number, scale: number) => {
      const item = dustPool[dustIdx];
      dustIdx = (dustIdx + 1) % dustPool.length;
      item.mesh.position.set(
        x + (Math.random() - 0.5) * 5,
        y + 2.2,
        z + (Math.random() - 0.5) * 5
      );
      item.mesh.scale.setScalar(scale);
      item.vx = vx + (Math.random() - 0.5) * 28;
      item.vy = 10 + Math.random() * 16;
      item.vz = vz + (Math.random() - 0.5) * 28;
      item.life = 0.01;
      item.maxLife = 0.42 + Math.random() * 0.35;
      item.mesh.visible = true;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();
    let smoothedDt = 1 / 60;
    let markTimer = 0;

    const stepPlayerPhysics = (
      p: PlayerPhysicsState,
      carMesh: Car3D,
      playerNum: 1 | 2,
      dt: number,
      now: number,
      shouldDropMarks: boolean
    ): { speedNorm: number; slipAmount: number } => {
      if (p.crashed || p.tooGoodPause) {
        return { speedNorm: 0, slipAmount: 0 };
      }

      if (Math.abs(p.speed) > 25) {
        p.cleanDriveMs += dt * 1000;
        if (p.cleanDriveMs >= 25000) {
          p.tooGoodPause = true;
          p.cleanDriveMs = 0;
          p.speed = 0;
          p.slipAngle = 0;
          sound.playCrash();
          if (playerNum === 1) setP1TooGood(true);
          else setP2TooGood(true);
          return { speedNorm: 0, slipAmount: 0 };
        }
      }

      // If player hit Nadim, Kert & Hans earlier, roll footballs & basketballs across the road every 20s
      if (p.sabotaged) {
        p.sabotageTimerMs += dt * 1000;
        if (p.sabotageTimerMs >= 20000) {
          p.sabotageTimerMs -= 20000;
          spawnSabotageBallWave(p);
        }
      }

      // If player hit Jakob: faster in singleplayer (rushing to EMO!), slower in split screen
      const jakobSpeedMult = p.jakobSpeedEffect
        ? gameRef.current.mode === 'time_attack'
          ? 1.32
          : 0.72
        : 1.0;

      const maxSpeed = 615 * jakobSpeedMult;
      const reverseMax = -190;
      const speedNorm = Math.min(1, Math.abs(p.speed) / maxSpeed);

      let accel = -Math.sin(p.carPitch) * 125;

      if (!p.isAirborne) {
        if (p.keys.up) {
          accel += 485 * jakobSpeedMult * (1 - speedNorm * 0.35);
        } else if (p.keys.down) {
          if (p.speed > 12) {
            accel -= 550;
          } else {
            accel -= 280;
          }
        } else {
          accel -= Math.sign(p.speed) * (58 + Math.abs(p.speed) * 0.3);
        }

        if (p.keys.handbrake) {
          accel -= Math.sign(p.speed) * Math.min(Math.abs(p.speed) * 2.5, 180);
        }

        accel -= Math.abs(p.slipAngle) * 65 * Math.sign(p.speed);
      }

      p.speed += accel * dt;
      if (!p.keys.up && !p.keys.down && Math.abs(p.speed) < 8) {
        p.speed = 0;
      }
      p.speed = Math.max(reverseMax, Math.min(maxSpeed, p.speed));

      // Gentler, smooth low-frequency drunk steering drift
      let steerInput = (p.keys.right ? 1 : 0) - (p.keys.left ? 1 : 0);
      if (p.drunkLevel > 0 && Math.abs(p.speed) > 40) {
        const wobbleAmp = Math.min(0.18, p.drunkLevel * 0.024);
        steerInput +=
          Math.sin(now * 0.002 + playerNum) * wobbleAmp +
          Math.cos(now * 0.0013) * (wobbleAmp * 0.45);
      }

      p.steerAngle += (steerInput - p.steerAngle) * (1 - Math.exp(-11 * dt));

      const speedTurnFactor = Math.min(1, Math.abs(p.speed) / 135);
      const dirSign = p.speed >= -5 ? 1 : -1;

      if (!p.isAirborne) {
        const pathTurnRate = p.keys.handbrake ? 2.55 : 2.2;
        p.moveAngle += p.steerAngle * pathTurnRate * speedTurnFactor * dirSign * dt;

        const gravelLateralGrip = p.keys.handbrake ? 2.6 : 4.2;
        const velDiff = shortestAngleDiff(p.velAngle, p.moveAngle);
        p.velAngle += velDiff * (1 - Math.exp(-gravelLateralGrip * dt));

        const maxDriftRad = p.keys.handbrake ? 0.72 : 0.38;
        const targetSlip =
          p.steerAngle * maxDriftRad * Math.min(1, Math.abs(p.speed) / 150) * dirSign -
          velDiff * 0.55;

        const slipResponse =
          steerInput === 0 ? 5.5 : p.keys.handbrake ? 6.2 : 4.8;
        p.slipAngle += (targetSlip - p.slipAngle) * (1 - Math.exp(-slipResponse * dt));
      } else {
        p.moveAngle += p.steerAngle * 0.95 * speedTurnFactor * dirSign * dt;
        p.velAngle += shortestAngleDiff(p.velAngle, p.moveAngle) * (1 - Math.exp(-6.0 * dt));
        p.slipAngle *= Math.exp(-4.5 * dt);
      }

      p.carAngle = p.moveAngle + p.slipAngle;

      const vx = Math.cos(p.velAngle) * p.speed;
      const vy = Math.sin(p.velAngle) * p.speed;
      p.carX += vx * dt;
      p.carY += vy * dt;
      p.wheelRotation += (p.speed / 5.35) * dt;

      const surface = sampleRoadSurface(p.carX, p.carY, p.trackIndex, track.points);
      p.trackIndex = surface.bestIdx;
      const { minDist, roadH, roadPitch } = surface;

      const gravity = 290;
      if (!p.isAirborne) {
        const roadClimbRate = p.speed * Math.tan(roadPitch);
        if (p.vVert - roadClimbRate > 34 && p.speed > 240) {
          p.isAirborne = true;
          p.vVert = Math.min(p.vVert, 58);
          p.carH += p.vVert * dt;
          p.vVert -= gravity * dt;
        } else {
          p.carH = roadH;
          p.vVert = roadClimbRate;
          p.carPitch += (roadPitch - p.carPitch) * (1 - Math.exp(-16 * dt));
        }
      } else {
        p.carH += p.vVert * dt;
        p.vVert -= gravity * dt;
        p.carPitch += (-0.05 - p.carPitch) * (1 - Math.exp(-2.8 * dt));

        if (p.carH <= roadH) {
          p.carH = roadH;
          p.isAirborne = false;
          p.vVert = p.speed * Math.tan(roadPitch);
          p.carPitch = roadPitch;
          p.suspensionBounce = -1.6;
          p.suspensionPitch = 0.06;

          const nfx = Math.cos(p.carAngle);
          const nfy = Math.sin(p.carAngle);
          for (let k = 0; k < 5; k++) {
            spawnDust(
              p.carX + (Math.random() - 0.5) * 20,
              roadH,
              p.carY + (Math.random() - 0.5) * 20,
              -nfx * 25,
              -nfy * 25,
              1.3
            );
          }
        }
      }

      p.suspensionBounce *= Math.exp(-11 * dt);

      const totalSlideAngle = Math.abs(shortestAngleDiff(p.velAngle, p.carAngle));
      const isSliding = !p.isAirborne && (p.keys.handbrake || totalSlideAngle > 0.15);
      const slipAmount = totalSlideAngle * 1.9 + (p.keys.handbrake ? 0.65 : 0);

      const braking = p.keys.down || p.keys.handbrake;
      carMesh.tailLightMat.emissiveIntensity = braking ? 2.2 : 0.85;
      carMesh.thirdBrakeLightMat.color.setHex(braking ? 0xff1111 : 0x450a0a);

      const targetRoll = Math.max(-0.11, Math.min(0.11, -p.slipAngle * 0.24));
      const targetPitch = Math.max(-0.05, Math.min(0.05, -accel * 0.00007));
      p.suspensionRoll += (targetRoll - p.suspensionRoll) * (1 - Math.exp(-10 * dt));
      p.suspensionPitch += (targetPitch - p.suspensionPitch) * (1 - Math.exp(-10 * dt));
      carMesh.bodyTiltGroup.rotation.x = p.suspensionRoll;
      carMesh.bodyTiltGroup.rotation.z = p.suspensionPitch;
      carMesh.bodyTiltGroup.position.y = p.suspensionBounce;

      const nfx = Math.cos(p.carAngle);
      const nfy = Math.sin(p.carAngle);
      const nrx = -Math.sin(p.carAngle);
      const nry = Math.cos(p.carAngle);

      const rearAxleX = p.carX - nfx * 16.2;
      const rearAxleZ = p.carY - nfy * 16.2;
      const rlX = rearAxleX - nrx * 11.6;
      const rlZ = rearAxleZ - nry * 11.6;
      const rrX = rearAxleX + nrx * 11.6;
      const rrZ = rearAxleZ + nry * 11.6;

      if (shouldDropMarks && isSliding && Math.abs(p.speed) > 42) {
        dropTireMark(rlX, roadH, rlZ, p.carAngle, roadPitch);
        dropTireMark(rrX, roadH, rrZ, p.carAngle, roadPitch);
      }

      if (!p.isAirborne && Math.abs(p.speed) > 45 && (isSliding || Math.random() < 0.45)) {
        const dustScale = isSliding ? 1.35 : 0.7;
        spawnDust(rlX, roadH, rlZ, -nfx * 35, -nfy * 35, dustScale);
        if (isSliding) {
          spawnDust(rrX, roadH, rrZ, -nfx * 35, -nfy * 35, dustScale);
        }
      }

      // Check collision with Nadim, Kert & Hans sitting on their bench
      const distToFriends = Math.hypot(p.carX - friendsBench.x, p.carY - friendsBench.z);
      if (!p.hitFriendsCrash && distToFriends < friendsBench.hitRadius) {
        p.crashed = true;
        p.hitFriendsCrash = true;
        p.sabotaged = true;
        // First ball wave rolls out ~2.5s after resuming, then every 20 seconds
        p.sabotageTimerMs = 17500;
        p.cleanDriveMs = 0;
        p.speed = 0;
        p.slipAngle = 0;
        sound.playCrash();
        if (playerNum === 1) {
          setP1HitFriends(true);
          setP1Crashed(true);
        } else {
          setP2HitFriends(true);
          setP2Crashed(true);
        }
        return { speedNorm: 0, slipAmount: 0 };
      }

      // Check collision with Jakob on the roadside
      const distToJakob = Math.hypot(p.carX - jakobSpot.x, p.carY - jakobSpot.z);
      if (!p.hitJakobCrash && distToJakob < jakobSpot.hitRadius) {
        p.crashed = true;
        p.hitJakobCrash = true;
        p.jakobSpeedEffect = true;
        p.cleanDriveMs = 0;
        p.speed = 0;
        p.slipAngle = 0;
        sound.playCrash();
        if (playerNum === 1) {
          setP1HitJakob(true);
          setP1Crashed(true);
        } else {
          setP2HitJakob(true);
          setP2Crashed(true);
        }
        return { speedNorm: 0, slipAmount: 0 };
      }

      // Check collision with Laureen on the roadside
      const distToLaureen = Math.hypot(p.carX - laureenSpot.x, p.carY - laureenSpot.z);
      if (!p.hitLaureenCrash && distToLaureen < laureenSpot.hitRadius) {
        p.crashed = true;
        p.hitLaureenCrash = true;
        p.cleanDriveMs = 0;
        p.speed = 0;
        p.slipAngle = 0;
        sound.playCrash();
        if (playerNum === 1) {
          setP1HitLaureen(true);
          setP1Crashed(true);
        } else {
          setP2HitLaureen(true);
          setP2Crashed(true);
        }
        return { speedNorm: 0, slipAmount: 0 };
      }

      // Check Finish Line
      if (p.trackIndex >= track.points.length - 5) {
        gameRef.current.screen = 'finished';
        sound.playFinish();
        const finalMs = Math.floor(gameRef.current.elapsedMs);
        const nowStr = new Date().toLocaleTimeString('et-EE', {
          hour: '2-digit',
          minute: '2-digit',
        });

        if (gameRef.current.mode === 'time_attack') {
          setFinalTimeMs(finalMs);
          setScreen('finished');
          const carObj = CAR_OPTIONS.find((c) => c.id === p1Car);
          recordLeaderboardEntry({
            id: `${Date.now()}`,
            mode: 'time_attack',
            timeMs: finalMs,
            drinks: p.drunkLevel,
            carName: carObj ? carObj.name : p1Car,
            dateStr: nowStr,
          });
          try {
            const prevSaved = localStorage.getItem(STORAGE_KEY);
            const prevBest = prevSaved ? Number(prevSaved) : null;
            if (prevBest === null || finalMs < prevBest) {
              localStorage.setItem(STORAGE_KEY, String(finalMs));
              setBestTimeMs(finalMs);
              setIsNewRecord(true);
            } else {
              setIsNewRecord(false);
            }
          } catch {
            // Ignore
          }
        } else {
          setWinner(playerNum);
          setFinalTimeMs(finalMs);
          setScreen('finished');
          const winCarId = playerNum === 1 ? p1Car : p2Car;
          const carObj = CAR_OPTIONS.find((c) => c.id === winCarId);
          const totalDrinks = gameRef.current.p1.drunkLevel + gameRef.current.p2.drunkLevel;
          recordLeaderboardEntry({
            id: `${Date.now()}`,
            mode: 'split_screen',
            timeMs: finalMs,
            drinks: totalDrinks,
            carName: carObj ? carObj.name : winCarId,
            winnerText: playerNum === 1 ? 'Tiim 1 (Vasak)' : 'Tiim 2 (Parem)',
            dateStr: nowStr,
          });
        }
      } else if (minDist > ROAD_HALF_WIDTH + 30) {
        // Off-road Crash (with forgiving 30-unit shoulder margin so slight edge clips don't crash!)
        p.crashed = true;
        p.cleanDriveMs = 0;
        p.speed = 0;
        p.slipAngle = 0;
        sound.playCrash();
        if (playerNum === 1) setP1Crashed(true);
        else setP2Crashed(true);
      } else if (minDist > ROAD_HALF_WIDTH && !p.isAirborne) {
        // Gentle shoulder gravel drag when wheels touch the outer shoulder
        p.speed *= Math.exp(-1.4 * dt);
      }

      return { speedNorm: p.speed / maxSpeed, slipAmount };
    };

    const updateMeshAndCamera = (
      p: PlayerPhysicsState,
      carMesh: Car3D,
      cam: THREE.PerspectiveCamera,
      dt: number,
      now: number,
      playerSeed: number
    ) => {
      carMesh.root.position.set(p.carX, p.carH + 0.45, p.carY);
      carMesh.root.rotation.set(0, -p.carAngle, p.carPitch, 'YXZ');

      const visualSteer = p.steerAngle * 0.46 - p.slipAngle * 0.55;
      carMesh.frontLeftWheel.rotation.set(0, -visualSteer, -p.wheelRotation);
      carMesh.frontRightWheel.rotation.set(0, -visualSteer, -p.wheelRotation);
      carMesh.rearLeftWheel.rotation.set(0, 0, p.keys.handbrake ? 0 : -p.wheelRotation);
      carMesh.rearRightWheel.rotation.set(0, 0, p.keys.handbrake ? 0 : -p.wheelRotation);

      // Jitter-Free Helicopter Camera with gentle drunk sway
      const angleDiff = shortestAngleDiff(p.camAngle, p.velAngle);
      p.camAngle += angleDiff * (1 - Math.exp(-5.5 * dt));
      p.camBaseH += (p.carH - p.camBaseH) * (1 - Math.exp(-8.0 * dt));

      let drunkAngleSway = 0;
      let drunkRoll = 0;
      let drunkPitchSway = 0;

      if (p.drunkLevel > 0) {
        drunkAngleSway =
          Math.sin(now * 0.0015 + playerSeed) * Math.min(0.14, p.drunkLevel * 0.02);
        drunkRoll =
          Math.cos(now * 0.0017 + playerSeed) * Math.min(0.14, p.drunkLevel * 0.02);
        drunkPitchSway =
          Math.sin(now * 0.0019 + playerSeed) * Math.min(8, p.drunkLevel * 1.2);
      }

      const effectiveCamAngle = p.camAngle + drunkAngleSway;
      const camDist = 150;
      const camHeightOffset = 80;

      cam.position.set(
        p.carX - Math.cos(effectiveCamAngle) * camDist,
        p.camBaseH + camHeightOffset + drunkPitchSway,
        p.carY - Math.sin(effectiveCamAngle) * camDist
      );

      const lookAheadDist = 85;
      const lookX = p.carX + Math.cos(effectiveCamAngle) * lookAheadDist;
      const lookZ = p.carY + Math.sin(effectiveCamAngle) * lookAheadDist;
      cam.up.set(Math.sin(drunkRoll), Math.cos(drunkRoll), 0);
      cam.lookAt(lookX, p.camBaseH + 10, lookZ);
    };

    const animate = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      smoothedDt += (rawDt - smoothedDt) * 0.25;
      const dt = smoothedDt;

      const g = gameRef.current;
      markTimer += dt;
      const shouldDropMarks = markTimer >= 0.028;
      if (shouldDropMarks) markTimer = 0;

      if (g.screen === 'racing') {
        if (g.mode === 'time_attack') {
          if (!g.p1.crashed && !g.p1.tooGoodPause) {
            g.elapsedMs += rawDt * 1000;
            if (timeTextRef.current) {
              timeTextRef.current.textContent = formatTime(Math.floor(g.elapsedMs));
            }
          }
          const res1 = stepPlayerPhysics(g.p1, car1Mesh, 1, dt, now, shouldDropMarks);
          sound.updateDriving(
            res1.speedNorm,
            res1.slipAmount,
            g.p1.keys.up,
            !g.p1.crashed && !g.p1.tooGoodPause
          );
        } else if (car2Mesh) {
          if ((!g.p1.crashed && !g.p1.tooGoodPause) || (!g.p2.crashed && !g.p2.tooGoodPause)) {
            g.elapsedMs += rawDt * 1000;
          }
          const res1 = stepPlayerPhysics(g.p1, car1Mesh, 1, dt, now, shouldDropMarks);
          const res2 = stepPlayerPhysics(g.p2, car2Mesh, 2, dt, now, shouldDropMarks);

          if (p1ProgressRef.current) {
            const pct1 = Math.min(
              100,
              Math.floor((g.p1.trackIndex / (track.points.length - 5)) * 100)
            );
            p1ProgressRef.current.textContent = `${pct1}%`;
          }
          if (p2ProgressRef.current) {
            const pct2 = Math.min(
              100,
              Math.floor((g.p2.trackIndex / (track.points.length - 5)) * 100)
            );
            p2ProgressRef.current.textContent = `${pct2}%`;
          }

          const activeSpeed = Math.max(Math.abs(res1.speedNorm), Math.abs(res2.speedNorm));
          const activeSlip = Math.max(res1.slipAmount, res2.slipAmount);
          const anyThrottle =
            (!g.p1.crashed && g.p1.keys.up) || (!g.p2.crashed && g.p2.keys.up);
          const anyActive = !g.p1.crashed || !g.p2.crashed;
          sound.updateDriving(activeSpeed, activeSlip, anyThrottle, anyActive);
        }
      } else {
        sound.updateDriving(0, 0, false, false);
      }

      // Update 3D dust particles
      for (const dItem of dustPool) {
        if (!dItem.mesh.visible) continue;
        dItem.life += dt;
        if (dItem.life >= dItem.maxLife) {
          dItem.mesh.visible = false;
          continue;
        }
        dItem.mesh.position.x += dItem.vx * dt;
        dItem.mesh.position.y += dItem.vy * dt;
        dItem.mesh.position.z += dItem.vz * dt;
        const progress = dItem.life / dItem.maxLife;
        dItem.mesh.scale.addScalar(dt * 2.4);
        (dItem.mesh.material as THREE.MeshLambertMaterial).opacity = (1 - progress) * 0.58;
      }

      // Update sabotage footballs & basketballs rolling across the road
      const activePlayers =
        g.mode === 'split_screen' ? [g.p1, g.p2] : [g.p1];
      for (const b of rollingBalls) {
        if (!b.active) continue;
        b.life += dt;
        if (b.life > 8.5) {
          b.active = false;
          b.mesh.visible = false;
          continue;
        }

        b.x += b.vx * dt;
        b.z += b.vz * dt;

        if (b.hit) {
          b.y += b.vy * dt;
          b.vy -= 260 * dt;
          if (b.y < b.baseH + 9.5) {
            b.y = b.baseH + 9.5;
            b.vy = Math.abs(b.vy) * 0.55;
          }
        } else {
          b.y = b.baseH + 9.5 + Math.abs(Math.sin(now * 0.009 + b.x * 0.02)) * 4.5;

          // Check collision with active cars -> car swerves/tilts ("auto kaldub natuke")
          for (const pl of activePlayers) {
            if (pl.crashed || pl.tooGoodPause) continue;
            const dCar = Math.hypot(pl.carX - b.x, pl.carY - b.z);
            if (dCar < 25) {
              b.hit = true;
              b.vy = 95;
              b.vx += Math.cos(pl.carAngle) * 260;
              b.vz += Math.sin(pl.carAngle) * 260;

              const sideDot =
                (b.x - pl.carX) * -Math.sin(pl.carAngle) +
                (b.z - pl.carY) * Math.cos(pl.carAngle);
              const pushDir = sideDot >= 0 ? -1 : 1;
              pl.moveAngle += pushDir * 0.28;
              pl.velAngle += pushDir * 0.2;
              pl.slipAngle += pushDir * 0.36;
              pl.suspensionRoll = -pushDir * 0.16;
              pl.suspensionBounce = -2.1;
              pl.speed *= 0.84;
              sound.playCrash();
            }
          }
        }

        b.mesh.position.set(b.x, b.y, b.z);
        b.mesh.rotation.x += (b.vz / 9.5) * dt;
        b.mesh.rotation.z -= (b.vx / 9.5) * dt;
      }

      updateMeshAndCamera(g.p1, car1Mesh, cam1, dt, now, 0);
      if (g.mode === 'split_screen' && car2Mesh) {
        updateMeshAndCamera(g.p2, car2Mesh, cam2, dt, now, 3.14);
      }

      // Render Single Viewport or Split-Screen Dual Viewports
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (g.mode === 'time_attack') {
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, w, h);
        if (Math.abs(cam1.aspect - w / h) > 0.001) {
          cam1.aspect = w / h;
          cam1.updateProjectionMatrix();
        }
        renderer.render(scene, cam1);
      } else {
        const halfW = Math.floor(w / 2);
        renderer.setScissorTest(true);

        // Left Half: Player 1 (WASD)
        renderer.setViewport(0, 0, halfW, h);
        renderer.setScissor(0, 0, halfW, h);
        if (Math.abs(cam1.aspect - halfW / h) > 0.001) {
          cam1.aspect = halfW / h;
          cam1.updateProjectionMatrix();
        }
        renderer.render(scene, cam1);

        // Right Half: Player 2 (Arrows)
        renderer.setViewport(halfW, 0, w - halfW, h);
        renderer.setScissor(halfW, 0, w - halfW, h);
        if (Math.abs(cam2.aspect - (w - halfW) / h) > 0.001) {
          cam2.aspect = (w - halfW) / h;
          cam2.updateProjectionMatrix();
        }
        renderer.render(scene, cam2);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      envMap.dispose();
      renderer.dispose();
    };
  }, [screen, mode, p1Car, p2Car, track]);

  // Gentler optical blur (0.45px per drink, capped at 3.2px) without transforming the WebGL canvas
  const p1BlurPx = p1Drunk > 0 ? Math.min(3.2, p1Drunk * 0.45) : 0;
  const p2BlurPx = p2Drunk > 0 ? Math.min(3.2, p2Drunk * 0.45) : 0;

  const p1CarOption = CAR_OPTIONS.find((c) => c.id === p1Car)!;
  const p2CarOption = CAR_OPTIONS.find((c) => c.id === p2Car)!;

  return (
    <div
      onClick={() => sound.init()}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none"
    >
      {/* 3D WebGL Canvas Mount — zero CSS filter/transform on the canvas itself for 60fps smoothness */}
      <div ref={mountRef} className="w-full h-full" />

      {/* SINGLEPLAYER GENTLE OPTICAL BLUR OVERLAY */}
      {(screen === 'racing' || screen === 'finished') && mode === 'time_attack' && p1BlurPx > 0 && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            backdropFilter: `blur(${p1BlurPx.toFixed(2)}px)`,
            WebkitBackdropFilter: `blur(${p1BlurPx.toFixed(2)}px)`,
          }}
        />
      )}

      {/* SPLIT-SCREEN OPTICAL BLUR OVERLAYS & CENTER DIVIDER */}
      {(screen === 'racing' || screen === 'finished') && mode === 'split_screen' && (
        <>
          {/* Left Player 1 Drunk Blur Layer */}
          {p1BlurPx > 0 && (
            <div
              className="pointer-events-none fixed top-0 bottom-0 left-0 w-1/2"
              style={{
                backdropFilter: `blur(${p1BlurPx.toFixed(2)}px)`,
                WebkitBackdropFilter: `blur(${p1BlurPx.toFixed(2)}px)`,
              }}
            />
          )}

          {/* Right Player 2 Drunk Blur Layer */}
          {p2BlurPx > 0 && (
            <div
              className="pointer-events-none fixed top-0 bottom-0 right-0 w-1/2"
              style={{
                backdropFilter: `blur(${p2BlurPx.toFixed(2)}px)`,
                WebkitBackdropFilter: `blur(${p2BlurPx.toFixed(2)}px)`,
              }}
            />
          )}

          {/* Center Vertical Split-Screen Divider Line */}
          <div className="pointer-events-none fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-stone-950 border-x border-stone-700/60 z-10" />
        </>
      )}

      {/* TOP HUD DURING RACING */}
      {(screen === 'racing' || screen === 'finished') && (
        <div className="pointer-events-none fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20">
          {mode === 'time_attack' ? (
            <div className="flex items-center gap-6 bg-stone-950/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-stone-800">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-stone-400">
                  {GAME_TEXT.timeLabel}
                </div>
                <div
                  ref={timeTextRef}
                  className="text-2xl font-black tabular-nums text-white"
                >
                  {formatTime(0)}
                </div>
              </div>

              <div className="h-8 w-px bg-stone-800" />

              <div>
                <div className="text-[11px] font-bold tracking-widest text-amber-400">
                  {GAME_TEXT.bestTimeLabel}
                </div>
                <div className="text-2xl font-black tabular-nums text-amber-300">
                  {bestTimeMs !== null ? formatTime(bestTimeMs) : '—'}
                </div>
              </div>

              {p1Drunk > 0 && (
                <>
                  <div className="h-8 w-px bg-stone-800" />
                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-rose-400">
                      {GAME_TEXT.crashesLabel}
                    </div>
                    <div className="text-2xl font-black tabular-nums text-rose-400">
                      {p1Drunk} 🥃
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Split Screen HUD for Player 1 (Left) and Player 2 (Right) */
            <div className="flex items-center justify-between w-full mr-4">
              {/* P1 Left HUD */}
              <div className="flex items-center gap-5 bg-stone-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-800">
                <div className="text-xs font-black tracking-wider text-sky-400">
                  TIIM 1 (WASD)
                </div>
                <div className="h-6 w-px bg-stone-800" />
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-stone-400">
                    {GAME_TEXT.progressLabel}
                  </div>
                  <div
                    ref={p1ProgressRef}
                    className="text-xl font-black tabular-nums text-white"
                  >
                    0%
                  </div>
                </div>
                {p1Drunk > 0 && (
                  <>
                    <div className="h-6 w-px bg-stone-800" />
                    <div className="text-lg font-black text-rose-400">
                      {p1Drunk} 🥃
                    </div>
                  </>
                )}
              </div>

              {/* P2 Right HUD */}
              <div className="flex items-center gap-5 bg-stone-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-800">
                <div className="text-xs font-black tracking-wider text-amber-400">
                  TIIM 2 (NOOLED)
                </div>
                <div className="h-6 w-px bg-stone-800" />
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-stone-400">
                    {GAME_TEXT.progressLabel}
                  </div>
                  <div
                    ref={p2ProgressRef}
                    className="text-xl font-black tabular-nums text-white"
                  >
                    0%
                  </div>
                </div>
                {p2Drunk > 0 && (
                  <>
                    <div className="h-6 w-px bg-stone-800" />
                    <div className="text-lg font-black text-rose-400">
                      {p2Drunk} 🥃
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                gameRef.current.screen = 'menu';
                setScreen('menu');
              }}
              className="px-3.5 h-11 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-stone-300 text-xs font-bold tracking-wider border border-stone-800 transition cursor-pointer"
            >
              AVALEHT
            </button>
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-stone-200 border border-stone-800 transition cursor-pointer"
              title={muted ? 'Heli sisse' : 'Heli välja'}
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 1. HOME / MAIN MENU SCREEN */}
      {screen === 'menu' && (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950 px-6 py-6 z-30 overflow-y-auto">
          <div className="max-w-5xl w-full bg-stone-900/95 border border-stone-800 rounded-2xl p-7 shadow-2xl">
            {/* Title & Mode Selection Top Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-stone-800">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-red-500 uppercase mb-1">
                  <Flag className="w-3.5 h-3.5" /> Lõuna-Eesti Kruusaralli
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white">
                  {GAME_TEXT.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <p className="text-stone-400 font-medium text-sm">
                    {GAME_TEXT.subtitle}
                  </p>
                  <label
                    title="Kliki, kui soovid valida arvutist oma MP3 faili"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded-full transition cursor-pointer"
                  >
                    <span>🎵 Kräki Kevin – Punane Škoda</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) sound.loadCustomTrackFile(file);
                      }}
                    />
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
                    title={muted ? 'Heli sisse' : 'Heli välja'}
                  >
                    {muted ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mode Selector + Big START Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex bg-stone-950 p-1.5 rounded-xl border border-stone-800">
                  <button
                    onClick={() => setMode('time_attack')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black tracking-wider transition cursor-pointer ${
                      mode === 'time_attack'
                        ? 'bg-stone-800 text-white shadow'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {GAME_TEXT.modeSingle}
                  </button>
                  <button
                    onClick={() => setMode('split_screen')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black tracking-wider transition cursor-pointer ${
                      mode === 'split_screen'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {GAME_TEXT.modeSplit}
                  </button>
                </div>

                <button
                  onClick={goToCarSelect}
                  className="px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-base tracking-wider transition shadow-lg cursor-pointer"
                >
                  {GAME_TEXT.mainStartButton}
                </button>
              </div>
            </div>

            {/* Split-Screen Team Drinking Notice when Split Screen is selected */}
            {mode === 'split_screen' && (
              <div className="mt-5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-200 text-sm font-semibold">
                🍻 <span className="font-black">SPLIT SCREEN REŽIIM:</span> Seltskond jagatakse kaheks väiksemaks tiimiks — see, kes hetkel roolis ei ole, joob!
              </div>
            )}

            {/* Two-Column Info: Rules (Left) & Leaderboard (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left: Rules */}
              <div className="bg-stone-950/70 border border-stone-800/90 rounded-xl p-5">
                <h2 className="text-sm font-black tracking-widest text-stone-300 uppercase mb-4">
                  {GAME_TEXT.rulesTitle}
                </h2>
                <ul className="space-y-3.5 text-sm text-stone-300 leading-relaxed">
                  {GAME_TEXT.rulesList.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-black text-xs flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Leaderboard of Previous Runs & Drinks */}
              <div className="bg-stone-950/70 border border-stone-800/90 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-sm font-black tracking-widest text-amber-400 uppercase">
                    <Trophy className="w-4 h-4" />
                    {GAME_TEXT.leaderboardTitle}
                  </h2>
                  {bestTimeMs !== null && (
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      Rekord: {formatTime(bestTimeMs)}
                    </span>
                  )}
                </div>

                {leaderboard.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center py-8 text-sm text-stone-500">
                    {GAME_TEXT.leaderboardEmpty}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {leaderboard.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-stone-900/90 border border-stone-800/80 rounded-lg px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-stone-500 w-4">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white">
                              {entry.mode === 'time_attack'
                                ? entry.carName
                                : `${entry.winnerText} • ${entry.carName}`}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {entry.mode === 'time_attack' ? 'Üksinda' : 'Split Screen'} • {entry.dateStr}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="font-black text-rose-400 text-sm">
                            {entry.drinks} 🥃
                          </div>
                          {entry.timeMs !== null && (
                            <div className="font-black tabular-nums text-emerald-400 text-sm min-w-[60px] text-right">
                              {formatTime(entry.timeMs)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAR SELECTION SCREEN */}
      {screen === 'car_select' && (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950 px-6 z-30">
          <div className="max-w-4xl w-full bg-stone-900 border border-stone-800 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  gameRef.current.screen = 'menu';
                  setScreen('menu');
                }}
                className="text-sm font-bold text-stone-400 hover:text-white transition cursor-pointer"
              >
                ← {GAME_TEXT.backToMenu}
              </button>
              <h2 className="text-3xl font-black tracking-tight text-white">
                {GAME_TEXT.selectCarTitle}
              </h2>
              <div className="w-28" />
            </div>

            {mode === 'time_attack' ? (
              /* Single Player Car Selector */
              <div className="max-w-lg mx-auto text-center">
                <CarPreview3D carId={p1Car} heightClass="h-56" />

                <div className="flex items-center justify-between gap-4 my-5">
                  <button
                    onClick={() => setP1Car(cycleCar(p1Car, -1))}
                    className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div>
                    <div className="text-2xl font-black text-white">
                      {p1CarOption.name}
                    </div>
                    <div className="text-sm font-semibold text-stone-400 mt-0.5">
                      {p1CarOption.subtitle}
                    </div>
                  </div>

                  <button
                    onClick={() => setP1Car(cycleCar(p1Car, 1))}
                    className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Quick Car Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {CAR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setP1Car(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        p1Car === c.id
                          ? 'bg-red-600 text-white'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {c.badgeText}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-stone-400 font-medium mb-5">
                  {GAME_TEXT.singleControlsHint}
                </div>
              </div>
            ) : (
              /* Split Screen 2-Player Car Selector */
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Player 1 (Left - WASD) */}
                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 text-center">
                  <div className="text-xs font-black tracking-widest text-sky-400 mb-2">
                    {GAME_TEXT.player1Label}
                  </div>
                  <CarPreview3D carId={p1Car} heightClass="h-44" />
                  <div className="flex items-center justify-between gap-2 my-3">
                    <button
                      onClick={() => setP1Car(cycleCar(p1Car, -1))}
                      className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="text-lg font-black text-white">
                        {p1CarOption.name}
                      </div>
                      <div className="text-xs text-stone-400">
                        {p1CarOption.subtitle}
                      </div>
                    </div>
                    <button
                      onClick={() => setP1Car(cycleCar(p1Car, 1))}
                      className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-xs text-stone-400 font-medium mt-2">
                    {GAME_TEXT.p1ControlsHint}
                  </div>
                </div>

                {/* Player 2 (Right - Arrows) */}
                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 text-center">
                  <div className="text-xs font-black tracking-widest text-amber-400 mb-2">
                    {GAME_TEXT.player2Label}
                  </div>
                  <CarPreview3D carId={p2Car} heightClass="h-44" />
                  <div className="flex items-center justify-between gap-2 my-3">
                    <button
                      onClick={() => setP2Car(cycleCar(p2Car, -1))}
                      className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="text-lg font-black text-white">
                        {p2CarOption.name}
                      </div>
                      <div className="text-xs text-stone-400">
                        {p2CarOption.subtitle}
                      </div>
                    </div>
                    <button
                      onClick={() => setP2Car(cycleCar(p2Car, 1))}
                      className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-xs text-stone-400 font-medium mt-2">
                    {GAME_TEXT.p2ControlsHint}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={startRace}
              className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xl tracking-wide transition shadow-lg cursor-pointer"
            >
              {GAME_TEXT.startButton}
            </button>
          </div>
        </div>
      )}

      {/* 3. CRASH, NADIM/KERT/HANS, JAKOB, LAUREEN & 25s "TOO GOOD" OVERLAYS */}
      {screen === 'racing' && mode === 'time_attack' && (p1Crashed || p1TooGood) && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${
            p1TooGood ? 'bg-amber-950/85' : 'bg-red-950/85'
          } backdrop-blur-md px-6 z-30`}
        >
          <div className="max-w-3xl w-full text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg mb-8">
              {p1TooGood
                ? GAME_TEXT.tooGoodTitle
                : p1HitLaureen
                ? GAME_TEXT.hitLaureenTitle
                : p1HitJakob
                ? GAME_TEXT.hitJakobTitle
                : p1HitFriends
                ? GAME_TEXT.hitFriendsTitle
                : GAME_TEXT.crashTitle}
            </h2>
            <p className="text-xl font-bold text-amber-200 tracking-wide animate-pulse">
              {GAME_TEXT.crashContinueEnter}
            </p>
          </div>
        </div>
      )}

      {screen === 'racing' && mode === 'split_screen' && (p1Crashed || p1TooGood) && (
        <div
          className={`fixed top-0 bottom-0 left-0 w-1/2 flex items-center justify-center ${
            p1TooGood ? 'bg-amber-950/85' : 'bg-red-950/85'
          } backdrop-blur-md px-6 z-30`}
        >
          <div className="max-w-md w-full text-center flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg mb-6">
              {p1TooGood
                ? GAME_TEXT.tooGoodTitle
                : p1HitLaureen
                ? GAME_TEXT.hitLaureenTitle
                : p1HitJakob
                ? GAME_TEXT.hitJakobTitle
                : p1HitFriends
                ? GAME_TEXT.hitFriendsTitle
                : GAME_TEXT.crashTitle}
            </h2>
            <p className="text-lg font-bold text-amber-200 tracking-wide animate-pulse">
              {GAME_TEXT.crashContinueSpace}
            </p>
          </div>
        </div>
      )}

      {screen === 'racing' && mode === 'split_screen' && (p2Crashed || p2TooGood) && (
        <div
          className={`fixed top-0 bottom-0 right-0 w-1/2 flex items-center justify-center ${
            p2TooGood ? 'bg-amber-950/85' : 'bg-red-950/85'
          } backdrop-blur-md px-6 z-30`}
        >
          <div className="max-w-md w-full text-center flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg mb-6">
              {p2TooGood
                ? GAME_TEXT.tooGoodTitle
                : p2HitLaureen
                ? GAME_TEXT.hitLaureenTitle
                : p2HitJakob
                ? GAME_TEXT.hitJakobTitle
                : p2HitFriends
                ? GAME_TEXT.hitFriendsTitle
                : GAME_TEXT.crashTitle}
            </h2>
            <p className="text-lg font-bold text-amber-200 tracking-wide animate-pulse">
              {GAME_TEXT.crashContinueEnter}
            </p>
          </div>
        </div>
      )}

      {/* 4. FINISH SCREEN */}
      {screen === 'finished' && (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-md px-4 z-30">
          <div className="max-w-md w-full bg-stone-900/95 border border-stone-800 rounded-2xl p-8 text-center shadow-2xl">
            {mode === 'time_attack' ? (
              <>
                <h2 className="text-5xl font-black text-white mb-2">
                  {GAME_TEXT.finishTitle}
                </h2>
                {isNewRecord && (
                  <div className="text-amber-400 font-black tracking-wider text-sm mb-4">
                    {GAME_TEXT.newRecord}
                  </div>
                )}
                <div className="text-5xl font-black tabular-nums text-emerald-400 my-5">
                  {formatTime(finalTimeMs)}
                </div>
                <div className="text-sm font-bold text-rose-400 mb-6">
                  Joodud joogid sellel sõidul: {p1Drunk} 🥃
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white mt-2 mb-4">
                  {winner === 1 ? GAME_TEXT.p1WinsTitle : GAME_TEXT.p2WinsTitle}
                </h2>
                <div className="text-sm font-bold text-rose-400 mb-6">
                  Kokku joodud shote: {p1Drunk + p2Drunk} 🥃 (Tiim 1: {p1Drunk}, Tiim 2: {p2Drunk})
                </div>
              </>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={startRace}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-lg tracking-wide transition cursor-pointer"
              >
                {GAME_TEXT.playAgainHint}
              </button>
              <button
                onClick={() => {
                  gameRef.current.screen = 'menu';
                  setScreen('menu');
                }}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-sm tracking-wide transition cursor-pointer"
              >
                {GAME_TEXT.backToMenu}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
