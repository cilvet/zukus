import { Platform, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { Text, YStack, XStack, ScrollView, View } from 'tamagui'
import { useState } from 'react'
import { useTheme } from '@zukus/ui'
import { SidePanel, SidePanelContainer } from '../../../components/layout'
import { useSidePanel } from '../../../hooks'

const DESKTOP_BREAKPOINT = 768

// Mock data de conjuros
const MOCK_SPELLS = [
  { id: 'fireball', name: 'Bola de Fuego', level: 3, school: 'Evocacion' },
  { id: 'magic-missile', name: 'Proyectil Magico', level: 1, school: 'Evocacion' },
  { id: 'shield', name: 'Escudo', level: 1, school: 'Abjuracion' },
  { id: 'counterspell', name: 'Contrahechizo', level: 3, school: 'Abjuracion' },
  { id: 'fly', name: 'Volar', level: 3, school: 'Transmutacion' },
]

// Mock data detallada
const SPELL_DETAILS: Record<string, {
  description: string
  range: string
  duration: string
  castingTime: string
  components: Array<{ type: 'verbal' | 'somatic' | 'material'; name: string; detail?: string }>
}> = {
  fireball: {
    description: 'Un brillante destello sale de tu dedo hacia un punto que elijas dentro del alcance y luego florece con un rugido bajo en una explosion de llamas.',
    range: '150 pies',
    duration: 'Instantanea',
    castingTime: '1 accion',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Palabras de poder arcano' },
      { type: 'somatic', name: 'Somatico', detail: 'Un gesto con la mano' },
      { type: 'material', name: 'Material', detail: 'Una pequena bola de guano de murcielago y azufre' },
    ],
  },
  'magic-missile': {
    description: 'Creas tres dardos brillantes de fuerza magica. Cada dardo golpea a una criatura de tu eleccion que puedas ver dentro del alcance.',
    range: '120 pies',
    duration: 'Instantanea',
    castingTime: '1 accion',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Una palabra de activacion' },
      { type: 'somatic', name: 'Somatico', detail: 'Apuntar con el dedo' },
    ],
  },
  shield: {
    description: 'Una barrera invisible de fuerza magica aparece y te protege. Hasta el comienzo de tu siguiente turno, tienes +5 de bonificacion a la CA.',
    range: 'Personal',
    duration: '1 ronda',
    castingTime: '1 reaccion',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Una exclamacion de proteccion' },
      { type: 'somatic', name: 'Somatico', detail: 'Levantar la mano' },
    ],
  },
  counterspell: {
    description: 'Intentas interrumpir a una criatura en el proceso de lanzar un conjuro.',
    range: '60 pies',
    duration: 'Instantanea',
    castingTime: '1 reaccion',
    components: [
      { type: 'somatic', name: 'Somatico', detail: 'Un gesto de negacion' },
    ],
  },
  fly: {
    description: 'Tocas a una criatura voluntaria. El objetivo gana una velocidad de vuelo de 60 pies durante la duracion.',
    range: 'Toque',
    duration: 'Concentracion, hasta 10 minutos',
    castingTime: '1 accion',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Palabras de levitacion' },
      { type: 'somatic', name: 'Somatico', detail: 'Mover los brazos como alas' },
      { type: 'material', name: 'Material', detail: 'Una pluma de ala de cualquier ave' },
    ],
  },
}

const COMPONENT_INFO: Record<string, { icon: string; fullName: string; description: string }> = {
  verbal: {
    icon: 'V',
    fullName: 'Componente Verbal',
    description: 'La mayoria de los conjuros requieren la recitacion de palabras misticas. Las palabras en si no son la fuente del poder del conjuro.',
  },
  somatic: {
    icon: 'S',
    fullName: 'Componente Somatico',
    description: 'Los gestos de lanzamiento de conjuros pueden incluir una gesticulacion energica o un conjunto intrincado de gestos.',
  },
  material: {
    icon: 'M',
    fullName: 'Componente Material',
    description: 'Lanzar algunos conjuros requiere objetos particulares, especificados entre parentesis en la entrada del componente.',
  },
}

