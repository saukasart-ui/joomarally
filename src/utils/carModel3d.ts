import * as THREE from 'three';
import type { CarId } from '../data/gameContent';

export interface Car3D {
  root: THREE.Group;
  bodyTiltGroup: THREE.Group;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  tailLightMat: THREE.MeshStandardMaterial;
  thirdBrakeLightMat: THREE.MeshBasicMaterial;
}

export type SkodaScala3D = Car3D;

export function createCarEnvironmentTexture(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.22, '#dbeafe');
  grad.addColorStop(0.44, '#fde68a');
  grad.addColorStop(0.49, '#fffbeb');
  grad.addColorStop(0.51, '#3f4f34');
  grad.addColorStop(0.75, '#6b533b');
  grad.addColorStop(1.0, '#18181b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Studio softbox highlights for realistic automotive clearcoat reflections
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillRect(40, 22, 180, 26);
  ctx.fillRect(290, 28, 170, 22);

  ctx.beginPath();
  ctx.arc(160, 68, 28, 0, Math.PI * 2);
  ctx.fill();

  const equirectTex = new THREE.CanvasTexture(canvas);
  equirectTex.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmrem.fromEquirectangular(equirectTex).texture;
  equirectTex.dispose();
  pmrem.dispose();
  return envMap;
}

function createLicensePlateTexture(plateText: string, bgColor = '#f8fafc', isEst = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 112;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 112);

  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 104);

  if (isEst) {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(8, 8, 64, 96);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(40, 36, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EST', 40, 88);
  }

  ctx.fillStyle = '#09090b';
  ctx.font = '900 68px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, isEst ? 288 : 256, 58);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

function createExtendedTailgateGlassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#07090d';
  ctx.fillRect(0, 0, 512, 320);

  const glassGrad = ctx.createLinearGradient(0, 20, 0, 225);
  glassGrad.addColorStop(0, '#0f1622');
  glassGrad.addColorStop(0.55, '#182232');
  glassGrad.addColorStop(1, '#0a0d14');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.roundRect(42, 22, 428, 198, 22);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 165, 110, 0.1)';
  ctx.lineWidth = 1.5;
  for (let y = 42; y < 206; y += 16) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(458, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(95, 22);
  ctx.lineTo(190, 22);
  ctx.lineTo(125, 220);
  ctx.lineTo(55, 220);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4f4f5';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 4;
  ctx.font = '900 31px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Š    K    O    D    A', 256, 272);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

function createGrilleTexture(slatSpacing = 12, withRings = false, withStar = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 256, 96);

  // Subtle honeycomb/mesh pattern behind slats
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;
  for (let y = 8; y < 88; y += 8) {
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(248, y);
    ctx.stroke();
  }

  for (let x = 14; x < 242; x += slatSpacing) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x, 6, 4, 84);
    ctx.fillStyle = '#52525b';
    ctx.fillRect(x + 4, 6, 1.5, 84);
  }

  if (withRings) {
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 5;
    const startX = 92;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * 24, 48, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (withStar) {
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 4;
    for (let y = 16; y < 84; y += 15) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(246, y);
      ctx.stroke();
    }
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 4);
    ctx.lineTo(128, 92);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

/**
 * Generates a full UV-mapped wrap-around body paint & racing livery texture!
 * U goes from 0 (rear bumper) to 1 (front bumper).
 * V goes from 0 (bottom rocker sill) to 0.65 (beltline/fender top) to 1.0 (hood/deck centerline).
 */
