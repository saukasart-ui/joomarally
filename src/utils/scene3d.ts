import * as THREE from 'three';
import { ROAD_HALF_WIDTH } from '../data/gameContent';
import { sampleTerrainHeight, type SceneryItem, type SplinePoint } from './track';

function createGravelRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c49e6c';
  ctx.fillRect(0, 0, 512, 512);

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, '#87633a');
  grad.addColorStop(0.08, '#b58d5b');
  grad.addColorStop(0.24, '#966f40');
  grad.addColorStop(0.38, '#c7a270');
  grad.addColorStop(0.5, '#d1ab79');
  grad.addColorStop(0.62, '#c7a270');
  grad.addColorStop(0.76, '#966f40');
  grad.addColorStop(0.92, '#b58d5b');
  grad.addColorStop(1.0, '#87633a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 10000; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const size = 1 + rand() * 2.8;
    const shade = rand();
    if (shade < 0.33) {
      ctx.fillStyle = 'rgba(85, 60, 34, 0.42)';
    } else if (shade < 0.66) {
      ctx.fillStyle = 'rgba(235, 208, 170, 0.36)';
    } else {
      ctx.fillStyle = 'rgba(130, 96, 60, 0.34)';
    }
    ctx.fillRect(x, y, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#537046';
  ctx.fillRect(0, 0, 256, 256);

  let seed = 909;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 3400; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(66, 92, 54, 0.45)' : 'rgba(105, 134, 80, 0.42)';
    ctx.fillRect(x, y, 3, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(140, 140);
  return tex;
}

function createBannerTexture(label: string, isFinish: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isFinish ? '#18181b' : '#dc2626';
  ctx.fillRect(0, 0, 512, 96);

  if (isFinish) {
    const sq = 24;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#18181b';
        ctx.fillRect(x * sq, y * sq, sq, sq);
        ctx.fillRect(512 - 96 + x * sq, y * sq, sq, sq);
      }
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 50);

  return new THREE.CanvasTexture(canvas);
}

export function buildRoadRibbonMesh(points: SplinePoint[]): THREE.Group {
  const roadGroup = new THREE.Group();

  const shoulderHalfWidth = ROAD_HALF_WIDTH + 34;
  const shoulderPositions: number[] = [];
  const shoulderIndices: number[] = [];

  const roadPositions: number[] = [];
  const roadUVs: number[] = [];
  const roadIndices: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const lx = pt.x - pt.nx * ROAD_HALF_WIDTH;
    const lz = pt.y - pt.ny * ROAD_HALF_WIDTH;
    const rx = pt.x + pt.nx * ROAD_HALF_WIDTH;
    const rz = pt.y + pt.ny * ROAD_HALF_WIDTH;

    roadPositions.push(lx, pt.h + 0.45, lz);
    roadPositions.push(rx, pt.h + 0.45, rz);

    const v = pt.distance / 190;
    roadUVs.push(0, v);
    roadUVs.push(1, v);

    const slx = pt.x - pt.nx * shoulderHalfWidth;
    const slz = pt.y - pt.ny * shoulderHalfWidth;
    const srx = pt.x + pt.nx * shoulderHalfWidth;
    const srz = pt.y + pt.ny * shoulderHalfWidth;

    shoulderPositions.push(slx, pt.h - 2.2, slz);
    shoulderPositions.push(srx, pt.h - 2.2, srz);

    if (i < points.length - 1) {
      const idx = i * 2;
      roadIndices.push(idx, idx + 1, idx + 2);
      roadIndices.push(idx + 1, idx + 3, idx + 2);

      shoulderIndices.push(idx, idx + 1, idx + 2);
      shoulderIndices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  const shoulderGeo = new THREE.BufferGeometry();
  shoulderGeo.setAttribute('position', new THREE.Float32BufferAttribute(shoulderPositions, 3));
  shoulderGeo.setIndex(shoulderIndices);
  shoulderGeo.computeVertexNormals();

  const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x85663f });
  const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulderMesh.receiveShadow = true;
  roadGroup.add(shoulderMesh);

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUVs, 2));
  roadGeo.setIndex(roadIndices);
  roadGeo.computeVertexNormals();

  const gravelTex = createGravelRoadTexture();
  const roadMat = new THREE.MeshLambertMaterial({ map: gravelTex });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  // Use InstancedMesh for roadside bollards (skip near index 92, 225, and 355 where roadside characters are!)
  const bollardCoords: { x: number; y: number; z: number }[] = [];
  for (let i = 6; i < points.length - 6; i += 6) {
    if (Math.abs(i - 92) < 14 || Math.abs(i - 225) < 14 || Math.abs(i - 355) < 14) continue;
    const pt = points[i];
    const edgeOffset = ROAD_HALF_WIDTH + 9;
    for (const side of [-1, 1]) {
      bollardCoords.push({
        x: pt.x + pt.nx * side * edgeOffset,
        y: pt.h,
        z: pt.y + pt.ny * side * edgeOffset,
      });
    }
  }

  const postGeo = new THREE.CylinderGeometry(1.9, 1.9, 14, 6);
  const postMatWhite = new THREE.MeshLambertMaterial({ color: 0xf5f5f4 });
  const topGeo = new THREE.CylinderGeometry(2.0, 2.0, 4.5, 6);
  const topMatRed = new THREE.MeshLambertMaterial({ color: 0xdc2626 });

  const instPosts = new THREE.InstancedMesh(postGeo, postMatWhite, bollardCoords.length);
  const instCaps = new THREE.InstancedMesh(topGeo, topMatRed, bollardCoords.length);
  const dummy = new THREE.Object3D();

  bollardCoords.forEach((b, idx) => {
    dummy.position.set(b.x, b.y + 7, b.z);
    dummy.updateMatrix();
    instPosts.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x, b.y + 13, b.z);
    dummy.updateMatrix();
    instCaps.setMatrixAt(idx, dummy.matrix);
  });

  roadGroup.add(instPosts);
  roadGroup.add(instCaps);

  return roadGroup;
}

