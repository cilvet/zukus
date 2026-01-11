import * as readline from 'readline';
import { createEntitySchema, validateEntity, EntitySchemaDefinition, SearchableEntity } from '../index';
import { 
  spellWithEnumsDefinition, 
  classDefinition, 
  discoveryDefinition 
} from '../__tests__/fixtures/testDefinitions';

// Definición simplificada de dotes para CLI
const featDefinitionCLI: EntitySchemaDefinition = {
  typeName: "feat",
  description: "Character feat",
  fields: [
    {
      name: "benefitType",
      type: "string",
      description: "Type of benefit provided",
      optional: false,
      allowedValues: ["combat", "general", "metamagic", "item creation", "skill", "special"]
    },
    {
      name: "prerequisites",
      type: "string_array",
      description: "Required feats or features",
      optional: true
    },
    {
      name: "requiredFeats",
      type: "string_array", 
      description: "Required feats",
      optional: true
    },
    {
      name: "description",
      type: "string",
      description: "Feat description",
      optional: true
    }
  ]
};

// Esquemas disponibles en el sistema
const availableSchemas: EntitySchemaDefinition[] = [
  spellWithEnumsDefinition,
  featDefinitionCLI,
  classDefinition,
  discoveryDefinition
];

class EntityFormCLI {
  private rl: readline.Interface;
  private entity: Partial<SearchableEntity> = {};

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  private async askForInput(
    fieldName: string, 
    description: string, 
    validator?: (value: string) => boolean,
    allowedValues?: string[]
  ): Promise<string> {
    let prompt = `${description}`;
    
    if (allowedValues) {
      prompt += ` (${allowedValues.join(', ')})`;
    }
    prompt += ': ';

    while (true) {
      const input = await this.question(prompt);
      
      if (validator && !validator(input)) {
        console.log('❌ Valor inválido. Intenta de nuevo.');
        continue;
      }
      
      if (allowedValues && !allowedValues.includes(input)) {
        console.log(`❌ Valor debe ser uno de: ${allowedValues.join(', ')}`);
        continue;
      }
      
      return input;
    }
  }

  private async askForNumber(
    fieldName: string, 
    description: string, 
    min?: number, 
    max?: number,
    allowedValues?: number[]
  ): Promise<number> {
    while (true) {
      let prompt = `${description}`;
      
      if (allowedValues) {
        prompt += ` (${allowedValues.join(', ')})`;
      } else if (min !== undefined && max !== undefined) {
        prompt += ` (${min}-${max})`;
      }
      prompt += ': ';

      const input = await this.question(prompt);
      const num = parseInt(input);
      
      if (isNaN(num)) {
        console.log('❌ Debe ser un número válido.');
        continue;
      }
      
      if (allowedValues && !allowedValues.includes(num)) {
        console.log(`❌ Nivel debe ser uno de: ${allowedValues.join(', ')}`);
        continue;
      }
      
      if (min !== undefined && num < min) {
        console.log(`❌ Valor debe ser mayor o igual a ${min}.`);
        continue;
      }
      
      if (max !== undefined && num > max) {
        console.log(`❌ Valor debe ser menor o igual a ${max}.`);
        continue;
      }
      
      return num;
    }
  }

  private async askForArray(
    fieldName: string, 
    description: string, 
    allowedValues?: string[]
  ): Promise<string[]> {
    console.log(`\n${description}`);
    if (allowedValues) {
      console.log(`Valores permitidos: ${allowedValues.join(', ')}`);
    }
    console.log('Ingresa los valores separados por comas (ej: V,S,M):');
    
    while (true) {
      const input = await this.question('> ');
      
      if (!input.trim()) {
        console.log('❌ Debe ingresar al menos un valor.');
        continue;
      }
      
      const values = input.split(',').map(v => v.trim()).filter(v => v);
      
      if (allowedValues) {
        const invalidValues = values.filter(v => !allowedValues.includes(v));
        if (invalidValues.length > 0) {
          console.log(`❌ Valores inválidos: ${invalidValues.join(', ')}`);
          console.log(`Valores permitidos: ${allowedValues.join(', ')}`);
          continue;
        }
      }
      
      return values;
    }
  }

