import { useEffect } from 'react'
import { YStack, Text } from 'tamagui'
import {
  useCharacterStore,
  useCharacterBuffs,
  useDraftBuff,
  useBuffEditActions,
  BuffEditScreen,
} from '../../../../ui'
import { usePanelNavigation } from '../../../../hooks'

type Props = {
  buffId: string
}

export function BuffEditContainer({ buffId }: Props) {
  const buffs = useCharacterBuffs()
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const { openPanel, closePanel } = usePanelNavigation('character')
  const draftBuff = useDraftBuff()
  const { startEditing, save, discard } = useBuffEditActions()

  const originalBuff = buffs.find((b) => b.uniqueId === buffId)

  // Iniciar edicion si no hay draft o es de otro buff
  useEffect(() => {
    if (originalBuff && (!draftBuff || draftBuff.uniqueId !== buffId)) {
      startEditing(originalBuff)
    }
  }, [originalBuff, draftBuff, buffId, startEditing])

  // Usar el draft si existe, si no el original
  const buff = draftBuff?.uniqueId === buffId ? draftBuff : originalBuff

  if (!buff) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado</Text>
      </YStack>
    )
  }

  const handleSave = () => {
    save()
    openPanel(`buff/${buffId}`)
  }

  const handleDelete = () => {
    discard()
    deleteBuff(buffId)
    closePanel()
  }

  const handleCancel = () => {
    discard()
    openPanel(`buff/${buffId}`)
  }

  return (
    <BuffEditScreen
      buff={buff}
      onSave={handleSave}
      onDelete={handleDelete}
      onCancel={handleCancel}
    />
  )
}
