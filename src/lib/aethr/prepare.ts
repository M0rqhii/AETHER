/**
 * One-time preparation of a loaded GLB: normals, UVs, final materials, node index
 * and rest-pose snapshot (spec §120, §121, §122).
 *
 * Idempotent — `useGLTF` caches scenes across mounts and React StrictMode mounts
 * twice in development, so every step is guarded.
 */
import * as THREE from 'three'
import { applyLatheUV, applyPlanarUV, ensureNormals, type RestTransform } from './geometry'
import type { MaterialSet } from './materials'
import { CROWN } from './constants'

/** Original GLB material names whose replacements sample the brushed maps. */
const NEEDS_LATHE_UV = new Set(['RAW_TITANIUM', 'OUTER_TITANIUM', 'AETHR_CHARGE_TITANIUM'])

/** Only these cast shadows — spec §105 keeps the shadow budget to the silhouette. */
const SHADOW_CASTERS = new Set(['Outer_Shell', 'Crown_Shell', 'Bottom_Plate', 'Body_Shoulder', 'Dock_Housing', 'Outer_Main'])

const PREPARED = new WeakSet<THREE.Object3D>()
/** Survives StrictMode remounts, when nodes have already been re-parented away. */
const NODE_CACHE = new WeakMap<THREE.Object3D, Map<string, THREE.Object3D>>()
const REST_CACHE = new WeakMap<THREE.Object3D, Map<string, RestTransform>>()

export interface PreparedModel {
  scene: THREE.Group
  nodes: Map<string, THREE.Object3D>
  meshes: THREE.Mesh[]
  rest: Map<string, RestTransform>
}

export function prepareModel(scene: THREE.Group, materials: MaterialSet, hide: readonly string[] = []): PreparedModel {
  // Start from the cached index: components below re-parent nodes (the Smart Crown
  // becomes an independent actor), so a later traversal alone would miss them.
  const nodes = new Map<string, THREE.Object3D>(NODE_CACHE.get(scene))
  const meshes: THREE.Mesh[] = []

  const first = !PREPARED.has(scene)

  const visit = (obj: THREE.Object3D) => {
    if (obj.name) nodes.set(obj.name, obj)
    if (!(obj as THREE.Mesh).isMesh) return

    const mesh = obj as THREE.Mesh
    meshes.push(mesh)
    if (!first) return

    const sourceName = (mesh.material as THREE.Material)?.name ?? ''

    mesh.geometry = ensureNormals(mesh.geometry)

    if (!mesh.geometry.getAttribute('uv')) {
      if (mesh.name === 'OLED_Panel') applyPlanarUV(mesh.geometry, CROWN.oledRadius)
      else if (NEEDS_LATHE_UV.has(sourceName)) applyLatheUV(mesh.geometry)
    }

    const replacement = materials.byName.get(sourceName)
    if (replacement) mesh.material = replacement

    mesh.castShadow = SHADOW_CASTERS.has(mesh.name)
    mesh.receiveShadow = false
  }

  scene.traverse(visit)
  // Anything already detached still belongs to the model.
  for (const cached of NODE_CACHE.get(scene)?.values() ?? []) {
    if (!cached.parent || cached.parent === scene) continue
    cached.traverse(visit)
  }

  if (first) {
    // Storytelling helpers start hidden (spec §100).
    for (const name of hide) {
      const n = nodes.get(name)
      if (n) n.visible = false
    }
    PREPARED.add(scene)
  }

  NODE_CACHE.set(scene, nodes)

  // Captured once, from the authored pose. Re-capturing on a remount would bake in
  // whatever the previous mount had animated (spec §121).
  let rest = REST_CACHE.get(scene)
  if (!rest) {
    rest = new Map<string, RestTransform>()
    for (const [name, obj] of nodes) {
      rest.set(name, { position: obj.position.clone(), quaternion: obj.quaternion.clone(), scale: obj.scale.clone() })
    }
    REST_CACHE.set(scene, rest)
  }

  return { scene, nodes, meshes, rest }
}

/** Convenience typed lookup that fails loudly in development. */
export function node<T extends THREE.Object3D = THREE.Object3D>(
  nodes: Map<string, THREE.Object3D>,
  name: string,
): T | undefined {
  const n = nodes.get(name) as T | undefined
  if (!n && process.env.NODE_ENV !== 'production') {
    console.warn(`[aethr] missing node: ${name}`)
  }
  return n
}
