/**
 * Bisects frame cost by feature.
 *
 * Loads the page once per configuration with the dev query flags and reports the
 * frame rate, so the expensive part is identified by measurement rather than by
 * intuition (spec §161).
 *
 *   node scripts/perf-bisect.mjs [progress]
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const at = Number(process.argv[2] ?? 0.062)

const CONFIGS = (process.env.PERF_CONFIGS ? JSON.parse(process.env.PERF_CONFIGS) : null) ?? [
  ['everything on', ''],
  ['no post-processing', 'fx=0'],
  ['fx, no DOF', 'dof=0'],
  ['fx, no bloom', 'bloom=0'],
  ['fx, no MSAA', 'ms=0'],
  ['no contact shadows', 'cs=0'],
  ['no shadow map', 'shadow=0'],
  ['no rect-area light', 'ral=0'],
  ['no environment', 'env=0'],
  ['bare (no fx/cs/shadow/ral)', 'fx=0&cs=0&shadow=0&ral=0'],
]

// Headless with the real GPU: a visible window fights the user's own browser for
// focus, and a backgrounded tab has its rAF paused — which silently corrupts every
// reading. Headless keeps the measurement independent of what has focus.
// `--software` forces the same software rasteriser a misconfigured browser falls
// back to, so the degraded path can be measured on purpose rather than by accident.
const software = process.argv.includes('--software')

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: process.argv.includes('--window') ? false : 'new',
  defaultViewport: null,
  args: [
    '--window-size=1920,1080',
    '--hide-scrollbars',
    ...(software ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []),
  ],
})

const page = (await browser.pages())[0] ?? (await browser.newPage())

const results = []
for (const [label, query] of CONFIGS) {
  const url = `http://localhost:3000${query ? `?${query}` : ''}`
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 })
  await page.waitForFunction(() => Boolean(window.__aethrScene?.stats), { timeout: 180000 })
  await page
    .waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--out'), {
      timeout: 180000,
    })
    .catch(() => {})
  await page.evaluate((v) => window.__aethr.seek(v), at)
  await new Promise((r) => setTimeout(r, 1500))

  const f0 = await page.evaluate(() => window.__aethrScene.stats.frames)
  const t0 = Date.now()
  await new Promise((r) => setTimeout(r, 4000))
  const f1 = await page.evaluate(() => window.__aethrScene.stats.frames)
  const fps = (f1 - f0) / ((Date.now() - t0) / 1000)

  const info = await page.evaluate(() => {
    const last = window.__aethrLastPerf
    return last ?? null
  })

  results.push([label, fps, info])
  console.log(`${label.padEnd(30)} ${fps.toFixed(1).padStart(6)} fps`)
}

console.log('\nRelative to "everything on":')
const base = results[0][1]
for (const [label, fps] of results.slice(1)) {
  console.log(`  ${label.padEnd(30)} x${(fps / base).toFixed(2)}`)
}

await browser.close()