export default function SpellsScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { themeColors } = useTheme()
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  const [selectedSpell, setSelectedSpell] = useState<string | null>(null)
  const { isOpen, currentContent, openPanel, closePanel } = useSidePanel()

  const handleSpellPress = (spellId: string, spellName: string) => {
    if (isDesktop) {
      setSelectedSpell(spellId)
    } else {
      router.push({
        pathname: '/(tabs)/(spells)/[id]',
        params: { id: spellId, name: spellName },
      })
    }
  }

  const handleComponentPress = (component: { type: string; name: string; detail?: string }) => {
    if (isDesktop) {
      openPanel({
        type: 'component-detail',
        data: {
          componentType: component.type,
          componentName: component.name,
          componentDetail: component.detail,
          spellName: selectedSpell ? MOCK_SPELLS.find(s => s.id === selectedSpell)?.name : '',
        },
      })
    } else {
      router.push({
        pathname: '/(tabs)/(spells)/component/[id]',
        params: {
          id: component.type,
          spellId: selectedSpell ?? '',
          spellName: selectedSpell ? MOCK_SPELLS.find(s => s.id === selectedSpell)?.name ?? '' : '',
          componentName: component.name,
          componentDetail: component.detail ?? '',
        },
      })
    }
  }

  const details = selectedSpell ? SPELL_DETAILS[selectedSpell] : null
  const spellData = selectedSpell ? MOCK_SPELLS.find(s => s.id === selectedSpell) : null

  // Desktop: 3 columnas
  if (isDesktop) {
    return (
      <SidePanelContainer>
        <XStack flex={1} backgroundColor="$background">
          {/* Columna 1: Lista de conjuros */}
          <YStack width={280} borderRightWidth={1} borderRightColor="$borderColor">
            <YStack padding={16} borderBottomWidth={1} borderBottomColor="$borderColor">
              <Text fontSize={20} fontWeight="bold" color="$color">Libro de Conjuros</Text>
              <Text fontSize={12} color="$placeholderColor" marginTop={4}>
                {MOCK_SPELLS.length} conjuros preparados
              </Text>
            </YStack>
            <ScrollView flex={1} showsVerticalScrollIndicator={false}>
              <YStack padding={12} gap={8}>
                {MOCK_SPELLS.map((spell) => (
                  <Pressable
                    key={spell.id}
                    style={{
                      backgroundColor: selectedSpell === spell.id ? themeColors.backgroundPress : themeColors.backgroundHover,
                      padding: 14,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selectedSpell === spell.id ? themeColors.colorFocus : themeColors.borderColor,
                    }}
                    onPress={() => handleSpellPress(spell.id, spell.name)}
                  >
                    <XStack alignItems="center" gap={12}>
                      <YStack
                        width={32}
                        height={32}
                        borderRadius={16}
                        backgroundColor="$actionButton"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={14} fontWeight="bold" color="#fff">{spell.level}</Text>
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={14} fontWeight="600" color="$color">{spell.name}</Text>
                        <Text fontSize={11} color="$placeholderColor">{spell.school}</Text>
                      </YStack>
                    </XStack>
                  </Pressable>
                ))}
              </YStack>
            </ScrollView>
          </YStack>

          {/* Columna 2: Detalle del conjuro */}
          <YStack flex={1} minWidth={300}>
            {details && spellData ? (
              <ScrollView flex={1} showsVerticalScrollIndicator={false}>
                <YStack padding={20} borderBottomWidth={1} borderBottomColor="$borderColor">
                  <Text fontSize={24} fontWeight="bold" color="$color">{spellData.name}</Text>
                  <Text fontSize={13} color="$placeholderColor" marginTop={4}>
                    Nivel {spellData.level} - {spellData.school}
                  </Text>
                </YStack>

                <XStack padding={16} borderBottomWidth={1} borderBottomColor="$borderColor">
                  <YStack flex={1} alignItems="center">
                    <Text fontSize={11} color="$placeholderColor">Tiempo</Text>
                    <Text fontSize={13} fontWeight="600" color="$color">{details.castingTime}</Text>
                  </YStack>
                  <YStack flex={1} alignItems="center">
                    <Text fontSize={11} color="$placeholderColor">Alcance</Text>
                    <Text fontSize={13} fontWeight="600" color="$color">{details.range}</Text>
                  </YStack>
                  <YStack flex={1} alignItems="center">
                    <Text fontSize={11} color="$placeholderColor">Duracion</Text>
                    <Text fontSize={13} fontWeight="600" color="$color">{details.duration}</Text>
                  </YStack>
                </XStack>

                <YStack padding={20} borderBottomWidth={1} borderBottomColor="$borderColor">
                  <Text fontSize={12} fontWeight="600" color="$colorFocus" textTransform="uppercase" letterSpacing={1} marginBottom={12}>
                    Descripcion
                  </Text>
                  <Text fontSize={14} color="$color" lineHeight={22}>
                    {details.description}
                  </Text>
                </YStack>

                <YStack padding={20}>
                  <Text fontSize={12} fontWeight="600" color="$colorFocus" textTransform="uppercase" letterSpacing={1} marginBottom={12}>
                    Componentes
                  </Text>
                  <YStack gap={10}>
                    {details.components.map((component, index) => (
                      <Pressable
                        key={index}
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? themeColors.backgroundPress : themeColors.backgroundHover,
                          padding: 14,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: themeColors.borderColor,
                        })}
                        onPress={() => handleComponentPress(component)}
                      >
                        <XStack alignItems="center" gap={12}>
                          <Text fontSize={20}>
                            {component.type === 'verbal' ? 'V' : component.type === 'somatic' ? 'S' : 'M'}
                          </Text>
                          <YStack flex={1}>
                            <Text fontSize={14} fontWeight="600" color="$color">{component.name}</Text>
                            <Text fontSize={11} color="$placeholderColor" numberOfLines={1}>
                              {component.detail}
                            </Text>
                          </YStack>
                          <Text fontSize={16} color="$color">→</Text>
                        </XStack>
                      </Pressable>
                    ))}
                  </YStack>
                </YStack>
              </ScrollView>
            ) : (
              <YStack flex={1} alignItems="center" justifyContent="center" padding={40}>
                <Text fontSize={48} marginBottom={16}>📜</Text>
                <Text fontSize={18} color="$placeholderColor" textAlign="center">
                  Selecciona un conjuro para ver su detalle
                </Text>
              </YStack>
            )}
          </YStack>

          {/* Columna 3: Placeholder o info */}
          <YStack width={280} borderLeftWidth={1} borderLeftColor="$borderColor">
            <YStack flex={1} alignItems="center" justifyContent="center" padding={20}>
              <Text fontSize={36} marginBottom={12}>✨</Text>
              <Text fontSize={14} color="$placeholderColor" textAlign="center" lineHeight={20}>
                Selecciona un componente{'\n'}para ver su detalle en el panel lateral
              </Text>
            </YStack>
          </YStack>
        </XStack>

        {/* Side Panel flotante */}
        <SidePanel
          isOpen={isOpen}
          onClose={closePanel}
          title={currentContent?.type === 'component-detail'
            ? COMPONENT_INFO[(currentContent.data?.componentType as string) ?? 'verbal']?.fullName
            : 'Detalle'
          }
        >
          {currentContent?.type === 'component-detail' && (
            <YStack gap={16} padding={4}>
              <YStack
                padding={20}
                backgroundColor="$backgroundHover"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
                alignItems="center"
              >
                <Text fontSize={48} fontWeight="bold" color="$colorFocus">
                  {COMPONENT_INFO[(currentContent.data?.componentType as string) ?? 'verbal']?.icon}
                </Text>
                <Text fontSize={14} color="$placeholderColor" marginTop={8}>
                  Para: {currentContent.data?.spellName as string}
                </Text>
              </YStack>

              <YStack
                padding={16}
                backgroundColor="$backgroundHover"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontSize={12} fontWeight="600" color="$colorFocus" textTransform="uppercase" marginBottom={8}>
                  Detalle especifico
                </Text>
                <Text fontSize={14} color="$color" fontStyle="italic">
                  {(currentContent.data?.componentDetail as string) || 'Sin detalle especifico.'}
                </Text>
              </YStack>

              <YStack
                padding={16}
                backgroundColor="$backgroundHover"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontSize={12} fontWeight="600" color="$colorFocus" textTransform="uppercase" marginBottom={8}>
                  Reglas generales
                </Text>
                <Text fontSize={14} color="$color" lineHeight={22}>
                  {COMPONENT_INFO[(currentContent.data?.componentType as string) ?? 'verbal']?.description}
                </Text>
              </YStack>
            </YStack>
          )}
        </SidePanel>
      </SidePanelContainer>
    )
  }

  // Mobile: layout original con navegacion nativa
  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding={20} borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text fontSize={24} fontWeight="bold" color="$color">Libro de Conjuros</Text>
        <Text fontSize={14} color="$placeholderColor" marginTop={4}>
          {MOCK_SPELLS.length} conjuros preparados
        </Text>
      </YStack>

      <YStack padding={16} gap={10}>
        {MOCK_SPELLS.map((spell) => (
          <Pressable
            key={spell.id}
            style={({ pressed }) => ({
              backgroundColor: pressed ? themeColors.backgroundPress : themeColors.backgroundHover,
              padding: 14,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: themeColors.borderColor,
            })}
            onPress={() => handleSpellPress(spell.id, spell.name)}
          >
            <XStack alignItems="center" gap={12}>
              <YStack
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="$actionButton"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={16} fontWeight="bold" color="#fff">{spell.level}</Text>
              </YStack>
              <YStack flex={1}>
                <Text fontSize={16} fontWeight="600" color="$color">{spell.name}</Text>
                <Text fontSize={12} color="$placeholderColor" marginTop={2}>{spell.school}</Text>
              </YStack>
              <Text fontSize={18} color="$color">→</Text>
            </XStack>
          </Pressable>
        ))}
      </YStack>

      <YStack margin={16} padding={16} backgroundColor="$uiBackgroundColor" borderRadius={8} borderWidth={1} borderColor="$borderColor">
        <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
          Pulsa un conjuro para ver su detalle.
          Desde el detalle podras navegar a los componentes del conjuro (V, S, M).
        </Text>
      </YStack>
    </ScrollView>
  )
}