function createBodyWrapLiveryTexture(carId: CarId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (carId === 'peugeot') {
    // Base Alpine White
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 512);

    // Lower matte black stone-guard rocker trim
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 465, 1024, 47);

    // Peugeot Talbot Sport 4-color diagonal racing stripes across sides & hood
    const ptsColors = ['#1e3a8a', '#0284c7', '#facc15', '#dc2626'];
    ptsColors.forEach((col, idx) => {
      ctx.fillStyle = col;
      // Rear-to-mid diagonal slash
      ctx.beginPath();
      ctx.moveTo(180 + idx * 55, 512);
      ctx.lineTo(390 + idx * 55, 90);
      ctx.lineTo(435 + idx * 55, 90);
      ctx.lineTo(225 + idx * 55, 512);
      ctx.closePath();
      ctx.fill();

      // Front hood diagonal slash
      ctx.beginPath();
      ctx.moveTo(720 + idx * 42, 320);
      ctx.lineTo(860 + idx * 42, 0);
      ctx.lineTo(896 + idx * 42, 0);
      ctx.lineTo(756 + idx * 42, 320);
      ctx.closePath();
      ctx.fill();
    });

    // Side Door Panel Shutlines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(410, 210, 240, 240);

    // Rally Door Number Plate #2
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(465, 230, 155, 185);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6;
    ctx.strokeRect(465, 230, 155, 185);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(468, 233, 149, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RALLYE MONTE-CARLO', 542, 257);

    ctx.fillStyle = '#09090b';
    ctx.font = '900 108px sans-serif';
    ctx.fillText('2', 542, 376);

    // Sponsor decals (MICHELIN / SHELL / PEUGEOT)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(730, 340, 145, 42);
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 900 24px sans-serif';
    ctx.fillText('MICHELIN', 802, 369);

    ctx.fillStyle = '#dc2626';
    ctx.font = '900 26px sans-serif';
    ctx.fillText('PEUGEOT TALBOT SPORT', 280, 265);
  } else if (carId === 'audi') {
    // Audi Sport HB Rally Team White Base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 512);

    // HB Audi Sport Yellow / Red / Grey / Black stripes wrapping side and hood
    const hbStripes = [
      { c: '#eab308', y: 170, h: 52 },
      { c: '#dc2626', y: 222, h: 44 },
      { c: '#52525b', y: 266, h: 38 },
      { c: '#18181b', y: 304, h: 34 },
    ];
    for (const st of hbStripes) {
      ctx.fillStyle = st.c;
      ctx.beginPath();
      ctx.moveTo(40, st.y + 45);
      ctx.lineTo(980, st.y - 35);
      ctx.lineTo(980, st.y - 35 + st.h);
      ctx.lineTo(40, st.y + 45 + st.h);
      ctx.closePath();
      ctx.fill();
    }

    // Hood louvers (dark vents on top of hood U=0.68..0.88, V=0..0.3)
    ctx.fillStyle = '#18181b';
    for (let x = 700; x < 890; x += 22) {
      ctx.fillRect(x, 28, 12, 95);
    }

    // Door shutlines & rear fender cooling gills
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.38)';
    ctx.lineWidth = 3;
    ctx.strokeRect(390, 200, 235, 250);
    ctx.fillStyle = '#18181b';
    for (let g = 0; g < 5; g++) {
      ctx.fillRect(285 + g * 14, 240, 8, 95);
    }

    // #1 HB Audi Sport Door Number Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(445, 220, 160, 195);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6;
    ctx.strokeRect(445, 220, 160, 195);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(448, 223, 154, 38);
    ctx.fillStyle = '#09090b';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HB AUDI TEAM', 525, 250);

    ctx.font = '900 112px sans-serif';
    ctx.fillText('1', 525, 378);

    ctx.fillStyle = '#18181b';
    ctx.font = 'italic 900 28px sans-serif';
    ctx.fillText('quattro', 790, 395);
  } else if (carId === 'subaru') {
    // Subaru WRC 555 Metallic Sonic Blue Base
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1347bd');
    grad.addColorStop(0.5, '#0e3fa9');
    grad.addColorStop(1, '#092a75');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Door shutlines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(380, 205, 255, 245);

    // Iconic Gold 555 Crescent Swooshes on Doors & Rear Quarter
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(340, 320, 120, -0.85, 1.35);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(320, 320, 148, -0.75, 1.25);
    ctx.stroke();

    // Giant Italic Gold "555" on Doors
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 900 104px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('555', 370, 355);

    // Hood "555" Crescent Logo
    ctx.save();
    ctx.translate(800, 90);
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 900 64px sans-serif';
    ctx.fillText('555', 0, 20);
    ctx.restore();

    // Rally Door Number Plate #3
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(515, 225, 148, 182);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6;
    ctx.strokeRect(515, 225, 148, 182);

    ctx.fillStyle = '#0e3fa9';
    ctx.fillRect(518, 228, 142, 34);
    ctx.fillStyle = '#facc15';
    ctx.font = '900 20px sans-serif';
    ctx.fillText('SUBARU WRC', 589, 252);

    ctx.fillStyle = '#09090b';
    ctx.font = '900 102px sans-serif';
    ctx.fillText('3', 589, 372);

    // Pirelli & STi badges
    ctx.fillStyle = '#facc15';
    ctx.fillRect(745, 360, 130, 34);
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 22px sans-serif';
    ctx.fillText('PIRELLI', 810, 384);
  } else if (carId === 'mercedes') {
    // Mercedes 190E Evo II DTM Metallic Anthracite Base + Silver Lower Cladding
    ctx.fillStyle = '#181a20';
    ctx.fillRect(0, 0, 1024, 512);

    // Silver-grey W201 lower body cladding & fender arches
    ctx.fillStyle = '#52525b';
    ctx.fillRect(0, 375, 1024, 137);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(0, 370, 1024, 8);

    // Red & Yellow SONAX / AMG DTM diagonal flashes
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(160, 512);
    ctx.lineTo(420, 80);
    ctx.lineTo(485, 80);
    ctx.lineTo(225, 512);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(225, 512);
    ctx.lineTo(485, 80);
    ctx.lineTo(530, 80);
    ctx.lineTo(270, 512);
    ctx.closePath();
    ctx.fill();

    // 4-Door Sedan Shutlines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(320, 205, 165, 240);
    ctx.strokeRect(488, 205, 175, 240);

    // SONAX #4 DTM Door Number Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(495, 220, 152, 188);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 6;
    ctx.strokeRect(495, 220, 152, 188);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(498, 223, 146, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SONAX', 571, 248);

    ctx.fillStyle = '#09090b';
    ctx.font = '900 104px sans-serif';
    ctx.fillText('4', 571, 372);

    // AMG / BOSCH decals
    ctx.fillStyle = '#e4e4e7';
    ctx.font = '900 26px sans-serif';
    ctx.fillText('AMG-MERCEDES', 785, 345);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function createWingLiveryTexture(carId: CarId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  if (carId === 'peugeot') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PEUGEOT TALBOT SPORT', 256, 64);
  } else if (carId === 'audi') {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 512, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AUDI SPORT', 256, 78);
  } else if (carId === 'subaru') {
    ctx.fillStyle = '#0e3fa9';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 900 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUBARU 555', 256, 64);
  } else {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SONAX AMG', 256, 64);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * Interpolates extra intermediate cross-section stations using Catmull-Rom splines
 * and builds a smooth 3D automotive body mesh with full UV coordinates!
 */
function buildSurfaceFromProfiles(
  rawStations: {
    x: number;
    bow: number;
    pts: [number, number][];
  }[],
  material: THREE.Material,
  closeEnds = false,
  subdivide = 2
): THREE.Mesh {
  // Subdivide stations along X for smoother curves
  const stations: { x: number; bow: number; pts: [number, number][] }[] = [];
  const numP = rawStations[0].pts.length;

  for (let s = 0; s < rawStations.length - 1; s++) {
    const st0 = rawStations[Math.max(0, s - 1)];
    const st1 = rawStations[s];
    const st2 = rawStations[s + 1];
    const st3 = rawStations[Math.min(rawStations.length - 1, s + 2)];

    const steps = subdivide;
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;

      const catmull = (p0: number, p1: number, p2: number, p3: number) =>
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t3);

      const x = catmull(st0.x, st1.x, st2.x, st3.x);
      const bow = catmull(st0.bow, st1.bow, st2.bow, st3.bow);
      const pts: [number, number][] = [];
      for (let i = 0; i < numP; i++) {
        const py = catmull(st0.pts[i][0], st1.pts[i][0], st2.pts[i][0], st3.pts[i][0]);
        const pz = Math.max(0, catmull(st0.pts[i][1], st1.pts[i][1], st2.pts[i][1], st3.pts[i][1]));
        pts.push([py, pz]);
      }
      stations.push({ x, bow, pts });
    }
  }
  stations.push(rawStations[rawStations.length - 1]);

  const numS = stations.length;
  const ringLen = numP * 2 - 2;

  const minX = stations[0].x;
  const maxX = stations[numS - 1].x;
  const spanX = Math.max(1, maxX - minX);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < numS; s++) {
    const st = stations[s];
    const maxZ = Math.max(...st.pts.map((p) => p[1]), 0.01);
    const u = (st.x - minX) / spanX;

    const ring: [number, number][] = [];
    const ringV: number[] = [];
    for (let i = 0; i < numP; i++) {
      ring.push([st.pts[i][0], st.pts[i][1]]);
      ringV.push(1.0 - i / (numP - 1));
    }
    for (let i = numP - 2; i >= 1; i--) {
      ring.push([st.pts[i][0], -st.pts[i][1]]);
      ringV.push(1.0 - i / (numP - 1));
    }

    for (let r = 0; r < ringLen; r++) {
      const [py, pz] = ring[r];
      const zr = Math.abs(pz) / maxZ;
      const cx = st.x + st.bow * Math.pow(zr, 1.8);
      positions.push(cx, py, pz);
      uvs.push(u, ringV[r]);
    }
  }

  for (let s = 0; s < numS - 1; s++) {
    const aBase = s * ringLen;
    const bBase = (s + 1) * ringLen;
    for (let r = 0; r < ringLen; r++) {
      const nr = (r + 1) % ringLen;
      indices.push(aBase + r, bBase + r, aBase + nr);
      indices.push(aBase + nr, bBase + r, bBase + nr);
    }
  }

  if (closeEnds) {
    const rearBase = 0;
    for (let r = 1; r < ringLen - 1; r++) {
      indices.push(rearBase, rearBase + r + 1, rearBase + r);
    }
    const frontBase = (numS - 1) * ringLen;
    for (let r = 1; r < ringLen - 1; r++) {
      indices.push(frontBase, frontBase + r, frontBase + r + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 128);

  // Realistic gravel rally tire tread blocks
  ctx.fillStyle = '#09090b';
  for (let y = 0; y < 128; y += 16) {
    ctx.fillRect(28, y, 52, 9);
    ctx.fillRect(96, y + 4, 64, 9);
    ctx.fillRect(176, y, 52, 9);
  }
  // Circumferential grooves
  ctx.fillRect(84, 0, 8, 128);
  ctx.fillRect(164, 0, 8, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 6);
  return tex;
}

const sharedTireTreadTex = typeof document !== 'undefined' ? createTireTreadTexture() : null;

function buildRealisticWheel(
  rimColorHex = 0xe4e4e7,
  spokeCount = 5,
  isTurbofan = false,
  caliperColorHex = 0xdc2626
): THREE.Group {
  const wheelGroup = new THREE.Group();

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c21,
    map: sharedTireTreadTex,
    roughness: 0.86,
    metalness: 0.05,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: rimColorHex,
    roughness: 0.2,
    metalness: 0.85,
  });
  const darkBarrelMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.45,
    metalness: 0.5,
  });
  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    roughness: 0.3,
    metalness: 0.85,
  });
  const caliperMat = new THREE.MeshStandardMaterial({
    color: caliperColorHex,
    roughness: 0.25,
    metalness: 0.4,
  });
  const lugMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.3,
    metalness: 0.9,
  });

  const tireRadius = 5.45;
  const rimRadius = 3.72;
  const halfWidth = 2.55;
  const profile = [
    new THREE.Vector2(rimRadius, -halfWidth * 0.88),
    new THREE.Vector2(tireRadius * 0.95, -halfWidth),
    new THREE.Vector2(tireRadius, -halfWidth * 0.74),
    new THREE.Vector2(tireRadius, halfWidth * 0.74),
    new THREE.Vector2(tireRadius * 0.95, halfWidth),
    new THREE.Vector2(rimRadius, halfWidth * 0.88),
    new THREE.Vector2(rimRadius, -halfWidth * 0.88),
  ];
  const tireGeo = new THREE.LatheGeometry(profile, 28);
  tireGeo.rotateX(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
  tireMesh.castShadow = true;
  wheelGroup.add(tireMesh);

  const barrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, halfWidth * 1.72, 24);
  barrelGeo.rotateX(Math.PI / 2);
  wheelGroup.add(new THREE.Mesh(barrelGeo, darkBarrelMat));

  // Ventilated brake disc rotor + Brembo brake caliper
  const rotorGeo = new THREE.CylinderGeometry(2.85, 2.85, 0.55, 20);
  rotorGeo.rotateX(Math.PI / 2);
  wheelGroup.add(new THREE.Mesh(rotorGeo, rotorMat));

  for (const side of [-1, 1]) {
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.95), caliperMat);
    caliper.position.set(-1.6, 0.8, side * 0.65);
    caliper.rotation.z = 0.4;
    wheelGroup.add(caliper);

    const zFace = side * (halfWidth * 0.82);

    const lipGeo = new THREE.RingGeometry(rimRadius - 0.42, rimRadius + 0.06, 28);
    if (side < 0) lipGeo.rotateY(Math.PI);
    const lip = new THREE.Mesh(lipGeo, alloyMat);
    lip.position.z = zFace;
    wheelGroup.add(lip);

    if (isTurbofan) {
      // Group B Speedline / BBS aerodynamic turbofan cover with cooling fins
      const fanGeo = new THREE.CylinderGeometry(rimRadius * 0.86, rimRadius * 0.86, 0.28, 24);
      fanGeo.rotateX(Math.PI / 2);
      const fan = new THREE.Mesh(fanGeo, alloyMat);
      fan.position.z = zFace - side * 0.05;
      wheelGroup.add(fan);

      const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.42, 16), lugMat);
      centerCap.rotateX(Math.PI / 2);
      centerCap.position.z = zFace + side * 0.02;
      wheelGroup.add(centerCap);

      const vaneGeo = new THREE.BoxGeometry(0.18, rimRadius * 0.72, 0.34);
      for (let v = 0; v < 12; v++) {
        const va = (v / 12) * Math.PI * 2;
        const vane = new THREE.Mesh(vaneGeo, lugMat);
        const rMid = rimRadius * 0.48;
        vane.position.set(Math.cos(va) * rMid, Math.sin(va) * rMid, zFace);
        vane.rotation.z = va - Math.PI / 2 + 0.25;
        wheelGroup.add(vane);
      }
    } else {
      const hubGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.44, 16);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, alloyMat);
      hub.position.z = zFace - side * 0.08;
      wheelGroup.add(hub);

      const capGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.48, 12);
      capGeo.rotateX(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, lugMat);
      cap.position.z = zFace - side * 0.06;
      wheelGroup.add(cap);

      const spokeGeo = new THREE.BoxGeometry(0.38, rimRadius - 0.52, 0.34);
      for (let i = 0; i < spokeCount; i++) {
        const baseAngle = (i / spokeCount) * Math.PI * 2;
        for (const subAngle of [-0.095, 0.095]) {
          const sp = new THREE.Mesh(spokeGeo, alloyMat);
          const a = baseAngle + subAngle;
          const rMid = (rimRadius + 0.65) * 0.5;
          sp.position.set(Math.cos(a) * rMid, Math.sin(a) * rMid, zFace - side * 0.05);
          sp.rotation.z = a - Math.PI / 2 + subAngle * 0.42;
          wheelGroup.add(sp);
        }
      }
    }
  }

  return wheelGroup;
}

