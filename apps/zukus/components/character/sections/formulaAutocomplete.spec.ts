import { describe, it, expect } from 'bun:test'
import {
  getMentionInfo,
  filterVariables,
  insertVariableInFormula,
  insertTextAtCursor,
  insertParentheses,
  insertFunction,
  parseFormulaToTokens,
  tokensToFormula,
  getTokensVisualLength,
  findTokenAtPosition,
  deleteAtPosition,
  insertTextInTokens,
  insertVariableToken,
  getVariableChipDisplay,
  type VariableDefinition,
  type FormulaToken,
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

// ============================================
// Token-based Formula Tests
// ============================================

const testVariablesWithAbbr: VariableDefinition[] = [
  { id: 'ability.strength.modifier', displayName: 'Strength Modifier', abbreviation: 'STR mod', category: 'Abilities', value: 3 },
  { id: 'ability.dexterity.modifier', displayName: 'Dexterity Modifier', abbreviation: 'DEX mod', category: 'Abilities', value: 2 },
  { id: 'level', displayName: 'Character Level', abbreviation: 'Lvl', category: 'Other', value: 5 },
  { id: 'bab.total', displayName: 'Base Attack Bonus', category: 'Combat', value: 5 }, // No abbreviation
]

describe('getVariableChipDisplay', () => {
  it('returns abbreviation when available', () => {
    const token = { type: 'variable' as const, variableId: 'test', displayName: 'Test Name', abbreviation: 'TST' }
    expect(getVariableChipDisplay(token)).toBe('TST')
  })

  it('returns displayName when abbreviation is not available', () => {
    const token = { type: 'variable' as const, variableId: 'test', displayName: 'Test Name' }
    expect(getVariableChipDisplay(token)).toBe('Test Name')
  })
})

describe('parseFormulaToTokens', () => {
  it('returns empty array for empty string', () => {
    const result = parseFormulaToTokens('', testVariablesWithAbbr)
    expect(result).toHaveLength(0)
  })

  it('parses plain text without variables', () => {
    const result = parseFormulaToTokens('1d20 + 5', testVariablesWithAbbr)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'text', value: '1d20 + 5' })
  })

  it('parses a single variable', () => {
    const result = parseFormulaToTokens('@ability.strength.modifier', testVariablesWithAbbr)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('variable')
    if (result[0].type === 'variable') {
      expect(result[0].variableId).toBe('ability.strength.modifier')
      expect(result[0].displayName).toBe('Strength Modifier')
      expect(result[0].abbreviation).toBe('STR mod')
    }
  })

  it('parses text before variable', () => {
    const result = parseFormulaToTokens('1d20 + @level', testVariablesWithAbbr)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'text', value: '1d20 + ' })
    expect(result[1].type).toBe('variable')
  })

  it('parses text after variable', () => {
    const result = parseFormulaToTokens('@level + 5', testVariablesWithAbbr)
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('variable')
    expect(result[1]).toEqual({ type: 'text', value: ' + 5' })
  })

  it('parses multiple variables', () => {
    const result = parseFormulaToTokens('@level + @ability.strength.modifier', testVariablesWithAbbr)
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe('variable')
    expect(result[1]).toEqual({ type: 'text', value: ' + ' })
    expect(result[2].type).toBe('variable')
  })

  it('keeps unknown variables as text', () => {
    const result = parseFormulaToTokens('@unknown.variable', testVariablesWithAbbr)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: 'text', value: '@unknown.variable' })
  })

  it('handles variable without abbreviation', () => {
    const result = parseFormulaToTokens('@bab.total', testVariablesWithAbbr)
    expect(result).toHaveLength(1)
    if (result[0].type === 'variable') {
      expect(result[0].abbreviation).toBeUndefined()
    }
  })
})

describe('tokensToFormula', () => {
  it('returns empty string for empty tokens', () => {
    expect(tokensToFormula([])).toBe('')
  })

  it('converts text tokens', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: '1d20 + 5' }]
    expect(tokensToFormula(tokens)).toBe('1d20 + 5')
  })

  it('converts variable tokens with @ prefix', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'level', displayName: 'Character Level', abbreviation: 'Lvl' }
    ]
    expect(tokensToFormula(tokens)).toBe('@level')
  })

  it('converts mixed tokens', () => {
    const tokens: FormulaToken[] = [
      { type: 'text', value: '1d20 + ' },
      { type: 'variable', variableId: 'ability.strength.modifier', displayName: 'Strength Modifier', abbreviation: 'STR mod' },
      { type: 'text', value: ' + 5' },
    ]
    expect(tokensToFormula(tokens)).toBe('1d20 + @ability.strength.modifier + 5')
  })
})

describe('getTokensVisualLength', () => {
  it('returns 0 for empty tokens', () => {
    expect(getTokensVisualLength([])).toBe(0)
  })

  it('counts text characters', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'hello' }]
    expect(getTokensVisualLength(tokens)).toBe(5)
  })

  it('counts variable as 1 character', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'very.long.variable.id', displayName: 'Very Long Name', abbreviation: 'VLN' }
    ]
    expect(getTokensVisualLength(tokens)).toBe(1)
  })

  it('counts mixed tokens correctly', () => {
    const tokens: FormulaToken[] = [
      { type: 'text', value: 'abc' },
      { type: 'variable', variableId: 'var', displayName: 'Var' },
      { type: 'text', value: 'def' },
    ]
    expect(getTokensVisualLength(tokens)).toBe(7) // 3 + 1 + 3
  })
})

