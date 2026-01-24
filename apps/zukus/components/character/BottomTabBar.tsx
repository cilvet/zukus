import { useState } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import type { CharacterPage } from './data'
import { MoreOptionsSheet } from './MoreOptionsSheet'
import { SafeAreaBottomSpacer } from '../layout'

type BottomTabBarProps = {
  pages: CharacterPage[]
  currentPage: number
  onPageChange: (index: number) => void
}

const MAX_VISIBLE_TABS = 4
const TAB_HEIGHT = 56

/**
 * Barra de tabs inferior para el CharacterScreen.
 * Muestra maximo 4 tabs + "More" si hay mas de 5 paginas.
 */
export function BottomTabBar({ pages, currentPage, onPageChange }: BottomTabBarProps) {
  const { themeColors } = useTheme()
  const [moreSheetVisible, setMoreSheetVisible] = useState(false)

  const needsMoreButton = pages.length > MAX_VISIBLE_TABS + 1
  const visiblePages = needsMoreButton ? pages.slice(0, MAX_VISIBLE_TABS) : pages
  const hiddenPages = needsMoreButton ? pages.slice(MAX_VISIBLE_TABS) : []

  // Determinar si la pagina actual esta en las ocultas
  const isCurrentInHidden = currentPage >= MAX_VISIBLE_TABS && needsMoreButton

  function handleTabPress(index: number) {
    onPageChange(index)
  }

  function handleMorePress() {
    setMoreSheetVisible(true)
  }

  function handleSelectHidden(index: number) {
    onPageChange(index)
    setMoreSheetVisible(false)
  }

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.tabBarBackground,
            borderTopColor: themeColors.tabBarBorder,
          },
        ]}
      >
        <View style={styles.tabsRow}>
          {visiblePages.map((page, index) => {
            const isActive = currentPage === index
            const color = isActive ? themeColors.tabBarActive : themeColors.tabBarInactive
            return (
              <Pressable
                key={page.key}
                onPress={() => handleTabPress(index)}
                style={styles.tab}
              >
                {({ pressed }) => (
                  <View style={[styles.tabContent, pressed && styles.tabPressed]}>
                    <FontAwesome name={page.icon} size={22} color={color} />
                    <Text style={[styles.tabLabel, { color }]}>
                      {page.label}
                    </Text>
                    {isActive && (
                      <View
                        style={[styles.activeIndicator, { backgroundColor: themeColors.tabBarActive }]}
                      />
                    )}
                  </View>
                )}
              </Pressable>
            )
          })}

          {needsMoreButton && (
            <Pressable onPress={handleMorePress} style={styles.tab}>
              {({ pressed }) => {
                const color = isCurrentInHidden ? themeColors.tabBarActive : themeColors.tabBarInactive
                return (
                  <View style={[styles.tabContent, pressed && styles.tabPressed]}>
                    <FontAwesome name="ellipsis-h" size={22} color={color} />
                    <Text style={[styles.tabLabel, { color }]}>
                      Mas
                    </Text>
                    {isCurrentInHidden && (
                      <View
                        style={[styles.activeIndicator, { backgroundColor: themeColors.tabBarActive }]}
                      />
                    )}
                  </View>
                )
              }}
            </Pressable>
          )}
        </View>
      </View>
      <SafeAreaBottomSpacer />

      <MoreOptionsSheet
        visible={moreSheetVisible}
        pages={hiddenPages}
        currentPage={currentPage}
        startIndex={MAX_VISIBLE_TABS}
        onSelect={handleSelectHidden}
        onClose={() => setMoreSheetVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
  },
  tab: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabPressed: {
    opacity: 0.7,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 1.5,
  },
})