function addInteriorCabin(bodyTiltGroup: THREE.Group, hasRollcage = false) {
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.85 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x181920, roughness: 0.7 });
  const harnessMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

  const interiorGroup = new THREE.Group();
  const interiorTub = new THREE.Mesh(new THREE.BoxGeometry(22.5, 4.0, 18.0), matteBlack);
  interiorTub.position.set(-3.0, 10.8, 0);
  interiorGroup.add(interiorTub);

  const dash = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 17.6), matteBlack);
  dash.position.set(6.5, 12.1, 0);
  interiorGroup.add(dash);

  // Instrument binnacle hood & rearview mirror
  const cluster = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 4.2), matteBlack);
  cluster.position.set(5.8, 13.8, -4.5);
  interiorGroup.add(cluster);

  const rearViewMirror = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 3.2), matteBlack);
  rearViewMirror.position.set(4.2, 16.4, 0);
  interiorGroup.add(rearViewMirror);

  const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.25, 8, 16), matteBlack);
  steeringWheel.position.set(4.1, 13.1, -4.5);
  steeringWheel.rotation.y = Math.PI / 2 - 0.35;
  interiorGroup.add(steeringWheel);

  for (const zSeat of [-4.5, 4.5]) {
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 4.6), seatMat);
    seatBack.position.set(-1.2, 13.0, zSeat);
    seatBack.rotation.z = 0.18;
    interiorGroup.add(seatBack);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 2.8), seatMat);
    headrest.position.set(-1.8, 15.9, zSeat);
    interiorGroup.add(headrest);

    if (hasRollcage) {
      // Racing 4-point red harness straps on Recaro/Sparco bucket seats
      for (const hOff of [-0.9, 0.9]) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.8, 0.55), harnessMat);
        strap.position.set(-0.1, 13.1, zSeat + hOff);
        strap.rotation.z = 0.18;
        interiorGroup.add(strap);
      }
    }
  }

  if (hasRollcage) {
    const cageMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.28, metalness: 0.65 });
    const crossBar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 16.8, 8), cageMat);
    crossBar1.position.set(-8.5, 14.4, 0);
    crossBar1.rotation.x = 0.65;
    interiorGroup.add(crossBar1);

    const crossBar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 16.8, 8), cageMat);
    crossBar2.position.set(-8.5, 14.4, 0);
    crossBar2.rotation.x = -0.65;
    interiorGroup.add(crossBar2);
  }

  bodyTiltGroup.add(interiorGroup);
}

/**
 * Adds realistic 3D wheel arch flares, deep wheel well liners, underbody chassis,
 * side mirrors, windshield wipers, Cabin Pillars (A/B/C), and Exhaust pipes!
 */
function addCommonRealisticDetails(
  bodyTiltGroup: THREE.Group,
  opts: {
    frontX: number;
    rearX: number;
    wheelZ: number;
    bodyPaintMat: THREE.Material;
    trimMat: THREE.Material;
    pillarPaintMat: THREE.Material;
    aPillarX: number;
    cPillarX: number;
    roofX: number;
    roofLen: number;
    exhaustSide: 'left' | 'right' | 'dual';
    singleWiper?: boolean;
  }
) {
  const darkUnderMat = new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: 0.92 });
  const mirrorGlassMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.05 });
  const chromeExhaustMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.18 });

  // 1. Underbody chassis floor pan so the car never looks hollow from low angles
  const chassisFloor = new THREE.Mesh(new THREE.BoxGeometry(44, 1.4, opts.wheelZ * 1.82), darkUnderMat);
  chassisFloor.position.set(0, 3.3, 0);
  bodyTiltGroup.add(chassisFloor);

  // 2. Deep 3D Wheel Wells + Sculpted 3D Fender Arch Lips around all 4 wheels
  const wellGeo = new THREE.CylinderGeometry(6.15, 6.15, 5.2, 22, 1, false, 0, Math.PI);
  wellGeo.rotateX(Math.PI / 2);

  const archTorusGeo = new THREE.TorusGeometry(5.95, 0.68, 10, 24, Math.PI);

  for (const wx of [opts.frontX, opts.rearX]) {
    for (const sideSign of [-1, 1]) {
      const well = new THREE.Mesh(wellGeo, darkUnderMat);
      well.position.set(wx, 5.35, sideSign * (opts.wheelZ - 0.7));
      bodyTiltGroup.add(well);

      const archLip = new THREE.Mesh(archTorusGeo, opts.bodyPaintMat);
      archLip.position.set(wx, 5.35, sideSign * (opts.wheelZ + 0.55));
      bodyTiltGroup.add(archLip);
    }
  }

  // 3. Sculpted A-Pillars, B-Pillars, C-Pillars, and Roof Cantrails
  for (const sideSign of [-1, 1]) {
    const aPillar = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.85, 1.05), opts.pillarPaintMat);
    aPillar.position.set(opts.aPillarX, 14.3, sideSign * 9.65);
    aPillar.rotation.z = -0.58;
    aPillar.rotation.y = sideSign * -0.07;
    bodyTiltGroup.add(aPillar);

    const cantrail = new THREE.Mesh(new THREE.BoxGeometry(opts.roofLen, 0.75, 1.15), opts.pillarPaintMat);
    cantrail.position.set(opts.roofX, 17.35, sideSign * 8.95);
    bodyTiltGroup.add(cantrail);

    const bPillar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.8, 0.65), opts.trimMat);
    bPillar.position.set(-1.8, 14.2, sideSign * 10.15);
    bPillar.rotation.x = sideSign * -0.18;
    bodyTiltGroup.add(bPillar);

    const cPillar = new THREE.Mesh(new THREE.BoxGeometry(6.8, 6.2, 1.18), opts.pillarPaintMat);
    cPillar.position.set(opts.cPillarX, 14.3, sideSign * 9.65);
    cPillar.rotation.z = 0.6;
    cPillar.rotation.y = sideSign * 0.08;
    bodyTiltGroup.add(cPillar);

    // Window rubber beltline trim & flush door handles
    const beltMolding = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.42, 0.65), opts.trimMat);
    beltMolding.position.set(-2.0, 11.35, sideSign * 11.45);
    bodyTiltGroup.add(beltMolding);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.52, 0.65), opts.trimMat);
    handle.position.set(1.5, 9.8, sideSign * (opts.wheelZ + 0.5));
    bodyTiltGroup.add(handle);

    // Aerodynamic Side Wing Mirrors with Reflective Glass
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(opts.aPillarX + 1.4, 11.5, sideSign * 11.3);
    const stalk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 1.8), opts.trimMat);
    mirrorGroup.add(stalk);

    const housing = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.75, 2.8), opts.pillarPaintMat);
    housing.position.set(-0.3, 0.45, sideSign * 1.1);
    housing.rotation.y = sideSign * -0.2;
    mirrorGroup.add(housing);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), mirrorGlassMat);
    glass.position.set(-1.72, 0.45, sideSign * 1.15);
    glass.rotation.y = -Math.PI / 2 + sideSign * -0.2;
    mirrorGroup.add(glass);

    bodyTiltGroup.add(mirrorGroup);
  }

  // 4. Front Windshield Wipers
  if (opts.singleWiper) {
    // DTM-style single central upright monowiper
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.35, 0.45), opts.trimMat);
    wiper.position.set(opts.aPillarX + 0.2, 13.8, 0);
    wiper.rotation.z = -0.58;
    bodyTiltGroup.add(wiper);
  } else {
    for (const wz of [-4.2, 2.8]) {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 6.8), opts.trimMat);
      wiper.position.set(opts.aPillarX + 3.2, 11.6, wz);
      wiper.rotation.y = 0.12;
      bodyTiltGroup.add(wiper);
    }
  }

  // 5. Realistic Exhaust Tailpipes (Chrome outer barrel + dark soot inner core)
  const addExhaustPipe = (x: number, y: number, z: number) => {
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 3.2, 16), chromeExhaustMat);
    outer.rotation.z = Math.PI / 2;
    outer.position.set(x, y, z);
    bodyTiltGroup.add(outer);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 3.3, 14), darkUnderMat);
    inner.rotation.z = Math.PI / 2;
    inner.position.set(x - 0.05, y, z);
    bodyTiltGroup.add(inner);
  };

  if (opts.exhaustSide === 'dual') {
    addExhaustPipe(opts.rearX - 9.2, 3.8, -6.5);
    addExhaustPipe(opts.rearX - 9.2, 3.8, 6.5);
  } else if (opts.exhaustSide === 'left') {
    addExhaustPipe(opts.rearX - 9.5, 3.8, -6.8);
    addExhaustPipe(opts.rearX - 9.5, 3.8, -4.7);
  } else {
    addExhaustPipe(opts.rearX - 9.5, 3.8, 6.8);
  }
}

/**
 * 1. 2020 Red Škoda Scala (515 TKW) — Estonian street specification
 */
