import { describe, it, expect } from "bun:test";
import { generateFormSchema, getDefaultValueForField } from "../../index";
import { spellWithEnumsDefinition, spellDefinition } from "../fixtures/testDefinitions";

describe("Form Generation", () => {
  describe("generateFormSchema", () => {
    it("should generate form schema with correct field types", () => {
      const formSchema = generateFormSchema(spellWithEnumsDefinition);

      expect(formSchema.typeName).toBe("spell");
      expect(formSchema.description).toBe("A magical spell");

      const levelField = formSchema.fields.find(f => f.name === "level");
      const schoolField = formSchema.fields.find(f => f.name === "school");
      const componentsField = formSchema.fields.find(f => f.name === "components");
      const descriptionField = formSchema.fields.find(f => f.name === "description");

      expect(levelField?.type).toBe("select");
      expect(levelField?.options?.map(o => o.value)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      
      expect(schoolField?.type).toBe("select");
      expect(schoolField?.options?.map(o => o.value)).toEqual(["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"]);
      
      expect(componentsField?.type).toBe("multiselect");
      expect(componentsField?.options?.map(o => o.value)).toEqual(["V", "S", "M", "F", "DF", "XP"]);
      
      expect(descriptionField?.type).toBe("text");
      expect(descriptionField?.required).toBe(false);
    });

    it("should generate base entity fields in form schema", () => {
      const formSchema = generateFormSchema(spellDefinition);

      const idField = formSchema.fields.find(f => f.name === "id");
      const nameField = formSchema.fields.find(f => f.name === "name");
      const tagsField = formSchema.fields.find(f => f.name === "tags");

      expect(idField?.type).toBe("text");
      expect(idField?.required).toBe(true);
      
      expect(nameField?.type).toBe("text");
      expect(nameField?.required).toBe(true);
      
      expect(tagsField?.type).toBe("text_array");
      expect(tagsField?.required).toBe(false);
    });

    it("should convert field types correctly", () => {
      const formSchema = generateFormSchema(spellDefinition);

      const levelField = formSchema.fields.find(f => f.name === "level");
      const schoolField = formSchema.fields.find(f => f.name === "school");
      const componentsField = formSchema.fields.find(f => f.name === "components");
      const metamagicField = formSchema.fields.find(f => f.name === "metamagic");
      const damageDiceField = formSchema.fields.find(f => f.name === "damageDice");

      expect(levelField?.type).toBe("number"); // integer without allowedValues -> number
      expect(schoolField?.type).toBe("text"); // string without allowedValues -> text
      expect(componentsField?.type).toBe("text_array"); // string_array without allowedValues -> text_array
      expect(metamagicField?.type).toBe("boolean");
      expect(damageDiceField?.type).toBe("number_array"); // integer_array without allowedValues -> number_array
    });

    it("should handle validation rules correctly", () => {
      const formSchema = generateFormSchema(spellDefinition);

      const componentsField = formSchema.fields.find(f => f.name === "components");
      expect(componentsField?.validation?.nonEmpty).toBe(true);

      const metamagicField = formSchema.fields.find(f => f.name === "metamagic");
      expect(metamagicField?.required).toBe(false); // Optional field
    });

    it("should preserve field descriptions and labels", () => {
      const formSchema = generateFormSchema(spellDefinition);

      const levelField = formSchema.fields.find(f => f.name === "level");
      expect(levelField?.label).toBe("Spell level");
      expect(levelField?.description).toBe("Spell level");

      const componentsField = formSchema.fields.find(f => f.name === "components");
      expect(componentsField?.label).toBe("Spell components");
      expect(componentsField?.description).toBe("Spell components");
    });
  });

  describe("getDefaultValueForField", () => {
    it("should generate correct default values for form fields", () => {
      const formSchema = generateFormSchema(spellWithEnumsDefinition);
      
      const levelField = formSchema.fields.find(f => f.name === "level")!;
      const componentsField = formSchema.fields.find(f => f.name === "components")!;
      const descriptionField = formSchema.fields.find(f => f.name === "description")!;

      expect(getDefaultValueForField(levelField)).toBe(0);
      expect(getDefaultValueForField(componentsField)).toEqual(["V"]);
      expect(getDefaultValueForField(descriptionField)).toBe("");
    });

    it("should return correct defaults for basic field types", () => {
      const textField = { name: "test", type: "text" as const, required: true, label: "Test" };
      const numberField = { name: "test", type: "number" as const, required: true, label: "Test" };
      const booleanField = { name: "test", type: "boolean" as const, required: true, label: "Test" };

      expect(getDefaultValueForField(textField)).toBe("");
      expect(getDefaultValueForField(numberField)).toBe(0);
      expect(getDefaultValueForField(booleanField)).toBe(false);
    });

    it("should return correct defaults for array field types", () => {
      const textArrayField = { 
        name: "test", 
        type: "text_array" as const, 
        required: true, 
        label: "Test",
        validation: { nonEmpty: true }
      };
      const numberArrayField = { 
        name: "test", 
        type: "number_array" as const, 
        required: true, 
        label: "Test",
        validation: { nonEmpty: false }
      };

      expect(getDefaultValueForField(textArrayField)).toEqual([""]);
      expect(getDefaultValueForField(numberArrayField)).toEqual([]);
    });

    it("should handle select fields with options", () => {
      const selectField = {
        name: "test",
        type: "select" as const,
        required: true,
        label: "Test",
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" }
        ]
      };

      expect(getDefaultValueForField(selectField)).toBe("option1");
    });

    it("should handle multiselect fields", () => {
      const multiselectRequired = {
        name: "test",
        type: "multiselect" as const,
        required: true,
        label: "Test",
        validation: { nonEmpty: true },
        options: [
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" }
        ]
      };

      const multiselectOptional = {
        name: "test",
        type: "multiselect" as const,
        required: false,
        label: "Test",
        validation: { nonEmpty: false },
        options: [
          { value: "option1", label: "Option 1" }
        ]
      };

      expect(getDefaultValueForField(multiselectRequired)).toEqual(["option1"]);
      expect(getDefaultValueForField(multiselectOptional)).toEqual([]);
    });

    it("should handle select field without options", () => {
      const selectFieldNoOptions = {
        name: "test",
        type: "select" as const,
        required: true,
        label: "Test"
      };

      expect(getDefaultValueForField(selectFieldNoOptions)).toBe("");
    });
  });
});