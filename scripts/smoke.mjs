/**
 * Smoke test: does the page actually come up styled and interactive?
 *
 * Checks the things that were silently broken when the dev server's chunks were
 * clobbered — stylesheets applied, the client component mounted, and either the
 * 3D canvas or the deliberate static fallback on screen.
 *
 *   node scripts/smoke.mjs [--software] [--shot <path>]
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const software = process.argv.includes('--software')
const shotIndex = process.argv.indexOf('--shot')
const shot = shotIndex > -1 ? process.argv[shotIndex + 1] : null

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
  args: [
    '--hide-scrollbars',
    ...(software ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []),
  ],
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))

await page.goto(process.env.AETHR_URL ?? 'http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page
  .waitForFunction(() => document.querySelector('canvas') || document.querySelector('.static'), { timeout: 180000 })
  .catch(() => {})
// Let the loader finish, otherwise the screenshot just shows the progress ring.
await page
  .waitForFunction(() => !document.querySelector('.loader') || document.querySelector('.loader--out'), {
    timeout: 180000,
  })
  .catch(() => {})
await new Promise((r) => setTimeout(r, 3500))

const result = await page.evaluate(() => {
  const body = getComputedStyle(document.body)
  const srOnly = document.querySelector('.sr-only')
  return {
    stylesheets: document.styleSheets.length,
    // The clearest tell that CSS is missing: the design system's font and colour.
    bodyFont: body.fontFamily.slice(0, 46),
    bodyBackground: body.backgroundColor,
    srOnlyHidden: srOnly ? getComputedStyle(srOnly).position === 'absolute' : null,
    hasCanvas: Boolean(document.querySelector('canvas')),
    hasStaticFallback: Boolean(document.querySelector('.static')),
    hasNavbar: Boolean(document.querySelector('.navbar')),
    scrollHeight: document.documentElement.scrollHeight,
  }
})

console.log(JSON.stringify({ mode: software ? 'software renderer' : 'hardware renderer', ...result }, null, 1))

/**
 * Scroll for real.
 *
 * Every other check in this repo drives the scene through the dev `seek()`
 * bridge, which sets progress directly and bypasses ScrollTrigger entirely. That
 * blind spot hid a bug where the scroll driver never attached at all: the page
 * looked perfect and did precisely nothing when scrolled.
 */
let scrollOk = true
if (result.hasCanvas) {
  const seen = []
  for (const fraction of [0.15, 0.45, 0.8]) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: max * f, behavior: 'instant' })
    }, fraction)
    await new Promise((r) => setTimeout(r, 1400))
    seen.push(
      await page.evaluate(() => ({
        scrollY: Math.round(window.scrollY),
        progress: +(window.__aethrScene?.progress.value ?? -1).toFixed(3),
        chapter: document.querySelector('.chapters button.is-active span')?.textContent ?? null,
      })),
    )
  }
  console.log('\nreal scroll:', JSON.stringify(seen))
  // Production strips the dev bridge, so fall back to what the reader can see:
  // the chapter indicator has to advance as the page scrolls.
  const progresses = seen.map((s) => s.progress)
  const byProgress = progresses.every((p, i) => p > 0 && (i === 0 || p > progresses[i - 1]))
  const chapters = seen.map((s) => Number(s.chapter))
  const byChapter =
    chapters.every((c) => Number.isFinite(c)) && chapters.every((c, i) => i === 0 || c > chapters[i - 1])
  scrollOk = progresses[0] > 0 ? byProgress : byChapter
  console.log(scrollOk ? 'OK — scrolling drives the experience.' : 'FAIL — scrolling does not move the experience.')
}

const ok =
  result.stylesheets > 0 &&
  result.bodyBackground !== 'rgba(0, 0, 0, 0)' &&
  (result.hasCanvas || result.hasStaticFallback) &&
  scrollOk
console.log(ok ? '\nOK — page renders styled.' : '\nFAIL — page is not rendering correctly.')

if (errors.length) {
  console.log('\nerrors:')
  for (const e of [...new Set(errors)].slice(0, 10)) console.log('  ' + e.slice(0, 160))
}

if (shot) await page.screenshot({ path: shot })
await browser.close()
process.exitCode = ok ? 0 : 1
