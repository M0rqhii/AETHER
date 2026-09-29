export const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const inverseLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a))

/** Smooth 0→1 ramp with zero derivative at both ends. */
export const smoothstep = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

/** Even smoother — used for camera and product motion so nothing snaps. */
export const smootherstep = (t: number) => {
  const x = clamp(t)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

export const easeInOutCubic = (t: number) => {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3)

export const easeInCubic = (t: number) => Math.pow(clamp(t), 3)

/** power2.inOut equivalent — the spec's preferred camera easing. */
export const easeInOutQuad = (t: number) => {
  const x = clamp(t)
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

/**
 * Frame-rate independent exponential damping.
 * `lambda` is roughly "how many e-folds per second".
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

/** Piecewise-linear interpolation through a keyframe table. */
export function sampleKeyframes(keys: readonly (readonly [number, number])[], t: number): number {
  if (t <= keys[0][0]) return keys[0][1]
  const last = keys[keys.length - 1]
  if (t >= last[0]) return last[1]
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i]
    if (t <= x1) {
      const [x0, y0] = keys[i - 1]
      return lerp(y0, y1, (t - x0) / (x1 - x0))
    }
  }
  return last[1]
}

/** Deterministic hash-based PRNG so generated textures are identical every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
