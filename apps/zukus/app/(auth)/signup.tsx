import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Button, Input, Text, YStack } from 'tamagui'
import { useAuth } from '../../contexts'

export default function SignupScreen() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signUp(email.trim(), password)
      setIsSuccess(true)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear cuenta'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <YStack flex={1} justifyContent="center" padding="$6" gap="$4" backgroundColor="$background">
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$color">
          Crear cuenta
        </Text>
        <Text fontSize={13} color="$placeholderColor">
          Registra tu email para sincronizar personajes.
        </Text>
      </YStack>

      <YStack gap="$3">
        <Input
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Contrasena"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </YStack>

      {error ? (
        <Text fontSize={12} color="$colorFocus">
          {error}
        </Text>
      ) : null}

      {isSuccess ? (
        <Text fontSize={12} color="$placeholderColor">
          Cuenta creada. Revisa tu email si hay confirmacion activa.
        </Text>
      ) : null}

      <Button onPress={handleSignup} disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear cuenta'}
      </Button>

      <Button chromeless onPress={() => router.back()} padding="$2">
        <Text color="$colorFocus">Volver a login</Text>
      </Button>
    </YStack>
  )
}
