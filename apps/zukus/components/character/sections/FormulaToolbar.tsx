import { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { XStack, Text } from 'tamagui'

type ToolbarMode = 'math' | 'functions'

type FormulaToolbarProps = {
  onInsertSymbol: (symbol: string) => void
  onInsertParentheses: () => void
  onInsertFunction: (functionName: string) => void
}

const MATH_SYMBOLS = ['@', '+', '-', '/', '*']

const FUNCTIONS = ['floor', 'ceil', 'round', 'abs', 'min', 'max']

export function FormulaToolbar({
  onInsertSymbol,
  onInsertParentheses,
  onInsertFunction,
}: FormulaToolbarProps) {
  const [mode, setMode] = useState<ToolbarMode>('math')

  const toggleMode = () => {
    setMode((prev) => (prev === 'math' ? 'functions' : 'math'))
  }

  return (
    <XStack
      backgroundColor="$backgroundHover"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      paddingVertical={8}
      paddingHorizontal={8}
      gap={8}
      alignItems="center"
    >
      {/* Toggle button */}
      <Pressable onPress={toggleMode}>
        {({ pressed }) => (
          <XStack
            paddingHorizontal={12}
            paddingVertical={8}
            backgroundColor={pressed ? '$backgroundPress' : '$background'}
            borderRadius={6}
            borderWidth={1}
            borderColor="$borderColor"
            minWidth={60}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={13} fontWeight="600" color="$color">
              {mode === 'math' ? 'ƒ(x)' : 'Math'}
            </Text>
          </XStack>
        )}
      </Pressable>

      {/* Scrollable buttons area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'math' ? (
          <>
            {MATH_SYMBOLS.map((symbol) => (
              <Pressable key={symbol} onPress={() => onInsertSymbol(symbol)}>
                {({ pressed }) => (
                  <XStack
                    paddingHorizontal={16}
                    paddingVertical={8}
                    backgroundColor={pressed ? '$backgroundPress' : '$background'}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor="$borderColor"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={16} fontWeight="500" color="$color" fontFamily="$mono">
                      {symbol}
                    </Text>
                  </XStack>
                )}
              </Pressable>
            ))}

            {/* Parentheses button with special behavior */}
            <Pressable onPress={onInsertParentheses}>
              {({ pressed }) => (
                <XStack
                  paddingHorizontal={16}
                  paddingVertical={8}
                  backgroundColor={pressed ? '$backgroundPress' : '$background'}
                  borderRadius={6}
                  borderWidth={1}
                  borderColor="$borderColor"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize={16} fontWeight="500" color="$color" fontFamily="$mono">
                    ( )
                  </Text>
                </XStack>
              )}
            </Pressable>
          </>
        ) : (
          <>
            {FUNCTIONS.map((func) => (
              <Pressable key={func} onPress={() => onInsertFunction(func)}>
                {({ pressed }) => (
                  <XStack
                    paddingHorizontal={12}
                    paddingVertical={8}
                    backgroundColor={pressed ? '$backgroundPress' : '$background'}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor="$borderColor"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={14} fontWeight="500" color="$color" fontFamily="$mono">
                      {func}()
                    </Text>
                  </XStack>
                )}
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </XStack>
  )
}
