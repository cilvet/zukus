/**
 * Lógica de autocompletado de fórmulas.
 * Funciones puras y testeables.
 */

export type VariableDefinition = {
  id: string
  displayName: string
  category: string
  value: number
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
