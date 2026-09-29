'use client'

import type * as THREE from 'three'

/**
 * Shared handles between scene components that need a world position from a node
 * owned by someone else — the mouth of the bottle for the streams and steam, the
 * crown coil for the induction field.
 *
 * Deliberately a plain mutable object: these are read inside `useFrame`, where a
 * React context read would be needless indirection and a state update would be a bug.
 */
export const sceneRefs: {
  mouth: THREE.Object3D | null
  crownCoil: THREE.Object3D | null
  product: THREE.Object3D | null
} = {
  mouth: null,
  crownCoil: null,
  product: null,
}
