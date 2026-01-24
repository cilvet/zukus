import { useEffect, useState } from 'react'
import { Platform, Pressable, useWindowDimensions, View } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { SafeAreaBottomSpacer } from '../../components/layout'
import type { BatteryEvent, PixelStatus, RollEvent } from '@systemic-games/pixels-core-connect'
import { useGlowOnChange } from '../../hooks'
import {
  usePixelDiceError,
  usePixelDiceIsConnecting,
  usePixelDiceLastRoll,
  usePixelDicePixel,
  usePixelDiceRolls,
  usePixelDiceStore,
  useTheme,
} from '../../ui'
import {
  connectPixel,
  disconnectPixel,
  getPixelFromScan,
  initializeBluetooth,
  isWebBluetoothSupported,
  requestPixelDevice,
  usePixelScanner,
  type BluetoothInitResult,
  type ScannedPixelInfo,
} from '../../ui/pixels/pixelDiceConnector'

function getStatusLabel(status?: PixelStatus) {
  if (!status) return 'Sin conectar'
  if (status === 'ready') return 'Conectado'
  if (status === 'connecting') return 'Conectando'
  if (status === 'disconnecting') return 'Desconectando'
  if (status === 'identifying') return 'Identificando'
  return 'Desconectado'
}

function getRollStateLabel(state?: string) {
  if (!state) return 'Sin datos'
  if (state === 'rolled') return 'Tirada confirmada'
  if (state === 'rolling') return 'Rodando'
  if (state === 'handling') return 'En mano'
  if (state === 'crooked') return 'Caida irregular'
  if (state === 'onFace') return 'En reposo'
  return 'Desconocido'
}

function formatRollTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function PixelDiceScreen() {
  "use no memo"
  const { themeColors } = useTheme()
  const { width } = useWindowDimensions()
  const isDesktop = Platform.OS === 'web' && width >= 960
  const isNative = Platform.OS !== 'web'

  const pixel = usePixelDicePixel()
  const rolls = usePixelDiceRolls()
  const lastRoll = usePixelDiceLastRoll()
  const isConnecting = usePixelDiceIsConnecting()
  const error = usePixelDiceError()
  const addRoll = usePixelDiceStore((state) => state.addRoll)
  const clearRolls = usePixelDiceStore((state) => state.clearRolls)
  const setError = usePixelDiceStore((state) => state.setError)
  const setConnecting = usePixelDiceStore((state) => state.setConnecting)
  const setPixel = usePixelDiceStore((state) => state.setPixel)

  const [pixelStatus, setPixelStatus] = useState<PixelStatus | undefined>(undefined)
  const [rollState, setRollState] = useState<RollEvent | undefined>(undefined)
  const [battery, setBattery] = useState<BatteryEvent | undefined>(undefined)
  const [bluetoothSupport, setBluetoothSupport] = useState<BluetoothInitResult>({
    supported: true,
  })

  const scanner = usePixelScanner()

  const glowTrigger = useGlowOnChange(lastRoll?.face ?? null)
  const [isGlowing, setIsGlowing] = useState(false)

  useEffect(() => {
    const result = initializeBluetooth()
    setBluetoothSupport(result)
    if (!result.supported && result.errorMessage) {
      setError(result.errorMessage)
    }
  }, [setError])

  useEffect(() => {
    if (!pixel) {
      setPixelStatus(undefined)
      setRollState(undefined)
      setBattery(undefined)
      return
    }

    setPixelStatus(pixel.status)
    setBattery({ level: pixel.batteryLevel, isCharging: pixel.isCharging })
    setRollState(undefined)

    const handleStatus = ({ status }: { status: PixelStatus }) => {
      setPixelStatus(status)
    }
    const handleRoll = (face: number) => {
      addRoll(face)
    }
    const handleRollState = (state: RollEvent) => {
      setRollState(state)
    }
    const handleBattery = (event: BatteryEvent) => {
      setBattery(event)
    }

    pixel.addEventListener('statusChanged', handleStatus)
    pixel.addEventListener('roll', handleRoll)
    pixel.addEventListener('rollState', handleRollState)
    pixel.addEventListener('battery', handleBattery)

    return () => {
      pixel.removeEventListener('statusChanged', handleStatus)
      pixel.removeEventListener('roll', handleRoll)
      pixel.removeEventListener('rollState', handleRollState)
      pixel.removeEventListener('battery', handleBattery)
    }
  }, [addRoll, pixel])

  useEffect(() => {
    if (glowTrigger > 0) {
      setIsGlowing(true)
      const timeoutId = setTimeout(() => setIsGlowing(false), 700)
      return () => clearTimeout(timeoutId)
    }
  }, [glowTrigger])

  const lastRollValue = lastRoll ? `${lastRoll.face}` : '--'
  const lastRollTime = lastRoll ? formatRollTime(lastRoll.timestamp) : 'Sin tiradas'
  const statusLabel = getStatusLabel(pixelStatus)
  const rollStateLabel = getRollStateLabel(rollState?.state)

  let batteryLabel = 'Sin datos'
  if (battery && typeof battery.level === 'number') {
    batteryLabel = `${battery.level}%`
    if (battery.isCharging) {
      batteryLabel = `${batteryLabel} (cargando)`
    }
  }

  const handleRequestPixel = async () => {
    if (!isWebBluetoothSupported) {
      setError('El navegador no soporta Web Bluetooth.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      const selectedPixel = await requestPixelDevice()
      await connectPixel(selectedPixel)
      setPixel(selectedPixel)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'No se pudo conectar al dado.'
      setError(message)
    } finally {
      setConnecting(false)
    }
  }

  const handleConnectScanned = async (scan: ScannedPixelInfo) => {
    setConnecting(true)
    setError(null)

    const selectedPixel = getPixelFromScan(scan)
    if (!selectedPixel) {
      setConnecting(false)
      setError('No se encontro el dado en el escaneo.')
      return
    }

    try {
      await connectPixel(selectedPixel)
      setPixel(selectedPixel)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'No se pudo conectar al dado.'
      setError(message)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!pixel) return
    setConnecting(true)
    setError(null)

    try {
      await disconnectPixel(pixel)
      setPixel(null)
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'No se pudo desconectar el dado.'
      setError(message)
    } finally {
      setConnecting(false)
    }
  }

  const handleScanToggle = () => {
    if (!bluetoothSupport.supported) return
    if (scanner.status === 'started') {
      scanner.stop()
    } else {
      scanner.start()
    }
  }

  const renderScanStatus = () => {
    if (scanner.status === 'started') return 'Escaneando'
    if (scanner.status === 'error') return 'Error de Bluetooth'
    if (scanner.status === 'unsupported') return 'Escaneo no disponible'
    return 'Escaneo detenido'
  }

  const infoCardBackground = isGlowing ? themeColors.backgroundHover : themeColors.uiBackgroundColor

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView flex={1} backgroundColor={themeColors.background}>
      <YStack padding="$4" borderBottomWidth={1} borderBottomColor={themeColors.borderColor}>
        <Text fontSize={24} fontWeight="bold" color={themeColors.color}>
          Pixel Dice
        </Text>
        <Text fontSize={14} color={themeColors.placeholderColor} marginTop="$1">
          Conecta tu dado fisico y registra las tiradas en tiempo real.
        </Text>
      </YStack>

      {!isNative && !isWebBluetoothSupported && (
        <YStack
          margin="$4"
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={themeColors.borderColor}
          backgroundColor={themeColors.uiBackgroundColor}
        >
          <Text fontSize={14} fontWeight="600" color={themeColors.color} marginBottom="$2">
            Web Bluetooth no disponible
          </Text>
          <Text fontSize={13} color={themeColors.placeholderColor} lineHeight={18}>
            Necesitas un navegador Chromium con Bluetooth activado para conectar un Pixel.
          </Text>
        </YStack>
      )}

      {isNative && !bluetoothSupport.supported && (
        <YStack
          margin="$4"
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={themeColors.borderColor}
          backgroundColor={themeColors.uiBackgroundColor}
        >
          <Text fontSize={14} fontWeight="600" color={themeColors.color} marginBottom="$2">
            Bluetooth nativo no disponible
          </Text>
          <Text fontSize={13} color={themeColors.placeholderColor} lineHeight={18}>
            Para usar Pixels en iOS o Android necesitas un dev build con el modulo BLE enlazado.
          </Text>
        </YStack>
      )}

      <YStack padding="$4" gap="$4">
        <XStack
          gap="$4"
          flexDirection={isDesktop ? 'row' : 'column'}
          alignItems={isDesktop ? 'flex-start' : 'stretch'}
        >
          <YStack flex={1} gap="$4">
            <YStack
              padding="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={themeColors.borderColor}
              backgroundColor={themeColors.uiBackgroundColor}
              gap="$3"
            >
              <Text fontSize={16} fontWeight="700" color={themeColors.color}>
                Estado de conexion
              </Text>

              <YStack gap="$2">
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color={themeColors.placeholderColor}>
                    Dado
                  </Text>
                  <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                    {pixel?.name ?? 'Sin conectar'}
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color={themeColors.placeholderColor}>
                    Estado
                  </Text>
                  <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                    {statusLabel}
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color={themeColors.placeholderColor}>
                    Bateria
                  </Text>
                  <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                    {batteryLabel}
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color={themeColors.placeholderColor}>
                    Estado de tirada
                  </Text>
                  <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                    {rollStateLabel}
                  </Text>
                </XStack>
              </YStack>

              {error && (
                <Text fontSize={13} color="$red10">
                  {error}
                </Text>
              )}

              <XStack gap="$2" flexWrap="wrap">
                {!pixel && !isNative && (
                  <Pressable
                    onPress={handleRequestPixel}
                    disabled={isConnecting}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: themeColors.actionButton,
                      opacity: pressed || isConnecting ? 0.7 : 1,
                    })}
                  >
                    <Text fontSize={14} fontWeight="700" color={themeColors.accentContrastText}>
                      Conectar dado
                    </Text>
                  </Pressable>
                )}
                {pixel && (
                  <Pressable
                    onPress={handleDisconnect}
                    disabled={isConnecting}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: themeColors.borderColor,
                      opacity: pressed || isConnecting ? 0.7 : 1,
                    })}
                  >
                    <Text fontSize={14} fontWeight="700" color={themeColors.color}>
                      Desconectar
                    </Text>
                  </Pressable>
                )}
              </XStack>
            </YStack>

            <YStack
              padding="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={themeColors.borderColor}
              backgroundColor={infoCardBackground}
              gap="$2"
            >
              <Text fontSize={16} fontWeight="700" color={themeColors.color}>
                Ultimo resultado
              </Text>
              <Text
                fontSize={48}
                fontWeight="800"
                color={themeColors.color}
                letterSpacing={2}
              >
                {lastRollValue}
              </Text>
              <Text fontSize={13} color={themeColors.placeholderColor}>
                {lastRollTime}
              </Text>
            </YStack>
          </YStack>

          <YStack flex={1} gap="$4">
            {isNative && (
              <YStack
                padding="$4"
                borderRadius="$4"
                borderWidth={1}
                borderColor={themeColors.borderColor}
                backgroundColor={themeColors.uiBackgroundColor}
                gap="$3"
              >
                <Text fontSize={16} fontWeight="700" color={themeColors.color}>
                  Dispositivos cercanos
                </Text>

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={13} color={themeColors.placeholderColor}>
                    {renderScanStatus()}
                  </Text>
                  <Pressable
                    onPress={handleScanToggle}
                    disabled={isConnecting || !bluetoothSupport.supported}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: themeColors.backgroundHover,
                      opacity: pressed || isConnecting ? 0.7 : 1,
                    })}
                  >
                    <Text fontSize={13} fontWeight="600" color={themeColors.color}>
                      {scanner.status === 'started' ? 'Detener' : 'Escanear'}
                    </Text>
                  </Pressable>
                </XStack>

                {scanner.errorMessage && (
                  <Text fontSize={12} color="$red10">
                    {scanner.errorMessage}
                  </Text>
                )}

                <YStack gap="$2">
                  {scanner.items.length === 0 && (
                    <Text fontSize={13} color={themeColors.placeholderColor}>
                      No hay dados detectados aun.
                    </Text>
                  )}
                  {scanner.items.map((item) => (
                    <XStack
                      key={item.id}
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="$2"
                      borderBottomWidth={1}
                      borderBottomColor={themeColors.borderColor}
                    >
                      <YStack>
                        <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                          {item.name || `Pixel ${item.pixelId}`}
                        </Text>
                        <Text fontSize={12} color={themeColors.placeholderColor}>
                          ID {item.pixelId}
                        </Text>
                      </YStack>
                      <Pressable
                        onPress={() => handleConnectScanned(item)}
                        disabled={isConnecting}
                        style={({ pressed }) => ({
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: themeColors.actionButton,
                          opacity: pressed || isConnecting ? 0.7 : 1,
                        })}
                      >
                        <Text fontSize={12} fontWeight="700" color={themeColors.accentContrastText}>
                          Conectar
                        </Text>
                      </Pressable>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}

            <YStack
              padding="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={themeColors.borderColor}
              backgroundColor={themeColors.uiBackgroundColor}
              gap="$3"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="700" color={themeColors.color}>
                  Historial de tiradas
                </Text>
                <Pressable
                  onPress={clearRolls}
                  disabled={rolls.length === 0}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: themeColors.backgroundHover,
                    opacity: pressed || rolls.length === 0 ? 0.5 : 1,
                  })}
                >
                  <Text fontSize={12} fontWeight="600" color={themeColors.color}>
                    Limpiar
                  </Text>
                </Pressable>
              </XStack>

              {rolls.length === 0 && (
                <Text fontSize={13} color={themeColors.placeholderColor}>
                  Todavia no hay tiradas registradas.
                </Text>
              )}

              <YStack gap="$2">
                {rolls.map((roll) => (
                  <XStack key={roll.id} justifyContent="space-between">
                    <Text fontSize={14} fontWeight="600" color={themeColors.color}>
                      {roll.face}
                    </Text>
                    <Text fontSize={12} color={themeColors.placeholderColor}>
                      {formatRollTime(roll.timestamp)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </XStack>
      </YStack>
    </ScrollView>
    <SafeAreaBottomSpacer />
  </View>
  )
}
