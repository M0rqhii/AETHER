/** A/B: screenshot with and without the floor disc, to identify the bright plane. */
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = process.argv[2]
const p = Number(process.argv[3] ?? 0.046)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=900,600'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 600 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethrScene && window.__aethr), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 3000))
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 1500))

await page.screenshot({ path: path.join(outDir, 'ab-with-floor.png') })

const which = process.argv[4] ?? 'both'

const hidden = await page.evaluate((mode) => {
  const { scene } = window.__aethrScene
  const hits = []
  scene.traverse((o) => {
    if (!o.isMesh) return
    const t = o.geometry?.type
    const hide =
      (t === 'CircleGeometry' && (mode === 'both' || mode === 'circle')) ||
      (t === 'PlaneGeometry' && (mode === 'both' || mode === 'plane'))
    if (hide) {
      o.visible = false
      hits.push(`${t}:${o.name || o.parent?.name || '?'} mat=${o.material?.type} color=#${o.material?.color?.getHexString?.() ?? '?'} op=${o.material?.opacity}`)
    }
  })
  return hits
}, which)
console.log('hidden:', hidden)

await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: path.join(outDir, `ab-no-${which}.png`) })

await browser.close()
