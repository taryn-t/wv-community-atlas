

export type RGB = {
  r: number;
  g: number;
  b: number;
};


export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min));
}

export function lerp(start: number, end: number, t: number): number {
  return Math.round(start + (end - start) * t);
}

export function lerpColor(low: RGB, high: RGB, t: number): string {
  const clamped = clamp(t);

  const r = lerp(low.r, high.r, clamped);
  const g = lerp(low.g, high.g, clamped);
  const b = lerp(low.b, high.b, clamped);

  return `rgb(${r}, ${g}, ${b})`;
}