export function buildSkodaScala3D(licensePlateText = '515 TKW'): Car3D {
  const root = new THREE.Group();
  const bodyTiltGroup = new THREE.Group();
  root.add(bodyTiltGroup);

  const velvetRedPaint = new THREE.MeshPhysicalMaterial({
    color: 0xcf151d,
    metalness: 0.38,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  const darkCrimsonCrease = new THREE.MeshPhysicalMaterial({
    color: 0x8f0d13,
    metalness: 0.35,
    roughness: 0.24,
    clearcoat: 0.9,
  });
  const glossBlack = new THREE.MeshPhysicalMaterial({
    color: 0x090b10,
    metalness: 0.2,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const matteBlack = new THREE.MeshStandardMaterial({
    color: 0x141519,
    roughness: 0.85,
    metalness: 0.1,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.14,
    metalness: 0.92,
  });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    metalness: 0.1,
    roughness: 0.06,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1.0,
  });

  const lowerBodyStations = [
    {
      x: -26.8,
      bow: 1.9,
      pts: [
        [4.0, 0.0],
        [4.1, 10.2],
        [5.4, 11.4],
        [6.8, 11.6],
        [8.4, 11.2],
        [9.4, 10.4],
        [9.6, 8.8],
        [9.7, 0.0],
      ] as [number, number][],
    },
    {
      x: -24.6,
      bow: 1.4,
      pts: [
        [3.6, 0.0],
        [3.7, 11.2],
        [5.6, 12.2],
        [7.6, 12.5],
        [9.8, 12.0],
        [11.3, 11.2],
        [11.6, 9.6],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: -19.8,
      bow: 0.6,
      pts: [
        [3.4, 0.0],
        [3.5, 11.8],
        [5.8, 12.8],
        [8.0, 13.0],
        [10.2, 12.3],
        [11.5, 11.3],
        [11.8, 9.8],
        [11.9, 0.0],
      ] as [number, number][],
    },
    {
      x: -16.2,
      bow: 0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 11.8],
        [6.2, 12.9],
        [8.3, 13.1],
        [10.3, 12.4],
        [11.6, 11.4],
        [11.9, 9.9],
        [12.0, 0.0],
      ] as [number, number][],
    },
    {
      x: -11.5,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 11.7],
        [5.8, 12.5],
        [8.0, 12.7],
        [10.2, 12.3],
        [11.4, 11.4],
        [11.7, 10.0],
        [11.8, 0.0],
      ] as [number, number][],
    },
    {
      x: -2.0,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 11.7],
        [5.6, 12.4],
        [7.8, 12.6],
        [10.0, 12.2],
        [11.2, 11.3],
        [11.5, 10.0],
        [11.6, 0.0],
      ] as [number, number][],
    },
    {
      x: 10.5,
      bow: -0.3,
      pts: [
        [3.2, 0.0],
        [3.3, 11.7],
        [5.6, 12.5],
        [7.7, 12.7],
        [9.8, 12.1],
        [10.9, 11.2],
        [11.2, 9.6],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 16.0,
      bow: -0.6,
      pts: [
        [3.4, 0.0],
        [3.5, 11.8],
        [6.0, 12.9],
        [8.0, 13.0],
        [9.6, 12.1],
        [10.5, 10.9],
        [10.8, 8.8],
        [11.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 20.2,
      bow: -1.0,
      pts: [
        [3.4, 0.0],
        [3.5, 11.5],
        [5.6, 12.4],
        [7.5, 12.5],
        [9.1, 11.6],
        [10.0, 10.3],
        [10.3, 8.0],
        [10.5, 0.0],
      ] as [number, number][],
    },
    {
      x: 24.4,
      bow: -1.5,
      pts: [
        [3.4, 0.0],
        [3.5, 10.8],
        [5.2, 11.6],
        [6.9, 11.7],
        [8.4, 10.9],
        [9.2, 9.5],
        [9.5, 7.2],
        [9.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 27.5,
      bow: -2.2,
      pts: [
        [3.5, 0.0],
        [3.6, 9.6],
        [4.9, 10.4],
        [6.5, 10.5],
        [7.8, 9.8],
        [8.5, 8.4],
        [8.8, 5.8],
        [8.9, 0.0],
      ] as [number, number][],
    },
  ];

  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerBodyStations, velvetRedPaint, true, 2));

  for (const sideSign of [-1, 1]) {
    const tornadoLine = new THREE.Mesh(new THREE.BoxGeometry(43.5, 0.35, 0.45), darkCrimsonCrease);
    tornadoLine.position.set(-1.5, 10.05, sideSign * 12.25);
    tornadoLine.rotation.z = -0.022;
    bodyTiltGroup.add(tornadoLine);

    const rockerSkirt = new THREE.Mesh(new THREE.BoxGeometry(24.5, 0.95, 0.55), darkCrimsonCrease);
    rockerSkirt.position.set(-0.2, 4.2, sideSign * 12.35);
    bodyTiltGroup.add(rockerSkirt);

    for (const [hx, hy] of [
      [3.0, 9.65],
      [-8.8, 9.9],
    ]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.65), velvetRedPaint);
      handle.position.set(hx, hy, sideSign * 12.45);
      bodyTiltGroup.add(handle);
    }
  }

  for (const zRib of [-4.8, -1.4, 1.4, 4.8]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.28, 0.42), darkCrimsonCrease);
    rib.position.set(18.6, 10.65, zRib);
    rib.rotation.z = -0.155;
    rib.rotation.y = zRib * 0.016;
    bodyTiltGroup.add(rib);
  }

  addInteriorCabin(bodyTiltGroup, false);

  const cabinStations = [
    {
      x: -23.8,
      bow: 1.4,
      pts: [
        [11.2, 0.0],
        [11.3, 10.6],
        [11.7, 10.4],
        [12.0, 9.8],
        [12.2, 0.0],
      ] as [number, number][],
    },
    {
      x: -17.4,
      bow: 0.9,
      pts: [
        [11.5, 0.0],
        [11.6, 11.0],
        [14.4, 10.0],
        [17.1, 8.9],
        [17.4, 0.0],
      ] as [number, number][],
    },
    {
      x: -4.8,
      bow: 0.2,
      pts: [
        [11.3, 0.0],
        [11.4, 11.2],
        [14.6, 10.2],
        [17.4, 9.1],
        [17.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 2.6,
      bow: -0.6,
      pts: [
        [11.1, 0.0],
        [11.2, 11.1],
        [14.4, 10.1],
        [17.1, 9.0],
        [17.4, 0.0],
      ] as [number, number][],
    },
    {
      x: 11.6,
      bow: -1.1,
      pts: [
        [10.9, 0.0],
        [11.0, 10.7],
        [11.3, 10.4],
        [11.5, 9.6],
        [11.6, 0.0],
      ] as [number, number][],
    },
  ];

  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false, 2));

  addCommonRealisticDetails(bodyTiltGroup, {
    frontX: 16.0,
    rearX: -16.2,
    wheelZ: 11.6,
    bodyPaintMat: velvetRedPaint,
    trimMat: glossBlack,
    pillarPaintMat: velvetRedPaint,
    aPillarX: 7.1,
    cPillarX: -18.8,
    roofX: -7.4,
    roofLen: 20.2,
    exhaustSide: 'dual',
  });

  for (const sideSign of [-1, 1]) {
    const chromeBelt = new THREE.Mesh(new THREE.BoxGeometry(28.5, 0.36, 0.68), chromeMat);
    chromeBelt.position.set(-2.8, 11.35, sideSign * 11.3);
    chromeBelt.rotation.z = -0.022;
    bodyTiltGroup.add(chromeBelt);
  }

  const panoRoof = new THREE.Mesh(new THREE.BoxGeometry(19.6, 0.42, 16.8), glossBlack);
  panoRoof.position.set(-7.4, 17.55, 0);
  panoRoof.rotation.z = 0.015;
  bodyTiltGroup.add(panoRoof);

  const sharkFin = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.2, 4), glossBlack);
  sharkFin.position.set(-14.8, 18.4, 0);
  sharkFin.rotation.z = -0.35;
  sharkFin.scale.set(1.6, 1, 0.42);
  bodyTiltGroup.add(sharkFin);

  const tailgateTex = createExtendedTailgateGlassTexture();
  const tailgateGlassMat = new THREE.MeshPhysicalMaterial({
    map: tailgateTex,
    roughness: 0.1,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const tailgateGlassGeo = new THREE.PlaneGeometry(18.6, 8.2, 8, 1);
  const tgPos = tailgateGlassGeo.attributes.position;
  for (let i = 0; i < tgPos.count; i++) {
    const u = tgPos.getX(i) / 9.3;
    tgPos.setZ(i, -Math.pow(u, 2) * 0.85);
  }
  tailgateGlassGeo.computeVertexNormals();

  const tailgateGlass = new THREE.Mesh(tailgateGlassGeo, tailgateGlassMat);
  tailgateGlass.position.set(-20.85, 14.2, 0);
  tailgateGlass.rotation.y = -Math.PI / 2;
  tailgateGlass.rotation.x = -0.64;
  bodyTiltGroup.add(tailgateGlass);

  const wiperGroup = new THREE.Group();
  wiperGroup.position.set(-22.85, 12.6, 0);
  wiperGroup.rotation.z = 0.64;
  const wiperPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10), matteBlack);
  wiperPivot.rotation.z = Math.PI / 2;
  wiperGroup.add(wiperPivot);
  const wiperBlade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 6.2), matteBlack);
  wiperBlade.position.set(-0.2, 0.25, 2.8);
  wiperBlade.rotation.x = -0.08;
  wiperGroup.add(wiperBlade);
  bodyTiltGroup.add(wiperGroup);

  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.9, 18.2), velvetRedPaint);
  spoiler.position.set(-18.2, 17.5, 0);
  spoiler.rotation.z = 0.06;
  bodyTiltGroup.add(spoiler);

  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
  const thirdBrake = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 7.8), thirdBrakeLightMat);
  thirdBrake.position.set(-20.35, 17.38, 0);
  bodyTiltGroup.add(thirdBrake);

  for (const sideSign of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.3, 0.52), glossBlack);
    fin.position.set(-19.6, 15.6, sideSign * 9.15);
    fin.rotation.z = 0.62;
    bodyTiltGroup.add(fin);
  }

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.85,
    roughness: 0.18,
  });
  const indicatorStripMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const darkLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x26080c,
    roughness: 0.12,
    clearcoat: 1.0,
  });

  for (const sideSign of [-1, 1]) {
    const tlGroup = new THREE.Group();
    const outerHousing = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.3, 4.6), darkLensMat);
    outerHousing.position.set(-24.2, 10.35, sideSign * 9.8);
    outerHousing.rotation.y = sideSign * 0.24;
    tlGroup.add(outerHousing);

    const outerLedTop = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.72, 4.3), tailLightMat);
    outerLedTop.position.set(-24.45, 11.0, sideSign * 9.8);
    outerLedTop.rotation.y = sideSign * 0.24;
    tlGroup.add(outerLedTop);

    const outerLedSide = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.9, 1.1), tailLightMat);
    outerLedSide.position.set(-24.45, 10.35, sideSign * 11.4);
    outerLedSide.rotation.y = sideSign * 0.24;
    tlGroup.add(outerLedSide);

    const innerHousing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 4.8), darkLensMat);
    innerHousing.position.set(-25.1, 10.75, sideSign * 6.2);
    tlGroup.add(innerHousing);

    const innerBlade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.88, 4.6), tailLightMat);
    innerBlade.position.set(-25.25, 10.9, sideSign * 6.2);
    tlGroup.add(innerBlade);

    const turnStrip = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.38, 7.4), indicatorStripMat);
    turnStrip.position.set(-25.25, 9.75, sideSign * 7.8);
    turnStrip.rotation.y = sideSign * 0.1;
    tlGroup.add(turnStrip);

    bodyTiltGroup.add(tlGroup);
  }

  const plateTex = createLicensePlateTexture(licensePlateText);
  const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });

  const recessBacking = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 13.8), darkCrimsonCrease);
  recessBacking.position.set(-25.85, 7.55, 0);
  bodyTiltGroup.add(recessBacking);

  const rearPlateHolder = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.1, 12.6), matteBlack);
  rearPlateHolder.position.set(-26.35, 7.55, 0);
  bodyTiltGroup.add(rearPlateHolder);

  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(12.2, 2.8), plateMat);
  rearPlate.position.set(-26.68, 7.55, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.85, 20.6), matteBlack);
  diffuser.position.set(-25.5, 4.15, 0);
  bodyTiltGroup.add(diffuser);

  const reflectorMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  for (const sideSign of [-1, 1]) {
    const refl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.48, 3.8), reflectorMat);
    refl.position.set(-26.45, 5.35, sideSign * 8.6);
    refl.rotation.y = sideSign * 0.24;
    bodyTiltGroup.add(refl);

    const mudflap = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.6, 4.2), matteBlack);
    mudflap.position.set(-21.6, 3.6, sideSign * 10.8);
    bodyTiltGroup.add(mudflap);
  }

  const grilleTex = createGrilleTexture();
  const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, roughness: 0.4 });
  const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.4, 12.6), chromeMat);
  grilleFrame.position.set(27.0, 7.1, 0);
  bodyTiltGroup.add(grilleFrame);

  const grilleCore = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.9, 11.8), grilleMat);
  grilleCore.position.set(27.05, 7.1, 0);
  bodyTiltGroup.add(grilleCore);

  const frontEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.25, 16), chromeMat);
  frontEmblem.position.set(26.5, 9.0, 0);
  frontEmblem.rotation.z = -1.38;
  bodyTiltGroup.add(frontEmblem);

  const frontIntake = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.75, 19.2), matteBlack);
  frontIntake.position.set(26.9, 4.2, 0);
  bodyTiltGroup.add(frontIntake);

  const hlHousingMat = new THREE.MeshPhysicalMaterial({ color: 0x111318, roughness: 0.1, clearcoat: 1.0 });
  const drlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const projectorMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });

  for (const sideSign of [-1, 1]) {
    const hlGroup = new THREE.Group();
    hlGroup.position.set(26.1, 7.65, sideSign * 8.6);
    hlGroup.rotation.y = sideSign * -0.28;
    hlGroup.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.85, 4.8), hlHousingMat));
    const proj = new THREE.Mesh(new THREE.BoxGeometry(2.95, 1.1, 2.2), projectorMat);
    proj.position.set(0.1, 0.15, sideSign * -0.5);
    hlGroup.add(proj);
    const drl = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.35, 4.5), drlMat);
    drl.position.set(0.15, -0.7, 0);
    hlGroup.add(drl);
    bodyTiltGroup.add(hlGroup);
  }

  const frontPlate = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 2.5), plateMat);
  frontPlate.position.set(27.85, 5.3, 0);
  frontPlate.rotation.y = Math.PI / 2;
  bodyTiltGroup.add(frontPlate);

  const frontLeftWheel = buildRealisticWheel(0xe4e4e7, 5, false, 0xdc2626);
  frontLeftWheel.position.set(16.0, 5.45, -11.6);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xe4e4e7, 5, false, 0xdc2626);
  frontRightWheel.position.set(16.0, 5.45, 11.6);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xe4e4e7, 5, false, 0xdc2626);
  rearLeftWheel.position.set(-16.2, 5.45, -11.6);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xe4e4e7, 5, false, 0xdc2626);
  rearRightWheel.position.set(-16.2, 5.45, 11.6);
  root.add(rearRightWheel);

  return {
    root,
    bodyTiltGroup,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    tailLightMat,
    thirdBrakeLightMat,
  };
}