export function buildGateArch(pt: SplinePoint, label: string, isFinish: boolean): THREE.Group {
  const arch = new THREE.Group();
  arch.position.set(pt.x, pt.h, pt.y);
  arch.rotation.y = -pt.angle;

  const pillarColor = isFinish ? 0x18181b : 0xdc2626;
  const pillarGeo = new THREE.BoxGeometry(10, 78, 10);
  const pillarMat = new THREE.MeshLambertMaterial({ color: pillarColor });

  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(0, 39, -ROAD_HALF_WIDTH - 6);
  leftPillar.castShadow = true;
  arch.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(0, 39, ROAD_HALF_WIDTH + 6);
  rightPillar.castShadow = true;
  arch.add(rightPillar);

  const spanWidth = (ROAD_HALF_WIDTH + 11) * 2;
  const bannerGeo = new THREE.BoxGeometry(8, 22, spanWidth);
  const bannerTex = createBannerTexture(label, isFinish);
  const bannerMat = [
    new THREE.MeshBasicMaterial({ map: bannerTex }),
    new THREE.MeshBasicMaterial({ map: bannerTex }),
    new THREE.MeshLambertMaterial({ color: pillarColor }),
    new THREE.MeshLambertMaterial({ color: pillarColor }),
    new THREE.MeshLambertMaterial({ color: pillarColor }),
    new THREE.MeshLambertMaterial({ color: pillarColor }),
  ];

  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 72, 0);
  banner.castShadow = true;
  arch.add(banner);

  return arch;
}

/**
 * Builds instanced scenery meshes so all trees, rocks, and tents render in ~8 draw calls total!
 */
