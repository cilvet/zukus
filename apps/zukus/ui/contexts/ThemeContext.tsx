import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { themes } from '../config/themes'

export type ThemeName =
  | 'zukus'
  | 'lightning'
  | 'coldDark'
  | 'rogue'
  | 'druid'
  | 'gruvbox'
  | 'nord'
  | 'catppuccin'
  | 'tokyoNight'
  | 'rosePine'
  | 'kanagawa'
  | 'dracula'
  | 'solarized'

export type CheckboxVariant =
  | 'diamond'
  | 'circle'
  | 'gothic'
  | 'gear'
  | 'shield'
  | 'star'

export type CheckboxColors = {
  frameBorder: string
  frameBorderActive: string
  frameBackground: string
  frameBackgroundActive: string
  gem: string
}

export type ThemeInfo = {
  name: ThemeName
  displayName: string
  checkboxVariant: CheckboxVariant
  checkboxAnimateGlow: boolean
  colors: {
    background: string
    primary: string
    accent: string
    border: string
    gem: string
  }
  checkboxColors?: CheckboxColors
}

export const AVAILABLE_THEMES: ThemeInfo[] = [
  {
    name: 'zukus',
    displayName: 'Zukus',
    checkboxVariant: 'diamond',
    checkboxAnimateGlow: false,
    colors: {
      background: '#2e1a47',
      primary: '#f3ca58',
      accent: '#a77ccb',
      border: '#6e3f97',
      gem: '#ffd700',
    },
  },
  {
    name: 'lightning',
    displayName: 'Lightning',
    checkboxVariant: 'gear',
    checkboxAnimateGlow: false,
    colors: {
      background: '#1a1a2e',
      primary: '#73d4f2',
      accent: '#5e77ed',
      border: '#5e77ed',
      gem: '#00e5ff',
    },
  },
  {
    name: 'coldDark',
    displayName: 'Cold Dark',
    checkboxVariant: 'circle',
    checkboxAnimateGlow: false,
    colors: {
      background: '#1b232b',
      primary: '#dde5f4',
      accent: '#668eab',
      border: 'rgba(177, 196, 216, 0.6)',
      gem: '#a8d4ff',
    },
    checkboxColors: {
      frameBorder: '#6a7a8a',
      frameBorderActive: '#a8c0d8',
      frameBackground: '#2a3540',
      frameBackgroundActive: '#3a4550',
      gem: '#a8d4ff',
    },
  },
  {
    name: 'rogue',
    displayName: 'Rogue',
    checkboxVariant: 'gothic',
    checkboxAnimateGlow: false,
    colors: {
      background: '#0d0d0d',
      primary: '#c4c4c4',
      accent: '#8b1a1a',
      border: '#2a2a2a',
      gem: '#ff2d2d',
    },
    checkboxColors: {
      frameBorder: '#5a5a5a',
      frameBorderActive: '#9a9a9a',
      frameBackground: '#1a1a1a',
      frameBackgroundActive: '#2d2d2d',
      gem: '#ff2d2d',
    },
  },
  {
    name: 'druid',
    displayName: 'Druid',
    checkboxVariant: 'shield',
    checkboxAnimateGlow: false,
    colors: {
      background: '#2d353b',
      primary: '#d3c6aa',
      accent: '#a7c080',
      border: '#475258',
      gem: '#7fff7f',
    },
    checkboxColors: {
      frameBorder: '#5c4033',
      frameBorderActive: '#8b6914',
      frameBackground: '#3d2817',
      frameBackgroundActive: '#4a3520',
      gem: '#7fff7f',
    },
  },
  {
    name: 'gruvbox',
    displayName: 'Gruvbox',
    checkboxVariant: 'circle',
    checkboxAnimateGlow: false,
    colors: {
      background: '#282828',
      primary: '#ebdbb2',
      accent: '#fabd2f',
      border: '#504945',
      gem: '#fe8019',
    },
  },
  {
    name: 'nord',
    displayName: 'Nord',
    checkboxVariant: 'circle',
    checkboxAnimateGlow: false,
    colors: {
      background: '#2e3440',
      primary: '#eceff4',
      accent: '#88c0d0',
      border: '#4c566a',
      gem: '#8fbcbb',
    },
  },
  {
    name: 'catppuccin',
    displayName: 'Catppuccin',
    checkboxVariant: 'circle',
    checkboxAnimateGlow: false,
    colors: {
      background: '#1e1e2e',
      primary: '#cdd6f4',
      accent: '#cba6f7',
      border: '#45475a',
      gem: '#f5c2e7',
    },
  },
  {
    name: 'tokyoNight',
    displayName: 'Tokyo Night',
    checkboxVariant: 'diamond',
    checkboxAnimateGlow: false,
    colors: {
      background: '#1a1b26',
      primary: '#c0caf5',
      accent: '#7aa2f7',
      border: '#3b4261',
      gem: '#bb9af7',
    },
  },
  {
    name: 'rosePine',
    displayName: 'Rose Pine',
    checkboxVariant: 'star',
    checkboxAnimateGlow: false,
    colors: {
      background: '#191724',
      primary: '#e0def4',
      accent: '#ebbcba',
      border: '#403d52',
      gem: '#eb6f92',
    },
  },
  {
    name: 'kanagawa',
    displayName: 'Kanagawa',
    checkboxVariant: 'diamond',
    checkboxAnimateGlow: false,
    colors: {
      background: '#1f1f28',
      primary: '#dcd7ba',
      accent: '#7e9cd8',
      border: '#54546d',
      gem: '#957fb8',
    },
  },
  {
    name: 'dracula',
    displayName: 'Dracula',
    checkboxVariant: 'gothic',
    checkboxAnimateGlow: false,
    colors: {
      background: '#282a36',
      primary: '#f8f8f2',
      accent: '#bd93f9',
      border: '#44475a',
      gem: '#ff79c6',
    },
  },
  {
    name: 'solarized',
    displayName: 'Solarized',
    checkboxVariant: 'gear',
    checkboxAnimateGlow: false,
    colors: {
      background: '#002b36',
      primary: '#839496',
      accent: '#2aa198',
      border: '#073642',
      gem: '#2aa198',
    },
  },
]