  private async askForNumberArray(description: string): Promise<number[]> {
    console.log(`\n${description}`);
    console.log('Ingresa los números separados por comas (ej: 1,4,6):');
    
    while (true) {
      const input = await this.question('> ');
      
      if (!input.trim()) {
        return []; // Array vacío es válido para campos opcionales
      }
      
      const values = input.split(',').map(v => v.trim()).filter(v => v);
      const numbers = values.map(v => parseInt(v));
      
      if (numbers.some(isNaN)) {
        console.log('❌ Todos los valores deben ser números válidos.');
        continue;
      }
      
      return numbers;
    }
  }

  private async askForBoolean(description: string): Promise<boolean> {
    while (true) {
      const input = await this.question(`${description} (s/n): `);
      const normalized = input.toLowerCase().trim();
      
      if (normalized === 's' || normalized === 'si' || normalized === 'y' || normalized === 'yes') {
        return true;
      }
      
      if (normalized === 'n' || normalized === 'no') {
        return false;
      }
      
      console.log('❌ Responde con "s" para sí o "n" para no.');
    }
  }

  private generateId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async selectSchema(): Promise<EntitySchemaDefinition> {
    console.log('🎯 ¿Qué tipo de entidad deseas crear?');
    
    availableSchemas.forEach((schema, index) => {
      const icon = this.getIconForType(schema.typeName);
      console.log(`${index + 1}. ${icon} ${schema.description || schema.typeName}`);
    });
    
    while (true) {
      const choice = await this.question(`Elige una opción (1-${availableSchemas.length}): `);
      const index = parseInt(choice) - 1;
      
      if (index >= 0 && index < availableSchemas.length) {
        return availableSchemas[index];
      }
      
      console.log(`❌ Opción inválida. Elige un número entre 1 y ${availableSchemas.length}.`);
    }
  }

  private getIconForType(typeName: string): string {
    const icons: Record<string, string> = {
      'spell': '📜',
      'feat': '🛡️',
      'class': '⚔️',
      'discovery': '🧪'
    };
    return icons[typeName] || '📋';
  }

  private displayEntity(entity: SearchableEntity, schema: EntitySchemaDefinition): void {
    const icon = this.getIconForType(schema.typeName);
    console.log(`\n${icon} ===== ${schema.description?.toUpperCase() || schema.typeName.toUpperCase()} CREADA =====`);
    console.log(`🆔 ID: ${entity.id}`);
    console.log(`✨ Nombre: ${entity.name}`);
    console.log(`🎯 Tipo: ${entity.entityType}`);
    
    // Mostrar todos los campos dinámicamente
    schema.fields.forEach(field => {
      const value = (entity as any)[field.name];
      if (value !== undefined && value !== null) {
        const emoji = this.getEmojiForField(field.name, field.type);
        const displayValue = this.formatFieldValue(value, field.type);
        console.log(`${emoji} ${field.description || field.name}: ${displayValue}`);
      }
    });
    
    console.log('========================\n');
  }

  private getEmojiForField(fieldName: string, fieldType: string): string {
    const fieldEmojis: Record<string, string> = {
      'level': '📊',
      'school': '🏫',
      'components': '🔮',
      'description': '📋',
      'metamagic': '🪄',
      'damageDice': '🎲',
      'benefitType': '🏷️',
      'prerequisites': '📋',
      'requiredFeats': '🔗',
      'hitDie': '🎲',
      'alignment': '⚖️',
      'savingThrows': '🛡️',
      'spellLevels': '✨',
      'prerequisiteLevel': '📈',
      'category': '📂',
      'keywords': '🏷️'
    };
    
    return fieldEmojis[fieldName] || (fieldType.includes('array') ? '📝' : '💠');
  }

