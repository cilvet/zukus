import { useRef, useEffect, useState, useCallback } from 'react'
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  StyleSheet,
  Text as RNText,
  View as RNView,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native'
import { XStack, View } from 'tamagui'
import { FormulaChip } from './FormulaChip'
import {
  type FormulaToken,
  getVariableChipDisplay,
  deleteAtPosition,
  insertTextInTokens,
} from './formulaAutocomplete'

type TokenizedFormulaInputProps = {
  tokens: FormulaToken[]
  onTokensChange: (tokens: FormulaToken[], cursorPosition: number) => void
  cursorPosition: number
  onCursorChange: (position: number) => void
  placeholder?: string
  autoFocus?: boolean
}

type ElementLayout = {
  x: number
  y: number
  width: number
  height: number
  visualStart: number
  visualEnd: number
  type: 'text' | 'chip'
}

export function TokenizedFormulaInput({
  tokens,
  onTokensChange,
  cursorPosition,
  onCursorChange,
  placeholder = 'Type @ to insert variables',
  autoFocus = false,
}: TokenizedFormulaInputProps) {
  const hiddenInputRef = useRef<TextInput>(null)
  const [isFocused, setIsFocused] = useState(false)
  const elementLayoutsRef = useRef<Map<string, ElementLayout>>(new Map())

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        hiddenInputRef.current?.focus()
      }, 100)
    }
  }, [autoFocus])

  // Clear layouts when tokens change structurally
  useEffect(() => {
    elementLayoutsRef.current.clear()
  }, [tokens.length])

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const key = e.nativeEvent.key

    if (key === 'Backspace') {
      const result = deleteAtPosition(tokens, cursorPosition)
      onTokensChange(result.tokens, result.newCursorPosition)
      onCursorChange(result.newCursorPosition)
    }
  }

  const handleTextInput = (text: string) => {
    if (text.length > 0) {
      const result = insertTextInTokens(tokens, cursorPosition, text)
      onTokensChange(result.tokens, result.newCursorPosition)
      onCursorChange(result.newCursorPosition)
    }
  }

  const handleElementLayout = useCallback(
    (
      key: string,
      event: LayoutChangeEvent,
      visualStart: number,
      visualEnd: number,
      type: 'text' | 'chip'
    ) => {
      const { x, y, width, height } = event.nativeEvent.layout
      elementLayoutsRef.current.set(key, {
        x,
        y,
        width,
        height,
        visualStart,
        visualEnd,
        type,
      })
    },
    []
  )

  const handleTap = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent

    // Always focus the hidden input
    hiddenInputRef.current?.focus()

    const layouts = Array.from(elementLayoutsRef.current.values())
    if (layouts.length === 0) {
      return
    }

    // Find element that contains the tap point
    let tappedElement: ElementLayout | null = null
    for (const layout of layouts) {
      const inXBounds = locationX >= layout.x && locationX <= layout.x + layout.width
      const inYBounds = locationY >= layout.y && locationY <= layout.y + layout.height
      if (inXBounds && inYBounds) {
        tappedElement = layout
        break
      }
    }

    let newCursorPos: number

    if (tappedElement) {
      if (tappedElement.type === 'chip') {
        // For chips: left half = before, right half = after
        const midpoint = tappedElement.x + tappedElement.width / 2
        newCursorPos = locationX < midpoint
          ? tappedElement.visualStart
          : tappedElement.visualEnd
      } else {
        // For text: proportional calculation
        const relativeX = locationX - tappedElement.x
        const proportion = Math.max(0, Math.min(1, relativeX / tappedElement.width))
        const textLength = tappedElement.visualEnd - tappedElement.visualStart
        const charOffset = Math.round(proportion * textLength)
        newCursorPos = tappedElement.visualStart + charOffset
      }
    } else {
      // Tap outside all elements - find closest by line, then position
      // Sort layouts by y (line), then x
      const sortedLayouts = layouts.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 10) {
          return a.x - b.x
        }
        return a.y - b.y
      })

      // Find the line closest to tap Y
      const lineThreshold = 30
      const sameLine = sortedLayouts.filter(
        (l) => Math.abs(locationY - (l.y + l.height / 2)) < lineThreshold
      )

      if (sameLine.length > 0) {
        // Find closest element on this line
        const first = sameLine[0]
        const last = sameLine[sameLine.length - 1]

        if (locationX < first.x) {
          // Before first element
          newCursorPos = first.visualStart
        } else if (locationX > last.x + last.width) {
          // After last element
          newCursorPos = last.visualEnd
        } else {
          // Between elements - find the gap
          for (let i = 0; i < sameLine.length - 1; i++) {
            const current = sameLine[i]
            const next = sameLine[i + 1]
            if (locationX >= current.x + current.width && locationX <= next.x) {
              // In the gap - go to end of current or start of next based on proximity
              const gapMid = (current.x + current.width + next.x) / 2
              newCursorPos = locationX < gapMid ? current.visualEnd : next.visualStart
              break
            }
          }
          // Fallback to last element
          newCursorPos = last.visualEnd
        }
      } else {
        // No elements on this line - go to end of last element
        const lastLayout = sortedLayouts[sortedLayouts.length - 1]
        newCursorPos = lastLayout?.visualEnd ?? 0
      }
    }

    onCursorChange(newCursorPos)
  }

  const renderTokens = () => {
    if (tokens.length === 0) {
      return (
        <>
          {isFocused && <RNView key="cursor-empty" style={styles.cursor} />}
          {!isFocused && (
            <RNText style={styles.placeholder}>{placeholder}</RNText>
          )}
        </>
      )
    }

    const elements: React.ReactNode[] = []
    let visualPos = 0
    let cursorRendered = false

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'text') {
        const textLength = token.value.length
        const tokenVisualStart = visualPos

        // Check if cursor is within this token
        const cursorInThisToken =
          isFocused &&
          !cursorRendered &&
          cursorPosition >= visualPos &&
          cursorPosition < visualPos + textLength

        if (cursorInThisToken) {
          const cursorOffset = cursorPosition - visualPos
          const beforeCursor = token.value.slice(0, cursorOffset)
          const afterCursor = token.value.slice(cursorOffset)

          if (beforeCursor) {
            const beforeKey = `text-${i}-before`
            const beforeStart = tokenVisualStart
            const beforeEnd = tokenVisualStart + beforeCursor.length
            elements.push(
              <RNText
                key={beforeKey}
                style={styles.text}
                onLayout={(e) =>
                  handleElementLayout(beforeKey, e, beforeStart, beforeEnd, 'text')
                }
              >
                {beforeCursor}
              </RNText>
            )
          }
          elements.push(<RNView key="cursor" style={styles.cursor} />)
          cursorRendered = true
          if (afterCursor) {
            const afterKey = `text-${i}-after`
            const afterStart = tokenVisualStart + cursorOffset
            const afterEnd = tokenVisualStart + textLength
            elements.push(
              <RNText
                key={afterKey}
                style={styles.text}
                onLayout={(e) =>
                  handleElementLayout(afterKey, e, afterStart, afterEnd, 'text')
                }
              >
                {afterCursor}
              </RNText>
            )
          }
        } else {
          const textKey = `text-${i}`
          elements.push(
            <RNText
              key={textKey}
              style={styles.text}
              onLayout={(e) =>
                handleElementLayout(
                  textKey,
                  e,
                  tokenVisualStart,
                  tokenVisualStart + textLength,
                  'text'
                )
              }
            >
              {token.value}
            </RNText>
          )
        }

        visualPos += textLength
      } else {
        // Variable chip
        const chipVisualStart = visualPos

        if (isFocused && !cursorRendered && visualPos === cursorPosition) {
          elements.push(<RNView key="cursor" style={styles.cursor} />)
          cursorRendered = true
        }

        const chipKey = `chip-${i}`
        elements.push(
          <RNView
            key={chipKey}
            onLayout={(e) =>
              handleElementLayout(chipKey, e, chipVisualStart, chipVisualStart + 1, 'chip')
            }
          >
            <FormulaChip label={getVariableChipDisplay(token)} />
          </RNView>
        )
        visualPos++
      }
    }

    // Cursor at the very end
    if (isFocused && !cursorRendered && cursorPosition >= visualPos) {
      elements.push(<RNView key="cursor" style={styles.cursor} />)
    }

    return elements
  }

  return (
    <RNView
      style={[styles.container, isFocused && styles.containerFocused]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={handleTap}
    >
      <XStack flexWrap="wrap" alignItems="center">
        {renderTokens()}
      </XStack>

      {/* Hidden input for keyboard capture */}
      <TextInput
        ref={hiddenInputRef}
        style={styles.hiddenInput}
        onKeyPress={handleKeyPress}
        onChangeText={handleTextInput}
        value=""
        autoCorrect={false}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </RNView>
  )
}

TokenizedFormulaInput.displayName = 'TokenizedFormulaInput'

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  containerFocused: {
    borderColor: 'rgba(100, 149, 237, 0.5)',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
  cursor: {
    width: 2,
    height: 20,
    backgroundColor: '#6495ED',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
})
