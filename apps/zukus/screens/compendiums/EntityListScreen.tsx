import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { FontAwesome6 } from '@expo/vector-icons';
import type { StandardEntity } from '@zukus/core';
import { SafeAreaBottomSpacer, SidePanel } from '../../components/layout';
import { EntityListItem, LayoutToggle, CompendiumEntityDetail } from '../../components/compendiums';
import {
  useEntities,
  useCurrentEntityTypeName,
  useSearchQuery,
  useViewMode,
  useIsLoadingEntities,
  useCompendiumError,
  useCompendiumActions,
} from '../../ui/stores';
import { useTheme } from '../../ui';
import { useIsDesktop, useNavigateToDetail } from '../../navigation';
import { usePanelNavigation } from '../../hooks';

export function EntityListScreen() {
  const { themeColors, themeInfo } = useTheme();
  const isDesktop = useIsDesktop();
  const navigateToDetail = useNavigateToDetail('compendiums');
  const { currentPanel, isPanelOpen, closePanel } = usePanelNavigation('compendiums');

  const entities = useEntities();
  const entityTypeName = useCurrentEntityTypeName();
  const searchQuery = useSearchQuery();
  const viewMode = useViewMode();
  const isLoading = useIsLoadingEntities();
  const error = useCompendiumError();
  const { setSearchQuery, toggleViewMode } = useCompendiumActions();

  // Colores extraidos como primitivos
  const primaryColor = themeInfo.colors.primary;
  const placeholderColor = themeColors.placeholderColor;
  const backgroundColor = themeColors.background;

  // Filtrar entidades por busqueda
  const filteredEntities = searchQuery.trim()
    ? entities.filter((entity) => {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = entity.name.toLowerCase().includes(query);
        const descMatch = entity.description?.toLowerCase().includes(query);
        const tagsMatch = entity.tags?.some((tag) => tag.toLowerCase().includes(query));
        return nameMatch || descMatch || tagsMatch;
      })
    : entities;

  const handleEntityPress = (entity: StandardEntity) => {
    navigateToDetail('compendiumEntity', entity.id, entity.name);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$accentColor" />
        </YStack>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$color" textAlign="center">
            {error}
          </Text>
        </YStack>
      </View>
    );
  }

  // Extraer entityId del panel path (formato: "compendiumEntity/entityId")
  const panelEntityId = currentPanel?.path?.split('/')[1] || null;

  const listContent = (
    <View style={{ flex: 1, backgroundColor }}>
      <FlashList
        data={filteredEntities}
        renderItem={({ item }) => (
          <EntityListItem
            entity={item}
            onPress={() => handleEntityPress(item)}
            primaryColor={primaryColor}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <YStack gap="$3" paddingHorizontal={16} paddingTop={isDesktop ? 32 : 16} paddingBottom="$3">
            {isDesktop && (
              <>
                <Text fontSize={24} fontWeight="700" color="$color">
                  {entityTypeName}
                </Text>
                <Text fontSize={14} color="$placeholderColor">
                  {filteredEntities.length} entidades
                </Text>
              </>
            )}

            <XStack gap="$3" alignItems="center">
              <XStack
                flex={1}
                backgroundColor="$background"
                borderRadius={10}
                borderWidth={1}
                borderColor="$borderColor"
                paddingHorizontal={12}
                paddingVertical={8}
                alignItems="center"
                gap={8}
              >
                <FontAwesome6 name="magnifying-glass" size={14} color={placeholderColor} />
                <TextInput
                  style={[styles.searchInput, { color: themeColors.color }]}
                  placeholder="Buscar..."
                  placeholderTextColor={placeholderColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <FontAwesome6 name="xmark" size={14} color={placeholderColor} />
                  </Pressable>
                )}
              </XStack>

              <LayoutToggle viewMode={viewMode} onToggle={toggleViewMode} />
            </XStack>
          </YStack>
        }
        ListEmptyComponent={
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
            <Text color="$placeholderColor" textAlign="center">
              {searchQuery
                ? 'No se encontraron resultados'
                : 'No hay entidades en esta categoria'}
            </Text>
          </YStack>
        }
      />
      {!isDesktop && <SafeAreaBottomSpacer />}
    </View>
  );

  // Desktop con SidePanel
  if (isDesktop) {
    return (
      <XStack flex={1}>
        {listContent}
        <SidePanel
          isOpen={isPanelOpen && !!panelEntityId}
          title={currentPanel?.title || 'Detalle'}
          onClose={closePanel}
        >
          {panelEntityId && <CompendiumEntityDetail entityId={panelEntityId} />}
        </SidePanel>
      </XStack>
    );
  }

  return listContent;
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
