'use client'

import { create } from 'zustand'
import type { FinishId } from '@/lib/aethr/materials'
import type { EngravingMode } from '@/lib/aethr/textures'

/**
 * Continuous scroll state lives *outside* React.
 *
 * It is read once per frame inside `useFrame` and written by ScrollTrigger. Putting
 * it in component state would mean 60 renders a second for no benefit (spec §169).
 */
export const scroll = {
  /** Global normalized progress, 0 → 1. */
  progress: 0,
  /** Progress delta per second — used to damp interaction, not to drive scenes. */
  velocity: 0,
  /** True once the first deterministic pose has been applied without damping. */
  primed: false,
  /**
   * Bumped whenever progress is adopted instantly rather than damped — a deep
   * link, a mid-page refresh, a resize. Consumers compare it against their own
   * copy and snap rather than gliding in from wherever they happened to be.
   */
  snapToken: 0,
}

export type Quality = 'high' | 'medium' | 'low'

export interface ConfigState {
  finish: FinishId
  engraving: string
  engravingMode: EngravingMode
  quantity: number
}

interface ExperienceStore {
  /* Boot */
  loaded: boolean
  loadProgress: number
  failed: boolean
  setLoadProgress: (v: number) => void
  setLoaded: (v: boolean) => void
  setFailed: (v: boolean) => void

  /* Environment */
  quality: Quality
  isMobile: boolean
  isCoarsePointer: boolean
  reducedMotion: boolean
  /** Set when the visitor asks for the 3D experience despite a slow renderer. */
  force3d: boolean
  setQuality: (q: Quality) => void
  setEnvironment: (e: { isMobile: boolean; isCoarsePointer: boolean; reducedMotion: boolean }) => void
  setForce3d: (v: boolean) => void

  /* Narrative — written only when the value actually changes */
  chapterIndex: number
  activeCallout: string | null
  cursorLabel: string | null
  setChapterIndex: (i: number) => void
  setActiveCallout: (id: string | null) => void
  setCursorLabel: (label: string | null) => void

  /* Configurator (spec §176) */
  config: ConfigState
  setFinish: (f: FinishId) => void
  setEngraving: (text: string) => void
  setEngravingMode: (mode: EngravingMode) => void
  setQuantity: (n: number) => void

  /* UI shells */
  menuOpen: boolean
  configuratorOpen: boolean
  cartOpen: boolean
  bagCount: number
  soundEnabled: boolean
  toggleMenu: (v?: boolean) => void
  toggleConfigurator: (v?: boolean) => void
  toggleCart: (v?: boolean) => void
  addToBag: () => void
  toggleSound: (v?: boolean) => void

  /* Drop test */
  dropReleased: boolean
  dropSettled: boolean
  dropResetToken: number
  setDropReleased: (v: boolean) => void
  setDropSettled: (v: boolean) => void
  resetDrop: () => void
}

const SOUND_KEY = 'aethr:sound'

export const useExperience = create<ExperienceStore>((set, get) => ({
  loaded: false,
  loadProgress: 0,
  failed: false,
  setLoadProgress: (v) => set((s) => (Math.abs(s.loadProgress - v) < 0.5 ? s : { loadProgress: v })),
  setLoaded: (v) => set({ loaded: v }),
  setFailed: (v) => set({ failed: v }),

  quality: 'high',
  isMobile: false,
  isCoarsePointer: false,
  reducedMotion: false,
  force3d: false,
  setQuality: (q) => set((s) => (s.quality === q ? s : { quality: q })),
  setEnvironment: (e) => set(e),
  setForce3d: (v) => set({ force3d: v }),

  chapterIndex: 0,
  activeCallout: null,
  cursorLabel: null,
  setChapterIndex: (i) => set((s) => (s.chapterIndex === i ? s : { chapterIndex: i })),
  setActiveCallout: (id) => set((s) => (s.activeCallout === id ? s : { activeCallout: id })),
  setCursorLabel: (label) => set((s) => (s.cursorLabel === label ? s : { cursorLabel: label })),

  config: { finish: 'RAW', engraving: '', engravingMode: 'none', quantity: 1 },
  setFinish: (finish) => set((s) => ({ config: { ...s.config, finish } })),
  setEngraving: (engraving) =>
    set((s) => ({
      config: {
        ...s.config,
        engraving: engraving.slice(0, 16),
        // Typing into an empty configurator should show something immediately.
        engravingMode: s.config.engravingMode === 'none' && engraving ? 'minimal' : s.config.engravingMode,
      },
    })),
  setEngravingMode: (engravingMode) => set((s) => ({ config: { ...s.config, engravingMode } })),
  setQuantity: (n) => set((s) => ({ config: { ...s.config, quantity: Math.max(1, Math.min(9, n)) } })),

  menuOpen: false,
  configuratorOpen: false,
  cartOpen: false,
  bagCount: 0,
  soundEnabled: false,
  toggleMenu: (v) => set((s) => ({ menuOpen: v ?? !s.menuOpen })),
  toggleConfigurator: (v) => set((s) => ({ configuratorOpen: v ?? !s.configuratorOpen })),
  toggleCart: (v) => set((s) => ({ cartOpen: v ?? !s.cartOpen })),
  addToBag: () => set((s) => ({ bagCount: s.bagCount + s.config.quantity, cartOpen: true, configuratorOpen: false })),
  toggleSound: (v) => {
    const next = v ?? !get().soundEnabled
    try {
      window.localStorage.setItem(SOUND_KEY, next ? '1' : '0')
    } catch {
      /* private mode — the preference simply does not persist */
    }
    set({ soundEnabled: next })
  },

  dropReleased: false,
  dropSettled: false,
  dropResetToken: 0,
  setDropReleased: (v) => set((s) => (s.dropReleased === v ? s : { dropReleased: v })),
  setDropSettled: (v) => set((s) => (s.dropSettled === v ? s : { dropSettled: v })),
  resetDrop: () =>
    set((s) => ({ dropResetToken: s.dropResetToken + 1, dropReleased: false, dropSettled: false })),
}))

export function restoreSoundPreference() {
  try {
    if (window.localStorage.getItem(SOUND_KEY) === '1') {
      useExperience.setState({ soundEnabled: true })
    }
  } catch {
    /* ignore */
  }
}
