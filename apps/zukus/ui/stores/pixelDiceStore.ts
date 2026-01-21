import type { Pixel } from '@systemic-games/pixels-core-connect'
import { create } from 'zustand'

export type PixelRollEntry = {
  id: string
  face: number
  timestamp: number
}

type PixelDiceState = {
  pixel: Pixel | null
  rolls: PixelRollEntry[]
  isConnecting: boolean
  error: string | null
}

type PixelDiceActions = {
  setPixel: (pixel: Pixel | null) => void
  setConnecting: (isConnecting: boolean) => void
  setError: (error: string | null) => void
  addRoll: (face: number) => void
  clearRolls: () => void
}

type PixelDiceStore = PixelDiceState & PixelDiceActions

const MAX_ROLL_HISTORY = 50

function createRollId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const usePixelDiceStore = create<PixelDiceStore>((set) => ({
  pixel: null,
  rolls: [],
  isConnecting: false,
  error: null,

  setPixel: (pixel) =>
    set({
      pixel,
      rolls: [],
      error: null,
    }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error) => set({ error }),

  addRoll: (face) =>
    set((state) => {
      const nextEntry: PixelRollEntry = {
        id: createRollId(),
        face,
        timestamp: Date.now(),
      }
      const nextRolls = [nextEntry, ...state.rolls]
      if (nextRolls.length > MAX_ROLL_HISTORY) {
        nextRolls.length = MAX_ROLL_HISTORY
      }
      return { rolls: nextRolls }
    }),

  clearRolls: () => set({ rolls: [] }),
}))

export function usePixelDicePixel() {
  return usePixelDiceStore((state) => state.pixel)
}

export function usePixelDiceRolls() {
  return usePixelDiceStore((state) => state.rolls)
}

export function usePixelDiceLastRoll() {
  return usePixelDiceStore((state) => state.rolls[0] ?? null)
}

export function usePixelDiceIsConnecting() {
  return usePixelDiceStore((state) => state.isConnecting)
}

export function usePixelDiceError() {
  return usePixelDiceStore((state) => state.error)
}
