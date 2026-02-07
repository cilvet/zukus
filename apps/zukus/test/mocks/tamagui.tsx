/**
 * Minimal Tamagui mock for web testing.
 * Maps styled components to basic HTML elements with forwarded props.
 */
import React from 'react'
import type { ReactNode } from 'react'

function createMockComponent(displayName: string, Element: string = 'div') {
  const Component = React.forwardRef<any, any>(({ children, ...props }, ref) => {
    // Filter out Tamagui-specific props, pass through standard HTML + data/aria props
    const htmlProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(props)) {
      if (
        key.startsWith('data-') ||
        key.startsWith('aria-') ||
        ['id', 'className', 'style', 'role', 'onClick', 'onPress', 'testID'].includes(key)
      ) {
        if (key === 'onPress') {
          htmlProps.onClick = value
        } else if (key === 'testID') {
          htmlProps['data-testid'] = value
        } else {
          htmlProps[key] = value
        }
      }
    }
    return React.createElement(Element, { ref, ...htmlProps }, children)
  })
  Component.displayName = displayName
  return Component
}

// Layout
export const YStack = createMockComponent('YStack')
export const XStack = createMockComponent('XStack')
export const ZStack = createMockComponent('ZStack')
export const Stack = createMockComponent('Stack')

// Typography
export const Text = createMockComponent('Text', 'span')
export const Paragraph = createMockComponent('Paragraph', 'p')
export const Heading = createMockComponent('Heading', 'h2')
export const Label = createMockComponent('Label', 'label')
export const SizableText = createMockComponent('SizableText', 'span')

// Input
export const Input = createMockComponent('Input', 'input')
export const TextArea = createMockComponent('TextArea', 'textarea')

// Other
export const Image = createMockComponent('Image', 'img')
export const ScrollView = createMockComponent('ScrollView')
export const Separator = createMockComponent('Separator', 'hr')
export const Spinner = createMockComponent('Spinner')
export const Switch = createMockComponent('Switch')
export const Button = createMockComponent('Button', 'button')
export const Theme = ({ children }: { children: ReactNode }) => <>{children}</>
export const TamaguiProvider = ({ children }: { children: ReactNode }) => <>{children}</>

// Utilities
export function styled(Component: any, _config?: any) {
  return Component
}

export function createTamagui(_config: any) {
  return _config
}

export function getTokens() {
  return { color: {}, space: {}, size: {}, radius: {}, zIndex: {} }
}

export function useTheme() {
  return new Proxy({}, { get: (_target, prop) => ({ val: `mock-${String(prop)}`, get: () => `mock-${String(prop)}` }) })
}

export function useMedia() {
  return { sm: false, md: true, lg: true, xl: true }
}

export function createTokens(tokens: any) {
  return tokens
}

export function createFont(font: any) {
  return font
}

export function isWeb() {
  return true
}

export const Spacer = createMockComponent('Spacer')
export const View = createMockComponent('View')

// Popover mock with sub-components
const PopoverBase = createMockComponent('Popover')
const PopoverTrigger = createMockComponent('PopoverTrigger')
const PopoverContent = createMockComponent('PopoverContent')
const PopoverArrow = createMockComponent('PopoverArrow')
export const Popover = Object.assign(PopoverBase, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Arrow: PopoverArrow,
})
