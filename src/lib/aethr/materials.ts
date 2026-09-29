/**
 * Material system.
 *
 * The GLB's PBR factors are fallbacks only (spec §77, MATERIALS_LIGHTING.md) — the
 * final look is built here, on top of the studio environment. Materials are keyed
 * by the *GLB material name*, so swapping is a name lookup during traversal.
 */
import * as THREE from 'three'
import { createBrushedMaps, type BrushedMaps } from './textures'
import { damp } from './math'

export type FinishId = 'RAW' | 'OBSIDIAN' | 'FROST' | 'SAND'

export interface FinishPreset {
  label: string
  /** Approximate UI swatch — the rendered result is not just this hex (spec §177). */
  swatch: string
  color: string
  metalness: number
  roughness: number
  anisotropy: number
  envMapIntensity: number
}

/** Spec §9 / §177. Tuned against the light rig, as the spec expects. */
export const FINISHES: Record<FinishId, FinishPreset> = {
  RAW: {
    label: 'Raw',
    swatch: '#8e8f8d',
    color: '#9a9b98',
    metalness: 1.0,
    roughness: 0.34,
    anisotropy: 0.75,
    envMapIntensity: 0.95,
  },
  OBSIDIAN: {
    label: 'Obsidian',
    swatch: '#1a1c1e',
    color: '#26282b',
    metalness: 0.95,
    roughness: 0.33,
    anisotropy: 0.68,
    envMapIntensity: 1.35,
  },
  FROST: {
    label: 'Frost',
    swatch: '#c0c4c4',
    color: '#c3c7c8',
    metalness: 1.0,
    roughness: 0.27,
    anisotropy: 0.72,
    envMapIntensity: 1.1,
  },
  SAND: {
    label: 'Sand',
    swatch: '#9b8d78',
    color: '#a4967f',
    metalness: 0.92,
    roughness: 0.34,
    anisotropy: 0.62,
    envMapIntensity: 1.12,
  },
}

export const FINISH_IDS = Object.keys(FINISHES) as FinishId[]

export interface MaterialSet {
  /** GLB material name → replacement. */
  byName: Map<string, THREE.Material>
  /** The exterior surface, driven by the finish selector. */
  titanium: THREE.MeshPhysicalMaterial
  polished: THREE.MeshPhysicalMaterial
  innerSteel: THREE.MeshPhysicalMaterial
  lowE: THREE.MeshPhysicalMaterial
  vacuum: THREE.ShaderMaterial
  liquid: THREE.MeshPhysicalMaterial
  crownGlass: THREE.MeshPhysicalMaterial
  oledPanel: THREE.MeshStandardMaterial
  statusRing: THREE.MeshBasicMaterial
  mark: THREE.MeshPhysicalMaterial
  brushed: BrushedMaps
  dispose: () => void
}

const c = (hex: string) => new THREE.Color(hex)

