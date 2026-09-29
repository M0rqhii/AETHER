/**
 * Development-only feature switches, read from the query string.
 *
 * Used to bisect frame cost by measurement instead of intuition (spec §161:
 * "Do not optimize by intuition only"). Always all-on in production builds.
 *
 *   ?fx=0      no post-processing at all
 *   ?bloom=0   post-processing without bloom
 *   ?ms=0      no MSAA on the composer
 *   ?cs=0      no contact shadows
 *   ?shadow=0  no shadow map
 *   ?env=0     no studio environment
 *   ?ral=0     no rect-area sweep light
 *   ?tm=0      no transmission on the liquid
 *   ?perf=1    log frame cost and the real GPU adapter once a second
 */
export interface DebugFlags {
  fx: boolean
  bloom: boolean
  ms: boolean
  contactShadows: boolean
  shadows: boolean
  environment: boolean
  rectAreaLight: boolean
  transmission: boolean
  /** Opt-in: logs frame cost and the real GPU adapter once a second. */
  perf: boolean
}

const ALL_ON: DebugFlags = {
  fx: true,
  bloom: true,
  ms: true,
  contactShadows: true,
  shadows: true,
  environment: true,
  rectAreaLight: true,
  transmission: true,
  perf: false,
}

export const flags: DebugFlags = (() => {
  if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') return ALL_ON
  const q = new URLSearchParams(window.location.search)
  const on = (key: string) => q.get(key) !== '0'
  return {
    fx: on('fx'),
    bloom: on('bloom'),
    ms: on('ms'),
    contactShadows: on('cs'),
    shadows: on('shadow'),
    environment: on('env'),
    rectAreaLight: on('ral'),
    transmission: on('tm'),
    perf: q.get('perf') === '1',
  }
})()
