/**
 * Scroll smoothness test.
 *
 * Scrolls the whole page the way a reader does and records every long frame
 * together with the progress it happened at, so a hitch can be traced to the
 * chapter that causes it instead of being described as "it stutters sometimes".
 *
 *   node scripts/scroll-test.mjs [seconds]
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const duration = Number(process.argv[2] ?? 30)
const origin = process.env.AETHR_URL ?? 'http://localhost:3000'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
  args: ['--hide-scrollbars'],
})

const page = await browser.newPage()
await page.goto(origin, { waitUntil: 'networkidle2', timeout: 180000 })
// The dev bridge is stripped from production builds, which is the build that
// matters here — so positions fall back to the scrollbar itself.
await page.waitForFunction(() => Boolean(document.querySelector('canvas')), { timeout: 180000 })
await page
  .waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--out'), {
    timeout: 180000,
  })
  .catch(() => {})
await new Promise((r) => setTimeout(r, 2500))

// Instrument frame intervals in the page itself.
await page.evaluate(() => {
  window.__hitches = []
  window.__frames = []
  let last = performance.now()
  const tick = (now) => {
    const dt = now - last
    last = now
    window.__frames.push(dt)
    if (dt > 45) {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const at = window.__aethrScene?.progress.value ?? (max > 0 ? window.scrollY / max : 0)
      window.__hitches.push({ ms: Math.round(dt), at: +at.toFixed(3) })
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

// Scroll steadily from top to bottom.
const steps = duration * 30
await page.evaluate(
  async (steps) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    for (let i = 0; i <= steps; i++) {
      window.scrollTo({ top: (max * i) / steps, behavior: 'instant' })
      await new Promise((r) => requestAnimationFrame(r))
    }
  },
  steps,
)

const report = await page.evaluate(() => {
  const frames = window.__frames.filter((f) => f < 2000)
  const sorted = [...frames].sort((a, b) => a - b)
  const pct = (p) => Math.round(sorted[Math.floor(sorted.length * p)] ?? 0)
  return {
    frames: frames.length,
    medianMs: pct(0.5),
    p95Ms: pct(0.95),
    p99Ms: pct(0.99),
    worstMs: Math.round(sorted[sorted.length - 1] ?? 0),
    hitches: window.__hitches.slice(0, 20),
    hitchCount: window.__hitches.length,
  }
})

console.log(
  `frames=${report.frames}  median=${report.medianMs}ms  p95=${report.p95Ms}ms  p99=${report.p99Ms}ms  worst=${report.worstMs}ms`,
)
console.log(`hitches over 45ms: ${report.hitchCount}`)
for (const h of report.hitches) console.log(`  ${String(h.ms).padStart(5)}ms at progress ${h.at}`)

await browser.close()
