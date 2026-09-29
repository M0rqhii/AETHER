/** One-off scene inspector for debugging transforms. node scripts/probe.mjs [progress] */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const p = Number(process.argv[2] ?? 0.046)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1280,800'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethrScene), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 2000))
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 1500))

const out = await page.evaluate(() => {
  const { scene, camera } = window.__aethrScene
  const info = []
  const names = ['aethr-product', 'aethr-crown', 'AETHR_ONE', 'Body_Group', 'Crown_Group', 'Outer_Shell']
  for (const n of names) {
    const o = scene.getObjectByName(n)
    if (!o) {
      info.push({ name: n, missing: true })
      continue
    }
    o.updateWorldMatrix(true, false)
    const m = o.matrixWorld.elements
    const r3 = (v) => +v.toFixed(3)
    info.push({
      name: n,
      visible: o.visible,
      localRotDeg: [o.rotation.x, o.rotation.y, o.rotation.z].map((v) => +((v * 180) / Math.PI).toFixed(2)),
      localPos: [o.position.x, o.position.y, o.position.z].map((v) => +v.toFixed(4)),
      worldPos: [m[12], m[13], m[14]].map((v) => +v.toFixed(4)),
      // Columns of the world basis: where the object's local X/Y/Z now point.
      axisX: [m[0], m[1], m[2]].map(r3),
      axisY: [m[4], m[5], m[6]].map(r3),
      axisZ: [m[8], m[9], m[10]].map(r3),
      parent: o.parent?.name || o.parent?.type,
    })
  }
  return {
    camera: {
      pos: [camera.position.x, camera.position.y, camera.position.z].map((v) => +v.toFixed(4)),
      up: [camera.up.x, camera.up.y, camera.up.z],
      fov: +camera.fov.toFixed(2),
    },
    info,
  }
})

console.log(JSON.stringify(out, null, 2))
await browser.close()
