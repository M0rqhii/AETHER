'use client'

/**
 * Set while the rigid body owns the product transform.
 *
 * `ProductModel` stops writing its scripted rotation the moment this flips, which
 * is what makes the hand-off between scripted motion and physics clean in both
 * directions (spec §156).
 */
export const physicsControl = { active: false }
