/**
 * Copies the canonical AETHR master-package assets into `public/`, Draco-compresses
 * the GLBs and self-hosts the Draco decoder.
 *
 * Run once (or after the master package changes):  npm run assets:prepare
 * Outputs are committed, so a normal `npm run build` never needs this script.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, draco } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PKG = path.join(ROOT, 'AETHR_ONE_FINAL_MASTER_PACKAGE')
const MODELS_OUT = path.join(ROOT, 'public', 'models', 'aethr')
const DRACO_OUT = path.join(ROOT, 'public', 'draco')

/** Only the three models the production experience actually loads. */
const MODELS = [
  ['01_MODELS/AETHR_ONE_FINAL_CANONICAL.glb', 'aethr-one.glb'],
  ['01_MODELS/dock/AETHR_CHARGE_FINAL.glb', 'aethr-charge.glb'],
  ['01_MODELS/thermal/THERMAL_CUTAWAY_ASSEMBLED.glb', 'thermal-cutaway.glb'],
]

const kb = (n) => `${(n / 1024).toFixed(0)} kB`

async function main() {
  await fs.mkdir(MODELS_OUT, { recursive: true })
  await fs.mkdir(DRACO_OUT, { recursive: true })

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  })

  let before = 0
  let after = 0

  for (const [src, out] of MODELS) {
    const srcPath = path.join(PKG, src)
    const outPath = path.join(MODELS_OUT, out)
    const srcSize = (await fs.stat(srcPath)).size

    const doc = await io.read(srcPath)
    await doc.transform(
      dedup(),
      // 14-bit position quantisation ≈ 0.02 mm over the 286 mm product — far below
      // anything visible, and the geometry carries no normals/UVs to damage.
      draco({ method: 'edgebreaker', quantizePosition: 14, quantizeGeneric: 12 }),
    )
    await io.write(outPath, doc)

    const outSize = (await fs.stat(outPath)).size
    before += srcSize
    after += outSize
    console.log(`  ${out.padEnd(22)} ${kb(srcSize).padStart(9)} → ${kb(outSize).padStart(9)}`)
  }

  // Self-hosted Draco decoder (no CDN dependency at runtime).
  const dracoSrc = path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf')
  for (const f of await fs.readdir(dracoSrc)) {
    if (f.includes('encoder')) continue
    await fs.copyFile(path.join(dracoSrc, f), path.join(DRACO_OUT, f))
  }

  // Approved render — used for the OG image and the no-WebGL fallback.
  await fs.copyFile(
    path.join(PKG, '04_REFERENCES', 'APPROVED_PRODUCT_DESIGN.png'),
    path.join(ROOT, 'public', 'aethr-one-render.png'),
  )

  console.log(`\n  total ${kb(before)} → ${kb(after)}  (${(100 - (after / before) * 100).toFixed(0)}% smaller)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
