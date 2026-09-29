/**
 * Verifies the software-rendering path end to end.
 *
 * Forces the same software rasteriser a misconfigured browser falls back to, then
 * checks that the page serves the static experience instead of the 3D one, and
 * measures how much main-thread CPU it actually costs.
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})

const page = await browser.newPage()
const client = await page.createCDPSession()
await client.send('Performance.enable')
const metrics = async () =>
  Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await new Promise((r) => setTimeout(r, 3000))

const shown = await page.evaluate(() => ({
  hasCanvas: Boolean(document.querySelector('canvas')),
  hasNotice: Boolean(document.querySelector('.static__notice')),
  hasStaticPage: Boolean(document.querySelector('.static')),
  headline: document.querySelector('.static__hero .mono')?.textContent ?? null,
  noticeText: document.querySelector('.static__notice p')?.textContent?.slice(0, 90) ?? null,
  productCopyPresent: document.body.innerText.includes('Inner Vessel'),
}))
console.log('static path:', JSON.stringify(shown, null, 1))

if (process.env.FALLBACK_SHOT) {
  await page.screenshot({ path: process.env.FALLBACK_SHOT })
  console.log('screenshot:', process.env.FALLBACK_SHOT)
}

const before = await metrics()
const t0 = Date.now()
await new Promise((r) => setTimeout(r, 5000))
const after = await metrics()
const wall = (Date.now() - t0) / 1000
const used = ((after.TaskDuration ?? 0) - (before.TaskDuration ?? 0)) / wall
console.log(`\nmain-thread CPU on the static page: ${(used * 100).toFixed(1)}%`)

// Now take the opt-in path and confirm the 3D experience really does start.
const button = await page.$('.static__notice button')
if (button) {
  await button.click()
  await new Promise((r) => setTimeout(r, 4000))
  const after3d = await page.evaluate(() => ({
    hasCanvas: Boolean(document.querySelector('canvas')),
    stillStatic: Boolean(document.querySelector('.static')),
  }))
  console.log('after "Load it anyway":', JSON.stringify(after3d))

  const b2 = await metrics()
  const t1 = Date.now()
  await new Promise((r) => setTimeout(r, 5000))
  const a2 = await metrics()
  const used2 = ((a2.TaskDuration ?? 0) - (b2.TaskDuration ?? 0)) / ((Date.now() - t1) / 1000)
  console.log(`main-thread CPU with 3D forced on: ${(used2 * 100).toFixed(1)}%`)
} else {
  console.log('no opt-in button found')
}

await browser.close()