export function buildSceneryMeshes(scenery: SceneryItem[]): THREE.Group {
  const group = new THREE.Group();

  const pines = scenery.filter((s) => s.type === 'pine');
  const birches = scenery.filter((s) => s.type === 'birch');
  const rocks = scenery.filter((s) => s.type === 'rock');
  const tents = scenery.filter((s) => s.type === 'tent');

  const dummy = new THREE.Object3D();
  const colorObj = new THREE.Color();

  // 1. Instanced Pine Trees
  if (pines.length > 0) {
    const trunkGeo = new THREE.CylinderGeometry(2.5, 4, 18, 6);
    trunkGeo.translate(0, 9, 0);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });

    const coneGeo = new THREE.ConeGeometry(21, 56, 7);
    coneGeo.translate(0, 40, 0);
    const coneMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const instTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, pines.length);
    const instCones = new THREE.InstancedMesh(coneGeo, coneMat, pines.length);

    pines.forEach((p, idx) => {
      dummy.position.set(p.x, p.h, p.y);
      dummy.rotation.set(0, p.rotation, 0);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      instTrunks.setMatrixAt(idx, dummy.matrix);
      instCones.setMatrixAt(idx, dummy.matrix);
      instCones.setColorAt(idx, colorObj.set(p.color));
    });

    group.add(instTrunks);
    group.add(instCones);
  }

  // 2. Instanced Birch Trees
  if (birches.length > 0) {
    const birchTrunkGeo = new THREE.CylinderGeometry(2.2, 3.5, 20, 6);
    birchTrunkGeo.translate(0, 10, 0);
    const birchTrunkMat = new THREE.MeshLambertMaterial({ color: 0xe7e5e4 });

    const crownGeo = new THREE.DodecahedronGeometry(20, 0);
    crownGeo.scale(1, 1.25, 1);
    crownGeo.translate(0, 36, 0);
    const crownMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const instBirchTrunks = new THREE.InstancedMesh(birchTrunkGeo, birchTrunkMat, birches.length);
    const instCrowns = new THREE.InstancedMesh(crownGeo, crownMat, birches.length);

    birches.forEach((b, idx) => {
      dummy.position.set(b.x, b.h, b.y);
      dummy.rotation.set(0, b.rotation, 0);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      instBirchTrunks.setMatrixAt(idx, dummy.matrix);
      instCrowns.setMatrixAt(idx, dummy.matrix);
      instCrowns.setColorAt(idx, colorObj.set(b.color));
    });

    group.add(instBirchTrunks);
    group.add(instCrowns);
  }

  // 3. Instanced Rocks
  if (rocks.length > 0) {
    const rockGeo = new THREE.DodecahedronGeometry(15, 0);
    rockGeo.scale(1.2, 0.65, 0.95);
    rockGeo.translate(0, 6, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x78716c });
    const instRocks = new THREE.InstancedMesh(rockGeo, rockMat, rocks.length);

    rocks.forEach((r, idx) => {
      dummy.position.set(r.x, r.h, r.y);
      dummy.rotation.set(0, r.rotation, 0);
      dummy.scale.setScalar(r.scale);
      dummy.updateMatrix();
      instRocks.setMatrixAt(idx, dummy.matrix);
    });

    group.add(instRocks);
  }

  // 4. Spectator Tents
  for (const item of tents) {
    const obj = new THREE.Group();
    obj.position.set(item.x, item.h, item.y);
    obj.rotation.y = item.rotation;

    const tentMat = new THREE.MeshLambertMaterial({ color: item.color });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(24, 16, 4), tentMat);
    roof.position.y = 24;
    roof.rotation.y = Math.PI / 4;
    obj.add(roof);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(28, 16, 28),
      new THREE.MeshLambertMaterial({ color: 0x27272a })
    );
    base.position.y = 8;
    obj.add(base);
    group.add(obj);
  }

  return group;
}

