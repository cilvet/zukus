import { useEffect, useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import type { StandardEntity, EntitySchemaDefinition } from '@zukus/core';
import { useTheme } from '../../ui';
import { localCompendiumAdapter } from '../../infrastructure/compendiums';
import {
  useCurrentCompendiumId,
  useCurrentEntityType,
  useEntitySchema,
} from '../../ui/stores';

export type CompendiumEntityDetailProps = {
  entityId: string;
};

/**
 * Panel de detalle para una entidad de compendio.
 * Muestra todos los campos de la entidad segun su schema.
 */
export function CompendiumEntityDetail({ entityId }: CompendiumEntityDetailProps) {
  const { themeColors } = useTheme();
  const compendiumId = useCurrentCompendiumId();
  const entityType = useCurrentEntityType();
  const schema = useEntitySchema();

  const [entity, setEntity] = useState<StandardEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntity() {
      if (!compendiumId || !entityType) {
        setError('No se pudo cargar la entidad');
        setIsLoading(false);
        return;
      }

      try {
        const loadedEntity = await localCompendiumAdapter.getEntityById(
          compendiumId,
          entityType,
          entityId
        );
        setEntity(loadedEntity);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
        setIsLoading(false);
      }
    }

    loadEntity();
  }, [compendiumId, entityType, entityId]);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$accentColor" />
      </YStack>
    );
  }

  if (error || !entity) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text color="$placeholderColor" textAlign="center">
          {error || 'Entidad no encontrada'}
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <YStack gap="$4">
        {/* Header con imagen y nombre */}
        <XStack gap="$4" alignItems="flex-start">
          {entity.image && (
            <Image
              source={{ uri: entity.image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          )}
          <YStack flex={1} gap="$2">
            <Text fontSize={20} fontWeight="700" color="$color">
              {entity.name}
            </Text>
            {entity.tags && entity.tags.length > 0 && (
              <XStack gap="$2" flexWrap="wrap">
                {entity.tags.map((tag) => (
                  <YStack
                    key={tag}
                    backgroundColor="$accentBackground"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                  >
                    <Text fontSize={11} color="$accentColor">
                      {tag}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        </XStack>

        {/* Descripcion */}
        {entity.description && (
          <YStack gap="$2">
            <Text fontSize={13} fontWeight="600" color="$placeholderColor">
              Descripcion
            </Text>
            <Text fontSize={14} color="$color" lineHeight={20}>
              {entity.description}
            </Text>
          </YStack>
        )}

        {/* Campos adicionales del schema */}
        {schema && (
          <YStack gap="$3">
            {schema.fields.map((field) => {
              const value = (entity as Record<string, unknown>)[field.name];
              if (value === undefined || value === null) return null;

              // Campos ya mostrados arriba
              if (['name', 'description', 'tags', 'image', 'id', 'entityType'].includes(field.name)) {
                return null;
              }

              return (
                <YStack key={field.name} gap="$1">
                  <Text fontSize={13} fontWeight="600" color="$placeholderColor">
                    {field.description || field.name}
                  </Text>
                  <Text fontSize={14} color="$color">
                    {formatFieldValue(value, field.type)}
                  </Text>
                </YStack>
              );
            })}
          </YStack>
        )}

        {/* Efectos si los tiene */}
        {entity.changes && entity.changes.length > 0 && (
          <YStack gap="$2">
            <Text fontSize={13} fontWeight="600" color="$placeholderColor">
              Efectos ({entity.changes.length})
            </Text>
            <YStack
              backgroundColor="$accentBackground"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              {entity.changes.map((change, index) => (
                <XStack key={index} gap="$2">
                  <Text fontSize={13} color="$accentColor">
                    {change.type}
                  </Text>
                  {change.bonusTypeId && change.bonusTypeId !== 'UNTYPED' && (
                    <Text fontSize={13} color="$color">
                      ({change.bonusTypeId})
                    </Text>
                  )}
                </XStack>
              ))}
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}

/**
 * Formatea un valor de campo para mostrar.
 */
function formatFieldValue(value: unknown, type: string): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