/**
 * 2. Peugeot 205 Turbo 16 Evolution 2 — Peugeot Talbot Sport Group B Livery (#2)
 */
function buildPeugeot205T16(): Car3D {
  const root = new THREE.Group();
  const bodyTiltGroup = new THREE.Group();
  root.add(bodyTiltGroup);

  const liveryBodyMat = new THREE.MeshPhysicalMaterial({
    map: createBodyWrapLiveryTexture('peugeot'),
    metalness: 0.18,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  const whitePaint = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.18,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const ptsBlue = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a8a,
    metalness: 0.3,
    roughness: 0.22,
    clearcoat: 1.0,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    transparent: true,
    opacity: 0.82,
    roughness: 0.06,
    clearcoat: 1.0,
  });

  // Detailed 9-station Group B widebody 205 T16 hatchback silhouette with flared arches
  const lowerStations = [
    {
      x: -23.8,
      bow: 1.4,
      pts: [
        [3.6, 0.0],
        [3.7, 11.6],
        [6.2, 12.8],
        [8.6, 12.8],
        [10.6, 11.6],
        [11.3, 9.8],
        [11.4, 0.0],
      ] as [number, number][],
    },
    {
      x: -18.5,
      bow: 0.5,
      pts: [
        [3.5, 0.0],
        [3.6, 12.6],
        [7.0, 13.8],
        [9.6, 13.7],
        [11.3, 12.0],
        [11.6, 10.0],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: -14.2,
      bow: 0.1,
      pts: [
        [3.4, 0.0],
        [3.5, 12.8],
        [7.2, 14.0],
        [9.8, 13.9],
        [11.4, 12.0],
        [11.7, 10.1],
        [11.8, 0.0],
      ] as [number, number][],
    },
    {
      x: -7.5,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 12.0],
        [6.8, 12.9],
        [9.4, 12.7],
        [11.1, 11.4],
        [11.4, 9.9],
        [11.5, 0.0],
      ] as [number, number][],
    },
    {
      x: 2.0,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 11.8],
        [6.6, 12.5],
        [9.2, 12.3],
        [10.9, 11.2],
        [11.2, 9.7],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 11.0,
      bow: -0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 12.5],
        [7.0, 13.6],
        [9.4, 13.4],
        [10.7, 11.4],
        [11.0, 9.4],
        [11.1, 0.0],
      ] as [number, number][],
    },
    {
      x: 16.5,
      bow: -0.4,
      pts: [
        [3.4, 0.0],
        [3.5, 12.6],
        [7.0, 13.7],
        [9.3, 13.5],
        [10.5, 11.3],
        [10.8, 9.1],
        [10.9, 0.0],
      ] as [number, number][],
    },
    {
      x: 21.5,
      bow: -1.0,
      pts: [
        [3.3, 0.0],
        [3.4, 11.6],
        [6.0, 12.4],
        [8.4, 12.0],
        [9.7, 10.3],
        [10.0, 8.0],
        [10.1, 0.0],
      ] as [number, number][],
    },
    {
      x: 24.4,
      bow: -1.6,
      pts: [
        [3.2, 0.0],
        [3.3, 10.8],
        [5.2, 11.4],
        [7.6, 11.0],
        [8.9, 9.4],
        [9.1, 6.8],
        [9.2, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, liveryBodyMat, true, 2));

  // Mid-engine rear quarter turbo intake scoops + intercooler mesh
  for (const sideSign of [-1, 1]) {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.4, 1.6), whitePaint);
    scoop.position.set(-10.2, 8.9, sideSign * 12.8);
    scoop.rotation.y = sideSign * 0.08;
    bodyTiltGroup.add(scoop);

    const intakeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.6, 1.3), matteBlack);
    intakeMesh.position.set(-6.6, 8.9, sideSign * 12.9);
    bodyTiltGroup.add(intakeMesh);
  }

  addInteriorCabin(bodyTiltGroup, true);

  const cabinStations = [
    {
      x: -20.5,
      bow: 0.8,
      pts: [
        [11.4, 0.0],
        [11.5, 10.6],
        [14.8, 9.6],
        [17.6, 8.6],
        [17.8, 0.0],
      ] as [number, number][],
    },
    {
      x: -5.0,
      bow: 0.2,
      pts: [
        [11.3, 0.0],
        [11.4, 11.0],
        [15.0, 10.0],
        [17.8, 8.9],
        [18.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 3.5,
      bow: -0.4,
      pts: [
        [11.1, 0.0],
        [11.2, 10.8],
        [14.8, 9.8],
        [17.5, 8.8],
        [17.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 11.2,
      bow: -0.9,
      pts: [
        [10.9, 0.0],
        [11.0, 10.4],
        [11.3, 9.8],
        [11.5, 8.8],
        [11.6, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false, 2));

  addCommonRealisticDetails(bodyTiltGroup, {
    frontX: 14.8,
    rearX: -14.8,
    wheelZ: 12.3,
    bodyPaintMat: whitePaint,
    trimMat: matteBlack,
    pillarPaintMat: whitePaint,
    aPillarX: 7.2,
    cPillarX: -16.8,
    roofX: -6.8,
    roofLen: 20.5,
    exhaustSide: 'left',
  });

  const roof = new THREE.Mesh(new THREE.BoxGeometry(21.0, 0.7, 17.2), whitePaint);
  roof.position.set(-7.2, 17.8, 0);
  bodyTiltGroup.add(roof);

  // Evolution 2 Group B High-Downforce Rear Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createWingLiveryTexture('peugeot'),
    clearcoat: 1.0,
  });
  const rearWingBlade = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.85, 24.6), wingMat);
  rearWingBlade.position.set(-21.8, 20.6, 0);
  rearWingBlade.rotation.z = 0.22;
  bodyTiltGroup.add(rearWingBlade);

  for (const sideSign of [-1, 1]) {
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(8.4, 7.0, 0.75), ptsBlue);
    endplate.position.set(-20.8, 18.5, sideSign * 12.0);
    endplate.rotation.z = 0.14;
    bodyTiltGroup.add(endplate);

    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 4.2, 4.6),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    flap.position.set(-20.6, 3.6, sideSign * 11.6);
    bodyTiltGroup.add(flap);
  }

  // Peugeot 205 Ribbed Taillights with Amber Turn Signals + Black Rear Garnish
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.88,
  });
  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  const rearGarnish = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 22.4), matteBlack);
  rearGarnish.position.set(-23.6, 9.2, 0);
  bodyTiltGroup.add(rearGarnish);

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 5.2), tailLightMat);
    tl.position.set(-23.75, 9.0, sideSign * 8.6);
    bodyTiltGroup.add(tl);

    const turn = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.8, 5.2), amberMat);
    turn.position.set(-23.75, 10.2, sideSign * 8.6);
    bodyTiltGroup.add(turn);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('205 T16', '#facc15', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.7), plateMat);
  rearPlate.position.set(-24.3, 6.2, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Front Evolution 2 Splitter, Dive Planes, Peugeot Grille & 4 Cibie Rally Spotlights
  const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.4, 26.2), matteBlack);
  frontSplitter.position.set(23.5, 3.5, 0);
  bodyTiltGroup.add(frontSplitter);

  const grilleMat = new THREE.MeshStandardMaterial({ map: createGrilleTexture(14, false, false) });
  const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 12.8), grilleMat);
  frontGrille.position.set(24.3, 7.6, 0);
  bodyTiltGroup.add(frontGrille);

  const headMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  for (const sideSign of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 4.4), headMat);
    hl.position.set(24.1, 7.6, sideSign * 8.8);
    hl.rotation.y = sideSign * -0.15;
    bodyTiltGroup.add(hl);
  }

  const podLensMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  for (const zLamp of [-8.4, -3.8, 3.8, 8.4]) {
    const podHousing = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.5, 1.6, 16), matteBlack);
    podHousing.rotation.z = Math.PI / 2;
    podHousing.position.set(24.8, 7.2, zLamp);
    bodyTiltGroup.add(podHousing);

    const podLens = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.3, 16), podLensMat);
    podLens.rotation.z = Math.PI / 2;
    podLens.position.set(25.55, 7.2, zLamp);
    bodyTiltGroup.add(podLens);
  }

  const frontLeftWheel = buildRealisticWheel(0xf4f4f5, 6, true, 0xdc2626);
  frontLeftWheel.position.set(14.8, 5.45, -12.3);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xf4f4f5, 6, true, 0xdc2626);
  frontRightWheel.position.set(14.8, 5.45, 12.3);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xf4f4f5, 6, true, 0xdc2626);
  rearLeftWheel.position.set(-14.8, 5.45, -12.5);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xf4f4f5, 6, true, 0xdc2626);
  rearRightWheel.position.set(-14.8, 5.45, 12.5);
  root.add(rearRightWheel);

  return {
    root,
    bodyTiltGroup,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    tailLightMat,
    thirdBrakeLightMat,
  };
}