export function createMaterials(): MaterialSet {
  const brushed = createBrushedMaps(20)
  const byName = new Map<string, THREE.Material>()
  const owned: THREE.Material[] = []

  const reg = <T extends THREE.Material>(mat: T, ...names: string[]) => {
    mat.name = names[0]
    owned.push(mat)
    for (const n of names) byName.set(n, mat)
    return mat
  }

  /* ---- Exterior titanium: the hero surface -------------------------------- */
  const raw = FINISHES.RAW
  const titanium = reg(
    new THREE.MeshPhysicalMaterial({
      color: c(raw.color),
      metalness: raw.metalness,
      roughness: raw.roughness,
      // Non-zero from the start so the anisotropy shader chunk is compiled once.
      anisotropy: raw.anisotropy,
      anisotropyRotation: Math.PI / 2,
      normalMap: brushed.normalMap,
      // Strong enough that the grooves survive a moving highlight, gentle enough
      // that the surface never reads as hammered.
      normalScale: new THREE.Vector2(0.72, 0.72),
      roughnessMap: brushed.roughnessMap,
      envMapIntensity: raw.envMapIntensity,
    }),
    'RAW_TITANIUM',
    'OUTER_TITANIUM',
  )

  /* ---- Machined details: threads, mouth lip, bezels ----------------------- */
  const polished = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#a9adae'),
      metalness: 1,
      // Machined, not mirrored: a true mirror on the crown's top bezel is the
      // surface that clips first and takes the bloom with it. 0.2 was still tight
      // enough that the mouth lip, glimpsed through the slot under a half-unscrewed
      // crown, read as a hard white rectangle floating in the gap.
      roughness: 0.3,
      envMapIntensity: 0.95,
    }),
    'POLISHED_TITANIUM',
    'THERMAL_BRIDGE_TITANIUM',
    'AETHR_CHARGE_POLISHED',
    'USB_C_BEZEL_TITANIUM',
  )

  /* ---- 18/8 stainless: cleaner and more polished than the shell (spec §53) - */
  const innerSteel = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#c6cdd1'),
      metalness: 1,
      // Peeled out of the shell the vessel is lit almost entirely by the
      // environment, and at 1.25 it came out as a black plate next to the low-E
      // layer. Brighter and slightly rougher, it separates from its neighbours.
      roughness: 0.22,
      envMapIntensity: 2.1,
    }),
    'INNER_STEEL',
  )

  /* ---- Low-emissivity coating: thin, champagne, never an orange tube ------ */
  const lowE = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#d8a86c'),
      metalness: 1,
      // A near-mirror only ever shows what is in front of it, and out in the
      // exploded stack that is black. Enough roughness to hold its own colour.
      roughness: 0.2,
      envMapIntensity: 2.4,
      side: THREE.DoubleSide,
    }),
    'THERMAL_REFLECTIVE_LAYER',
    'REFLECTIVE_LAYER',
  )

  /* ---- Vacuum: empty space, so it renders as a faint additive wash --------
     Two things have to be shaped by hand for that to read as *nothing* rather
     than as an object. A plain additive shell is brightest exactly where it is
     seen edge-on, because the ray crosses both walls — which drew a hard bright
     band along the top and bottom rims of the gap. And an open-ended tube ends in
     a cut edge, which a fade along the axis has to swallow. Uniforms carry the
     axial extent of the cutaway's vacuum layer (spec §57). */
  const vacuum = reg(
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: c('#9fc4dd') },
        uOpacity: { value: 0 },
        uRange: { value: new THREE.Vector2(0.009, 0.2275) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      // The vertex stage carries the raw axial coordinate and nothing else; the
      // fade is shaped per fragment. Folding the two smoothsteps into the vertex
      // shader and interpolating the result gave a varying that arrived at zero
      // across the whole layer, and the gap simply never drew.
      vertexShader: /* glsl */ `
        uniform vec2 uRange;
        varying float vAxial;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          vAxial = (position.z - uRange.x) / max(1e-5, uRange.y - uRange.x);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - world.xyz);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAxial;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        void main() {
          // An open-ended tube ends in a cut edge; swallow it at both ends.
          float fade = smoothstep(0.0, 0.16, vAxial) * (1.0 - smoothstep(0.84, 1.0, vAxial));
          float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
          // Mostly an even wash — the facing term only takes the edge off the
          // grazing angles where a thin shell doubles up on itself.
          gl_FragColor = vec4(uColor, uOpacity * fade * (0.7 + 0.3 * facing));
        }
      `,
    }),
    'VACUUM_VISUALIZATION',
    'VACUUM_HELPER',
  )

  /* ---- Water: colourless, refractive-looking, never blue acrylic (spec §43).
     Built from transparency plus a strong environment reflection rather than
     `transmission`. Real transmission makes three render the scene into a second
     buffer every frame — measured at ~32% of the frame in the fill chapters — and
     it buys almost nothing here, because the water is only ever glimpsed through
     the 62 mm mouth or as a thin peeled layer in the cutaway. The Fresnel response
     of the physical BRDF gives the bright rims that actually read as liquid. */
  const liquid = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#e9f2f5'),
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.46,
      ior: 1.33,
      transmission: 0,
      envMapIntensity: 2.0,
      depthWrite: false,
    }),
    'LIQUID_HELPER',
  )

  /* ---- Smart Crown glass -------------------------------------------------- */
  const crownGlass = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#050607'),
      metalness: 0.1,
      roughness: 0.045,
      clearcoat: 1,
      clearcoatRoughness: 0.045,
      // Black glass reads as black. It should catch one clean sweep of the key
      // card, not mirror the whole studio.
      envMapIntensity: 0.7,
      transparent: true,
      // The OLED sits *under* this pane. At 0.96 the glass swallowed 96% of it and
      // the display never showed at all — black glass has to stay readable when the
      // screen behind it lights up (spec §99).
      opacity: 0.38,
      depthWrite: false,
    }),
    'SMART_CROWN_GLASS',
  )

  /* ---- OLED --------------------------------------------------------------- */
  const oledPanel = reg(
    new THREE.MeshStandardMaterial({
      color: c('#000000'),
      metalness: 0,
      roughness: 0.35,
      emissive: c('#ffffff'),
      emissiveIntensity: 0,
      toneMapped: false,
      // The panel is a zero-thickness disc whose winding is mixed, so a
      // single-sided material hides part of it depending on the camera.
      side: THREE.DoubleSide,
    }),
    'OLED_PANEL',
  )
  reg(
    new THREE.MeshStandardMaterial({ color: c('#0d0f11'), metalness: 0.4, roughness: 0.32 }),
    'OLED_EDGE',
  )
  // The baked "72°" glyphs are hidden on load; the dynamic panel replaces them.
  reg(new THREE.MeshBasicMaterial({ color: c('#f4f6f7'), transparent: true, opacity: 0 }), 'OLED_WHITE')

  /* ---- Branding: etched, not printed -------------------------------------- */
  const mark = reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#3d4042'),
      metalness: 0.85,
      roughness: 0.58,
      envMapIntensity: 0.7,
    }),
    'AETHR_MARK',
    'DOCK_MARKING',
  )

  /* ---- Seals and feet ----------------------------------------------------- */
  reg(
    new THREE.MeshPhysicalMaterial({ color: c('#0b0c0d'), metalness: 0, roughness: 0.78 }),
    'SEAL_RUBBER',
    'AETHR_CHARGE_RUBBER',
  )

  /* ---- AETHR Sense -------------------------------------------------------- */
  reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#04070a'),
      metalness: 0.05,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
    }),
    'AETHR_SENSE_SAPPHIRE',
  )
  reg(
    new THREE.MeshStandardMaterial({ color: c('#0a0f13'), metalness: 0.2, roughness: 0.4 }),
    'AETHR_SENSE_MODULE',
  )

  /* ---- Crown electronics -------------------------------------------------- */
  reg(new THREE.MeshStandardMaterial({ color: c('#0d2a20'), metalness: 0.1, roughness: 0.44 }), 'PCB_DARK_GREEN')
  reg(new THREE.MeshStandardMaterial({ color: c('#08090b'), metalness: 0.15, roughness: 0.4 }), 'IC_PACKAGE')
  reg(new THREE.MeshStandardMaterial({ color: c('#9a9da0'), metalness: 0.85, roughness: 0.24 }), 'SOLDER')
  reg(new THREE.MeshStandardMaterial({ color: c('#a8642a'), metalness: 0.95, roughness: 0.26 }), 'COPPER_TRACE')
  reg(new THREE.MeshStandardMaterial({ color: c('#101315'), metalness: 0.1, roughness: 0.6 }), 'FERRITE_SHIELD')
  reg(
    new THREE.MeshStandardMaterial({ color: c('#b06f2e'), metalness: 1, roughness: 0.22, envMapIntensity: 1.3 }),
    'CHARGING_COIL',
  )
  reg(new THREE.MeshStandardMaterial({ color: c('#7a3512'), metalness: 0.3, roughness: 0.4 }), 'FLEX_CABLE')
  reg(new THREE.MeshStandardMaterial({ color: c('#c2701f'), metalness: 0.9, roughness: 0.24 }), 'FLEX_TRACE')
  reg(new THREE.MeshStandardMaterial({ color: c('#8a8d90'), metalness: 0.85, roughness: 0.28 }), 'LIPO_ALUMINUM_FOIL')
  reg(new THREE.MeshStandardMaterial({ color: c('#9da0a3'), metalness: 0.88, roughness: 0.24 }), 'LIPO_FACE_FOIL')
  reg(new THREE.MeshStandardMaterial({ color: c('#0e1012'), metalness: 0.08, roughness: 0.56 }), 'LIPO_BLACK_SEAL')
  reg(new THREE.MeshStandardMaterial({ color: c('#ad4a14'), metalness: 0.95, roughness: 0.23 }), 'LIPO_COPPER_TAB')
  reg(new THREE.MeshStandardMaterial({ color: c('#a3a7aa'), metalness: 0.9, roughness: 0.2 }), 'LIPO_NICKEL_TAB')
  reg(new THREE.MeshStandardMaterial({ color: c('#191b1d'), metalness: 0, roughness: 0.66 }), 'LIPO_TECH_INK')
  reg(new THREE.MeshStandardMaterial({ color: c('#2a2d30'), metalness: 0.7, roughness: 0.36 }), 'VACUUM_GETTER')

  /* ---- AETHR CHARGE ------------------------------------------------------- */
  reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#9a9b98'),
      metalness: 1,
      roughness: 0.3,
      anisotropy: 0.6,
      anisotropyRotation: Math.PI / 2,
      normalMap: brushed.normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
      envMapIntensity: 1.15,
    }),
    'AETHR_CHARGE_TITANIUM',
  )
  reg(
    new THREE.MeshPhysicalMaterial({
      color: c('#0a0b0c'),
      metalness: 0,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.25,
    }),
    'AETHR_CHARGE_CERAMIC_TOP',
  )
  const statusRing = reg(
    new THREE.MeshBasicMaterial({
      color: c('#e8f2f7'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
    'STATUS_LIGHT',
  )
  reg(new THREE.MeshStandardMaterial({ color: c('#1c1f22'), metalness: 0.6, roughness: 0.45 }), 'AETHR_CHARGE_MAGNET_RING')
  reg(new THREE.MeshStandardMaterial({ color: c('#101315'), metalness: 0.1, roughness: 0.6 }), 'AETHR_CHARGE_FERRITE')
  reg(
    new THREE.MeshStandardMaterial({ color: c('#b06f2e'), metalness: 1, roughness: 0.22, envMapIntensity: 1.3 }),
    'AETHR_CHARGE_COIL',
  )
  reg(new THREE.MeshStandardMaterial({ color: c('#0d2a20'), metalness: 0.1, roughness: 0.44 }), 'AETHR_CHARGE_PCB')
  reg(new THREE.MeshStandardMaterial({ color: c('#08090b'), metalness: 0.15, roughness: 0.4 }), 'AETHR_CHARGE_IC')

  /* ---- USB-C: a reward detail, dark and discreet -------------------------- */
  reg(new THREE.MeshStandardMaterial({ color: c('#2a2d2f'), metalness: 0.9, roughness: 0.3 }), 'USB_C_INNER_SHELL')
  reg(new THREE.MeshStandardMaterial({ color: c('#020303'), metalness: 0.2, roughness: 0.85 }), 'USB_C_CAVITY')
  reg(new THREE.MeshStandardMaterial({ color: c('#0b0d0e'), metalness: 0.3, roughness: 0.55 }), 'USB_C_TONGUE')
  reg(
    new THREE.MeshStandardMaterial({ color: c('#c9a24a'), metalness: 1, roughness: 0.22, envMapIntensity: 1.4 }),
    'USB_C_CONTACT_GOLD',
  )

  return {
    byName,
    titanium,
    polished,
    innerSteel,
    lowE,
    vacuum,
    liquid,
    crownGlass,
    oledPanel,
    statusRing,
    mark,
    brushed,
    dispose: () => {
      for (const m of owned) m.dispose()
      brushed.dispose()
    },
  }
}

/**
 * Smoothly moves the exterior between finishes. The GLB is never reloaded and the
 * material is never swapped — only its numbers move (spec §76).
 */
export class FinishAnimator {
  private current: FinishPreset
  private target: FinishPreset
  private readonly color = new THREE.Color()
  private readonly from = new THREE.Color()
  private readonly to = new THREE.Color()
  private t = 1

  constructor(
    private readonly material: THREE.MeshPhysicalMaterial,
    private readonly polished: THREE.MeshPhysicalMaterial,
    initial: FinishId = 'RAW',
  ) {
    this.current = FINISHES[initial]
    this.target = this.current
    this.from.set(this.current.color)
    this.to.set(this.current.color)
    this.apply(1)
  }

  set(finish: FinishId) {
    if (this.target === FINISHES[finish]) return
    this.from.copy(this.material.color)
    this.current = { ...this.target, color: `#${this.material.color.getHexString()}` }
    this.target = FINISHES[finish]
    this.to.set(this.target.color)
    this.t = 0
  }

  /** ~900 ms of eased travel. The spec asks for 500–800 ms; the whole film has
      since been paced down around it, and a finish that lands faster than every
      other move on the page reads as a UI toggle rather than as the surface
      changing. */
  update(dt: number) {
    if (this.t >= 1) return
    this.t = Math.min(1, this.t + dt / 0.9)
    const e = this.t < 0.5 ? 2 * this.t * this.t : 1 - Math.pow(-2 * this.t + 2, 2) / 2
    this.apply(e)
  }

  private apply(e: number) {
    const a = this.current
    const b = this.target
    this.color.copy(this.from).lerp(this.to, e)
    this.material.color.copy(this.color)
    this.material.metalness = a.metalness + (b.metalness - a.metalness) * e
    this.material.roughness = a.roughness + (b.roughness - a.roughness) * e
    this.material.anisotropy = a.anisotropy + (b.anisotropy - a.anisotropy) * e
    this.material.envMapIntensity = a.envMapIntensity + (b.envMapIntensity - a.envMapIntensity) * e

    // Machined details stay brighter than the body but pick up its temperature.
    this.polished.color.copy(this.color).lerp(new THREE.Color('#c8ccce'), 0.62)
  }
}

/** Per-mesh emphasis for callouts — spec §34: dim, never hide. */
export class EmphasisController {
  private readonly entries = new Map<
    THREE.Mesh,
    { mat: THREE.MeshStandardMaterial; source: THREE.MeshStandardMaterial; value: number; target: number }
  >()

  /**
   * Gives the mesh its own material instance so it can be dimmed independently.
   *
   * The shared material is remembered on the mesh, because `mesh.material` is not
   * a reliable way to find it a second time: a controller that has been disposed
   * leaves every mesh wearing its clone, and the next controller would then take
   * that clone as its source. Nothing updates a clone, so the finish selector
   * stopped reaching the Smart Crown, the Sense plate and the cutaway shell —
   * they sat at whatever colour was current when the first controller died.
   */
  register(mesh: THREE.Mesh) {
    if (this.entries.has(mesh)) return
    const remembered = mesh.userData.aethrSourceMaterial as THREE.MeshStandardMaterial | undefined
    const source = remembered ?? (mesh.material as THREE.MeshStandardMaterial)
    mesh.userData.aethrSourceMaterial = source
    const mat = source.clone() as THREE.MeshStandardMaterial
    mesh.material = mat
    this.entries.set(mesh, { mat, source, value: 1, target: 1 })
  }

  setTarget(mesh: THREE.Mesh, target: number) {
    const e = this.entries.get(mesh)
    if (e) e.target = target
  }

  setAll(target: number) {
    for (const e of this.entries.values()) e.target = target
  }

  update(dt: number) {
    for (const e of this.entries.values()) {
      const settled = e.value === e.target
      if (!settled) {
        e.value = Math.abs(e.value - e.target) < 0.002 ? e.target : damp(e.value, e.target, 6, dt)
      }

      // Track the shared source so a finish change still reaches dimmed meshes.
      const k = 0.34 + 0.66 * e.value
      e.mat.color.copy(e.source.color).multiplyScalar(k)
      e.mat.envMapIntensity = (e.source.envMapIntensity ?? 1) * (0.3 + 0.7 * e.value)
      e.mat.roughness = e.source.roughness
      e.mat.metalness = e.source.metalness
      // Emissive is narrative, not emphasis: the display's brightness is driven
      // by the story and must reach the clone untouched.
      e.mat.emissiveIntensity = e.source.emissiveIntensity
      const src = e.source as THREE.MeshPhysicalMaterial
      const dst = e.mat as THREE.MeshPhysicalMaterial
      if (src.anisotropy !== undefined && dst.anisotropy !== undefined) dst.anisotropy = src.anisotropy
    }
  }

  dispose() {
    // Hand each mesh its shared material back before the clone goes away, so a
    // disposed controller never leaves a dead material on screen.
    for (const [mesh, e] of this.entries) {
      mesh.material = e.source
      e.mat.dispose()
    }
    this.entries.clear()
  }
}