  private formatFieldValue(value: any, fieldType: string): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return value.toString();
  }

  private async createEntity(schema: EntitySchemaDefinition): Promise<void> {
    const icon = this.getIconForType(schema.typeName);
    console.log(`\n${icon} === CREANDO ${schema.description?.toUpperCase() || schema.typeName.toUpperCase()} ===\n`);
    
    // Campos base obligatorios
    const name = await this.askForInput(
      'name',
      '✨ Nombre'
    );
    this.entity.name = name;
    this.entity.id = this.generateId(name);
    this.entity.entityType = schema.typeName;

    // Procesar campos del esquema dinámicamente
    const requiredFields = schema.fields.filter(field => !field.optional);
    const optionalFields = schema.fields.filter(field => field.optional);

    // Campos obligatorios
    if (requiredFields.length > 0) {
      console.log('\n--- Campos obligatorios ---');
      for (const field of requiredFields) {
        await this.processField(field);
      }
    }

    // Campos opcionales
    if (optionalFields.length > 0) {
      console.log('\n--- Campos opcionales ---');
      for (const field of optionalFields) {
        const emoji = this.getEmojiForField(field.name, field.type);
        const shouldAdd = await this.askForBoolean(
          `¿Agregar ${field.description || field.name}?`
        );
        
        if (shouldAdd) {
          await this.processField(field);
        }
      }
    }
  }

  private async processField(field: any): Promise<void> {
    const emoji = this.getEmojiForField(field.name, field.type);
    const fieldDescription = `${emoji} ${field.description || field.name}`;

    switch (field.type) {
      case 'string':
        (this.entity as any)[field.name] = await this.askForInput(
          field.name,
          fieldDescription,
          undefined,
          field.allowedValues
        );
        break;

      case 'integer':
        (this.entity as any)[field.name] = await this.askForNumber(
          field.name,
          fieldDescription,
          undefined,
          undefined,
          field.allowedValues
        );
        break;

      case 'boolean':
        (this.entity as any)[field.name] = await this.askForBoolean(fieldDescription);
        break;

      case 'string_array':
        (this.entity as any)[field.name] = await this.askForArray(
          field.name,
          fieldDescription,
          field.allowedValues
        );
        break;

      case 'integer_array':
        (this.entity as any)[field.name] = await this.askForNumberArray(fieldDescription);
        break;

      case 'reference':
        // Para referencias, tratamos como string array por simplicidad
        (this.entity as any)[field.name] = await this.askForArray(
          field.name,
          `${fieldDescription} (referencias)`
        );
        break;

      default:
        console.log(`⚠️  Tipo de campo no soportado: ${field.type}`);
        break;
    }
  }

  async run(): Promise<void> {
    console.log('🧙‍♂️ ===== CREADOR DE ENTIDADES D&D 3.5 =====\n');

    try {
      // Seleccionar esquema dinámicamente
      const schema = await this.selectSchema();
      
      // Crear la entidad usando el esquema seleccionado
      await this.createEntity(schema);

      // Validar con el esquema seleccionado
      const validationResult = validateEntity(this.entity, schema);
      
      if (!validationResult.valid) {
        console.log('\n❌ Error de validación:');
        validationResult.errors?.forEach(error => {
          console.log(`  - ${error}`);
        });
        return;
      }

      // Mostrar resultado
      this.displayEntity(this.entity as SearchableEntity, schema);

      // Mostrar JSON
      const showJson = await this.askForBoolean(`¿Mostrar JSON de la entidad?`);
      if (showJson) {
        console.log('📄 JSON:');
        console.log(JSON.stringify(this.entity, null, 2));
      }

    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      this.rl.close();
    }
  }
}

// Función principal para ejecutar la aplicación
export async function runEntityForm(): Promise<void> {
  const app = new EntityFormCLI();
  await app.run();
}

// Función de compatibilidad
export async function runSpellForm(): Promise<void> {
  return runEntityForm();
}

// Si se ejecuta directamente
if (import.meta.main) {
  runEntityForm();
}
