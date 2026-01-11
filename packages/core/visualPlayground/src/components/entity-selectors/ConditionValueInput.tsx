import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VariableAutocompleteInput } from './VariableAutocompleteInput'
import {
  extractSingleEntityVariable,
  getPropertyPathFromVariable,
  getUniqueStringValuesForProperty,
  getEntityVariablesForAutocomplete,
} from '@/utils/entity-selectors/entityVariableUtils'
import type { ConditionValueInputProps } from './types'

/**
 * Smart input for condition values.
 * When the field (left side) is a single entity variable that maps to a string property,
 * shows a Select with all unique values for that property.
 * Otherwise, shows the regular VariableAutocompleteInput.
 */
export function ConditionValueInput({
  value,
  onChange,
  fieldValue,
  variables,
  entityVariables,
  entityType,
  className,
}: ConditionValueInputProps) {
  const entityVariablePath = extractSingleEntityVariable(fieldValue)
  
  let stringOptions: string[] | null = null
  if (entityVariablePath) {
    const propertyPath = getPropertyPathFromVariable(entityVariablePath)
    stringOptions = getUniqueStringValuesForProperty(entityType, propertyPath)
  }
  
  if (stringOptions && stringOptions.length > 0) {
    return (
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Selecciona un valor..." />
        </SelectTrigger>
        <SelectContent>
          {stringOptions.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  
  return (
    <VariableAutocompleteInput
      value={value}
      onChange={onChange}
      variables={variables}
      entityVariables={entityVariables}
      placeholder="value (o @variable)"
      className={className}
      showHelperText={false}
    />
  )
}

