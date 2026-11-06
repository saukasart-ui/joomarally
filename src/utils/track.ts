import { ROAD_HALF_WIDTH, STAGE_CONTROL_POINTS, type TrackPoint } from '../data/gameContent';

export interface SplinePoint {
  x: number;
  y: number;
  h: number;
  angle: number;
  pitch: number;
  nx: number;
  ny: number;
  distance: number;
  curvature: number;
}

export interface SceneryItem {
  x: number;
  y: number;
  h: number;
  type: 'pine' | 'birch' | 'rock' | 'tent';
  scale: number;
  rotation: number;
  color: string;
}

function catmullRom3D(
  p0: TrackPoint,
  p1: TrackPoint,
  p2: TrackPoint,
  p3: TrackPoint,
  t: number
): TrackPoint {
  const t2 = t * t;
  const t3 = t2 * t;
  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  const h =
    0.5 *
    (2 * p1.h +
      (-p0.h + p2.h) * t +
      (2 * p0.h - 5 * p1.h + 4 * p2.h - p3.h) * t2 +
      (-p0.h + 3 * p1.h - 3 * p2.h + p3.h) * t3);
  return { x, y, h };
}

export function sampleTerrainHeight(x: number, y: number, points: SplinePoint[]): number {
  let minDistSq = Infinity;
  let nearestH = 0;

  for (let i = 0; i < points.length; i += 14) {
    const pt = points[i];
    const dx = x - pt.x;
    const dy = y - pt.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      nearestH = pt.h;
    }
  }

  const dist = Math.sqrt(minDistSq);
  const roadEdge = ROAD_HALF_WIDTH + 34;
  if (dist <= roadEdge) {
    return nearestH - 0.5;
  }

  // Smooth, broad rolling hills away from the road
  const blend = Math.min(1, (dist - roadEdge) / 540);
  const smoothBlend = blend * blend * (3 - 2 * blend);
  const hillNoise =
    Math.sin(x * 0.0012) * Math.cos(y * 0.0012) * 38 +
    Math.cos(x * 0.0008 - y * 0.0009) * 26;

  return nearestH * (1 - smoothBlend * 0.6) + hillNoise * smoothBlend;
}

/**
 * Continuously interpolates the road height, slope pitch, and distance from road center
 * without any discrete segment snapping or false off-road triggers.
 */
export function sampleRoadSurface(
  carX: number,
  carY: number,
  hintIdx: number,
  points: SplinePoint[]
): {
  bestIdx: number;
  minDist: number;
  roadH: number;
  roadPitch: number;
} {
  const searchStart = Math.max(0, hintIdx - 65);
  const searchEnd = Math.min(points.length - 1, hintIdx + 115);
  let bestIdx = hintIdx;
  let minDistSq = Infinity;

  for (let i = searchStart; i <= searchEnd; i++) {
    const pt = points[i];
    const dx = carX - pt.x;
    const dy = carY - pt.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      bestIdx = i;
    }
  }

  // Fallback global search if local window was exceeded so car never false-crashes
  if (minDistSq > ROAD_HALF_WIDTH * ROAD_HALF_WIDTH) {
    for (let i = 0; i < points.length; i += 2) {
      const pt = points[i];
      const dx = carX - pt.x;
      const dy = carY - pt.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        bestIdx = i;
      }
    }
    const refineStart = Math.max(0, bestIdx - 2);
    const refineEnd = Math.min(points.length - 1, bestIdx + 2);
    for (let i = refineStart; i <= refineEnd; i++) {
      const pt = points[i];
      const dx = carX - pt.x;
      const dy = carY - pt.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        bestIdx = i;
      }
    }
  }

  // Check projection on both (bestIdx - 1 -> bestIdx) and (bestIdx -> bestIdx + 1)
  const idx0 = Math.max(0, bestIdx - 1);
  const idx1 = bestIdx;
  const idx2 = Math.min(points.length - 1, bestIdx + 1);

  const p0 = points[idx0];
  const p1 = points[idx1];
  const p2 = points[idx2];

  // Forward segment (p1 -> p2)
  const dxF = p2.x - p1.x;
  const dyF = p2.y - p1.y;
  const lenSqF = dxF * dxF + dyF * dyF;
  const tF = lenSqF > 0.0001 ? ((carX - p1.x) * dxF + (carY - p1.y) * dyF) / lenSqF : 0;

  let segA = p1;
  let segB = p2;
  let t = Math.max(0, Math.min(1, tF));

  if (tF < 0 && idx0 < idx1) {
    const dxB = p1.x - p0.x;
    const dyB = p1.y - p0.y;
    const lenSqB = dxB * dxB + dyB * dyB;
    const tB = lenSqB > 0.0001 ? ((carX - p0.x) * dxB + (carY - p0.y) * dyB) / lenSqB : 1;
    segA = p0;
    segB = p1;
    t = Math.max(0, Math.min(1, tB));
  }

  const projX = segA.x + (segB.x - segA.x) * t;
  const projY = segA.y + (segB.y - segA.y) * t;
  const minDist = Math.hypot(carX - projX, carY - projY);

  const roadH = segA.h + (segB.h - segA.h) * t;
  const roadPitch = segA.pitch + (segB.pitch - segA.pitch) * t;

  return { bestIdx, minDist, roadH, roadPitch };
}

