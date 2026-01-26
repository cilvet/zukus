import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { YStack, Text, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { SafeAreaBottomSpacer } from '../../components/layout';
import { CompendiumCard } from '../../components/compendiums';
import {
  useCompendiums,
  useIsLoading,
  useCompendiumError,
  useCompendiumActions,
} from '../../ui/stores';
import { useTheme } from '../../ui';

export function CompendiumsScreenMobile() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const compendiums = useCompendiums();
  const isLoading = useIsLoading();
  const error = useCompendiumError();
  const { loadCompendiums, selectCompendium } = useCompendiumActions();

  useEffect(() => {
    loadCompendiums();
  }, [loadCompendiums]);

  const handleCompendiumPress = async (compendiumId: string) => {
    await selectCompendium(compendiumId);
    router.push(`/compendiums/${compendiumId}`);
  };

  // Calcular total de entidades por compendio
  const getEntityCount = (compendiumId: string): number => {
    // De momento hardcoded para el ejemplo
    // En el futuro se podria obtener del compendio cargado
    return 100;
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$accentColor" />
        </YStack>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$color" textAlign="center">
            {error}
          </Text>
        </YStack>
      </View>
    );
  }

  if (compendiums.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$placeholderColor" textAlign="center">
            No hay compendios disponibles
          </Text>
        </YStack>
        <SafeAreaBottomSpacer />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <YStack gap="$3">
          {compendiums.map((compendium) => (
            <CompendiumCard
              key={compendium.id}
              id={compendium.id}
              name={compendium.name}
              entityCount={getEntityCount(compendium.id)}
              onPress={() => handleCompendiumPress(compendium.id)}
            />
          ))}
        </YStack>
      </ScrollView>
      <SafeAreaBottomSpacer />
    </View>
  );
}
