const COMMON_RATIOS: [number, number][] = [
  [21, 9],
  [16, 9],
  [16, 10],
  [4, 3],
  [3, 2],
  [2, 3],
  [1, 1],
  [9, 16],
  [9, 21],
];

const ASPECT_TOLERANCE = 0.002;

export const MIN_ASPECT = 0.25;
export const MAX_ASPECT = 4;
export const ASPECT_CENTERED_SLIDER_MIN = -Math.log2(MAX_ASPECT);
export const ASPECT_CENTERED_SLIDER_MAX = -Math.log2(MIN_ASPECT);

function clampAspect(aspect: number): number {
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect));
}

export function aspectToCenteredSlider(aspect: number): number {
  return -Math.log2(clampAspect(aspect));
}

export function centeredSliderToAspect(position: number): number {
  return clampAspect(Math.pow(2, -position));
}

export function ratioPairToAspect(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return 1;
  }
  return width / height;
}

export function aspectToRatioPair(aspect: number): [number, number] {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return [1, 1];
  }

  for (const [w, h] of COMMON_RATIOS) {
    const candidate = w / h;
    if (Math.abs(candidate - aspect) <= ASPECT_TOLERANCE) {
      return [w, h];
    }
  }

  let bestW = 1;
  let bestH = 1;
  let bestError = Number.POSITIVE_INFINITY;

  for (let h = 1; h <= 100; h += 1) {
    const w = Math.max(1, Math.round(aspect * h));
    const error = Math.abs(w / h - aspect);
    if (error < bestError) {
      bestError = error;
      bestW = w;
      bestH = h;
      if (error === 0) break;
    }
  }

  return [bestW, bestH];
}
