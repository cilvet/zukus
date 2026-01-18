/**
 * Lógica de autocompletado de fórmulas.
 * Funciones puras y testeables.
 */

export type VariableDefinition = {
  id: string
  displayName: string
  abbreviation?: string
  category: string
  value: number
}

// ============================================
// Token-based Formula Model
// ============================================

export type TextToken = {
  type: 'text'
  value: string
}

export type VariableToken = {
  type: 'variable'
  variableId: string
  displayName: string
  abbreviation?: string
}

export type FormulaToken = TextToken | VariableToken

/**
 * Obtiene el texto a mostrar para un chip de variable.
 * Usa la abreviatura si está disponible, sino el displayName.
 */
export function getVariableChipDisplay(token: VariableToken): string {
  return token.abbreviation ?? token.displayName
}

/**
 * Parsea una fórmula string a tokens.
 * Busca patrones @variable.id y los convierte a VariableTokens.
 */
export function parseFormulaToTokens(
  formula: string,
  variables: VariableDefinition[]
): FormulaToken[] {
  if (formula === '') {
    return []
  }

  const tokens: FormulaToken[] = []
  const variableMap = new Map(variables.map((v) => [v.id, v]))
  
  // Regex para encontrar @variable.id (caracteres alfanuméricos y puntos)
  const regex = /@([\w.]+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(formula)) !== null) {
    const variableId = match[1]
    const variable = variableMap.get(variableId)

    // Añadir texto antes del match si existe
    if (match.index > lastIndex) {
      const textBefore = formula.slice(lastIndex, match.index)
      tokens.push({ type: 'text', value: textBefore })
    }

    if (variable) {
      // Variable conocida -> crear VariableToken
      tokens.push({
        type: 'variable',
        variableId: variable.id,
        displayName: variable.displayName,
        abbreviation: variable.abbreviation,
      })
    } else {
      // Variable desconocida -> mantener como texto
      tokens.push({ type: 'text', value: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  // Añadir texto restante después del último match
  if (lastIndex < formula.length) {
    tokens.push({ type: 'text', value: formula.slice(lastIndex) })
  }

  return tokens
}

/**
 * Convierte tokens a fórmula string para evaluación.
 */
export function tokensToFormula(tokens: FormulaToken[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'text') {
        return token.value
      }
      return `@${token.variableId}`
    })
    .join('')
}

/**
 * Calcula la longitud visual de los tokens (para posición de cursor).
 * Cada variable cuenta como 1 caracter (el chip).
 */
export function getTokensVisualLength(tokens: FormulaToken[]): number {
  return tokens.reduce((acc, token) => {
    if (token.type === 'text') {
      return acc + token.value.length
    }
    return acc + 1 // Variable chip = 1 caracter visual
  }, 0)
}

/**
 * Encuentra el índice del token y la posición dentro de él
 * dado una posición visual del cursor.
 * 
 * La posición es el punto ANTES del caracter/chip en esa posición.
 * Por ejemplo, en "abc[CHIP]def":
 * - pos 0: antes de 'a'
 * - pos 3: antes de [CHIP] (fin de 'abc')
 * - pos 4: antes de 'd' (después de [CHIP])
 */
export function findTokenAtPosition(
  tokens: FormulaToken[],
  visualPosition: number
): { tokenIndex: number; offsetInToken: number } | null {
  let currentPos = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const tokenLength = token.type === 'text' ? token.value.length : 1

    // Usar < en lugar de <= para que las posiciones en el límite
    // pertenezcan al siguiente token
    if (visualPosition < currentPos + tokenLength) {
      return {
        tokenIndex: i,
        offsetInToken: visualPosition - currentPos,
      }
    }

    currentPos += tokenLength
  }

  // Si la posición es exactamente al final, retornar el último token
  if (visualPosition === currentPos && tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1]
    const lastTokenLength = lastToken.type === 'text' ? lastToken.value.length : 1
    return {
      tokenIndex: tokens.length - 1,
      offsetInToken: lastTokenLength,
    }
  }

  return null
}

