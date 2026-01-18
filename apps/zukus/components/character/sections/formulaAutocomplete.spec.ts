import { describe, it, expect } from 'bun:test'
import {
  getMentionInfo,
  filterVariables,
  insertVariableInFormula,
  insertTextAtCursor,
  insertParentheses,
  insertFunction,
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

describe('insertTextAtCursor', () => {
  it('inserts text at the beginning', () => {
    const result = insertTextAtCursor('world', 0, 'hello ')
    expect(result.newText).toBe('hello world')
    expect(result.newCursorPosition).toBe(6)
  })

  it('inserts text at the end', () => {
    const result = insertTextAtCursor('hello', 5, ' world')
    expect(result.newText).toBe('hello world')
    expect(result.newCursorPosition).toBe(11)
  })

  it('inserts text in the middle', () => {
    const result = insertTextAtCursor('helloworld', 5, ' ')
    expect(result.newText).toBe('hello world')
    expect(result.newCursorPosition).toBe(6)
  })

  it('inserts symbol in formula', () => {
    const result = insertTextAtCursor('1d20 5', 5, '+ ')
    expect(result.newText).toBe('1d20 + 5')
    expect(result.newCursorPosition).toBe(7)
  })

  it('handles empty text', () => {
    const result = insertTextAtCursor('', 0, '+')
    expect(result.newText).toBe('+')
    expect(result.newCursorPosition).toBe(1)
  })
})

describe('insertParentheses', () => {
  it('inserts parentheses at the beginning', () => {
    const result = insertParentheses('1 + 2', 0)
    expect(result.newText).toBe('()1 + 2')
    expect(result.newCursorPosition).toBe(1)
  })

  it('inserts parentheses at the end', () => {
    const result = insertParentheses('1 + 2', 5)
    expect(result.newText).toBe('1 + 2()')
    expect(result.newCursorPosition).toBe(6)
  })

  it('inserts parentheses in the middle', () => {
    const result = insertParentheses('1 + 2 * 3', 6)
    expect(result.newText).toBe('1 + 2 ()* 3')
    expect(result.newCursorPosition).toBe(7)
  })

  it('cursor is positioned between parentheses', () => {
    const result = insertParentheses('test', 2)
    expect(result.newText).toBe('te()st')
    expect(result.newCursorPosition).toBe(3)
    expect(result.newText[result.newCursorPosition - 1]).toBe('(')
    expect(result.newText[result.newCursorPosition]).toBe(')')
  })

  it('handles empty text', () => {
    const result = insertParentheses('', 0)
    expect(result.newText).toBe('()')
    expect(result.newCursorPosition).toBe(1)
  })
})

describe('insertFunction', () => {
  it('inserts function at the beginning', () => {
    const result = insertFunction('1 + 2', 0, 'floor')
    expect(result.newText).toBe('floor()1 + 2')
    expect(result.newCursorPosition).toBe(6)
  })

  it('inserts function at the end', () => {
    const result = insertFunction('1 + ', 4, 'ceil')
    expect(result.newText).toBe('1 + ceil()')
    expect(result.newCursorPosition).toBe(9)
  })

  it('inserts function in the middle', () => {
    const result = insertFunction('1 + 2', 4, 'abs')
    expect(result.newText).toBe('1 + abs()2')
    expect(result.newCursorPosition).toBe(8)
  })

  it('cursor is positioned between parentheses', () => {
    const result = insertFunction('test', 2, 'round')
    expect(result.newText).toBe('teround()st')
    expect(result.newCursorPosition).toBe(8)
    expect(result.newText[result.newCursorPosition - 1]).toBe('(')
    expect(result.newText[result.newCursorPosition]).toBe(')')
  })

  it('handles different function names', () => {
    const result1 = insertFunction('', 0, 'min')
    expect(result1.newText).toBe('min()')
    expect(result1.newCursorPosition).toBe(4)

    const result2 = insertFunction('', 0, 'max')
    expect(result2.newText).toBe('max()')
    expect(result2.newCursorPosition).toBe(4)
  })

  it('handles empty text', () => {
    const result = insertFunction('', 0, 'floor')
    expect(result.newText).toBe('floor()')
    expect(result.newCursorPosition).toBe(6)
  })
})
