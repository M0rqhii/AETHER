/**
 * Real-GPU performance measurement.
 *
 * Launches a visible Chrome (so the real GPU and compositor are used, unlike the
 * SwiftShader capture harness) and attributes frame cost with the CDP Performance
 * domain: script vs style vs layout vs the rest. Samples at several scroll
 * positions because the cost profile changes with what is on screen.
 *
 *   node scripts/perf.mjs [--headless]
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const headless = process.argv.includes('--headless')

const SAMPLES = [
  ['reveal (top of page)', 0.004],
  ['inspection', 0.062],
  ['crown exploded + callout', 0.2253],
  ['thermal peel', 0.4706],
  ['finale', 0.9886],
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless,
  defaultViewport: null,
  args: ['--window-size=1920,1080', '--start-maximized'],
})

const page = (await browser.pages())[0] ?? (await browser.newPage())
const client = await page.createCDPSession()
await client.send('Performance.enable')

const perfLogs = []
page.on('console', (m) => {
  const t = m.text()
  if (t.startsWith('[aethr:perf]') || t.startsWith('[aethr:gpu]')) perfLogs.push(t)
})

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethrScene?.stats), { timeout: 180000 })
await page.waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--out'), {
  timeout: 180000,
})
await new Promise((r) => setTimeout(r, 2500))

const gpuLine = perfLogs.find((l) => l.startsWith('[aethr:gpu]'))
if (gpuLine) console.log(gpuLine, '\n')

const metrics = async () => Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))

for (const [label, p] of SAMPLES) {
  await page.evaluate((v) => window.__aethr.seek(v), p)
  await new Promise((r) => setTimeout(r, 1200))

  const before = await metrics()
  const framesBefore = await page.evaluate(() => window.__aethrScene.stats.frames)
  const t0 = Date.now()
  await new Promise((r) => setTimeout(r, 4000))
  const after = await metrics()
  const framesAfter = await page.evaluate(() => window.__aethrScene.stats.frames)
  const wall = (Date.now() - t0) / 1000

  const d = (k) => (after[k] ?? 0) - (before[k] ?? 0)
  const fps = (framesAfter - framesBefore) / wall
  const task = d('TaskDuration')
  const pct = (v) => `${((v / wall) * 100).toFixed(0)}%`

  const last = [...perfLogs].reverse().find((l) => l.startsWith('[aethr:perf]'))
  const gl = last ? JSON.parse(last.slice('[aethr:perf] '.length)) : {}

  console.log(
    `${label.padEnd(26)} fps=${fps.toFixed(0).padStart(3)}  cpu(main-thread)=${pct(task).padStart(4)}  ` +
      `script=${pct(d('ScriptDuration')).padStart(4)} style=${pct(d('RecalcStyleDuration')).padStart(4)} ` +
      `layout=${pct(d('LayoutDuration')).padStart(4)}  draws=${gl.drawCalls ?? '?'} tris=${gl.triangles ?? '?'} ` +
      `programs=${gl.programs ?? '?'} dpr=${gl.dpr ?? '?'} buf=${gl.buffer ?? '?'}`,
  )
}

await browser.close()
