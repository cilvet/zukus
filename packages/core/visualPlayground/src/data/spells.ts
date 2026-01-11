/**
 * Import and re-export all spells from the generated file
 * This file exists to provide a cleaner import path
 */

import { allSpells as generatedSpells } from './allSpells'

export const allSpells = generatedSpells