/**
 * 3. Audi Sport Quattro S1 E2 — HB Audi Sport Group B Livery (#1)
 */
function buildAudiQuattroS1(): Car3D {
  const root = new THREE.Group();
  const bodyTiltGroup = new THREE.Group();
  root.add(bodyTiltGroup);

  const liveryBodyMat = new THREE.MeshPhysicalMaterial({
    map: createBodyWrapLiveryTexture('audi'),
    metalness: 0.18,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  const whitePaint = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.18,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const hbYellow = new THREE.MeshPhysicalMaterial({
    color: 0xeab308,
    metalness: 0.2,
    roughness: 0.22,
    clearcoat: 1.0,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    transparent: true,
    opacity: 0.82,
    roughness: 0.06,
    clearcoat: 1.0,
  });

  // Angular Group B Coupe with wide blistered box-flares (9 stations)
  const lowerStations = [
    {
      x: -25.8,
      bow: 0.6,
      pts: [
        [3.8, 0.0],
        [3.9, 12.2],
        [6.8, 13.4],
        [9.4, 13.4],
        [11.4, 12.0],
        [11.8, 10.2],
        [11.9, 0.0],
      ] as [number, number][],
    },
    {
      x: -19.8,
      bow: 0.1,
      pts: [
        [3.5, 0.0],
        [3.6, 13.0],
        [7.2, 14.3],
        [9.9, 14.2],
        [11.6, 12.3],
        [11.9, 10.4],
        [12.0, 0.0],
      ] as [number, number][],
    },
    {
      x: -14.2,
      bow: 0.0,
      pts: [
        [3.4, 0.0],
        [3.5, 13.0],
        [7.2, 14.3],
        [9.9, 14.2],
        [11.6, 12.2],
        [11.9, 10.4],
        [12.0, 0.0],
      ] as [number, number][],
    },
    {
      x: -7.0,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 12.0],
        [6.8, 12.9],
        [9.6, 12.7],
        [11.3, 11.4],
        [11.6, 10.0],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 5.0,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 12.0],
        [6.8, 12.8],
        [9.5, 12.6],
        [11.1, 11.4],
        [11.4, 9.9],
        [11.5, 0.0],
      ] as [number, number][],
    },
    {
      x: 13.0,
      bow: 0.0,
      pts: [
        [3.4, 0.0],
        [3.5, 13.0],
        [7.2, 14.2],
        [9.6, 14.1],
        [11.0, 11.9],
        [11.3, 9.8],
        [11.4, 0.0],
      ] as [number, number][],
    },
    {
      x: 19.2,
      bow: -0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 12.8],
        [7.0, 14.0],
        [9.4, 13.8],
        [10.8, 11.7],
        [11.1, 9.6],
        [11.2, 0.0],
      ] as [number, number][],
    },
    {
      x: 24.0,
      bow: -0.5,
      pts: [
        [3.3, 0.0],
        [3.4, 12.2],
        [6.2, 13.0],
        [8.6, 12.8],
        [10.0, 11.1],
        [10.3, 9.1],
        [10.4, 0.0],
      ] as [number, number][],
    },
    {
      x: 27.0,
      bow: -0.8,
      pts: [
        [3.2, 0.0],
        [3.3, 11.8],
        [5.8, 12.4],
        [8.2, 12.2],
        [9.6, 10.8],
        [9.9, 8.8],
        [10.0, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, liveryBodyMat, true, 2));

  addInteriorCabin(bodyTiltGroup, true);

  const cabinStations = [
    {
      x: -22.5,
      bow: 0.4,
      pts: [
        [11.6, 0.0],
        [11.7, 10.8],
        [12.2, 10.2],
        [12.6, 9.4],
        [12.8, 0.0],
      ] as [number, number][],
    },
    {
      x: -9.5,
      bow: 0.2,
      pts: [
        [11.5, 0.0],
        [11.6, 11.2],
        [14.8, 10.0],
        [17.5, 8.9],
        [17.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 3.5,
      bow: -0.3,
      pts: [
        [11.3, 0.0],
        [11.4, 11.0],
        [14.6, 9.9],
        [17.3, 8.8],
        [17.5, 0.0],
      ] as [number, number][],
    },
    {
      x: 11.5,
      bow: -0.7,
      pts: [
        [11.0, 0.0],
        [11.1, 10.6],
        [11.4, 10.0],
        [11.6, 9.0],
        [11.7, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false, 2));

  addCommonRealisticDetails(bodyTiltGroup, {
    frontX: 15.8,
    rearX: -15.5,
    wheelZ: 12.6,
    bodyPaintMat: whitePaint,
    trimMat: matteBlack,
    pillarPaintMat: whitePaint,
    aPillarX: 7.5,
    cPillarX: -16.2,
    roofX: -3.2,
    roofLen: 15.8,
    exhaustSide: 'right',
  });

  const roof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.65, 17.2), whitePaint);
  roof.position.set(-3.2, 17.6, 0);
  bodyTiltGroup.add(roof);

  // Massive S1 E2 Snowplow Front Splitter + Side Canards
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.2, 28.8), hbYellow);
  splitter.position.set(27.4, 3.6, 0);
  bodyTiltGroup.add(splitter);

  const canard = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.55, 29.4), matteBlack);
  canard.position.set(27.0, 5.4, 0);
  bodyTiltGroup.add(canard);

  // Towering Twin-Plane S1 E2 Rear Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createWingLiveryTexture('audi'),
    clearcoat: 1.0,
  });
  const upperWing = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.9, 26.8), wingMat);
  upperWing.position.set(-24.2, 20.8, 0);
  upperWing.rotation.z = 0.2;
  bodyTiltGroup.add(upperWing);

  const lowerWing = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.7, 25.8), matteBlack);
  lowerWing.position.set(-23.8, 16.5, 0);
  bodyTiltGroup.add(lowerWing);

  for (const sideSign of [-1, 1]) {
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(10.4, 10.0, 0.85), whitePaint);
    endplate.position.set(-23.2, 17.2, sideSign * 13.2);
    bodyTiltGroup.add(endplate);
  }

  // Full-Width Audi Smoked Red Taillight Bar + Rear Radiator Cooling Ducts
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 23.6), tailLightMat);
  tailBar.position.set(-25.8, 9.6, 0);
  bodyTiltGroup.add(tailBar);

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('IN NL 1', '#ffffff', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-26.4, 6.4, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Audi 4-Rings Grille & 6-Pod Hella Rally Lamp Bank
  const grilleMat = new THREE.MeshStandardMaterial({
    map: createGrilleTexture(10, true, false),
  });
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.4, 18.8), grilleMat);
  grille.position.set(27.2, 7.6, 0);
  bodyTiltGroup.add(grille);

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  for (const zLamp of [-10.2, -6.4, -2.5, 2.5, 6.4, 10.2]) {
    const podHousing = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.45, 1.6, 16), matteBlack);
    podHousing.rotation.z = Math.PI / 2;
    podHousing.position.set(27.9, 8.2, zLamp);
    bodyTiltGroup.add(podHousing);

    const podLens = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.3, 16), lampMat);
    podLens.rotation.z = Math.PI / 2;
    podLens.position.set(28.65, 8.2, zLamp);
    bodyTiltGroup.add(podLens);
  }

  const frontLeftWheel = buildRealisticWheel(0xf8fafc, 6, true, 0xdc2626);
  frontLeftWheel.position.set(15.8, 5.45, -12.6);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xf8fafc, 6, true, 0xdc2626);
  frontRightWheel.position.set(15.8, 5.45, 12.6);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xf8fafc, 6, true, 0xdc2626);
  rearLeftWheel.position.set(-15.5, 5.45, -12.6);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xf8fafc, 6, true, 0xdc2626);
  rearRightWheel.position.set(-15.5, 5.45, 12.6);
  root.add(rearRightWheel);

  return {
    root,
    bodyTiltGroup,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    tailLightMat,
    thirdBrakeLightMat,
  };
}