export function buildHillyTerrainMesh(points: SplinePoint[]): THREE.Mesh {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < points.length; i += 4) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minZ) minZ = pt.y;
    if (pt.y > maxZ) maxZ = pt.y;
  }

  const pad = 4200;
  const width = maxX - minX + pad * 2;
  const depth = maxZ - minZ + pad * 2;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const segX = 130;
  const segZ = 75;

  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(centerX, 0, centerZ);

  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = sampleTerrainHeight(vx, vz, points);
    posAttr.setY(i, vy);
  }
  geo.computeVertexNormals();

  const grassTex = createGrassTexture();
  grassTex.repeat.set(220, 140);
  const mat = new THREE.MeshLambertMaterial({ map: grassTex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

export interface FriendsBenchInfo {
  group: THREE.Group;
  x: number;
  y: number;
  z: number;
  hitRadius: number;
}

/**
 * Places Nadim, Kert and Hans sitting on a wooden bench right by the roadside watching the rally.
 * Uses the exact uploaded photo without modifying it.
 */
export function buildFriendsBench(points: SplinePoint[], imageUrl: string): FriendsBenchInfo {
  const spotIdx = Math.min(points.length - 20, 92);
  const pt = points[spotIdx];
  // Place on the right roadside shoulder so normal driving on the road never clips them
  const side = -1;
  const offset = ROAD_HALF_WIDTH + 22;
  const bx = pt.x + pt.nx * side * offset;
  const bz = pt.y + pt.ny * side * offset;
  const by = pt.h;

  const group = new THREE.Group();
  group.position.set(bx, by, bz);

  // Angle the bench toward the approaching cars so the players see Nadim, Kert & Hans head-on
  const lookAtPt = points[Math.max(0, spotIdx - 22)];
  const faceAngle = Math.atan2(lookAtPt.x - bx, lookAtPt.y - bz);
  group.rotation.y = faceAngle;

  const woodMat = new THREE.MeshLambertMaterial({ color: 0x7c4a21 });
  const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x4a2c11 });
  const legMat = new THREE.MeshLambertMaterial({ color: 0x27272a });

  // Wooden bench seat plank
  const seatGeo = new THREE.BoxGeometry(66, 3.5, 22);
  const seatMesh = new THREE.Mesh(seatGeo, woodMat);
  seatMesh.position.set(0, 17, 0);
  seatMesh.castShadow = true;
  seatMesh.receiveShadow = true;
  group.add(seatMesh);

  // Bench backrest planks
  const backGeo = new THREE.BoxGeometry(66, 15, 3);
  const backMesh = new THREE.Mesh(backGeo, darkWoodMat);
  backMesh.position.set(0, 29, -9.5);
  backMesh.castShadow = true;
  group.add(backMesh);

  // Bench legs & armrests
  const legGeo = new THREE.BoxGeometry(4.5, 17, 20);
  for (const lx of [-27, 0, 27]) {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, 8.5, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  const armGeo = new THREE.BoxGeometry(4.5, 9, 22);
  for (const ax of [-31, 31]) {
    const arm = new THREE.Mesh(armGeo, darkWoodMat);
    arm.position.set(ax, 22, 0);
    arm.castShadow = true;
    group.add(arm);
  }

  // Exact photo of Nadim, Kert & Hans sitting on the bench
  const tex = new THREE.TextureLoader().load(imageUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  const photoWidth = 60;
  const photoHeight = 58;
  const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);
  const photoMat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide,
  });
  const photoMesh = new THREE.Mesh(photoGeo, photoMat);
  photoMesh.position.set(0, photoHeight / 2 + 1, 2.5);
  group.add(photoMesh);

  return {
    group,
    x: bx,
    y: by,
    z: bz,
    hitRadius: 42,
  };
}

/**
 * Places Jakob at a separate roadside spot further down the track (around index 225).
 * Uses the exact uploaded photo without modifying it.
 */
