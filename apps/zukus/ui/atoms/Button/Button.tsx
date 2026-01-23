import { XStack, Text } from 'tamagui'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'

type ButtonProps = {
  children: ReactNode
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
}

const sizeStyles = {
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 12,
    borderRadius: 6,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    borderRadius: 8,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    borderRadius: 10,
  },
}

/**
 * Componente Button atomico.
 * Variantes: primary (accent), secondary (outline), destructive (red), ghost (transparent)
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const styles = sizeStyles[size]

  const getBackgroundColor = () => {
    if (disabled) return '$backgroundPress'
    switch (variant) {
      case 'primary':
        return '$accent'
      case 'secondary':
        return 'transparent'
      case 'destructive':
        return '$destructiveBackground'
      case 'ghost':
        return 'transparent'
      default:
        return '$accent'
    }
  }

  const getTextColor = () => {
    if (disabled) return '$placeholderColor'
    switch (variant) {
      case 'primary':
        return '$accentContrastText'
      case 'secondary':
        return '$color'
      case 'destructive':
        return '$destructiveColor'
      case 'ghost':
        return '$color'
      default:
        return '$accentContrastText'
    }
  }

  const getBorderColor = () => {
    switch (variant) {
      case 'secondary':
        return '$borderColor'
      case 'destructive':
        return '$destructiveColor'
      default:
        return 'transparent'
    }
  }

  const getPressBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '$accentPress'
      case 'secondary':
        return '$backgroundPress'
      case 'destructive':
        return '$destructiveBackgroundHover'
      case 'ghost':
        return '$backgroundPress'
      default:
        return '$accentPress'
    }
  }

  return (
    <XStack
      paddingVertical={styles.paddingVertical}
      paddingHorizontal={styles.paddingHorizontal}
      backgroundColor={getBackgroundColor()}
      borderRadius={styles.borderRadius}
      borderWidth={variant === 'secondary' || variant === 'destructive' ? 1 : 0}
      borderColor={getBorderColor()}
      justifyContent="center"
      alignItems="center"
      opacity={disabled ? 0.5 : 1}
      pressStyle={disabled ? undefined : { backgroundColor: getPressBackgroundColor() }}
      onPress={disabled ? undefined : onPress}
      flex={fullWidth ? 1 : undefined}
      cursor={disabled ? 'not-allowed' : 'pointer'}
    >
      {typeof children === 'string' ? (
        <Text
          fontSize={styles.fontSize}
          fontWeight="600"
          color={getTextColor()}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </XStack>
  )
}
