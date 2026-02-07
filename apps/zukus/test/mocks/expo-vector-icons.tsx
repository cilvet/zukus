/**
 * Minimal @expo/vector-icons mock.
 */
import React from 'react'

function createIconMock(displayName: string) {
  const Icon = ({ name, size, color, ...props }: any) => (
    <span data-testid={`icon-${name}`} data-icon-name={name} {...props} />
  )
  Icon.displayName = displayName
  return Icon
}

export const FontAwesome6 = createIconMock('FontAwesome6')
export const FontAwesome5 = createIconMock('FontAwesome5')
export const FontAwesome = createIconMock('FontAwesome')
export const MaterialIcons = createIconMock('MaterialIcons')
export const MaterialCommunityIcons = createIconMock('MaterialCommunityIcons')
export const Ionicons = createIconMock('Ionicons')
export const Feather = createIconMock('Feather')
export const Entypo = createIconMock('Entypo')
