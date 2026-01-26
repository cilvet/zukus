import { View, ScrollView } from 'react-native';
import { YStack, Text, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { SafeAreaBottomSpacer } from '../../components/layout';
import { EntityTypeCard } from '../../components/compendiums';
import {
  useEntityTypes,
  useCurrentCompendiumId,
  useCurrentCompendiumName,
  useIsLoading,
  useCompendiumError,
  useCompendiumActions,
} from '../../ui/stores';
import { useTheme } from '../../ui';
import { useIsDesktop } from '../../navigation';

export function EntityTypesScreen() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const isDesktop = useIsDesktop();
  const entityTypes = useEntityTypes();
  const compendiumId = useCurrentCompendiumId();
  const compendiumName = useCurrentCompendiumName();
  const isLoading = useIsLoading();
  const error = useCompendiumError();
  const { selectEntityType } = useCompendiumActions();

  const handleEntityTypePress = async (typeName: string) => {
    await selectEntityType(typeName);
    router.push(`/compendiums/${compendiumId}/${typeName}`);
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

  if (entityTypes.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$placeholderColor" textAlign="center">
            No hay tipos de entidad en este compendio
          </Text>
        </YStack>
        {!isDesktop && <SafeAreaBottomSpacer />}
      </View>
    );
  }

  const contentStyle = isDesktop
    ? { padding: 32, maxWidth: 800 }
    : { padding: 16 };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={contentStyle}>
        <YStack gap="$4">
          {isDesktop && (
            <>
              <Text fontSize={24} fontWeight="700" color="$color">
                {compendiumName}
              </Text>
              <Text fontSize={14} color="$placeholderColor" marginBottom="$2">
                Selecciona un tipo de entidad para ver su contenido
              </Text>
            </>
          )}

          <YStack gap="$2">
            {entityTypes.map((entityType) => (
              <EntityTypeCard
                key={entityType.typeName}
                typeName={entityType.typeName}
                displayName={entityType.displayName}
                count={entityType.count}
                description={entityType.description}
                onPress={() => handleEntityTypePress(entityType.typeName)}
              />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
      {!isDesktop && <SafeAreaBottomSpacer />}
    </View>
  );
}
