/** Zooms in on the active callout card to see whether it actually paints. */
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = process.argv[2]
const phase = process.argv[3] ?? 'thermalLowE'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethr?.phases && window.__aethrScene?.pose), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 3000))
const p = await page.evaluate((n) => {
  const r = window.__aethr.phases[n]
  return (r[0] + r[1]) / 2
}, phase)
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 4000))

const info = await page.evaluate(() => {
  const all = [...document.querySelectorAll('.callout')]
  const el = document.querySelector('.callout.is-active')
  if (!el) return { found: false, active: window.__aethrScene.pose.activeCallout, total: all.length }
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  return {
    found: true,
    active: window.__aethrScene.pose.activeCallout,
    totalCards: all.length,
    // The projection loop writes these; empty means it is driving a different node.
    inlineOpacity: el.style.opacity,
    inlineVisibility: el.style.visibility,
    anyInlineWritten: all.filter((n) => n.style.opacity !== '').length,
    text: el.innerText.replace(/\n/g, ' | '),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    opacity: cs.opacity,
    visibility: cs.visibility,
    background: cs.backgroundColor,
    color: cs.color,
    backdropFilter: cs.backdropFilter,
    borderColor: cs.borderColor,
    transform: cs.transform,
  }
})
console.log(JSON.stringify(info, null, 1))

// Ask Chrome which declarations actually win, and whether a transition is mid-flight.
const client = await page.createCDPSession()
await client.send('DOM.enable')
await client.send('CSS.enable')
const { root } = await client.send('DOM.getDocument', { depth: -1 })
const q = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.callout.is-active' })
if (q.nodeId) {
  const matched = await client.send('CSS.getMatchedStylesForNode', { nodeId: q.nodeId })
  console.log(
    'rules:',
    JSON.stringify(
      (matched.matchedCSSRules ?? [])
        .filter((r) => r.rule.style.cssProperties.some((pr) => ['opacity', 'visibility'].includes(pr.name)))
        .map((r) => ({
          sel: r.rule.selectorList.text,
          matching: r.matchingSelectors,
          origin: r.rule.origin,
          props: r.rule.style.cssProperties
            .filter((pr) => ['opacity', 'visibility'].includes(pr.name))
            .map((pr) => `${pr.name}:${pr.value}${pr.important ? '!' : ''}`),
        })),
      null,
      1,
    ),
  )
}

if (info.found) {
  await page.screenshot({
    path: path.join(outDir, `card-${phase}.png`),
    clip: {
      x: Math.max(0, info.rect.x - 30),
      y: Math.max(0, info.rect.y - 30),
      width: Math.min(1440, info.rect.w + 60),
      height: Math.min(900, info.rect.h + 60),
    },
  })
}

await browser.close()
