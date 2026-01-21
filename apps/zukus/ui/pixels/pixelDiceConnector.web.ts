import type { Pixel } from '@systemic-games/pixels-core-connect'
import { getBluetoothCapabilities, requestPixel, repeatConnect } from '@systemic-games/pixels-web-connect'

import type { BluetoothInitResult, PixelScannerState, ScannedPixelInfo } from './pixelDiceConnector.types'

const bluetoothCapabilities = getBluetoothCapabilities()

export const isWebBluetoothSupported = bluetoothCapabilities.bluetooth

export function initializeBluetooth(): BluetoothInitResult {
  if (!isWebBluetoothSupported) {
    return { supported: false, errorMessage: 'Web Bluetooth no esta disponible en este navegador.' }
  }
  return { supported: true }
}

export async function requestPixelDevice(): Promise<Pixel> {
  return requestPixel()
}

export async function connectPixel(pixel: Pixel): Promise<void> {
  await repeatConnect(pixel)
}

export async function disconnectPixel(pixel: Pixel): Promise<void> {
  await pixel.disconnect()
}

export function getPixelFromScan(_scan: ScannedPixelInfo): Pixel | null {
  return null
}

const UNSUPPORTED_SCANNER: PixelScannerState = {
  items: [],
  status: 'unsupported',
  start: () => {},
  stop: () => {},
  clear: () => {},
}

export function usePixelScanner(): PixelScannerState {
  return UNSUPPORTED_SCANNER
}
