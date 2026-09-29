/** Dumps live pose + overlay state at the middle of a phase. node scripts/probe-dom.mjs <phase> */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const phase = process.argv[2] ?? 'calloutOled'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethr?.phases && window.__aethrScene?.pose), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 3000))

const p = await page.evaluate((n) => {
  const r = window.__aethr.phases[n]
  return r ? (r[0] + r[1]) / 2 : Number(n)
}, phase)
const before = await page.evaluate(() => window.__aethrScene.stats.frames)
await page.evaluate((v) => window.__aethr.seek(v), p)
await page
  .waitForFunction(
    (target, base) =>
      Math.abs(window.__aethrScene.progress.value - target) < 0.0005 &&
      window.__aethrScene.stats.frames > base + 14,
    { timeout: 120000, polling: 250 },
    p,
    before,
  )
  .catch(() => console.log('(frame wait timed out)'))

const out = await page.evaluate((n) => {
  const { pose, progress } = window.__aethrScene
  const cards = [...document.querySelectorAll('.callout')].map((el) => ({
    title: el.querySelector('.callout__title')?.textContent,
    cls: el.className.trim(),
    opacity: getComputedStyle(el).opacity,
  }))
  return {
    phase: n,
    phaseRange: window.__aethr.phases[n],
    targetProgress: window.__aethr.progress,
    liveProgress: progress.value,
    pose: {
      activeCallout: pose.activeCallout,
      explode: +pose.explode.toFixed(3),
      crownLift: +pose.crownLift.toFixed(4),
      crownSpin: +pose.crownSpin.toFixed(3),
      yaw: +pose.yaw.toFixed(3),
      tiltX: +pose.tiltX.toFixed(3),
      tiltZ: +pose.tiltZ.toFixed(3),
      liquidLevel: +pose.liquidLevel.toFixed(3),
      cutaway: +pose.cutaway.toFixed(3),
      peel: +pose.peel.toFixed(3),
      oled: pose.oled,
      oledBrightness: +pose.oledBrightness.toFixed(3),
      dockVisible: pose.dockVisible,
      bodyVisible: pose.bodyVisible,
      blackout: +pose.blackout.toFixed(3),
    },
    activeCards: cards.filter((c) => c.cls.includes('is-active')),
    scene: (() => {
      const { scene, camera } = window.__aethrScene
      const info = {}
      for (const n of ['aethr-product', 'aethr-crown', 'Body_Group', 'Outer_Shell', 'Crown_Group']) {
        const o = scene.getObjectByName(n)
        if (!o) {
          info[n] = 'MISSING'
          continue
        }
        o.updateWorldMatrix(true, false)
        const m = o.matrixWorld.elements
        // visible only counts if the whole ancestor chain is visible
        let vis = o.visible
        for (let a = o.parent; a; a = a.parent) vis = vis && a.visible
        info[n] = {
          visible: vis,
          own: o.visible,
          world: [m[12], m[13], m[14]].map((v) => +v.toFixed(4)),
        }
      }
      info.camera = {
        pos: [camera.position.x, camera.position.y, camera.position.z].map((v) => +v.toFixed(3)),
        fov: +camera.fov.toFixed(1),
      }
      return info
    })(),
  }
}, phase)

console.log(JSON.stringify(out, null, 1))
await browser.close()