export function buildTrackSpline(ControlPoints: TrackPoint[] = STAGE_CONTROL_POINTS): {
  points: SplinePoint[];
  scenery: SceneryItem[];
  totalLength: number;
} {
  const rawPoints: TrackPoint[] = [];
  const stepsPerSegment = 24;

  for (let i = 0; i < ControlPoints.length - 1; i++) {
    const p0 = ControlPoints[Math.max(0, i - 1)];
    const p1 = ControlPoints[i];
    const p2 = ControlPoints[i + 1];
    const p3 = ControlPoints[Math.min(ControlPoints.length - 1, i + 2)];

    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      rawPoints.push(catmullRom3D(p0, p1, p2, p3, t));
    }
  }
  rawPoints.push(ControlPoints[ControlPoints.length - 1]);

  // 1. Horizontal (x, y) Gaussian smoothing so corners flow effortlessly with zero kinks
  let xs = rawPoints.map((p) => p.x);
  let ys = rawPoints.map((p) => p.y);
  for (let pass = 0; pass < 6; pass++) {
    const nextX = [...xs];
    const nextY = [...ys];
    for (let i = 2; i < xs.length - 2; i++) {
      nextX[i] =
        xs[i - 2] * 0.1 + xs[i - 1] * 0.25 + xs[i] * 0.3 + xs[i + 1] * 0.25 + xs[i + 2] * 0.1;
      nextY[i] =
        ys[i - 2] * 0.1 + ys[i - 1] * 0.25 + ys[i] * 0.3 + ys[i + 1] * 0.25 + ys[i + 2] * 0.1;
    }
    xs = nextX;
    ys = nextY;
  }

  // 2. Vertical (h) 14-pass Gaussian smoothing so hills & crests are 100% silky smooth
  let heights = rawPoints.map((p) => p.h);
  for (let pass = 0; pass < 14; pass++) {
    const nextH = [...heights];
    for (let i = 2; i < heights.length - 2; i++) {
      nextH[i] =
        heights[i - 2] * 0.1 +
        heights[i - 1] * 0.25 +
        heights[i] * 0.3 +
        heights[i + 1] * 0.25 +
        heights[i + 2] * 0.1;
    }
    heights = nextH;
  }

  const points: SplinePoint[] = [];
  let totalLength = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const prevX = xs[Math.max(0, i - 1)];
    const prevY = ys[Math.max(0, i - 1)];
    const currX = xs[i];
    const currY = ys[i];

    if (i > 0) {
      totalLength += Math.hypot(currX - prevX, currY - prevY);
    }

    points.push({
      x: currX,
      y: currY,
      h: heights[i],
      angle: 0,
      pitch: 0,
      nx: 0,
      ny: 0,
      distance: totalLength,
      curvature: 0,
    });
  }

  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 3)];
    const next = points[Math.min(points.length - 1, i + 3)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const ds = Math.max(0.001, Math.hypot(dx, dy));
    const dh = next.h - prev.h;

    const angle = Math.atan2(dy, dx);
    points[i].angle = angle;
    points[i].pitch = Math.atan2(dh, ds);
    points[i].nx = -Math.sin(angle);
    points[i].ny = Math.cos(angle);
  }

  for (let i = 1; i < points.length - 1; i++) {
    let dAngle = points[i + 1].angle - points[i - 1].angle;
    while (dAngle > Math.PI) dAngle -= Math.PI * 2;
    while (dAngle < -Math.PI) dAngle += Math.PI * 2;
    points[i].curvature = dAngle;
  }

  let seed = 515;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const scenery: SceneryItem[] = [];
  const pineColors = ['#1f4d36', '#285e42', '#1b4332', '#2d6a4f'];
  const birchColors = ['#d98a2b', '#e6a635', '#c86428', '#869c38'];
  const minClearance = ROAD_HALF_WIDTH + 54;

  for (let i = 6; i < points.length - 6; i += 6) {
    const pt = points[i];
    const count = rand() > 0.45 ? 2 : 1;

    for (let c = 0; c < count; c++) {
      const side = rand() > 0.5 ? 1 : -1;
      const offset = minClearance + 22 + rand() * 520;
      const jitterAlong = (rand() - 0.5) * 65;
      const x = pt.x + pt.nx * side * offset + Math.cos(pt.angle) * jitterAlong;
      const y = pt.y + pt.ny * side * offset + Math.sin(pt.angle) * jitterAlong;

      let tooClose = false;
      for (let j = Math.max(0, i - 60); j < Math.min(points.length, i + 60); j += 4) {
        if (Math.hypot(x - points[j].x, y - points[j].y) < minClearance) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const h = sampleTerrainHeight(x, y, points);
      const r = rand();
      if (r < 0.62) {
        scenery.push({
          x,
          y,
          h,
          type: 'pine',
          scale: 0.85 + rand() * 0.75,
          rotation: rand() * Math.PI * 2,
          color: pineColors[Math.floor(rand() * pineColors.length)],
        });
      } else if (r < 0.88) {
        scenery.push({
          x,
          y,
          h,
          type: 'birch',
          scale: 0.8 + rand() * 0.65,
          rotation: rand() * Math.PI * 2,
          color: birchColors[Math.floor(rand() * birchColors.length)],
        });
      } else if (r < 0.96) {
        scenery.push({
          x,
          y,
          h,
          type: 'rock',
          scale: 0.75 + rand() * 0.8,
          rotation: rand() * Math.PI * 2,
          color: '#78716c',
        });
      } else {
        scenery.push({
          x,
          y,
          h,
          type: 'tent',
          scale: 1,
          rotation: pt.angle + (side === 1 ? -Math.PI / 2 : Math.PI / 2),
          color: rand() > 0.5 ? '#dc2626' : '#2563eb',
        });
      }
    }
  }

  return { points, scenery, totalLength };
}
