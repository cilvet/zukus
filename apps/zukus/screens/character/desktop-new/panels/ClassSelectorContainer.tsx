import { YStack, Text } from 'tamagui'
import {
  useCharacterStore,
  useCharacterBaseData,
} from '../../../../ui'
import {
  ClassSelectorDetail,
  updateLevelClass,
  getAvailableClasses,
} from '../../../../ui/components/character/editor'
import { usePanelNavigation } from '../../../../hooks'

type Props = {
  levelIndex: number
}

export function ClassSelectorContainer({ levelIndex }: Props) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { closePanel } = usePanelNavigation('character')

  if (!baseData || !updater) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const levelSlot = baseData.levelSlots?.[levelIndex]
  const currentClassId = levelSlot?.classId ?? null

  const handleSelectClass = (classId: string) => {
    updateLevelClass(baseData, updater, levelIndex, classId)
    closePanel()
  }

  const handleClose = () => {
    closePanel()
  }

  const availableClasses = getAvailableClasses()

  return (
    <ClassSelectorDetail
      levelIndex={levelIndex}
      currentClassId={currentClassId}
      availableClasses={availableClasses}
      onSelectClass={handleSelectClass}
      onClose={handleClose}
    />
  )
}
