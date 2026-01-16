import { ScrollView, StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'
import { useTheme } from '../../../ui'

export function NotesSection() {
  const { themeColors } = useTheme()

  const notes = [
    {
      title: 'Current Quest',
      content: 'Investigate the disappearance of arcane scholars in the city. Several mages have gone missing over the past month.',
      date: 'Today',
    },
    {
      title: 'Important NPCs',
      content: 'Elara Moonwhisper - High Elf merchant who provided info about the Lost Library. Owes us a favor.',
      date: 'Yesterday',
    },
    {
      title: 'Loot to Sell',
      content: '3 × Ruby gems (150gp each), Masterwork dagger, Scroll of Invisibility',
      date: '2 days ago',
    },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <YStack padding={16} gap={12}>
        <Text fontSize={18} fontWeight="700" color="$color">
          Notes
        </Text>
        {notes.map((note, index) => (
          <YStack
            key={index}
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
            gap={6}
          >
            <YStack>
              <Text fontSize={14} fontWeight="600" color="$color">
                {note.title}
              </Text>
              <Text fontSize={10} color="$placeholderColor" marginTop={2}>
                {note.date}
              </Text>
            </YStack>
            <Text fontSize={12} color="$placeholderColor" lineHeight={18}>
              {note.content}
            </Text>
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
