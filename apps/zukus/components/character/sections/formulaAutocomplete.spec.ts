import { describe, it, expect } from 'bun:test'
import {
  getMentionInfo,
  filterVariables,
  insertVariableInFormula,
  type VariableDefinition,
} from './formulaAutocomplete'

describe('getMentionInfo', () => {
  it('returns inactive when text has no @', () => {
    const result = getMentionInfo('hello world')
    expect(result.active).toBe(false)
  })

  it('returns inactive when text is empty', () => {
    const result = getMentionInfo('')
    expect(result.active).toBe(false)
  })

  it('returns active when text ends with @', () => {
    const result = getMentionInfo('@')
    expect(result.active).toBe(true)
    expect(result.atPosition).toBe(0)
    expect(result.searchTerm).toBe('')
  })

  it('returns active with searchTerm when typing after @', () => {
    const result = getMentionInfo('@str')
    expect(result.active).toBe(true)
    expect(result.atPosition).toBe(0)
    expect(result.searchTerm).toBe('str')
  })

  it('returns inactive when there is a space after @', () => {
    const result = getMentionInfo('@variable ')
    expect(result.active).toBe(false)
  })

  it('handles @ in the middle of text', () => {
    const result = getMentionInfo('1d20 + @str')
    expect(result.active).toBe(true)
    expect(result.atPosition).toBe(7)
    expect(result.searchTerm).toBe('str')
  })

  it('uses the last @ when there are multiple', () => {
    const result = getMentionInfo('@foo + @bar')
    expect(result.active).toBe(true)
    expect(result.atPosition).toBe(7)
    expect(result.searchTerm).toBe('bar')
  })

  it('returns inactive when last @ has space after it', () => {
    const result = getMentionInfo('@foo + @bar ')
    expect(result.active).toBe(false)
  })

  it('converts searchTerm to lowercase', () => {
    const result = getMentionInfo('@STR')
    expect(result.searchTerm).toBe('str')
  })
})

describe('filterVariables', () => {
  const testVariables: VariableDefinition[] = [
    { id: 'ability.strength.modifier', displayName: 'Strength Modifier', category: 'Abilities', value: 3 },
    { id: 'ability.dexterity.modifier', displayName: 'Dexterity Modifier', category: 'Abilities', value: 2 },
    { id: 'bab.total', displayName: 'Base Attack Bonus', category: 'Combat', value: 5 },
  ]

  it('returns all variables sorted alphabetically when searchTerm is empty', () => {
    const result = filterVariables(testVariables, '')
    expect(result).toHaveLength(3)
    expect(result[0].displayName).toBe('Base Attack Bonus')
    expect(result[1].displayName).toBe('Dexterity Modifier')
    expect(result[2].displayName).toBe('Strength Modifier')
  })

  it('filters by displayName', () => {
    const result = filterVariables(testVariables, 'strength')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ability.strength.modifier')
  })

  it('filters by id', () => {
    const result = filterVariables(testVariables, 'bab')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('bab.total')
  })

  it('matches partial strings', () => {
    const result = filterVariables(testVariables, 'mod')
    expect(result).toHaveLength(2)
  })

  it('returns empty array when no matches', () => {
    const result = filterVariables(testVariables, 'xyz')
    expect(result).toHaveLength(0)
  })

  it('is case insensitive', () => {
    const result = filterVariables(testVariables, 'STRENGTH')
    expect(result).toHaveLength(1)
  })
})

describe('insertVariableInFormula', () => {
  it('returns original formula when mention is not active', () => {
    const mentionInfo = { active: false, atPosition: 0, searchTerm: '' }
    const result = insertVariableInFormula('hello', mentionInfo, 'foo')
    expect(result).toBe('hello')
  })

  it('inserts variable replacing @ and searchTerm', () => {
    const mentionInfo = { active: true, atPosition: 0, searchTerm: 'str' }
    const result = insertVariableInFormula('@str', mentionInfo, 'ability.strength.modifier')
    expect(result).toBe('@ability.strength.modifier ')
  })

  it('preserves text before @', () => {
    const mentionInfo = { active: true, atPosition: 7, searchTerm: 'str' }
    const result = insertVariableInFormula('1d20 + @str', mentionInfo, 'ability.strength.modifier')
    expect(result).toBe('1d20 + @ability.strength.modifier ')
  })

  it('preserves text after the mention', () => {
    const mentionInfo = { active: true, atPosition: 0, searchTerm: '' }
    const result = insertVariableInFormula('@ + 5', mentionInfo, 'level')
    expect(result).toBe('@level  + 5')
  })

  it('handles empty searchTerm (just @)', () => {
    const mentionInfo = { active: true, atPosition: 0, searchTerm: '' }
    const result = insertVariableInFormula('@', mentionInfo, 'level')
    expect(result).toBe('@level ')
  })

  it('adds space after variable to close autocomplete', () => {
    const mentionInfo = { active: true, atPosition: 0, searchTerm: '' }
    const result = insertVariableInFormula('@', mentionInfo, 'foo')
    expect(result.endsWith(' ')).toBe(true)
  })
})
