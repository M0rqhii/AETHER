'use client'

import { useEffect } from 'react'
import { addReactor, type Reactor } from '@/lib/aethr/ticker'

/**
 * Subscribes a per-frame callback to global scroll progress.
 * The callback must write to refs — never call setState from here.
 */
export function useProgressEffect(fn: Reactor, deps: React.DependencyList = []) {
  useEffect(() => addReactor(fn), deps) // eslint-disable-line react-hooks/exhaustive-deps
}
