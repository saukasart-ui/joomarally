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
  grad.addColorStop(0.0, '#fff7e6');
  grad.addColorStop(0.38, '#eab676');
  grad.addColorStop(0.49, '#ffdca8');
  grad.addColorStop(0.51, '#4d663c');
  grad.addColorStop(0.75, '#7a5c3c');
  grad.addColorStop(1.0, '#2b2118');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(160, 68, 26, 0, Math.PI * 2);
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

  ctx.strokeStyle = 'rgba(255, 165, 110, 0.08)';
  ctx.lineWidth = 1.5;
  for (let y = 42; y < 206; y += 16) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(458, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(95, 22);
  ctx.lineTo(190, 22);
  ctx.lineTo(125, 220);
  ctx.lineTo(55, 220);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4f4f5';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
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

  for (let x = 14; x < 242; x += slatSpacing) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x, 8, 4, 80);
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x + 4, 8, 1.5, 80);
  }

  if (withRings) {
    // Audi 4 rings in center of grille
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 4.5;
    const startX = 92;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * 24, 48, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (withStar) {
    // Mercedes chrome horizontal louvers & central vertical bar
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 4;
    for (let y = 18; y < 84; y += 16) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(246, y);
      ctx.stroke();
    }
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(128, 6);
    ctx.lineTo(128, 90);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates authentic racing livery side & top decals on a canvas texture!
 */
function createRacingLiveryTexture(carId: CarId, part: 'side' | 'hood' | 'wing'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (carId === 'peugeot') {
    // Peugeot Talbot Sport White + Yellow/Red/Blue PTS Stripes + #2 Number Plate
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    const colors = ['#1e3a8a', '#38bdf8', '#facc15', '#dc2626'];
    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(60 + idx * 36, 256);
      ctx.lineTo(185 + idx * 36, 0);
      ctx.lineTo(215 + idx * 36, 0);
      ctx.lineTo(90 + idx * 36, 256);
      ctx.closePath();
      ctx.fill();
    });

    if (part === 'side' || part === 'hood') {
      // Race number box #2
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(285, 38, 125, 165);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.strokeRect(285, 38, 125, 165);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(288, 41, 119, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RALLYE', 347, 63);

      ctx.fillStyle = '#09090b';
      ctx.font = '900 92px sans-serif';
      ctx.fillText('2', 347, 168);
    } else if (part === 'wing') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PEUGEOT TALBOT SPORT', 256, 145);
    }
  } else if (carId === 'audi') {
    // Audi Sport HB Rally Team Livery (White + Yellow, Red, Grey, Black stripes + #1)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    const stripes = [
      { c: '#eab308', y: 24, h: 42 },
      { c: '#dc2626', y: 66, h: 36 },
      { c: '#52525b', y: 102, h: 32 },
      { c: '#18181b', y: 134, h: 30 },
    ];
    for (const st of stripes) {
      ctx.fillStyle = st.c;
      ctx.beginPath();
      ctx.moveTo(0, st.y + 20);
      ctx.lineTo(512, st.y - 10);
      ctx.lineTo(512, st.y - 10 + st.h);
      ctx.lineTo(0, st.y + 20 + st.h);
      ctx.closePath();
      ctx.fill();
    }

    if (part === 'side' || part === 'hood') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(210, 42, 130, 170);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.strokeRect(210, 42, 130, 170);

      ctx.fillStyle = '#eab308';
      ctx.fillRect(213, 45, 124, 34);
      ctx.fillStyle = '#09090b';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HB AUDI', 275, 69);

      ctx.font = '900 96px sans-serif';
      ctx.fillText('1', 275, 175);
    } else if (part === 'wing') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, 512, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 62px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AUDI SPORT', 256, 165);
    }
  } else if (carId === 'subaru') {
    // Subaru 22B STi WRC 555 Sonic Blue + Gold 555 Swooshes & #3
    ctx.fillStyle = '#0e3fa9';
    ctx.fillRect(0, 0, 512, 256);

    // Gold 555 crescent swooshes
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(140, 140, 95, -0.8, 1.3);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(125, 140, 118, -0.7, 1.2);
    ctx.stroke();

    // Bold Gold "555"
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 900 90px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('555', 145, 165);

    if (part === 'side') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(320, 44, 120, 160);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 5;
      ctx.strokeRect(320, 44, 120, 160);

      ctx.fillStyle = '#0e3fa9';
      ctx.fillRect(323, 47, 114, 30);
      ctx.fillStyle = '#facc15';
      ctx.font = '900 18px sans-serif';
      ctx.fillText('SWRT', 380, 68);

      ctx.fillStyle = '#09090b';
      ctx.font = '900 88px sans-serif';
      ctx.fillText('3', 380, 168);
    } else if (part === 'wing') {
      ctx.fillStyle = '#facc15';
      ctx.font = '900 64px sans-serif';
      ctx.fillText('SUBARU 555', 256, 150);
    }
  } else if (carId === 'mercedes') {
    // Mercedes 190E 2.5-16 Evo II DTM Sonax / AMG Black & Silver Livery
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 512, 256);

    // Silver-grey & red-yellow DTM diagonal flashes
    ctx.fillStyle = '#a1a1aa';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(512, 95);
    ctx.lineTo(512, 256);
    ctx.lineTo(0, 256);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(40, 256);
    ctx.lineTo(220, 0);
    ctx.lineTo(275, 0);
    ctx.lineTo(95, 256);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(95, 256);
    ctx.lineTo(275, 0);
    ctx.lineTo(310, 0);
    ctx.lineTo(130, 256);
    ctx.closePath();
    ctx.fill();

    if (part === 'side' || part === 'hood') {
      // DTM #4 Sonax number box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(310, 40, 130, 168);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 6;
      ctx.strokeRect(310, 40, 130, 168);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(313, 43, 124, 34);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SONAX', 375, 67);

      ctx.fillStyle = '#09090b';
      ctx.font = '900 92px sans-serif';
      ctx.fillText('4', 375, 172);
    } else if (part === 'wing') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 66px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SONAX AMG', 256, 152);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

