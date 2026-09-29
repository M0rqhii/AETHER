/**
 * Visual QA harness.
 *
 * Drives the running dev server in headless Chrome and writes a screenshot per
 * phase — the spec's visual checks (§122, §190–§193) need actual frames.
 *
 * Shots are addressed by **phase name**, and the progress value is taken from the
 * middle of that phase as the app itself defines it. Hand-written progress numbers
 * land on phase boundaries and capture ambiguous in-between states.
 *
 *   node scripts/capture.mjs <outDir> [width] [height] [phase...]
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

/** The story in order; each entry is a phase name from the app's PHASE map. */
const STORY = [
  'revealSweep',
  'revealTitleOne',
  'heroOled',
  'inspectMaterial',
  'inspectMonogram',
  'inspectUnderside',
  'crownIntro',
  'crownUnscrew',
  'crownSense',
  'crownInside',
  'explodeIntro',
  'calloutOled',
  'calloutCore',
  'calloutPower',
  'calloutInductive',
  'calloutSense',
  'crownReassemble',
  'thermalWords',
  'coldFill',
  'coldHold',
  'hotFill',
  'hotSeal',
  'thermalIntro',
  'thermalPeel',
  'thermalWater',
  'thermalInner',
  'thermalLowE',
  'thermalVacuum',
  'thermalShell',
  'thermalWide',
  'timeCompress',
  'timeStillHot',
  'timeOpen',
  'timePour',
  'chargeMatchCut',
  'chargeReveal',
  'chargeDock',
  'chargeSeated',
  'chargeCoils',
  'chargeBattery',
  'chargeUsbC',
  'chargeConclusion',
  'materialsIntro',
  'materialsSelect',
  'materialsMacro',
  'engraving',
  'grabIt',
  'dropIntro',
  'dropActive',
  'finaleTitle',
  'finaleCta',
]

const outDir = process.argv[2] ?? 'shots'
const width = Number(process.argv[3] ?? 1440)
const height = Number(process.argv[4] ?? 900)
const requested = process.argv.slice(5)
const names = requested.length ? requested : STORY

await fs.mkdir(outDir, { recursive: true })

// The real GPU, not SwiftShader: software rendering shifts highlights and
// tone-mapping enough that judging materials from it is misleading — and it is an
// order of magnitude slower, which made every capture a waiting game.
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--disable-dev-shm-usage', '--hide-scrollbars', `--window-size=${width},${height}`],
})

const page = await browser.newPage()
await page.setViewport({ width, height, deviceScaleFactor: 1 })

const problems = []
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethr?.phases), { timeout: 180000 })
await page.waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--out'), {
  timeout: 300000,
})

// SwiftShader renders at a couple of frames a second, which starves CSS
// transitions — a 340 ms fade can still be at 20% after four seconds. Zero them
// so every screenshot shows the settled state rather than a random frame of a fade.
await page.addStyleTag({
  content: '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }',
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(1500)

for (const name of names) {
  const p = await page.evaluate((n) => {
    const range = window.__aethr.phases[n]
    if (!range) return Number(n)
    return (range[0] + range[1]) / 2
  }, name)

  if (!Number.isFinite(p)) {
    console.log(`  ${name.padEnd(18)} SKIPPED (unknown phase)`)
    continue
  }

  const before = await page.evaluate(() => window.__aethrScene.stats.frames)
  await page.evaluate((v) => window.__aethr.seek(v), p)

  // Wait for real rendered frames, not a wall clock: under SwiftShader a single
  // frame of this scene can take seconds, and a timed wait screenshots whatever
  // half-updated state happens to be on screen.
  await page
    .waitForFunction(
      (target, base) =>
        Math.abs(window.__aethrScene.progress.value - target) < 0.0005 &&
        window.__aethrScene.stats.frames > base + 14,
      { timeout: 120000, polling: 250 },
      p,
      before,
    )
    .catch(() => console.log(`  (${name}: frame wait timed out, capturing anyway)`))

  await page.screenshot({ path: path.join(outDir, `${name}.png`) })

  // Record what the scene actually believed at the moment of the frame.
  const state = await page.evaluate(() => {
    const s = window.__aethrScene
    const active = document.querySelector('.callout.is-active')
    return {
      live: +s.progress.value.toFixed(4),
      callout: s.pose.activeCallout,
      cardOpacity: active ? getComputedStyle(active).opacity : null,
    }
  })
  console.log(
    `  ${name.padEnd(18)} p=${p.toFixed(4)} live=${state.live} callout=${state.callout ?? '-'} card=${state.cardOpacity ?? '-'}`,
  )
}

await browser.close()

if (problems.length) {
  console.log('\nConsole output:')
  for (const p of [...new Set(problems)].slice(0, 40)) console.log('  ' + p)
} else {
  console.log('\nConsole clean.')
}
