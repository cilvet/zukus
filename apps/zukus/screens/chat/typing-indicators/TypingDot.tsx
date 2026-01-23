import { useTheme, type ThemeName } from '../../../ui'
import { ArcaneDotMini } from './ArcaneDotMini'
import { EmberDotMini } from './EmberDotMini'
import { FrostDotMini } from './FrostDotMini'
import { VerdantDotMini } from './VerdantDotMini'
import { DefaultDotMini } from './DefaultDotMini'

// =============================================================================
// DOT SIZE
// =============================================================================
// Change this value to resize all typing indicator dots at once.
// All dot components scale proportionally based on this size.
// =============================================================================
const DOT_SIZE = 33

// Mapping from theme name to its corresponding dot style
// Themes not listed here will use the DefaultDotMini with the theme's accent color
type DotType = 'frost' | 'ember' | 'arcane' | 'verdant'

const THEME_DOT_MAP: Partial<Record<ThemeName, DotType>> = {
  // Frost (cold, icy themes)
  coldDark: 'frost',
  nord: 'frost',

  // Ember (warm, fiery themes)
  rogue: 'ember',
  gruvbox: 'ember',

  // Arcane (magical, mystical themes)
  zukus: 'arcane',
  catppuccin: 'arcane',
  tokyoNight: 'arcane',
  rosePine: 'arcane',
  kanagawa: 'arcane',
  dracula: 'arcane',

  // Verdant (natural, green themes)
  druid: 'verdant',
}

function ThemedDot({ themeName, accentColor }: { themeName: ThemeName; accentColor: string }) {
  const dotType = THEME_DOT_MAP[themeName]

  switch (dotType) {
    case 'frost':
      return <FrostDotMini size={DOT_SIZE} />
    case 'ember':
      return <EmberDotMini size={DOT_SIZE} />
    case 'arcane':
      return <ArcaneDotMini size={DOT_SIZE} />
    case 'verdant':
      return <VerdantDotMini size={DOT_SIZE} />
    default:
      return <DefaultDotMini color={accentColor} size={DOT_SIZE} />
  }
}

export function TypingDot() {
  const { themeName, themeInfo } = useTheme()

  return <ThemedDot themeName={themeName} accentColor={themeInfo.colors.accent} />
}
