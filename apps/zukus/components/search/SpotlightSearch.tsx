'use no memo'

import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'
import { useCompendiumContext } from '../../ui/components/EntityProvider/CompendiumContext'
import { createCompendiumSearchProvider } from './providers/compendiumSearchProvider'
import { useSpotlightSearch } from './useSpotlightSearch'
import { SearchResultRow } from './SearchResultRow'
import type { SearchResult } from './types'

type SpotlightSearchProps = {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (result: SearchResult) => void
}

export function SpotlightSearch({ isOpen, onClose, onSelectResult }: SpotlightSearchProps) {
  const { getAllEntitiesFromAllTypes } = useCompendiumContext()
  const { themeColors } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<any>(null)

  const entities = getAllEntitiesFromAllTypes()
  const provider = createCompendiumSearchProvider(entities)

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedFromMouse,
    selectionSource,
    handleKeyDown,
  } = useSpotlightSearch({
    providers: [provider],
    onSelect: onSelectResult,
    onClose,
  })

  // Focus the raw input when opened, clear query when closed
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    } else {
      setQuery('')
    }
  }, [isOpen, setQuery])

  // Scroll selected result into view — ONLY on keyboard-driven changes
  useEffect(() => {
    if (selectionSource.current !== 'keyboard') return
    if (!scrollRef.current || results.length === 0) return

    const rowHeight = 52
    const visibleHeight = 400
    const targetTop = selectedIndex * rowHeight
    const targetBottom = targetTop + rowHeight
    const node = scrollRef.current as any
    const currentScroll = node.scrollTop ?? 0

    if (targetBottom > currentScroll + visibleHeight) {
      node.scrollTo?.({ y: targetBottom - visibleHeight, animated: false })
    } else if (targetTop < currentScroll) {
      node.scrollTo?.({ y: targetTop, animated: false })
    }
  }, [selectedIndex, results.length, selectionSource])

  if (!isOpen || Platform.OS !== 'web') return null

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={10000}
      onPress={onClose}
    >
      {/* Backdrop */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.5)"
      />

      {/* Dialog */}
      <YStack
        alignSelf="center"
        top="15%"
        width="100%"
        maxWidth={520}
        backgroundColor="$uiBackgroundColorDark"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$4"
        overflow="hidden"
        onPress={(e: any) => e.stopPropagation()}
        {...(Platform.OS === 'web'
          ? { style: { boxShadow: '0 16px 48px rgba(0,0,0,0.4)' } as any }
          : {})}
      >
        {/* Input section — raw <input> for direct onKeyDown control */}
        <XStack
          alignItems="center"
          paddingHorizontal="$3"
          height={50}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          gap="$2"
        >
          <FontAwesome6 name="magnifying-glass" size={16} color={themeColors.placeholderColor} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar en el compendio..."
            autoFocus
            style={{
              flex: 1,
              fontSize: 14,
              color: themeColors.color,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 4px',
              fontFamily: 'Roboto, sans-serif',
            }}
          />
          <XStack
            backgroundColor="$borderColor"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$1"
          >
            <Text fontSize={10} color="$placeholderColor" fontWeight="600">
              ESC
            </Text>
          </XStack>
        </XStack>

        {/* Results section */}
        <ScrollView ref={scrollRef} maxHeight={400} padding="$1">
          {query.trim() === '' ? (
            <YStack padding="$4" alignItems="center">
              <Text color="$placeholderColor" fontSize="$2">
                Escribe para buscar...
              </Text>
            </YStack>
          ) : results.length === 0 ? (
            <YStack padding="$4" alignItems="center">
              <Text color="$placeholderColor" fontSize="$2">
                Sin resultados
              </Text>
            </YStack>
          ) : (
            results.map((result, index) => (
              <SearchResultRow
                key={result.id}
                result={result}
                isSelected={index === selectedIndex}
                onSelect={() => onSelectResult(result)}
                onHover={() => {
                  if (index !== selectedIndex) setSelectedFromMouse(index)
                }}
              />
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <XStack
          height={32}
          borderTopWidth={1}
          borderTopColor="$borderColor"
          alignItems="center"
          paddingHorizontal="$2"
        >
          <Text color="$placeholderColor" fontSize="$1">
            {'↑↓/Tab Navegar  ·  ↵ Abrir  ·  Esc Cerrar'}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  )
}
