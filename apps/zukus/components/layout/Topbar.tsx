import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'
import { useRouter, usePathname } from 'expo-router'
import { themes } from '../../ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

type NavItem = {
  label: string
  href: string
  matchPath: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Mis personajes', href: '/(tabs)/(character)', matchPath: '(character)' },
  { label: 'Chat', href: '/chat', matchPath: 'chat' },
  { label: 'Mis compendios', href: '/(tabs)/(compendiums)', matchPath: '(compendiums)' },
  { label: 'Ajustes', href: '/(tabs)/(settings)', matchPath: '(settings)' },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const router = useRouter()

  const handlePress = () => {
    router.push(item.href as any)
  }

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <XStack
          paddingHorizontal={16}
          paddingVertical={8}
          borderRadius={4}
          backgroundColor={pressed ? theme.backgroundHover : 'transparent'}
        >
          <Text
            fontSize={14}
            fontWeight={isActive ? '700' : '400'}
            color={isActive ? theme.color : theme.placeholderColor}
            letterSpacing={0.5}
          >
            {item.label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

export function Topbar() {
  const pathname = usePathname()

  return (
    <XStack
      height={56}
      paddingHorizontal={24}
      alignItems="center"
      backgroundColor={theme.background}
      borderBottomWidth={1}
      borderBottomColor={theme.borderColor}
    >
      {/* Logo / Brand + Navigation Links */}
      <XStack alignItems="center" gap={24}>
        <Text
          fontSize={20}
          fontWeight="800"
          color={theme.color}
          letterSpacing={1}
        >
          ZUKUS
        </Text>
        <XStack alignItems="center" gap={8}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.includes(item.matchPath)
            return <NavLink key={item.href} item={item} isActive={isActive} />
          })}
        </XStack>
      </XStack>
    </XStack>
  )
}
