/**
 * Test helper that wraps components in a ThemeProvider.
 */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '../../ui/contexts/ThemeContext'

export function renderWithTheme(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    ...options,
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  })
}