export type TokenOperationResult = {
  tokens: FormulaToken[]
  newCursorPosition: number
}

/**
 * Elimina un caracter o chip en la posición del cursor (backspace).
 */
export function deleteAtPosition(
  tokens: FormulaToken[],
  visualPosition: number
): TokenOperationResult {
  if (visualPosition === 0 || tokens.length === 0) {
    return { tokens, newCursorPosition: 0 }
  }

  // Encontrar qué hay justo antes del cursor
  const positionBefore = visualPosition - 1
  const location = findTokenAtPosition(tokens, positionBefore)

  if (!location) {
    return { tokens, newCursorPosition: visualPosition }
  }

  const { tokenIndex, offsetInToken } = location
  const token = tokens[tokenIndex]

  if (token.type === 'variable') {
    // Borrar todo el chip
    const newTokens = [...tokens.slice(0, tokenIndex), ...tokens.slice(tokenIndex + 1)]
    
    // Calcular nueva posición (posición antes del chip)
    let newPos = 0
    for (let i = 0; i < tokenIndex; i++) {
      newPos += tokens[i].type === 'text' ? tokens[i].value.length : 1
    }

    return {
      tokens: mergeAdjacentTextTokens(newTokens),
      newCursorPosition: newPos,
    }
  }

  // Token de texto: borrar un caracter
  const textToken = token as TextToken
  const newValue =
    textToken.value.slice(0, offsetInToken) + textToken.value.slice(offsetInToken + 1)

  let newTokens: FormulaToken[]
  if (newValue === '') {
    // Token de texto vacío, eliminarlo
    newTokens = [...tokens.slice(0, tokenIndex), ...tokens.slice(tokenIndex + 1)]
  } else {
    newTokens = [
      ...tokens.slice(0, tokenIndex),
      { type: 'text', value: newValue },
      ...tokens.slice(tokenIndex + 1),
    ]
  }

  return {
    tokens: mergeAdjacentTextTokens(newTokens),
    newCursorPosition: visualPosition - 1,
  }
}

/**
 * Inserta texto en la posición del cursor.
 */
export function insertTextInTokens(
  tokens: FormulaToken[],
  visualPosition: number,
  text: string
): TokenOperationResult {
  if (text === '') {
    return { tokens, newCursorPosition: visualPosition }
  }

  if (tokens.length === 0) {
    return {
      tokens: [{ type: 'text', value: text }],
      newCursorPosition: text.length,
    }
  }

  const location = findTokenAtPosition(tokens, visualPosition)

  if (!location) {
    // Insertar al final
    const lastToken = tokens[tokens.length - 1]
    if (lastToken.type === 'text') {
      const newTokens = [
        ...tokens.slice(0, -1),
        { type: 'text' as const, value: lastToken.value + text },
      ]
      return {
        tokens: newTokens,
        newCursorPosition: visualPosition + text.length,
      }
    }
    return {
      tokens: [...tokens, { type: 'text', value: text }],
      newCursorPosition: visualPosition + text.length,
    }
  }

  const { tokenIndex, offsetInToken } = location
  const token = tokens[tokenIndex]

  if (token.type === 'text') {
    // Insertar dentro del texto
    const newValue =
      token.value.slice(0, offsetInToken) + text + token.value.slice(offsetInToken)
    const newTokens = [
      ...tokens.slice(0, tokenIndex),
      { type: 'text' as const, value: newValue },
      ...tokens.slice(tokenIndex + 1),
    ]
    return {
      tokens: newTokens,
      newCursorPosition: visualPosition + text.length,
    }
  }

  // Insertar antes de un chip de variable
  if (offsetInToken === 0) {
    // Antes del chip
    const prevToken = tokens[tokenIndex - 1]
    if (prevToken && prevToken.type === 'text') {
      const newTokens = [
        ...tokens.slice(0, tokenIndex - 1),
        { type: 'text' as const, value: prevToken.value + text },
        ...tokens.slice(tokenIndex),
      ]
      return {
        tokens: newTokens,
        newCursorPosition: visualPosition + text.length,
      }
    }
    const newTokens = [
      ...tokens.slice(0, tokenIndex),
      { type: 'text' as const, value: text },
      ...tokens.slice(tokenIndex),
    ]
    return {
      tokens: newTokens,
      newCursorPosition: visualPosition + text.length,
    }
  }

  // Después del chip (offsetInToken === 1)
  const nextToken = tokens[tokenIndex + 1]
  if (nextToken && nextToken.type === 'text') {
    const newTokens = [
      ...tokens.slice(0, tokenIndex + 1),
      { type: 'text' as const, value: text + nextToken.value },
      ...tokens.slice(tokenIndex + 2),
    ]
    return {
      tokens: newTokens,
      newCursorPosition: visualPosition + text.length,
    }
  }
  const newTokens = [
    ...tokens.slice(0, tokenIndex + 1),
    { type: 'text' as const, value: text },
    ...tokens.slice(tokenIndex + 1),
  ]
  return {
    tokens: newTokens,
    newCursorPosition: visualPosition + text.length,
  }
}