function buildSurfaceFromProfiles(
  stations: {
    x: number;
    bow: number;
    pts: [number, number][];
  }[],
  material: THREE.Material,
  closeEnds = false
): THREE.Mesh {
  const numS = stations.length;
  const numP = stations[0].pts.length;
  const ringLen = numP * 2 - 2;

  const positions: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < numS; s++) {
    const st = stations[s];
    const maxZ = Math.max(...st.pts.map((p) => p[1]), 0.01);

    const ring: [number, number][] = [];
    for (let i = 0; i < numP; i++) {
      ring.push([st.pts[i][0], st.pts[i][1]]);
    }
    for (let i = numP - 2; i >= 1; p_noop()) {
      ring.push([st.pts[i][0], -st.pts[i][1]]);
      i--;
    }

    for (let r = 0; r < ringLen; r++) {
      const [py, pz] = ring[r];
      const zr = Math.abs(pz) / maxZ;
      const cx = st.x + st.bow * Math.pow(zr, 1.8);
      positions.push(cx, py, pz);
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
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function p_noop() {}

function buildRealisticWheel(rimColorHex = 0xe4e4e7, spokeCount = 5, isTurbofan = false): THREE.Group {
  const wheelGroup = new THREE.Group();

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.82,
    metalness: 0.05,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: rimColorHex,
    roughness: 0.24,
    metalness: 0.82,
  });
  const darkBarrelMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.4,
    metalness: 0.5,
  });
  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    roughness: 0.35,
    metalness: 0.8,
  });

  const tireRadius = 5.35;
  const rimRadius = 3.65;
  const halfWidth = 2.4;
  const profile = [
    new THREE.Vector2(rimRadius, -halfWidth * 0.88),
    new THREE.Vector2(tireRadius * 0.94, -halfWidth),
    new THREE.Vector2(tireRadius, -halfWidth * 0.72),
    new THREE.Vector2(tireRadius, halfWidth * 0.72),
    new THREE.Vector2(tireRadius * 0.94, halfWidth),
    new THREE.Vector2(rimRadius, halfWidth * 0.88),
    new THREE.Vector2(rimRadius, -halfWidth * 0.88),
  ];
  const tireGeo = new THREE.LatheGeometry(profile, 24);
  tireGeo.rotateX(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
  tireMesh.castShadow = true;
  wheelGroup.add(tireMesh);

  const barrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, halfWidth * 1.7, 20);
  barrelGeo.rotateX(Math.PI / 2);
  wheelGroup.add(new THREE.Mesh(barrelGeo, darkBarrelMat));

  const rotorGeo = new THREE.CylinderGeometry(2.65, 2.65, 0.6, 16);
  rotorGeo.rotateX(Math.PI / 2);
  wheelGroup.add(new THREE.Mesh(rotorGeo, rotorMat));

  for (const side of [-1, 1]) {
    const zFace = side * (halfWidth * 0.82);

    const lipGeo = new THREE.RingGeometry(rimRadius - 0.38, rimRadius + 0.05, 24);
    if (side < 0) lipGeo.rotateY(Math.PI);
    const lip = new THREE.Mesh(lipGeo, alloyMat);
    lip.position.z = zFace;
    wheelGroup.add(lip);

    if (isTurbofan) {
      const fanGeo = new THREE.CylinderGeometry(rimRadius * 0.82, rimRadius * 0.82, 0.25, 20);
      fanGeo.rotateX(Math.PI / 2);
      const fan = new THREE.Mesh(fanGeo, alloyMat);
      fan.position.z = zFace - side * 0.05;
      wheelGroup.add(fan);
    } else {
      const hubGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.4, 12);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, alloyMat);
      hub.position.z = zFace - side * 0.1;
      wheelGroup.add(hub);

      const spokeGeo = new THREE.BoxGeometry(0.42, rimRadius - 0.55, 0.32);
      for (let i = 0; i < spokeCount; i++) {
        const baseAngle = (i / spokeCount) * Math.PI * 2;
        for (const subAngle of [-0.1, 0.1]) {
          const sp = new THREE.Mesh(spokeGeo, alloyMat);
          const a = baseAngle + subAngle;
          const rMid = (rimRadius + 0.6) * 0.5;
          sp.position.set(Math.cos(a) * rMid, Math.sin(a) * rMid, zFace - side * 0.06);
          sp.rotation.z = a - Math.PI / 2 + subAngle * 0.45;
          wheelGroup.add(sp);
        }
      }
    }
  }

  return wheelGroup;
}

