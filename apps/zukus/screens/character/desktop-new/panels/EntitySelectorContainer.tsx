import { YStack, Text } from 'tamagui'
import { EntitySelectorDetail } from '../../../../ui/components/EntityProvider'
import type { ProviderLocation } from '@zukus/core'

type Props = {
  locationJson: string
}

export function EntitySelectorContainer({ locationJson }: Props) {
  // Parse the provider location from JSON
  let providerLocation: ProviderLocation | null = null
  try {
    providerLocation = JSON.parse(locationJson)
  } catch {
    // Invalid JSON
  }

  if (!providerLocation) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Invalid provider location</Text>
      </YStack>
    )
  }

  return <EntitySelectorDetail providerLocation={providerLocation} />
}
