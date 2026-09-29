/** Why is the OLED not visible? Reports geometry, material and orientation. */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1280, height: 800 },
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethrScene?.pose), { timeout: 180000 })
await new Promise((r) => setTimeout(r, 2500))
const p = await page.evaluate(() => {
  const r = window.__aethr.phases.crownIntro
  return (r[0] + r[1]) / 2
})
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 1500))

const out = await page.evaluate(() => {
  const { scene, pose } = window.__aethrScene
  const mesh = scene.getObjectByName('OLED_Panel')
  if (!mesh) return { found: false }
  const g = mesh.geometry
  const uv = g.getAttribute('uv')
  const nrm = g.getAttribute('normal')
  const pos = g.getAttribute('position')
  const m = mesh.material

  // Average normal: tells us which way the disc actually faces.
  let nx = 0, ny = 0, nz = 0
  for (let i = 0; i < nrm.count; i++) {
    nx += nrm.getX(i); ny += nrm.getY(i); nz += nrm.getZ(i)
  }
  const n = nrm.count || 1

  let uvMin = [9, 9], uvMax = [-9, -9]
  if (uv) {
    for (let i = 0; i < uv.count; i++) {
      uvMin[0] = Math.min(uvMin[0], uv.getX(i)); uvMax[0] = Math.max(uvMax[0], uv.getX(i))
      uvMin[1] = Math.min(uvMin[1], uv.getY(i)); uvMax[1] = Math.max(uvMax[1], uv.getY(i))
    }
  }

  let vis = mesh.visible
  for (let a = mesh.parent; a; a = a.parent) vis = vis && a.visible

  return {
    found: true,
    visibleInChain: vis,
    vertices: pos.count,
    hasUV: Boolean(uv),
    uvRange: uv ? { min: uvMin.map((v) => +v.toFixed(3)), max: uvMax.map((v) => +v.toFixed(3)) } : null,
    avgNormal: [nx / n, ny / n, nz / n].map((v) => +v.toFixed(3)),
    material: {
      type: m.type,
      side: m.side, // 0 Front, 1 Back, 2 Double
      emissiveIntensity: m.emissiveIntensity,
      emissive: '#' + m.emissive?.getHexString(),
      hasEmissiveMap: Boolean(m.emissiveMap),
      emissiveMapFlipY: m.emissiveMap?.flipY,
      transparent: m.transparent,
      opacity: m.opacity,
      toneMapped: m.toneMapped,
    },
    poseOled: pose.oled,
    poseBrightness: +pose.oledBrightness.toFixed(3),
  }
})

console.log(JSON.stringify(out, null, 1))
await browser.close()
