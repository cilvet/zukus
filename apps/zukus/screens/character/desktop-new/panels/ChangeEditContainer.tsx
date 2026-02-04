import { YStack, Text } from 'tamagui'
import {
  useDraftBuff,
  useBuffEditActions,
  ChangeEditScreen,
} from '../../../../ui'
import { usePanelNavigation } from '../../../../hooks'

type Props = {
  changeId: string
}

export function ChangeEditContainer({ changeId }: Props) {
  const { openPanel } = usePanelNavigation('character')
  const draftBuff = useDraftBuff()
  const { updateChange, addChange, deleteChange } = useBuffEditActions()

  // Parsear el id: buffId:changeIndex o buffId:new
  const [buffId, indexStr] = changeId.split(':')
  const isNew = indexStr === 'new'
  const changeIndex = isNew ? -1 : parseInt(indexStr, 10)

  // Leer del draft (ya deberia estar inicializado desde BuffEditContainer)
  if (!draftBuff || draftBuff.uniqueId !== buffId) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado en edicion</Text>
      </YStack>
    )
  }

  const changes = draftBuff.changes ?? []
  const change = isNew ? null : changes[changeIndex]

  if (!isNew && !change) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Change no encontrado</Text>
      </YStack>
    )
  }

  type AnyChange = NonNullable<typeof draftBuff.changes>[number]

  const handleSave = (updatedChange: AnyChange) => {
    if (isNew) {
      addChange(updatedChange)
    } else {
      updateChange(changeIndex, updatedChange)
    }
    openPanel(`buffEdit/${buffId}`)
  }

  const handleDelete = () => {
    deleteChange(changeIndex)
    openPanel(`buffEdit/${buffId}`)
  }

  const handleCancel = () => {
    openPanel(`buffEdit/${buffId}`)
  }

  return (
    <ChangeEditScreen
      change={change ?? null}
      isNew={isNew}
      onSave={handleSave}
      onDelete={isNew ? undefined : handleDelete}
      onCancel={handleCancel}
    />
  )
}
