/**
 * Runtime geometry preparation.
 *
 * The canonical GLB carries **POSITION only** — no normals, no UVs. Without this
 * pass every surface renders unlit-flat, and neither the brushed maps nor the OLED
 * texture have anywhere to land. Everything here runs once, behind the loader.
 */
import * as THREE from 'three'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Smooth the lathe facets, keep the machined chamfers crisp. 40° sits comfortably
 * above the ~1.4° between adjacent cylinder segments and far below a 90° edge.
 */
const CREASE_ANGLE = (40 * Math.PI) / 180

/**
 * Metres → millimetres, and back again.
 *
 * `toCreasedNormals` decides which vertices share a normal by truncating each
 * coordinate onto a **fixed 0.01-unit grid** — a constant baked into three, with
 * no tolerance argument. The GLB is authored in metres, so that grid is one
 * centimetre wide: every vertex inside a 10 mm cell was welded together and the
 * 76 mm body ended up wearing about eight flat-shaded facets. Working in
 * millimetres puts the same grid at 0.01 mm, which is finer than the model's own
 * quantisation. Normals are unaffected by a uniform scale, so scaling back
 * afterwards costs nothing.
 */
const WELD_SCALE = 1000

export function ensureNormals(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  if (geometry.getAttribute('normal')) return geometry

  geometry.scale(WELD_SCALE, WELD_SCALE, WELD_SCALE)
  const creased = toCreasedNormals(geometry, CREASE_ANGLE)
  if (creased !== geometry) geometry.dispose()
  creased.scale(1 / WELD_SCALE, 1 / WELD_SCALE, 1 / WELD_SCALE)
  return creased
}

/**
 * A face whose normal points along the lathe axis is a cap, not a wall.
 * cos(44°) — comfortably past the steepest chamfer on the model.
 */
const CAP_FACING = 0.72

/**
 * Lathe UVs around the model's local Z axis.
 *
 * Walls get the cylindrical projection: U wraps the circumference, V runs up the
 * body in metres. Caps — the base disc, the crown's top face — get a *planar*
 * projection in the same units instead, so the grain crosses them as straight
 * parallel lines at the wall's own density.
 *
 * Two separate things force the split. A single cylindrical projection gives
 * every vertex of a cap the same V, and a map with no gradient across a surface
 * both smears the brushed grain into radial streaks and leaves three deriving the
 * normal map's tangent frame from a degenerate UV triangle, which resolves to hot
 * white specks. Wrapping U around a cap instead is no better: it puts a pole at
 * the centre and a seam along one radius, and the base is precisely the surface
 * on which a single bright hairline is impossible to miss.
 *
 * The atan2 seam on the walls is repaired per triangle, which is only possible
 * because `ensureNormals` leaves the geometry non-indexed — adjacent triangles no
 * longer share the wrapped vertex.
 */
export function applyLatheUV(geometry: THREE.BufferGeometry) {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const count = pos.count
  const uv = new Float32Array(count * 2)

  const angleAt = (i: number) => Math.atan2(pos.getY(i), pos.getX(i)) / (Math.PI * 2) + 0.5

  if (geometry.getIndex()) {
    // An indexed mesh shares vertices across the seam, so neither the per-triangle
    // projection nor the seam repair can be expressed. Nothing in the shipped GLBs
    // reaches this branch; it exists so the function stays total.
    for (let i = 0; i < count; i++) {
      uv[i * 2] = angleAt(i)
      uv[i * 2 + 1] = pos.getZ(i)
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    return
  }

  // One turn of the widest wall is one turn of U, so measuring the cap against the
  // same circumference keeps the grain the same size on both.
  let rMax = 0
  for (let i = 0; i < count; i++) rMax = Math.max(rMax, Math.hypot(pos.getX(i), pos.getY(i)))
  const capScale = rMax > 1e-6 ? 1 / (Math.PI * 2 * rMax) : 1

  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const ac = new THREE.Vector3()
  const n = new THREE.Vector3()

  for (let t = 0; t < count; t += 3) {
    a.fromBufferAttribute(pos, t)
    b.fromBufferAttribute(pos, t + 1)
    c.fromBufferAttribute(pos, t + 2)
    n.subVectors(b, a).cross(ac.subVectors(c, a))
    const len = n.length()

    if (len > 0 && Math.abs(n.z) / len > CAP_FACING) {
      for (let k = 0; k < 3; k++) {
        const i = t + k
        uv[i * 2] = pos.getX(i) * capScale + 0.5
        uv[i * 2 + 1] = pos.getY(i)
      }
      continue
    }

    for (let k = 0; k < 3; k++) {
      const i = t + k
      uv[i * 2] = angleAt(i)
      uv[i * 2 + 1] = pos.getZ(i)
    }

    const u0 = uv[t * 2]
    const u1 = uv[(t + 1) * 2]
    const u2 = uv[(t + 2) * 2]
    const max = Math.max(u0, u1, u2)
    // A triangle straddling the seam spans almost the whole U range; lift the
    // low corners past 1 so the interpolation stays local.
    if (max - Math.min(u0, u1, u2) > 0.5) {
      if (max - u0 > 0.5) uv[t * 2] = u0 + 1
      if (max - u1 > 0.5) uv[(t + 1) * 2] = u1 + 1
      if (max - u2 > 0.5) uv[(t + 2) * 2] = u2 + 1
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

/** Planar UVs in the local XY plane — used for the circular OLED panel. */
export function applyPlanarUV(geometry: THREE.BufferGeometry, radius: number) {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute
  const uv = new Float32Array(pos.count * 2)
  const d = radius * 2
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / d + 0.5
    uv[i * 2 + 1] = pos.getY(i) / d + 0.5
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

export interface RestTransform {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
}

/**
 * Snapshot of every animated node's authored transform. Animations are always
 * computed from this rest pose rather than from the mutated live values, so the
 * model returns *exactly* to its closed state on reverse scroll (spec §121, §192).
 */
export function captureRestTransforms(root: THREE.Object3D): Map<string, RestTransform> {
  const rest = new Map<string, RestTransform>()
  root.traverse((o) => {
    if (!o.name) return
    rest.set(o.name, {
      position: o.position.clone(),
      quaternion: o.quaternion.clone(),
      scale: o.scale.clone(),
    })
  })
  return rest
}

export function restoreRest(object: THREE.Object3D, rest: RestTransform | undefined) {
  if (!rest) return
  object.position.copy(rest.position)
  object.quaternion.copy(rest.quaternion)
  object.scale.copy(rest.scale)
}