/**
 * Inserta una variable como chip en la posición del cursor.
 */
export function insertVariableToken(
  tokens: FormulaToken[],
  visualPosition: number,
  variable: VariableDefinition
): TokenOperationResult {
  const variableToken: VariableToken = {
    type: 'variable',
    variableId: variable.id,
    displayName: variable.displayName,
    abbreviation: variable.abbreviation,
  }

  if (tokens.length === 0) {
    return {
      tokens: [variableToken],
      newCursorPosition: 1,
    }
  }

  const location = findTokenAtPosition(tokens, visualPosition)

  if (!location) {
    // Insertar al final
    return {
      tokens: [...tokens, variableToken],
      newCursorPosition: getTokensVisualLength(tokens) + 1,
    }
  }

  const { tokenIndex, offsetInToken } = location
  const token = tokens[tokenIndex]

  if (token.type === 'text') {
    // Dividir el texto e insertar el chip
    const before = token.value.slice(0, offsetInToken)
    const after = token.value.slice(offsetInToken)

    const newTokens: FormulaToken[] = [
      ...tokens.slice(0, tokenIndex),
      ...(before ? [{ type: 'text' as const, value: before }] : []),
      variableToken,
      ...(after ? [{ type: 'text' as const, value: after }] : []),
      ...tokens.slice(tokenIndex + 1),
    ]

    return {
      tokens: newTokens,
      newCursorPosition: visualPosition + 1,
    }
  }

  // Insertar antes o después de un chip existente
  if (offsetInToken === 0) {
    const newTokens = [
      ...tokens.slice(0, tokenIndex),
      variableToken,
      ...tokens.slice(tokenIndex),
    ]
    return {
      tokens: newTokens,
      newCursorPosition: visualPosition + 1,
    }
  }

  const newTokens = [
    ...tokens.slice(0, tokenIndex + 1),
    variableToken,
    ...tokens.slice(tokenIndex + 1),
  ]
  return {
    tokens: newTokens,
    newCursorPosition: visualPosition + 1,
  }
}

/**
 * Reemplaza un rango de texto (desde @ hasta cursor) con una variable.
 * Usado cuando el usuario selecciona del autocomplete.
 */
export function replaceRangeWithVariable(
  tokens: FormulaToken[],
  startPosition: number,
  endPosition: number,
  variable: VariableDefinition
): TokenOperationResult {
  // Primero eliminar el rango
  let currentTokens = tokens
  let currentPosition = endPosition

  // Borrar desde el final hasta el inicio
  while (currentPosition > startPosition) {
    const result = deleteAtPosition(currentTokens, currentPosition)
    currentTokens = result.tokens
    currentPosition = result.newCursorPosition
  }

  // Insertar la variable
  return insertVariableToken(currentTokens, startPosition, variable)
}