export function buildJakobSpot(points: SplinePoint[], imageUrl: string): FriendsBenchInfo {
  const spotIdx = Math.min(points.length - 20, 225);
  const pt = points[spotIdx];
  const side = 1;
  const offset = ROAD_HALF_WIDTH + 22;
  const jx = pt.x + pt.nx * side * offset;
  const jz = pt.y + pt.ny * side * offset;
  const jy = pt.h;

  const group = new THREE.Group();
  group.position.set(jx, jy, jz);

  const lookAtPt = points[Math.max(0, spotIdx - 22)];
  const faceAngle = Math.atan2(lookAtPt.x - jx, lookAtPt.y - jz);
  group.rotation.y = faceAngle;

  // Low wooden roadside pallet/cot under Jakob
  const matGeo = new THREE.BoxGeometry(82, 4, 28);
  const matMesh = new THREE.Mesh(
    matGeo,
    new THREE.MeshLambertMaterial({ color: 0x6b4423 })
  );
  matMesh.position.set(0, 2, 0);
  matMesh.castShadow = true;
  matMesh.receiveShadow = true;
  group.add(matMesh);

  const tex = new THREE.TextureLoader().load(imageUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  const photoWidth = 78;
  const photoHeight = 36;
  const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);
  const photoMat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide,
  });
  const photoMesh = new THREE.Mesh(photoGeo, photoMat);
  photoMesh.position.set(0, photoHeight / 2 + 4, 2);
  group.add(photoMesh);

  return {
    group,
    x: jx,
    y: jy,
    z: jz,
    hitRadius: 42,
  };
}

/**
 * Places Laureen at a separate roadside spot further down the track (around index 355).
 * Uses the exact uploaded photo without modifying it.
 */
export function buildLaureenSpot(points: SplinePoint[], imageUrl: string): FriendsBenchInfo {
  const spotIdx = Math.min(points.length - 20, 355);
  const pt = points[spotIdx];
  const side = -1;
  const offset = ROAD_HALF_WIDTH + 22;
  const lx = pt.x + pt.nx * side * offset;
  const lz = pt.y + pt.ny * side * offset;
  const ly = pt.h;

  const group = new THREE.Group();
  group.position.set(lx, ly, lz);

  const lookAtPt = points[Math.max(0, spotIdx - 22)];
  const faceAngle = Math.atan2(lookAtPt.x - lx, lookAtPt.y - lz);
  group.rotation.y = faceAngle;

  // Small wooden roadside platform under Laureen
  const standGeo = new THREE.BoxGeometry(42, 4, 24);
  const standMesh = new THREE.Mesh(
    standGeo,
    new THREE.MeshLambertMaterial({ color: 0x7c4a21 })
  );
  standMesh.position.set(0, 2, 0);
  standMesh.castShadow = true;
  standMesh.receiveShadow = true;
  group.add(standMesh);

  const tex = new THREE.TextureLoader().load(imageUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  const photoWidth = 36;
  const photoHeight = 74;
  const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);
  const photoMat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide,
  });
  const photoMesh = new THREE.Mesh(photoGeo, photoMat);
  photoMesh.position.set(0, photoHeight / 2 + 4, 2);
  group.add(photoMesh);

  return {
    group,
    x: lx,
    y: ly,
    z: lz,
    hitRadius: 42,
  };
}

function createFootballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 128);

  // Classic black soccer ball pentagon patches
  ctx.fillStyle = '#111827';
  const spots = [
    [32, 32],
    [96, 28],
    [160, 32],
    [224, 28],
    [64, 72],
    [128, 68],
    [192, 72],
    [32, 106],
    [110, 108],
    [180, 106],
  ];
  for (const [cx, cy] of spots) {
    ctx.beginPath();
    const r = 16;
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5 - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

function createBasketballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 0, 256, 128);

  // Black basketball ribs/seams
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(256, 64);
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 128);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(64, 64, 44, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(192, 64, 44, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

export function createSportsBallPool(scene: THREE.Scene, count: number = 16): THREE.Mesh[] {
  const ballGeo = new THREE.SphereGeometry(9.5, 18, 14);
  const footballMat = new THREE.MeshLambertMaterial({ map: createFootballTexture() });
  const basketballMat = new THREE.MeshLambertMaterial({ map: createBasketballTexture() });

  const meshes: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const isFootball = i % 2 === 0;
    const m = new THREE.Mesh(ballGeo, isFootball ? footballMat : basketballMat);
    m.castShadow = true;
    m.visible = false;
    scene.add(m);
    meshes.push(m);
  }
  return meshes;
}
