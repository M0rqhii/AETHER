/** Asks Chrome directly which rules apply to the active callout, and why. */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 180000 })
await page.waitForFunction(() => Boolean(window.__aethr?.phases), { timeout: 300000 })
await new Promise((r) => setTimeout(r, 3000))
const p = await page.evaluate(() => {
  const r = window.__aethr.phases.calloutOled
  return (r[0] + r[1]) / 2
})
await page.evaluate((v) => window.__aethr.seek(v), p)
await new Promise((r) => setTimeout(r, 1500))

const basic = await page.evaluate(() => {
  const el = document.querySelector('.callout.is-active')
  if (!el) return { found: false }
  const before = getComputedStyle(el).opacity
  // Force it and see whether anything fights back.
  const test = document.createElement('style')
  test.textContent = '.callout.is-active { opacity: 1 !important; visibility: visible !important; }'
  document.head.appendChild(test)
  const after = getComputedStyle(el).opacity
  test.remove()
  return {
    found: true,
    matches: el.matches('.callout.is-active'),
    className: el.className,
    inlineStyle: el.getAttribute('style'),
    opacityBefore: before,
    opacityWithImportant: after,
    animationName: getComputedStyle(el).animationName,
    transition: getComputedStyle(el).transition,
  }
})
console.log('basic:', JSON.stringify(basic, null, 1))

const client = await page.createCDPSession()
await client.send('DOM.enable')
await client.send('CSS.enable')
const { root } = await client.send('DOM.getDocument', { depth: -1 })
const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.callout.is-active' })
if (nodeId) {
  const matched = await client.send('CSS.getMatchedStylesForNode', { nodeId })
  const relevant = (matched.matchedCSSRules ?? [])
    .filter((r) => r.rule.style.cssProperties.some((pr) => pr.name === 'opacity' || pr.name === 'visibility'))
    .map((r) => ({
      selector: r.rule.selectorList.text,
      media: r.rule.media?.map((m) => m.text),
      props: r.rule.style.cssProperties
        .filter((pr) => pr.name === 'opacity' || pr.name === 'visibility')
        .map((pr) => `${pr.name}: ${pr.value}${pr.important ? ' !important' : ''}${pr.disabled ? ' (disabled)' : ''}`),
      matchingSelectors: r.matchingSelectors,
    }))
  console.log('opacity/visibility rules (in cascade order):')
  console.log(JSON.stringify(relevant, null, 1))
  console.log('inline:', JSON.stringify(matched.inlineStyle?.cssText))
}

await browser.close()