/**
 * 4. Subaru Impreza 22B STi WRC — 555 World Rally Team Livery (#3)
 */
function buildSubaru22B(): Car3D {
  const root = new THREE.Group();
  const bodyTiltGroup = new THREE.Group();
  root.add(bodyTiltGroup);

  const liveryBodyMat = new THREE.MeshPhysicalMaterial({
    map: createBodyWrapLiveryTexture('subaru'),
    metalness: 0.45,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });
  const sonicBlue = new THREE.MeshPhysicalMaterial({
    color: 0x0e3fa9,
    metalness: 0.45,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    transparent: true,
    opacity: 0.82,
    roughness: 0.06,
    clearcoat: 1.0,
  });

  // Wide-body 2-door GC8 Coupe Sedan Proportions with blistered 22B fenders (9 stations)
  const lowerStations = [
    {
      x: -26.8,
      bow: 1.5,
      pts: [
        [3.6, 0.0],
        [3.7, 11.4],
        [6.4, 12.6],
        [8.6, 12.8],
        [10.8, 11.8],
        [11.4, 10.2],
        [11.5, 0.0],
      ] as [number, number][],
    },
    {
      x: -20.5,
      bow: 0.5,
      pts: [
        [3.4, 0.0],
        [3.5, 12.4],
        [6.8, 13.7],
        [9.1, 13.8],
        [11.2, 12.2],
        [11.6, 10.6],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: -14.2,
      bow: 0.1,
      pts: [
        [3.4, 0.0],
        [3.5, 12.5],
        [6.9, 13.8],
        [9.2, 13.8],
        [11.2, 12.2],
        [11.6, 10.6],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: -6.5,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 11.6],
        [6.2, 12.5],
        [8.6, 12.6],
        [10.8, 11.6],
        [11.2, 10.2],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 5.5,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 11.6],
        [6.2, 12.4],
        [8.6, 12.5],
        [10.7, 11.5],
        [11.1, 10.1],
        [11.2, 0.0],
      ] as [number, number][],
    },
    {
      x: 13.5,
      bow: -0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 12.4],
        [6.8, 13.6],
        [8.9, 13.6],
        [10.5, 11.9],
        [10.9, 9.9],
        [11.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 19.5,
      bow: -0.5,
      pts: [
        [3.4, 0.0],
        [3.5, 12.3],
        [6.7, 13.5],
        [8.8, 13.4],
        [10.3, 11.7],
        [10.7, 9.6],
        [10.8, 0.0],
      ] as [number, number][],
    },
    {
      x: 24.5,
      bow: -1.1,
      pts: [
        [3.3, 0.0],
        [3.4, 11.5],
        [6.0, 12.4],
        [8.1, 12.3],
        [9.5, 10.9],
        [9.9, 8.9],
        [10.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 27.4,
      bow: -1.6,
      pts: [
        [3.2, 0.0],
        [3.3, 11.0],
        [5.6, 11.8],
        [7.6, 11.8],
        [9.0, 10.4],
        [9.4, 8.2],
        [9.5, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, liveryBodyMat, true, 2));

  // Signature Impreza 22B Hood Scoop & Side Hood Louvers
  const hoodScoop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.6, 7.8), sonicBlue);
  hoodScoop.position.set(16.8, 11.2, 0);
  hoodScoop.rotation.z = -0.06;
  bodyTiltGroup.add(hoodScoop);

  const scoopIntake = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 6.8), matteBlack);
  scoopIntake.position.set(20.1, 11.2, 0);
  bodyTiltGroup.add(scoopIntake);

  for (const sideSign of [-1, 1]) {
    const hoodVent = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.35, 2.8), matteBlack);
    hoodVent.position.set(18.2, 10.8, sideSign * 6.8);
    hoodVent.rotation.z = -0.08;
    bodyTiltGroup.add(hoodVent);
  }

  addInteriorCabin(bodyTiltGroup, true);

  // 2-Door Coupe Sedan Greenhouse (Notchback rear window at x = -16.5)
  const cabinStations = [
    {
      x: -17.5,
      bow: 0.6,
      pts: [
        [11.4, 0.0],
        [11.5, 10.6],
        [11.9, 10.2],
        [12.1, 9.4],
        [12.2, 0.0],
      ] as [number, number][],
    },
    {
      x: -10.5,
      bow: 0.3,
      pts: [
        [11.4, 0.0],
        [11.5, 10.9],
        [14.6, 9.8],
        [17.2, 8.8],
        [17.4, 0.0],
      ] as [number, number][],
    },
    {
      x: 2.5,
      bow: -0.4,
      pts: [
        [11.1, 0.0],
        [11.2, 10.9],
        [14.5, 9.8],
        [17.1, 8.8],
        [17.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 11.0,
      bow: -0.9,
      pts: [
        [10.8, 0.0],
        [10.9, 10.5],
        [11.2, 9.9],
        [11.4, 9.0],
        [11.5, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false, 2));

  addCommonRealisticDetails(bodyTiltGroup, {
    frontX: 16.2,
    rearX: -16.4,
    wheelZ: 12.2,
    bodyPaintMat: sonicBlue,
    trimMat: matteBlack,
    pillarPaintMat: sonicBlue,
    aPillarX: 6.8,
    cPillarX: -14.2,
    roofX: -4.0,
    roofLen: 14.2,
    exhaustSide: 'left',
  });

  // Roof + WRC Roof Vent Scoop
  const roof = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.6, 16.8), sonicBlue);
  roof.position.set(-4.0, 17.35, 0);
  bodyTiltGroup.add(roof);

  const roofScoop = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.95, 3.6), sonicBlue);
  roofScoop.position.set(0.5, 17.85, 0);
  bodyTiltGroup.add(roofScoop);

  // Iconic High-Rise 22B STi Bi-Plane Rear Trunk Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createWingLiveryTexture('subaru'),
    clearcoat: 1.0,
  });
  const topBlade = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.75, 22.8), wingMat);
  topBlade.position.set(-24.2, 16.5, 0);
  topBlade.rotation.z = 0.12;
  bodyTiltGroup.add(topBlade);

  const lowerBlade = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 22.4), sonicBlue);
  lowerBlade.position.set(-24.4, 12.2, 0);
  bodyTiltGroup.add(lowerBlade);

  for (const sideSign of [-1, 1]) {
    const riser = new THREE.Mesh(new THREE.BoxGeometry(5.6, 5.2, 1.1), sonicBlue);
    riser.position.set(-23.8, 14.0, sideSign * 10.6);
    bodyTiltGroup.add(riser);
  }

  // GC8 Red/Amber/White Taillights & Gold "P555 WRC" License Plate
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 5.6), tailLightMat);
    tl.position.set(-26.5, 9.0, sideSign * 8.4);
    bodyTiltGroup.add(tl);

    const turn = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.85, 5.6), amberMat);
    turn.position.set(-26.5, 10.2, sideSign * 8.4);
    bodyTiltGroup.add(turn);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('P555 WRC', '#facc15', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-27.0, 7.2, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // GC8 Crystalline Headlights, Grille, Intercooler & Giant Yellow Foglight Covers
  const grilleMat = new THREE.MeshStandardMaterial({ map: createGrilleTexture(14, false, false) });
  const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 11.2), grilleMat);
  frontGrille.position.set(27.2, 8.2, 0);
  bodyTiltGroup.add(frontGrille);

  // Front-Mount Intercooler (FMIC) silver core visible in lower bumper opening
  const fmic = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 11.8), silverMat);
  fmic.position.set(27.3, 4.8, 0);
  bodyTiltGroup.add(fmic);

  const headMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  const fogMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (const sideSign of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.1, 4.8), headMat);
    hl.position.set(26.9, 8.2, sideSign * 8.2);
    hl.rotation.y = sideSign * -0.18;
    bodyTiltGroup.add(hl);

    const fog = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 1.2, 18), fogMat);
    fog.rotation.z = Math.PI / 2;
    fog.position.set(27.2, 5.2, sideSign * 7.8);
    bodyTiltGroup.add(fog);
  }

  const frontLeftWheel = buildRealisticWheel(0xd99b26, 6, false, 0xdc2626);
  frontLeftWheel.position.set(16.2, 5.45, -12.2);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xd99b26, 6, false, 0xdc2626);
  frontRightWheel.position.set(16.2, 5.45, 12.2);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xd99b26, 6, false, 0xdc2626);
  rearLeftWheel.position.set(-16.4, 5.45, -12.2);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xd99b26, 6, false, 0xdc2626);
  rearRightWheel.position.set(-16.4, 5.45, 12.2);
  root.add(rearRightWheel);

  return {
    root,
    bodyTiltGroup,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    tailLightMat,
    thirdBrakeLightMat,
  };
}