describe('findTokenAtPosition', () => {
  const tokens: FormulaToken[] = [
    { type: 'text', value: 'abc' },
    { type: 'variable', variableId: 'var', displayName: 'Var' },
    { type: 'text', value: 'def' },
  ]

  it('finds position in first text token', () => {
    const result = findTokenAtPosition(tokens, 1)
    expect(result).toEqual({ tokenIndex: 0, offsetInToken: 1 })
  })

  it('finds position at variable token', () => {
    const result = findTokenAtPosition(tokens, 3)
    expect(result).toEqual({ tokenIndex: 1, offsetInToken: 0 })
  })

  it('finds position after variable token', () => {
    const result = findTokenAtPosition(tokens, 4)
    expect(result).toEqual({ tokenIndex: 2, offsetInToken: 0 })
  })

  it('finds position in last text token', () => {
    const result = findTokenAtPosition(tokens, 6)
    expect(result).toEqual({ tokenIndex: 2, offsetInToken: 2 })
  })

  it('returns null for position beyond tokens', () => {
    const result = findTokenAtPosition(tokens, 10)
    expect(result).toBeNull()
  })
})

describe('deleteAtPosition', () => {
  it('does nothing when position is 0', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'abc' }]
    const result = deleteAtPosition(tokens, 0)
    expect(result.tokens).toEqual(tokens)
    expect(result.newCursorPosition).toBe(0)
  })

  it('deletes a character from text token', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'abc' }]
    const result = deleteAtPosition(tokens, 2)
    expect(result.tokens).toEqual([{ type: 'text', value: 'ac' }])
    expect(result.newCursorPosition).toBe(1)
  })

  it('deletes entire variable chip', () => {
    const tokens: FormulaToken[] = [
      { type: 'text', value: 'a' },
      { type: 'variable', variableId: 'var', displayName: 'Var' },
      { type: 'text', value: 'b' },
    ]
    const result = deleteAtPosition(tokens, 2) // Position right after the chip
    expect(result.tokens).toEqual([{ type: 'text', value: 'ab' }])
    expect(result.newCursorPosition).toBe(1)
  })

  it('merges adjacent text tokens after deletion', () => {
    const tokens: FormulaToken[] = [
      { type: 'text', value: 'abc' },
      { type: 'variable', variableId: 'var', displayName: 'Var' },
      { type: 'text', value: 'def' },
    ]
    const result = deleteAtPosition(tokens, 4) // Delete the chip
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toEqual({ type: 'text', value: 'abcdef' })
  })

  it('removes empty text token after deleting last character', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'a' }]
    const result = deleteAtPosition(tokens, 1)
    expect(result.tokens).toHaveLength(0)
    expect(result.newCursorPosition).toBe(0)
  })
})

describe('insertTextInTokens', () => {
  it('creates new text token in empty tokens', () => {
    const result = insertTextInTokens([], 0, 'hello')
    expect(result.tokens).toEqual([{ type: 'text', value: 'hello' }])
    expect(result.newCursorPosition).toBe(5)
  })

  it('inserts text within existing text token', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'ac' }]
    const result = insertTextInTokens(tokens, 1, 'b')
    expect(result.tokens).toEqual([{ type: 'text', value: 'abc' }])
    expect(result.newCursorPosition).toBe(2)
  })

  it('inserts text before variable token', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'var', displayName: 'Var' },
    ]
    const result = insertTextInTokens(tokens, 0, 'prefix')
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[0]).toEqual({ type: 'text', value: 'prefix' })
    expect(result.tokens[1].type).toBe('variable')
  })

  it('inserts text after variable token', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'var', displayName: 'Var' },
    ]
    const result = insertTextInTokens(tokens, 1, 'suffix')
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[0].type).toBe('variable')
    expect(result.tokens[1]).toEqual({ type: 'text', value: 'suffix' })
  })

  it('inserts text between variable tokens', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'var1', displayName: 'Var 1' },
      { type: 'variable', variableId: 'var2', displayName: 'Var 2' },
    ]
    const result = insertTextInTokens(tokens, 1, ' + ')
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].type).toBe('variable')
    expect(result.tokens[1]).toEqual({ type: 'text', value: ' + ' })
    expect(result.tokens[2].type).toBe('variable')
  })
})

describe('insertVariableToken', () => {
  const testVariable: VariableDefinition = {
    id: 'test.var',
    displayName: 'Test Variable',
    abbreviation: 'TST',
    category: 'Test',
    value: 42,
  }

  it('inserts variable in empty tokens', () => {
    const result = insertVariableToken([], 0, testVariable)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0].type).toBe('variable')
    if (result[0]?.type === 'variable') {
      expect(result.tokens[0].variableId).toBe('test.var')
    }
    expect(result.newCursorPosition).toBe(1)
  })

  it('inserts variable at end of text', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: '1 + ' }]
    const result = insertVariableToken(tokens, 4, testVariable)
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[0]).toEqual({ type: 'text', value: '1 + ' })
    expect(result.tokens[1].type).toBe('variable')
    expect(result.newCursorPosition).toBe(5)
  })

  it('splits text token when inserting in middle', () => {
    const tokens: FormulaToken[] = [{ type: 'text', value: 'abc' }]
    const result = insertVariableToken(tokens, 1, testVariable)
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0]).toEqual({ type: 'text', value: 'a' })
    expect(result.tokens[1].type).toBe('variable')
    expect(result.tokens[2]).toEqual({ type: 'text', value: 'bc' })
  })

  it('inserts variable between existing variables', () => {
    const tokens: FormulaToken[] = [
      { type: 'variable', variableId: 'var1', displayName: 'Var 1' },
      { type: 'variable', variableId: 'var2', displayName: 'Var 2' },
    ]
    const result = insertVariableToken(tokens, 1, testVariable)
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[1].type).toBe('variable')
    if (result.tokens[1].type === 'variable') {
      expect(result.tokens[1].variableId).toBe('test.var')
    }
  })
})