/**
 * Une tokens de texto adyacentes.
 */
function mergeAdjacentTextTokens(tokens: FormulaToken[]): FormulaToken[] {
  if (tokens.length === 0) return []

  const result: FormulaToken[] = []

  for (const token of tokens) {
    const lastToken = result[result.length - 1]

    if (token.type === 'text' && lastToken && lastToken.type === 'text') {
      // Merge con el anterior
      result[result.length - 1] = {
        type: 'text',
        value: lastToken.value + token.value,
      }
    } else {
      result.push(token)
    }
  }

  return result
}

export type MentionInfo = {
  active: boolean
  atPosition: number
  searchTerm: string
}

/**
 * Detecta si hay una mención activa en el texto.
 * Una mención está activa si hay un @ sin espacio después.
 */
export function getMentionInfo(text: string): MentionInfo {
  const lastAtIndex = text.lastIndexOf('@')

  if (lastAtIndex === -1) {
    return { active: false, atPosition: 0, searchTerm: '' }
  }

  const textAfterAt = text.slice(lastAtIndex + 1)
  const hasSpaceAfterAt = textAfterAt.includes(' ')

  if (hasSpaceAfterAt) {
    return { active: false, atPosition: 0, searchTerm: '' }
  }

  return {
    active: true,
    atPosition: lastAtIndex,
    searchTerm: textAfterAt.toLowerCase(),
  }
}

/**
 * Filtra las variables según el término de búsqueda.
 * Busca tanto en displayName como en id.
 * Retorna las variables ordenadas alfabéticamente por displayName.
 */
export function filterVariables(
  variables: VariableDefinition[],
  searchTerm: string
): VariableDefinition[] {
  let filtered: VariableDefinition[]
  const normalizedSearchTerm = searchTerm.toLowerCase()

  if (normalizedSearchTerm === '') {
    filtered = [...variables]
  } else {
    filtered = variables.filter((variable) => {
      const matchesDisplayName = variable.displayName.toLowerCase().includes(normalizedSearchTerm)
      const matchesId = variable.id.toLowerCase().includes(normalizedSearchTerm)
      return matchesDisplayName || matchesId
    })
  }

  return filtered.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

/**
 * Genera el nuevo texto de fórmula después de insertar una variable.
 * Añade un espacio después de la variable para cerrar el autocompletado.
 */
export function insertVariableInFormula(
  formula: string,
  mentionInfo: MentionInfo,
  variableId: string
): string {
  if (!mentionInfo.active) {
    return formula
  }

  const beforeAt = formula.slice(0, mentionInfo.atPosition)
  const afterSearchTerm = formula.slice(
    mentionInfo.atPosition + 1 + mentionInfo.searchTerm.length
  )

  return `${beforeAt}@${variableId} ${afterSearchTerm}`
}

export type InsertionResult = {
  newText: string
  newCursorPosition: number
}

/**
 * Inserta texto en una posición específica del cursor.
 */
export function insertTextAtCursor(
  text: string,
  cursorPosition: number,
  textToInsert: string
): InsertionResult {
  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)
  
  return {
    newText: before + textToInsert + after,
    newCursorPosition: cursorPosition + textToInsert.length,
  }
}

/**
 * Inserta paréntesis y coloca el cursor en medio.
 */
export function insertParentheses(
  text: string,
  cursorPosition: number
): InsertionResult {
  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)
  
  return {
    newText: before + '()' + after,
    newCursorPosition: cursorPosition + 1, // Cursor entre paréntesis
  }
}

/**
 * Inserta una función con paréntesis vacíos y coloca el cursor en medio.
 */
export function insertFunction(
  text: string,
  cursorPosition: number,
  functionName: string
): InsertionResult {
  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)
  const insertion = `${functionName}()`
  
  return {
    newText: before + insertion + after,
    newCursorPosition: cursorPosition + functionName.length + 1, // Cursor entre paréntesis
  }
}
