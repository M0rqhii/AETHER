/** Inspects lights and the studio floor material at a given progress. */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const p = Number(process.argv[2] ?? 0.046)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=900,600'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 600 })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethrScene && window.__aethr), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 3000))
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 1500))

const out = await page.evaluate(() => {
  const { scene } = window.__aethrScene
  const lights = []
  const meshes = []
  scene.traverse((o) => {
    if (o.isLight) {
      lights.push({
        type: o.type,
        intensity: +o.intensity.toFixed(3),
        color: '#' + o.color.getHexString(),
        pos: [o.position.x, o.position.y, o.position.z].map((v) => +v.toFixed(3)),
        castShadow: o.castShadow,
      })
    }
    if (o.isMesh && o.geometry?.type === 'CircleGeometry') {
      const m = o.material
      meshes.push({
        name: o.name || '(floor?)',
        geo: o.geometry.type,
        params: o.geometry.parameters,
        visible: o.visible,
        material: {
          type: m.type,
          color: '#' + m.color?.getHexString(),
          opacity: m.opacity,
          transparent: m.transparent,
          roughness: m.roughness,
          metalness: m.metalness,
          envMapIntensity: m.envMapIntensity,
          emissive: m.emissive ? '#' + m.emissive.getHexString() : null,
          toneMapped: m.toneMapped,
        },
      })
    }
  })
  const shell = scene.getObjectByName('Outer_Shell')
  const sm = shell?.material
  return {
    progress: window.__aethr.progress,
    envIntensity: scene.environmentIntensity,
    hasEnvironment: Boolean(scene.environment),
    background: scene.background?.isColor ? '#' + scene.background.getHexString() : String(scene.background),
    lights,
    circleMeshes: meshes,
    shell: sm
      ? {
          type: sm.type,
          color: '#' + sm.color.getHexString(),
          roughness: sm.roughness,
          metalness: sm.metalness,
          anisotropy: sm.anisotropy,
          anisotropyRotation: sm.anisotropyRotation,
          envMapIntensity: sm.envMapIntensity,
          hasNormalMap: Boolean(sm.normalMap),
          hasRoughnessMap: Boolean(sm.roughnessMap),
          normalScale: sm.normalScale ? [sm.normalScale.x, sm.normalScale.y] : null,
          hasUV: Boolean(shell.geometry.getAttribute('uv')),
          hasNormalAttr: Boolean(shell.geometry.getAttribute('normal')),
        }
      : null,
  }
})

console.log(JSON.stringify(out, null, 1))
await browser.close()
