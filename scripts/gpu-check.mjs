/**
 * Reports which GPU adapter Chrome hands to WebGL.
 *
 * Launches the *same* chrome.exe the user runs, but with a throwaway profile, so
 * the answer isolates browser configuration from machine capability.
 *
 *   node scripts/gpu-check.mjs [--window]
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: process.argv.includes('--window') ? false : 'new',
  defaultViewport: null,
  args: ['--window-size=1280,800'],
})

const page = (await browser.pages())[0] ?? (await browser.newPage())

const info = await page.evaluate(() => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!gl) return { webgl: false }
  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  const unmasked = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null
  return {
    webgl: true,
    renderer: gl.getParameter(gl.RENDERER),
    unmaskedRenderer: unmasked,
    unmaskedVendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
    software: /swiftshader|basic render|llvmpipe|software/i.test(String(unmasked ?? '')),
  }
})

console.log(JSON.stringify(info, null, 1))
await browser.close()
