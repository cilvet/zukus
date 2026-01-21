import type { Pixel } from '@systemic-games/pixels-core-connect'

export type PixelDevice = Pixel

export type BluetoothInitResult = {
  supported: boolean
  errorMessage?: string
}

export type ScannedPixelInfo = {
  id: string
  name: string
  pixelId: number
}

export type PixelScannerState = {
  items: ScannedPixelInfo[]
  status: 'started' | 'stopped' | 'unsupported' | 'error'
  errorMessage?: string
  start: () => void
  stop: () => void
  clear: () => void
}