function addInteriorCabin(bodyTiltGroup: THREE.Group, hasRollcage = false) {
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f2026, roughness: 0.75 });

  const interiorGroup = new THREE.Group();
  const interiorTub = new THREE.Mesh(new THREE.BoxGeometry(22.5, 4.0, 18.0), matteBlack);
  interiorTub.position.set(-3.0, 11.0, 0);
  interiorGroup.add(interiorTub);

  const dash = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 17.6), matteBlack);
  dash.position.set(6.5, 12.2, 0);
  interiorGroup.add(dash);

  const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.24, 8, 16), matteBlack);
  steeringWheel.position.set(4.2, 13.2, -4.5);
  steeringWheel.rotation.y = Math.PI / 2 - 0.35;
  interiorGroup.add(steeringWheel);

  for (const zSeat of [-4.5, 4.5]) {
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 5.0, 4.4), seatMat);
    seatBack.position.set(-1.2, 13.0, zSeat);
    seatBack.rotation.z = 0.18;
    interiorGroup.add(seatBack);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 2.6), seatMat);
    headrest.position.set(-1.8, 15.8, zSeat);
    interiorGroup.add(headrest);
  }

  if (hasRollcage) {
    const cageMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.3, metalness: 0.6 });
    const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 16.5, 8), cageMat);
    crossBar.position.set(-8.5, 14.5, 0);
    crossBar.rotation.x = 0.65;
    interiorGroup.add(crossBar);
  }

  bodyTiltGroup.add(interiorGroup);
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
    metalness: 0.34,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const darkCrimsonCrease = new THREE.MeshPhysicalMaterial({
    color: 0x8f0d13,
    metalness: 0.35,
    roughness: 0.28,
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
    roughness: 0.15,
    metalness: 0.92,
  });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x101722,
    metalness: 0.1,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
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

  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerBodyStations, velvetRedPaint, true));

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

  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false));

  for (const sideSign of [-1, 1]) {
    const aPillar = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.85, 1.05), velvetRedPaint);
    aPillar.position.set(7.1, 14.3, sideSign * 9.65);
    aPillar.rotation.z = -0.58;
    aPillar.rotation.y = sideSign * -0.07;
    bodyTiltGroup.add(aPillar);

    const cantrail = new THREE.Mesh(new THREE.BoxGeometry(20.2, 0.78, 1.15), velvetRedPaint);
    cantrail.position.set(-7.4, 17.3, sideSign * 8.95);
    cantrail.rotation.z = 0.015;
    bodyTiltGroup.add(cantrail);

    const bPillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 5.8, 0.65), glossBlack);
    bPillar.position.set(-2.4, 14.3, sideSign * 10.15);
    bPillar.rotation.x = sideSign * -0.18;
    bodyTiltGroup.add(bPillar);

    const cPillar = new THREE.Mesh(new THREE.BoxGeometry(6.8, 6.2, 1.15), velvetRedPaint);
    cPillar.position.set(-18.8, 14.3, sideSign * 9.75);
    cPillar.rotation.z = 0.62;
    cPillar.rotation.y = sideSign * 0.08;
    bodyTiltGroup.add(cPillar);

    const chromeBelt = new THREE.Mesh(new THREE.BoxGeometry(28.5, 0.36, 0.6), chromeMat);
    chromeBelt.position.set(-2.8, 11.35, sideSign * 11.25);
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

  for (const sideSign of [-1, 1]) {
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(8.6, 11.4, sideSign * 11.4);
    mirrorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.6), matteBlack));
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 2.9), velvetRedPaint);
    cap.position.set(-0.4, 0.45, sideSign * 1.0);
    cap.rotation.y = sideSign * -0.22;
    mirrorGroup.add(cap);
    bodyTiltGroup.add(mirrorGroup);
  }

  const wellGeo = new THREE.CylinderGeometry(6.1, 6.1, 4.8, 18, 1, false, 0, Math.PI);
  wellGeo.rotateX(Math.PI / 2);
  for (const wx of [16.0, -16.2]) {
    for (const sideSign of [-1, 1]) {
      const well = new THREE.Mesh(wellGeo, matteBlack);
      well.position.set(wx, 5.2, sideSign * 10.9);
      bodyTiltGroup.add(well);
    }
  }

  const frontLeftWheel = buildRealisticWheel(0xe4e4e7, 5);
  frontLeftWheel.position.set(16.0, 5.35, -11.6);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xe4e4e7, 5);
  frontRightWheel.position.set(16.0, 5.35, 11.6);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xe4e4e7, 5);
  rearLeftWheel.position.set(-16.2, 5.35, -11.6);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xe4e4e7, 5);
  rearRightWheel.position.set(-16.2, 5.35, 11.6);
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

  const whitePaint = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.15,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const ptsBlue = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a8a,
    metalness: 0.3,
    roughness: 0.25,
    clearcoat: 1.0,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.78,
    roughness: 0.08,
    clearcoat: 1.0,
  });

  // Compact Group B widebody hatchback shell (length 46, wide boxy fenders 26.8)
  const lowerStations = [
    {
      x: -23.0,
      bow: 1.2,
      pts: [
        [3.6, 0.0],
        [3.7, 11.8],
        [6.5, 13.0],
        [8.8, 13.0],
        [10.8, 11.8],
        [11.4, 9.8],
        [11.5, 0.0],
      ] as [number, number][],
    },
    {
      x: -14.8,
      bow: 0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 12.4],
        [7.2, 13.6],
        [9.8, 13.5],
        [11.4, 11.8],
        [11.7, 10.0],
        [11.8, 0.0],
      ] as [number, number][],
    },
    {
      x: 0.0,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 11.8],
        [6.8, 12.5],
        [9.4, 12.2],
        [11.0, 11.2],
        [11.3, 9.8],
        [11.4, 0.0],
      ] as [number, number][],
    },
    {
      x: 14.8,
      bow: -0.3,
      pts: [
        [3.4, 0.0],
        [3.5, 12.2],
        [7.0, 13.4],
        [9.4, 13.2],
        [10.6, 11.2],
        [10.9, 9.0],
        [11.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 23.5,
      bow: -1.4,
      pts: [
        [3.2, 0.0],
        [3.3, 11.0],
        [5.4, 11.6],
        [7.8, 11.2],
        [9.2, 9.6],
        [9.4, 6.8],
        [9.5, 0.0],
      ] as [number, number][],
    },
  ];
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, whitePaint, true));

  // Peugeot Talbot Sport Livery Side & Hood Panels
  const sideLiveryMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('peugeot', 'side'),
    clearcoat: 1.0,
    roughness: 0.2,
  });
  for (const sideSign of [-1, 1]) {
    const sideDecal = new THREE.Mesh(new THREE.PlaneGeometry(31, 6.4), sideLiveryMat);
    sideDecal.position.set(-1.5, 7.6, sideSign * 13.05);
    if (sideSign < 0) sideDecal.rotation.y = Math.PI;
    bodyTiltGroup.add(sideDecal);

    // Mid-engine rear fender air intake scoops behind doors
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.2, 1.8), matteBlack);
    scoop.position.set(-10.5, 8.8, sideSign * 12.6);
    bodyTiltGroup.add(scoop);
  }

  const hoodDecal = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 17.5), sideLiveryMat);
  hoodDecal.position.set(16.0, 11.15, 0);
  hoodDecal.rotation.x = -Math.PI / 2;
  hoodDecal.rotation.y = -0.1;
  bodyTiltGroup.add(hoodDecal);

  addInteriorCabin(bodyTiltGroup, true);

  // 205 T16 Greenhouse
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
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false));

  // White Roof Crown + Massive Evolution 2 Group B Rear Wing
  const roof = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.8, 17.2), whitePaint);
  roof.position.set(-7.5, 17.8, 0);
  bodyTiltGroup.add(roof);

  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('peugeot', 'wing'),
    clearcoat: 1.0,
  });
  const rearWingBlade = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.9, 24.4), wingMat);
  rearWingBlade.position.set(-21.8, 20.6, 0);
  rearWingBlade.rotation.z = 0.22;
  bodyTiltGroup.add(rearWingBlade);

  for (const sideSign of [-1, 1]) {
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(8.2, 6.8, 0.8), ptsBlue);
    endplate.position.set(-20.8, 18.6, sideSign * 11.8);
    endplate.rotation.z = 0.15;
    bodyTiltGroup.add(endplate);

    // Yellow rally mudflaps
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 4.2, 4.6),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    flap.position.set(-20.2, 3.6, sideSign * 11.4);
    bodyTiltGroup.add(flap);
  }

  // Peugeot 205 Ribbed Rear Taillights & Black Rear Garnish
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.85,
  });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  const rearGarnish = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 22.0), matteBlack);
  rearGarnish.position.set(-23.2, 9.2, 0);
  bodyTiltGroup.add(rearGarnish);

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 5.2), tailLightMat);
    tl.position.set(-23.3, 9.2, sideSign * 8.4);
    bodyTiltGroup.add(tl);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('205 T16', '#facc15', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.7), plateMat);
  rearPlate.position.set(-23.95, 6.2, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Front Evolution 2 Canards, Grille & 4 Rally Pod Spotlights
  const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 25.6), matteBlack);
  frontSplitter.position.set(22.8, 3.6, 0);
  bodyTiltGroup.add(frontSplitter);

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  for (const zLamp of [-8.8, -4.2, 4.2, 8.8]) {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.4, 14), lampMat);
    lamp.rotation.z = Math.PI / 2;
    lamp.position.set(24.2, 7.6, zLamp);
    bodyTiltGroup.add(lamp);
  }

  const frontLeftWheel = buildRealisticWheel(0xf4f4f5, 6, true);
  frontLeftWheel.position.set(14.8, 5.35, -12.2);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xf4f4f5, 6, true);
  frontRightWheel.position.set(14.8, 5.35, 12.2);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xf4f4f5, 6, true);
  rearLeftWheel.position.set(-14.8, 5.35, -12.4);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xf4f4f5, 6, true);
  rearRightWheel.position.set(-14.8, 5.35, 12.4);
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

  const whitePaint = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.15,
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
    color: 0x0f172a,
    transparent: true,
    opacity: 0.78,
    roughness: 0.08,
    clearcoat: 1.0,
  });

  // Angular Group B Coupe with blister box-flares
  const lowerStations = [
    {
      x: -25.5,
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
      x: -15.5,
      bow: 0.0,
      pts: [
        [3.4, 0.0],
        [3.5, 12.8],
        [7.2, 14.0],
        [9.8, 14.0],
        [11.6, 12.2],
        [11.9, 10.4],
        [12.0, 0.0],
      ] as [number, number][],
    },
    {
      x: 0.0,
      bow: 0.0,
      pts: [
        [3.3, 0.0],
        [3.4, 12.0],
        [6.8, 12.8],
        [9.6, 12.6],
        [11.3, 11.4],
        [11.6, 10.0],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 15.8,
      bow: 0.0,
      pts: [
        [3.4, 0.0],
        [3.5, 12.8],
        [7.2, 13.9],
        [9.5, 13.8],
        [10.9, 11.8],
        [11.2, 9.8],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 26.8,
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
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, whitePaint, true));

  const sideLiveryMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('audi', 'side'),
    clearcoat: 1.0,
    roughness: 0.2,
  });
  for (const sideSign of [-1, 1]) {
    const sideDecal = new THREE.Mesh(new THREE.PlaneGeometry(36, 6.8), sideLiveryMat);
    sideDecal.position.set(0.0, 7.8, sideSign * 13.6);
    if (sideSign < 0) sideDecal.rotation.y = Math.PI;
    bodyTiltGroup.add(sideDecal);
  }

  const hoodDecal = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 19.5), sideLiveryMat);
  hoodDecal.position.set(18.0, 11.35, 0);
  hoodDecal.rotation.x = -Math.PI / 2;
  hoodDecal.rotation.y = -0.09;
  bodyTiltGroup.add(hoodDecal);

  addInteriorCabin(bodyTiltGroup, true);

  // Fastback Coupe Greenhouse
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
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false));

  // Massive S1 E2 Snowplow Front Splitter + Side Canards
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.2, 28.4), hbYellow);
  splitter.position.set(27.2, 3.6, 0);
  bodyTiltGroup.add(splitter);

  const canard = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 29.2), matteBlack);
  canard.position.set(26.8, 5.4, 0);
  bodyTiltGroup.add(canard);

  // Towering Twin-Plane S1 E2 Rear Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('audi', 'wing'),
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
    const endplate = new THREE.Mesh(new THREE.BoxGeometry(10.2, 9.8, 0.85), whitePaint);
    endplate.position.set(-23.2, 17.2, sideSign * 13.2);
    bodyTiltGroup.add(endplate);
  }

  // Full-Width Audi Smoked Red Taillight Bar + Rear Cooling Ducts
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 23.6), tailLightMat);
  tailBar.position.set(-25.6, 9.6, 0);
  bodyTiltGroup.add(tailBar);

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('IN NL 1', '#ffffff', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-26.2, 6.4, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Audi 4-Rings Grille & 6-Pod Rally Lamp Bank
  const grilleMat = new THREE.MeshStandardMaterial({
    map: createGrilleTexture(10, true, false),
  });
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.4, 18.4), grilleMat);
  grille.position.set(27.0, 7.6, 0);
  bodyTiltGroup.add(grille);

  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  for (const zLamp of [-10.2, -6.4, -2.5, 2.5, 6.4, 10.2]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.6, 14), lampMat);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(27.8, 8.2, zLamp);
    bodyTiltGroup.add(pod);
  }

  const frontLeftWheel = buildRealisticWheel(0xf8fafc, 6, true);
  frontLeftWheel.position.set(15.8, 5.35, -12.6);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xf8fafc, 6, true);
  frontRightWheel.position.set(15.8, 5.35, 12.6);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xf8fafc, 6, true);
  rearLeftWheel.position.set(-15.5, 5.35, -12.6);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xf8fafc, 6, true);
  rearRightWheel.position.set(-15.5, 5.35, 12.6);
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

  const sonicBlue = new THREE.MeshPhysicalMaterial({
    color: 0x0e3fa9,
    metalness: 0.42,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x141519, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.78,
    roughness: 0.08,
    clearcoat: 1.0,
  });

  // Wide-body 2-door GC8 Coupe Sedan Proportions (distinct rear trunk deck)
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
      x: -16.4,
      bow: 0.2,
      pts: [
        [3.4, 0.0],
        [3.5, 12.2],
        [6.8, 13.4],
        [9.0, 13.5],
        [11.2, 12.2],
        [11.6, 10.6],
        [11.7, 0.0],
      ] as [number, number][],
    },
    {
      x: 0.0,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 11.6],
        [6.2, 12.4],
        [8.6, 12.5],
        [10.8, 11.6],
        [11.2, 10.2],
        [11.3, 0.0],
      ] as [number, number][],
    },
    {
      x: 16.2,
      bow: -0.4,
      pts: [
        [3.4, 0.0],
        [3.5, 12.2],
        [6.8, 13.3],
        [8.8, 13.3],
        [10.4, 11.8],
        [10.8, 9.8],
        [10.9, 0.0],
      ] as [number, number][],
    },
    {
      x: 27.2,
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
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, sonicBlue, true));

  const sideLiveryMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('subaru', 'side'),
    clearcoat: 1.0,
    roughness: 0.2,
  });
  for (const sideSign of [-1, 1]) {
    const sideDecal = new THREE.Mesh(new THREE.PlaneGeometry(36, 6.4), sideLiveryMat);
    sideDecal.position.set(0.0, 7.6, sideSign * 13.15);
    if (sideSign < 0) sideDecal.rotation.y = Math.PI;
    bodyTiltGroup.add(sideDecal);
  }

  // Signature Impreza 22B Hood Scoop & Side Vents
  const hoodScoop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.6, 7.8), sonicBlue);
  hoodScoop.position.set(16.8, 11.2, 0);
  hoodScoop.rotation.z = -0.06;
  bodyTiltGroup.add(hoodScoop);

  const scoopIntake = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 6.8), matteBlack);
  scoopIntake.position.set(20.1, 11.2, 0);
  bodyTiltGroup.add(scoopIntake);

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
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false));

  // Roof + WRC Roof Vent Scoop
  const roof = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.6, 16.8), sonicBlue);
  roof.position.set(-4.0, 17.3, 0);
  bodyTiltGroup.add(roof);

  const roofScoop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.9, 3.6), sonicBlue);
  roofScoop.position.set(0.5, 17.8, 0);
  bodyTiltGroup.add(roofScoop);

  // Iconic High-Rise 22B STi Bi-Plane Rear Trunk Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('subaru', 'wing'),
    clearcoat: 1.0,
  });
  const topBlade = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.75, 22.8), wingMat);
  topBlade.position.set(-24.2, 16.4, 0);
  topBlade.rotation.z = 0.12;
  bodyTiltGroup.add(topBlade);

  for (const sideSign of [-1, 1]) {
    const riser = new THREE.Mesh(new THREE.BoxGeometry(5.6, 5.2, 1.1), sonicBlue);
    riser.position.set(-23.8, 13.9, sideSign * 10.6);
    bodyTiltGroup.add(riser);
  }

  // GC8 Taillights & Gold "555" Rear License Plate
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.5, 5.6), tailLightMat);
    tl.position.set(-26.4, 9.4, sideSign * 8.4);
    bodyTiltGroup.add(tl);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('P555 WRC', '#facc15', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-26.9, 7.2, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Front Bumper with Giant Yellow Foglight Covers & Gold OZ/BBS Multi-Spoke Wheels
  const fogMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (const sideSign of [-1, 1]) {
    const fog = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.2, 16), fogMat);
    fog.rotation.z = Math.PI / 2;
    fog.position.set(27.1, 5.4, sideSign * 7.8);
    bodyTiltGroup.add(fog);
  }

  const frontLeftWheel = buildRealisticWheel(0xd99b26, 6);
  frontLeftWheel.position.set(16.2, 5.35, -12.1);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xd99b26, 6);
  frontRightWheel.position.set(16.2, 5.35, 12.1);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xd99b26, 6);
  rearLeftWheel.position.set(-16.4, 5.35, -12.1);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xd99b26, 6);
  rearRightWheel.position.set(-16.4, 5.35, 12.1);
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

  const anthracitePaint = new THREE.MeshPhysicalMaterial({
    color: 0x181a20,
    metalness: 0.55,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const silverTrim = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.85,
    roughness: 0.2,
  });
  const matteBlack = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.85 });
  const cabinGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.78,
    roughness: 0.08,
    clearcoat: 1.0,
  });

  // Boxy W201 3-Box Sedan with Massive Flat-Topped Evo II Wheel-Arch Flares
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
      x: -16.4,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 12.6],
        [7.2, 13.8],
        [9.4, 13.8],
        [11.2, 12.0],
        [11.5, 10.6],
        [11.6, 0.0],
      ] as [number, number][],
    },
    {
      x: 0.0,
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
      x: 16.4,
      bow: 0.0,
      pts: [
        [3.2, 0.0],
        [3.3, 12.6],
        [7.0, 13.8],
        [9.2, 13.8],
        [10.6, 11.8],
        [10.9, 10.0],
        [11.0, 0.0],
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
  bodyTiltGroup.add(buildSurfaceFromProfiles(lowerStations, anthracitePaint, true));

  const sideLiveryMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('mercedes', 'side'),
    clearcoat: 1.0,
    roughness: 0.2,
  });
  for (const sideSign of [-1, 1]) {
    const sideDecal = new THREE.Mesh(new THREE.PlaneGeometry(37, 6.6), sideLiveryMat);
    sideDecal.position.set(0.0, 7.6, sideSign * 13.55);
    if (sideSign < 0) sideDecal.rotation.y = Math.PI;
    bodyTiltGroup.add(sideDecal);
  }

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
  bodyTiltGroup.add(buildSurfaceFromProfiles(cabinStations, cabinGlassMat, false));

  // Towering Evo II DTM Bridge Rear Wing
  const wingMat = new THREE.MeshPhysicalMaterial({
    map: createRacingLiveryTexture('mercedes', 'wing'),
    clearcoat: 1.0,
  });
  const topWingBlade = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.8, 24.4), wingMat);
  topWingBlade.position.set(-25.2, 18.2, 0);
  topWingBlade.rotation.z = 0.14;
  bodyTiltGroup.add(topWingBlade);

  for (const sideSign of [-1, 1]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(6.4, 7.2, 1.0), anthracitePaint);
    strut.position.set(-24.6, 14.8, sideSign * 11.4);
    strut.rotation.z = 0.15;
    bodyTiltGroup.add(strut);
  }

  // W201 Fluted Rectangular Taillights
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef232a,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.9,
  });
  const thirdBrakeLightMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });

  for (const sideSign of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 6.2), tailLightMat);
    tl.position.set(-27.0, 9.2, sideSign * 8.4);
    bodyTiltGroup.add(tl);
  }

  const plateMat = new THREE.MeshBasicMaterial({
    map: createLicensePlateTexture('S-EVO 190', '#ffffff', false),
  });
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 2.6), plateMat);
  rearPlate.position.set(-27.5, 8.8, 0);
  rearPlate.rotation.y = -Math.PI / 2;
  bodyTiltGroup.add(rearPlate);

  // Classic Upright Chrome Mercedes Radiator Grille + 3-Pointed Star Hood Ornament!
  const grilleMat = new THREE.MeshStandardMaterial({
    map: createGrilleTexture(14, false, true),
    roughness: 0.3,
  });
  const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 11.2), silverTrim);
  grilleFrame.position.set(27.4, 7.2, 0);
  bodyTiltGroup.add(grilleFrame);

  const grilleInsert = new THREE.Mesh(new THREE.BoxGeometry(1.55, 3.6, 10.4), grilleMat);
  grilleInsert.position.set(27.45, 7.2, 0);
  bodyTiltGroup.add(grilleInsert);

  // Standing 3D Mercedes-Benz Star Hood Ornament
  const starRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.12, 6, 16), silverTrim);
  starRing.position.set(27.1, 10.4, 0);
  starRing.rotation.y = Math.PI / 2;
  bodyTiltGroup.add(starRing);

  // Rectangular W201 Headlights & Deep Evo II Front Splitter
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
  for (const sideSign of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 5.4), lampMat);
    hl.position.set(27.2, 7.2, sideSign * 8.6);
    bodyTiltGroup.add(hl);
  }

  const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 26.8), matteBlack);
  frontSplitter.position.set(26.8, 3.4, 0);
  bodyTiltGroup.add(frontSplitter);

  const frontLeftWheel = buildRealisticWheel(0xd4d4d8, 6);
  frontLeftWheel.position.set(16.4, 5.35, -12.4);
  root.add(frontLeftWheel);

  const frontRightWheel = buildRealisticWheel(0xd4d4d8, 6);
  frontRightWheel.position.set(16.4, 5.35, 12.4);
  root.add(frontRightWheel);

  const rearLeftWheel = buildRealisticWheel(0xd4d4d8, 6);
  rearLeftWheel.position.set(-16.4, 5.35, -12.4);
  root.add(rearLeftWheel);

  const rearRightWheel = buildRealisticWheel(0xd4d4d8, 6);
  rearRightWheel.position.set(-16.4, 5.35, 12.4);
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
