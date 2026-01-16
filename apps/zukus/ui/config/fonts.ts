import { createFont } from '@tamagui/core'

// Roboto font for body text
export const bodyFont = createFont({
  family: 'Roboto, sans-serif',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 22,
    8: 24,
    9: 28,
    10: 32,
  },
  lineHeight: {
    1: 17,
    2: 22,
    3: 25,
    4: 26,
    5: 28,
    6: 30,
    7: 32,
    8: 34,
    9: 38,
    10: 42,
  },
  weight: {
    4: '400',
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
})

// Roboto Condensed font for headings
export const headingFont = createFont({
  family: 'Roboto Condensed, sans-serif',
  size: {
    1: 10,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 24,
    10: 28,
  },
  lineHeight: {
    1: 15,
    2: 18,
    3: 21,
    4: 23,
    5: 25,
    6: 27,
    7: 29,
    8: 31,
    9: 34,
    10: 38,
  },
  weight: {
    4: '400',
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
})

// Roboto Condensed font for labels
export const labelFont = createFont({
  family: 'Roboto Condensed, sans-serif',
  size: {
    1: 10,
    2: 11,
    3: 12,
    4: 13,
    5: 14,
    6: 15,
  },
  lineHeight: {
    1: 15,
    2: 16,
    3: 17,
    4: 18,
    5: 19,
    6: 20,
  },
  weight: {
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
})

export const fonts = {
  body: bodyFont,
  heading: headingFont,
  label: labelFont,
}
