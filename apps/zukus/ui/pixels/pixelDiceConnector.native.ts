import type { Pixel } from '@systemic-games/pixels-core-connect'
import { getPixel, initBluetooth, useScannedPixels } from '@systemic-games/react-native-pixels-connect'

import type { BluetoothInitResult, PixelScannerState, ScannedPixelInfo } from './pixelDiceConnector.types'

export const isWebBluetoothSupported = false
let bluetoothSupported = true

export function initializeBluetooth(): BluetoothInitResult {
  try {
    initBluetooth()
    bluetoothSupported = true
    return { supported: true }
  } catch (error) {
    bluetoothSupported = false
    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo inicializar Bluetooth en este entorno.'
    return {
      supported: false,
      errorMessage: `${message} Necesitas un dev build con @systemic-games/react-native-bluetooth-le enlazado.`,
    }
  }
}

export async function requestPixelDevice(): Promise<Pixel> {
  throw new Error('requestPixelDevice solo esta disponible en web.')
}

export function getPixelFromScan(scan: ScannedPixelInfo): Pixel | null {
  const pixel = getPixel(scan.pixelId)
  if (!pixel) return null
  return pixel
}

export async function connectPixel(pixel: Pixel): Promise<void> {
  await pixel.connect()
}

export async function disconnectPixel(pixel: Pixel): Promise<void> {
  await pixel.disconnect()
}

export function usePixelScanner(): PixelScannerState {
  let items: ReturnType<typeof useScannedPixels>[0] = []
  let dispatch: ReturnType<typeof useScannedPixels>[1] = () => {}
  let status: ReturnType<typeof useScannedPixels>[2] = 'stopped'
  let hookError: Error | null = null

  try {
    const hookResult = useScannedPixels({ autoStart: false })
    items = hookResult[0]
    dispatch = hookResult[1]
    status = hookResult[2]
  } catch (error) {
    bluetoothSupported = false
    hookError = error instanceof Error ? error : new Error('Bluetooth no disponible')
  }

  const diceItems: ScannedPixelInfo[] = []
  for (const item of items) {
    if (item.type === 'die') {
      diceItems.push({
        id: item.systemId,
        name: item.name,
        pixelId: item.pixelId,
      })
    }
  }

  let normalizedStatus: PixelScannerState['status'] = 'stopped'
  let errorMessage: string | undefined

  if (!bluetoothSupported || hookError) {
    return {
      items: [],
      status: 'unsupported',
      errorMessage:
        hookError?.message ??
        'Bluetooth nativo no disponible sin dev build.',
      start: () => {},
      stop: () => {},
      clear: () => {},
    }
  }

  if (status instanceof Error) {
    normalizedStatus = 'error'
    errorMessage = status.message
  } else if (status === 'started') {
    normalizedStatus = 'started'
  }

  return {
    items: diceItems,
    status: normalizedStatus,
    errorMessage,
    start: () => dispatch('start'),
    stop: () => dispatch('stop'),
    clear: () => dispatch('clear'),
  }
}
