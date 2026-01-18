import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Button, Input, Text, YStack } from 'tamagui'
import { useAuth } from '../../contexts'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signIn(email.trim(), password)
      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <YStack flex={1} justifyContent="center" padding="$6" gap="$4" backgroundColor="$background">
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$color">
          Iniciar sesion
        </Text>
        <Text fontSize={13} color="$placeholderColor">
          Accede a tus personajes en cualquier dispositivo.
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

      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Button
        chromeless
        onPress={() => router.push('/(auth)/signup')}
        padding="$2"
      >
        <Text color="$colorFocus">Crear cuenta</Text>
      </Button>
    </YStack>
  )
}