/**
 * 5. Mercedes-Benz 190E 2.5-16 Evolution II — DTM Sonax / AMG Racing Livery (#4)
 */
function buildMercedes190EEvo2(): Car3D {
  const root = new THREE.Group();
  const bodyTiltGroup = new THREE.Group();
  root.add(bodyTiltGroup);

  const liveryBodyMat = new THREE.MeshPhysicalMaterial({
    map: createBodyWrapLiveryTexture('mercedes'),
    metalness: 0.55,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const anthracitePaint = new THREE.MeshPhysicalMaterial({
    color: 0x181a20,
    metalness: 0.55,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const silverTrim = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.88,
    roughness: 0.18,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    transparent: true,
    opacity: 0.82,
    roughness: 0.06,
    clearcoat: 1.0,
  });

  // Boxy W201 3-Box Sedan with Massive Flat-Topped Evo II Wheel-Arch Flares (9 stations)
  const lowerStations = [
    {
      x: -27.2,
      bow: 0.8,
      pts: [
        [3.4, 0.0],
        [3.5, 11.6],
        [6.4, 12.6],
        [8.8, 12.6],
        [10.8, 11.8],
        [11.2, 10.4],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: -20.5,
      bow: 0.1,
      pts: [
        [3.2, 0.0],
        [3.3, 12.8],
        [7.2, 14.0],
        [9.5, 14.0],
        [11.2, 12.0],
        [11.5, 10.6],
        [11.6, 0.0],
      ] as [number, number][],
    },
    {
      x: -14.2,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 12.8],
        [7.2, 14.0],
        [9.5, 14.0],
        [11.2, 12.0],
        [11.5, 10.6],
        [11.6, 0.0],
      ] as [number, number][],
    },
    {
      x: -6.5,
      bow: 0.0,
      pts: [
        [3.1, 0.0],
        [3.2, 11.8],
        [6.4, 12.5],
        [8.8, 12.5],
        [10.9, 11.6],
        [11.2, 10.4],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 5.5,
      bow: 0.0,
      pts: [
        [3.1, 0.0],
        [3.2, 11.8],
        [6.4, 12.5],
        [8.8, 12.5],
        [10.8, 11.5],
        [11.1, 10.3],
        [11.2, 0.0],
      ] as [number, number][],
    },
    {
      x: 13.5,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 12.8],
        [7.0, 14.0],
        [9.3, 14.0],
        [10.7, 11.9],
        [11.0, 10.0],
        [11.1, 0.0],
      ] as [number, number][],
    },
    {
      x: 19.5,
      bow: -0.1,
      pts: [
        [3.2, 0.0],
        [3.3, 12.8],
        [7.0, 14.0],
        [9.2, 13.9],
        [10.6, 11.8],
        [10.9, 9.9],
        [11.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 24.5,
      bow: -0.5,
      pts: [
        [3.1, 0.0],
        [3.2, 11.8],
        [6.0, 12.5],
        [8.3, 12.4],
        [9.7, 11.1],
        [10.0, 9.2],
        [10.1, 0.0],
      ] as [number, number][],
    },
    {
      x: 27.6,
      bow: -0.9,
      pts: [
        [3.0, 0.0],
        [3.1, 11.4],
        [5.6, 12.0],
        [7.8, 12.0],
        [9.2, 10.8],
        [9.5, 8.8],
        [9.6, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, liveryBodyMat, true, 2));

  addInteriorCabin(bodyTiltGroup, true);

  // Upright W201 4-Door Sedan Greenhouse
  const cabinStations = [
    {
      x: -17.2,
      bow: 0.4,
      pts: [
        [11.2, 0.0],
        [11.3, 10.6],
        [11.8, 10.2],
        [12.0, 9.6],
        [12.1, 0.0],
      ] as [number, number][],
    },
    {
      x: -11.5,
      bow: 0.2,
      pts: [
        [11.2, 0.0],
        [11.3, 10.9],
        [14.8, 10.0],
        [17.4, 9.0],
        [17.6, 0.0],
      ] as [number, number][],
    },
    {
      x: 2.5,
      bow: -0.3,
      pts: [
        [11.0, 0.0],
        [11.1, 10.9],
        [14.6, 10.0],
        [17.3, 9.0],
        [17.5, 0.0],
      ] as [number, number][],
    },
    {
      x: 10.8,
      bow: -0.7,
      pts: [
        [10.8, 0.0],
        [10.9, 10.5],
        [11.2, 9.9],
        [11.4, 9.0],
        [11.5, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false, 2));

  addCommonRealisticDetails(bodyTiltGroup, {
    frontX: 16.4,
    rearX: -16.4,
    wheelZ: 12.4,
    bodyPaintMat: anthracitePaint,
    trimMat: matteBlack,
    pillarPaintMat: anthracitePaint,
    aPillarX: 6.8,
    cPillarX: -14.5,
    roofX: -4.2,
    roofLen: 14.8,
    exhaustSide: 'left',
    singleWiper: true,
  });

  const roof = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.65, 17.0), anthracitePaint);
  roof.position.set(-4.2, 17.5, 0);
  bodyTiltGroup.add(roof);

  // Towering Evo II DTM Bridge Rear Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createWingLiveryTexture('mercedes'),
    clearcoat: 1.0,
  });
  const topWingBlade = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.8, 24.6), wingMat);
  topWingBlade.position.set(-25.2, 18.2, 0);
  topWingBlade.rotation.z = 0.14;
  bodyTiltGroup.add(topWingBlade);

  const lowerDeckLip = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.65, 23.8), anthracitePaint);
  lowerDeckLip.position.set(-25.6, 11.8, 0);
  bodyTiltGroup.add(lowerDeckLip);

  for (const sideSign of [-1, 1]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(6.4, 7.2, 1.0), anthracitePaint);
    strut.position.set(-24.6, 14.8, sideSign * 11.4);
    strut.rotation.z = 0.15;
    bodyTiltGroup.add(strut);
  }

  // W201 Fluted Rectangular Taillights with Amber Corners
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 4.6), tailLightMat);
    tl.position.set(-27.1, 9.2, sideSign * 7.6);
    bodyTiltGroup.add(tl);

    const turn = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.6, 1.8), amberMat);
    turn.position.set(-27.1, 9.2, sideSign * 10.6);
    bodyTiltGroup.add(turn);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('S-EVO 190', '#ffffff', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-27.6, 8.8, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Classic Upright Chrome Mercedes Radiator Grille + 3-Pointed Star Hood Ornament
  const grilleMat = new THREE.MeshStandardMaterial({
    map: createGrilleTexture(14, false, true),
    roughness: 0.3,
  });
  const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 11.2), silverTrim);
  grilleFrame.position.set(27.5, 7.2, 0);
  bodyTiltGroup.add(grilleFrame);

  const grilleInsert = new THREE.Mesh(new THREE.BoxGeometry(1.55, 3.6, 10.4), grilleMat);
  grilleInsert.position.set(27.55, 7.2, 0);
  bodyTiltGroup.add(grilleInsert);

  // Standing 3D Mercedes-Benz Star Hood Ornament
  const starRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 6, 16), silverTrim);
  starRing.position.set(27.2, 10.4, 0);
  starRing.rotation.y = Math.PI / 2;
  bodyTiltGroup.add(starRing);

  // Rectangular W201 Headlights + Amber Corner Indicators & Deep Evo II Front Splitter
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  for (const sideSign of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 4.4), lampMat);
    hl.position.set(27.3, 7.2, sideSign * 8.1);
    bodyTiltGroup.add(hl);

    const cornerSignal = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.6, 1.4), amberMat);
    cornerSignal.position.set(27.2, 7.2, sideSign * 10.9);
    bodyTiltGroup.add(cornerSignal);
  }

  const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.4, 27.2), matteBlack);
  frontSplitter.position.set(27.0, 3.4, 0);
  bodyTiltGroup.add(frontSplitter);

  const frontLeftWheel = buildRealisticWheel(0xd4d4d8, 6, false, 0x71717a);
  frontLeftWheel.position.set(16.4, 5.45, -12.4);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xd4d4d8, 6, false, 0x71717a);
  frontRightWheel.position.set(16.4, 5.45, 12.4);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xd4d4d8, 6, false, 0x71717a);
  rearLeftWheel.position.set(-16.4, 5.45, -12.4);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xd4d4d8, 6, false, 0x71717a);
  rearRightWheel.position.set(-16.4, 5.45, 12.4);
  root.add(rearRightWheel);

  return {
    root,
    bodyTiltGroup,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    tailLightMat,
    thirdBrakeLightMat,
  };
}

/**
 * Dispatcher that builds any of the 5 selectable realistic 3D rally cars.
 */
export function buildCarModel3D(carId: CarId): Car3D {
  switch (carId) {
    case 'peugeot':
      return buildPeugeot205T16();
    case 'audi':
      return buildAudiQuattroS1();
    case 'subaru':
      return buildSubaru22B();
    case 'mercedes':
      return buildMercedes190EEvo2();
    case 'skoda':
    default:
      return buildSkodaScala3D('515 TKW');
  }
}
