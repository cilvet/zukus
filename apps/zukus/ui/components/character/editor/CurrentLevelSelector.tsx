import { XStack, Text, YStack, Select } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export type CurrentLevelSelectorProps = {
  currentLevel: number
  onLevelChange: (newLevel: number) => void
}

export function CurrentLevelSelector({
  currentLevel,
  onLevelChange,
}: CurrentLevelSelectorProps) {
  // Generar opciones de nivel 1-20
  const levelOptions = Array.from({ length: 20 }, (_, i) => i + 1)

  const handleLevelChange = (value: string) => {
    const newLevel = parseInt(value, 10)
    if (!isNaN(newLevel) && newLevel >= 1 && newLevel <= 20) {
      onLevelChange(newLevel)
    }
  }

  return (
    <YStack
      gap="$2"
      padding="$3"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$2"
      backgroundColor="$background"
    >
      <Text fontSize={16} fontWeight="700" color="$color">
        Current Character Level
      </Text>
      <Select
        value={currentLevel.toString()}
        onValueChange={handleLevelChange}
        disablePreventBodyScroll
      >
        <Select.Trigger width={200} iconAfter={<FontAwesome name="chevron-down" size={16} />}>
          <Select.Value placeholder="Select level" />
        </Select.Trigger>

        <Select.Adapt when="sm" platform="touch">
          <Select.Sheet modal dismissOnSnapToBottom>
            <Select.Sheet.Frame>
              <Select.Sheet.ScrollView>
                <Select.Adapt.Contents />
              </Select.Sheet.ScrollView>
            </Select.Sheet.Frame>
            <Select.Sheet.Overlay />
          </Select.Sheet>
        </Select.Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton />
          <Select.Viewport>
            {levelOptions.map((level) => (
              <Select.Item key={level} index={level - 1} value={level.toString()}>
                <Select.ItemText>Level {level}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <FontAwesome name="check" size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
    </YStack>
  )
}