const THEME_STORAGE_KEY = '@zukus_theme'

const VALID_THEMES: ThemeName[] = [
  'zukus',
  'lightning',
  'coldDark',
  'rogue',
  'druid',
  'gruvbox',
  'nord',
  'catppuccin',
  'tokyoNight',
  'rosePine',
  'kanagawa',
  'dracula',
  'solarized',
]

function isValidTheme(value: string): value is ThemeName {
  return VALID_THEMES.includes(value as ThemeName)
}

type ThemeContextType = {
  themeName: ThemeName
  setTheme: (theme: ThemeName) => void
  themeInfo: ThemeInfo
  themeColors: typeof themes.zukus
  availableThemes: ThemeInfo[]
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  "use no memo"; // React Compiler doesn't support try/finally yet

  const [themeName, setThemeState] = useState<ThemeName>('kanagawa')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedTheme && isValidTheme(savedTheme)) {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTheme()
  }, [])

  const setTheme = useCallback(async (newTheme: ThemeName) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }, [])

  const themeInfo = useMemo(() => {
    return AVAILABLE_THEMES.find((t) => t.name === themeName) || AVAILABLE_THEMES[0]
  }, [themeName])

  const themeColors = useMemo(() => {
    return themes[themeName]
  }, [themeName])

  const value = useMemo(
    () => ({
      themeName,
      setTheme,
      themeInfo,
      themeColors,
      availableThemes: AVAILABLE_THEMES,
      isLoading,
    }),
    [themeName, setTheme, themeInfo, themeColors, isLoading]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
