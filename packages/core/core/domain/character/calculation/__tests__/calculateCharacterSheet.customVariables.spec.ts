import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { CustomVariableChange } from "../../baseData/changes";
import { calculateCharacterSheet } from "../calculateCharacterSheet";
import { AttackContextualChange, ResolvedAttackContextualChange } from "../../baseData/contextualChange";
import { ClassFeature } from "../../../class/classFeatures";
import { featureTypes } from "../../baseData/features/feature";
import { BabType } from "../../../class/baseAttackBonus";
import { CharacterClass } from "../../../class/class";
import { SaveType } from "../../../class/saves";
import { getAttackDamageFormula } from "../attacks/attack/getAttackDamageFormula";
import { getDamageFormulaText } from "../attacks/attack/utils/getDamageText";
import { ResolvedAttackContext } from "../../calculatedSheet/attacks/calculatedAttack";
import { getWeaponAttackContext } from "../../calculatedSheet/attacks/attackContext/availableAttackContext";
import { rapier } from "../../../../../srd/equipment/weapons";

describe("calculateCharacterSheet - Custom Variables", () => {
    it("calculates custom variables correctly", () => {
        const sneakAttackChange: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "sneakAttackDiceAmount",
            formula: {
                expression: "3",
            },
            bonusTypeId: "BASE",
        };

        const sneakAttackBuff = buildBuff()
            .withChange(sneakAttackChange)
            .build();

        const character = buildCharacter()
            .withBuff(sneakAttackBuff)
            .build();

        const result = calculateCharacterSheet(character);

        expect(result.customVariables).toHaveLength(1);
        expect(result.customVariables[0].uniqueId).toEqual("sneakAttackDiceAmount");
        expect(result.customVariables[0].name).toEqual("sneakAttackDiceAmount");
        expect(result.customVariables[0].totalValue).toEqual(3);
        expect(result.customVariables[0].sources).toHaveLength(1);
        expect(result.customVariables[0].sources[0].sourceName).toEqual("buff name");

        expect(result.substitutionValues["customVariable.sneakAttackDiceAmount"]).toEqual(3);
    });

    it("handles multiple sources for the same custom variable", () => {
        const rogueSneak: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "sneakAttackDiceAmount",
            formula: {
                expression: "2",
            },
            bonusTypeId: "BASE",
        };

        const assassinSneak: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "sneakAttackDiceAmount",
            formula: {
                expression: "1",
            },
            bonusTypeId: "BASE",
        };

        const rogueBuff = buildBuff()
            .withChange(rogueSneak)
            .build();
        rogueBuff.name = "Rogue Sneak Attack";

        const assassinBuff = buildBuff()
            .withChange(assassinSneak)
            .build();
        assassinBuff.name = "Assassin Sneak Attack";

        const character = buildCharacter()
            .withBuff(rogueBuff)
            .withBuff(assassinBuff)
            .build();

        const result = calculateCharacterSheet(character);

        expect(result.customVariables).toHaveLength(1);
        expect(result.customVariables[0].uniqueId).toEqual("sneakAttackDiceAmount");
        expect(result.customVariables[0].name).toEqual("sneakAttackDiceAmount");
        expect(result.customVariables[0].totalValue).toEqual(3); // 2 + 1
        expect(result.customVariables[0].sources).toHaveLength(2);

        expect(result.substitutionValues["customVariable.sneakAttackDiceAmount"]).toEqual(3);
    });
});



// Helper function to create sneak attack dice variable
const createSneakAttackDiceVariable = (): CustomVariableChange => ({
    type: "CUSTOM_VARIABLE",
    uniqueId: "classes.rogue.sneakAttackDiceAmount",
    formula: { expression: "ceil(@class.rogue.level / 2)" },
    bonusTypeId: "BASE",
});

// Helper function to create assassin sneak attack dice variable
const createAssassinSneakAttackDiceVariable = (): CustomVariableChange => ({
    type: "CUSTOM_VARIABLE",
    uniqueId: "classes.rogue.sneakAttackDiceAmount", // Same uniqueId to stack
    formula: { expression: "ceil(@class.assassin.level / 2)" },
    bonusTypeId: "BASE",
});

// Helper function to create sneak attack die variable (d6 base)
const createSneakAttackDieVariable = (): CustomVariableChange => ({
    type: "CUSTOM_VARIABLE",
    uniqueId: "classes.rogue.sneakAttackDie",
    formula: { expression: "6" }, // Base d6
    bonusTypeId: "BASE",
});

// Helper function to create enhanced sneak attack die variable (d8 replacement)
const createEnhancedSneakAttackDieVariable = (): CustomVariableChange => ({
    type: "CUSTOM_VARIABLE",
    uniqueId: "classes.rogue.sneakAttackDie",
    formula: { expression: "8" }, // Enhanced to d8
    bonusTypeId: "REPLACEMENT", // Replaces the base value
});

// Helper function to create sneak attack contextual change (basic d6)
const createSneakAttackContextual = (): AttackContextualChange => ({
    name: "Sneak Attack",
    type: "attack",
    appliesTo: "all",
    available: true,
    optional: true,
    variables: [],
    changes: [
        {
            type: "DAMAGE",
            formula: { expression: "(@customVariable.classes.rogue.sneakAttackDiceAmount)d6" },
            bonusTypeId: "UNTYPED",
            originId: "sneakAttack",
            originType: "classFeature",
            name: "Sneak Attack",
        },
    ],
});

// Helper function to create advanced sneak attack contextual change (variable die)
const createAdvancedSneakAttackContextual = (): AttackContextualChange => ({
    name: "Sneak Attack",
    type: "attack",
    appliesTo: "all",
    available: true,
    optional: true,
    variables: [],
    changes: [
        {
            type: "DAMAGE",
            formula: { expression: "(@customVariable.classes.rogue.sneakAttackDiceAmount)d(@customVariable.classes.rogue.sneakAttackDie)" },
            bonusTypeId: "REPLACEMENT",
            originId: "sneakAttack",
            originType: "classFeature",
            name: "Sneak Attack",
        },
    ],
});

// Helper function to create sneak attack class feature
const createSneakAttackFeature = (changes: CustomVariableChange[]): ClassFeature => ({
    uniqueId: "sneakAttack",
    name: "Sneak Attack",
    description: "Deal extra damage when flanking or catching enemies unaware",
    featureType: featureTypes.CLASS_FEATURE,
    changes,
    contextualChanges: [createSneakAttackContextual()],
});

// Helper function to create advanced sneak attack class feature (with variable die)
const createAdvancedSneakAttackFeature = (changes: CustomVariableChange[]): ClassFeature => ({
    uniqueId: "sneakAttack",
    name: "Sneak Attack",
    description: "Deal extra damage when flanking or catching enemies unaware",
    featureType: featureTypes.CLASS_FEATURE,
    changes,
    contextualChanges: [createAdvancedSneakAttackContextual()],
});

// Helper function to create rogue class with sneak attack
const createRogueClass = (): CharacterClass => ({
    name: "Rogue",
    uniqueId: "rogue",
    hitDie: 6,
    baseAttackBonusProgression: BabType.AVERAGE,
    baseSavesProgression: {
        fortitude: SaveType.POOR,
        reflex: SaveType.GOOD,
        will: SaveType.POOR,
    },
    classFeatures: [],
    levels: [
        {
            level: 1,
            classFeatures: [createSneakAttackFeature([createSneakAttackDiceVariable()])],
        },
    ],
    spellCasting: false,
});

// Helper function to create assassin class with sneak attack
const createAssassinClass = (): CharacterClass => ({
    name: "Assassin",
    uniqueId: "assassin",
    hitDie: 6,
    baseAttackBonusProgression: BabType.AVERAGE,
    baseSavesProgression: {
        fortitude: SaveType.POOR,
        reflex: SaveType.POOR,
        will: SaveType.POOR,
    },
    classFeatures: [],
    levels: [
        {
            level: 1,
            classFeatures: [createSneakAttackFeature([createAssassinSneakAttackDiceVariable()])],
        },
    ],
    spellCasting: false,
});

describe("Sneak Attack with Custom Variables", () => {
    it("should apply sneak attack damage using custom variable for dice amount", () => {
        // Crear personaje con rogue nivel 3 (debería tener 2d6 sneak attack)
        const characterSheet = buildCharacter()
            .withClassLevels(createRogueClass(), 3)
            .withItem(rapier)
            .buildCharacterSheet();

        // Verificar que la custom variable se calculó correctamente
        expect(characterSheet.customVariables).toHaveLength(1);
        expect(characterSheet.customVariables[0].uniqueId).toEqual("classes.rogue.sneakAttackDiceAmount");
        expect(characterSheet.customVariables[0].name).toEqual("classes.rogue.sneakAttackDiceAmount");
        expect(characterSheet.customVariables[0].totalValue).toEqual(2); // ceil(3/2) = 2
        expect(characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDiceAmount"]).toEqual(2);

        // Obtener el contexto de ataque del arma
        const attackContext = getWeaponAttackContext(
            rapier,
            characterSheet.attackData.attackContextChanges,
            characterSheet.attackData.attackChanges,
            characterSheet
        );

        // Debería haber un contextual change de sneak attack disponible
        const sneakAttackChange = attackContext.contextualChanges.find(
            change => change.name === "Sneak Attack"
        );
        expect(sneakAttackChange).toBeDefined();
        expect(sneakAttackChange!.name).toEqual("Sneak Attack");

        // Resolver el contextual change (simular que el usuario lo activa)
        const resolvedSneakAttackChange: ResolvedAttackContextualChange = {
            ...sneakAttackChange!,
            variables: [],
        };

        // Crear el contexto de ataque resuelto con sneak attack aplicado
        const resolvedAttackContext: ResolvedAttackContext = {
            appliedContextualChanges: [resolvedSneakAttackChange],
            attackType: attackContext.type,
            character: characterSheet,
            weapon: attackContext.weapon,
            wieldType: attackContext.weapon.defaultWieldType,
            appliedChanges: attackContext.changes,
        };

        // Obtener la fórmula de daño con sneak attack aplicado
        const damageFormula = getAttackDamageFormula(resolvedAttackContext);

        // Verificar que la fórmula incluye los dados de sneak attack
        const damageFormulaText = getDamageFormulaText(
            damageFormula,
            characterSheet.substitutionValues
        );

        // La fórmula debería incluir 2d6 de sneak attack
        expect(damageFormulaText[1]).toContainEqual({
            name: "Sneak Attack",
            finalText: "2d6",
            originalText: "(@customVariable.classes.rogue.sneakAttackDiceAmount)d6",
            numericValue: undefined,
            multipliersApplied: [],
        });

    });

    it("should stack sneak attack dice from rogue and assassin classes", () => {
        // Crear personaje multiclase: Rogue 5 / Assassin 3 
        // Rogue 5 = ceil(5/2) = 3d6, Assassin 3 = ceil(3/2) = 2d6, Total = 5d6
        const characterSheet = buildCharacter()
            .withClassLevels(createRogueClass(), 5)
            .withClassLevels(createAssassinClass(), 3)
            .withItem(rapier)
            .buildCharacterSheet();

        // Verificar que la custom variable agregó ambas sources correctamente
        expect(characterSheet.customVariables).toHaveLength(1);
        expect(characterSheet.customVariables[0].uniqueId).toEqual("classes.rogue.sneakAttackDiceAmount");
        expect(characterSheet.customVariables[0].name).toEqual("classes.rogue.sneakAttackDiceAmount");
        expect(characterSheet.customVariables[0].totalValue).toEqual(5); // 3 + 2 = 5
        expect(characterSheet.customVariables[0].sources).toHaveLength(2); // Rogue + Assassin
        expect(characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDiceAmount"]).toEqual(5);

        // Obtener el contexto de ataque del arma
        const attackContext = getWeaponAttackContext(
            rapier,
            characterSheet.attackData.attackContextChanges,
            characterSheet.attackData.attackChanges,
            characterSheet
        );

        // Buscar el contextual change de sneak attack
        const sneakAttackChange = attackContext.contextualChanges.find(
            change => change.name === "Sneak Attack"
        );
        expect(sneakAttackChange).toBeDefined();

        // Resolver el contextual change
        const resolvedSneakAttackChange: ResolvedAttackContextualChange = {
            ...sneakAttackChange!,
            variables: [],
        };

        // Crear el contexto de ataque resuelto con sneak attack aplicado
        const resolvedAttackContext: ResolvedAttackContext = {
            appliedContextualChanges: [resolvedSneakAttackChange],
            attackType: attackContext.type,
            character: characterSheet,
            weapon: attackContext.weapon,
            wieldType: attackContext.weapon.defaultWieldType,
            appliedChanges: attackContext.changes,
        };

        // Obtener la fórmula de daño con sneak attack aplicado
        const damageFormula = getAttackDamageFormula(resolvedAttackContext);

        // Verificar que la fórmula incluye los dados de sneak attack
        const damageFormulaText = getDamageFormulaText(
            damageFormula,
            characterSheet.substitutionValues
        );

        // La fórmula debería incluir 5d6 de sneak attack (3d6 de rogue + 2d6 de assassin)
        expect(damageFormulaText[1]).toContainEqual({
            name: "Sneak Attack",
            finalText: "5d6",
            originalText: "(@customVariable.classes.rogue.sneakAttackDiceAmount)d6",
            numericValue: undefined,
            multipliersApplied: [],
        });

    });

    it("should use variable die type and replacement for enhanced sneak attack", () => {
        // Crear clases avanzadas que incluyen tanto dados como tipo de dado
        const advancedRogueClass: CharacterClass = {
            name: "Rogue",
            uniqueId: "rogue",
            hitDie: 6,
            baseAttackBonusProgression: BabType.AVERAGE,
            baseSavesProgression: {
                fortitude: SaveType.POOR,
                reflex: SaveType.GOOD,
                will: SaveType.POOR,
            },
            classFeatures: [],
            levels: [
                {
                    level: 1,
                    classFeatures: [createAdvancedSneakAttackFeature([
                        createSneakAttackDiceVariable(),    // Dados: ceil(level/2)
                        createSneakAttackDieVariable(),     // Tipo de dado: 6 (base)
                    ])],
                },
            ],
            spellCasting: false,
        };

        const advancedAssassinClass: CharacterClass = {
            name: "Assassin",
            uniqueId: "assassin",
            hitDie: 6,
            baseAttackBonusProgression: BabType.AVERAGE,
            baseSavesProgression: {
                fortitude: SaveType.POOR,
                reflex: SaveType.POOR,
                will: SaveType.POOR,
            },
            classFeatures: [],
            levels: [
                {
                    level: 1,
                    classFeatures: [createAdvancedSneakAttackFeature([
                        createAssassinSneakAttackDiceVariable(),  // Dados: ceil(level/2)
                        createEnhancedSneakAttackDieVariable(),   // Tipo de dado: 8 (REPLACEMENT)
                    ])],
                },
            ],
            spellCasting: false,
        };

        // Crear personaje multiclase: Rogue 5 / Assassin 3
        // Dice: Rogue 5 (3) + Assassin 3 (2) = 5 dice
        // Die type: Base 6 REPLACED by 8 = d8
        const characterSheet = buildCharacter()
            .withClassLevels(advancedRogueClass, 5)
            .withClassLevels(advancedAssassinClass, 3)
            .withItem(rapier)
            .buildCharacterSheet();

        // Verificar que tenemos ambas custom variables
        expect(characterSheet.customVariables).toHaveLength(2);

        // Verificar cantidad de dados (5d total)
        const diceAmountVariable = characterSheet.customVariables.find(
            v => v.name === "classes.rogue.sneakAttackDiceAmount"
        );
        expect(diceAmountVariable).toBeDefined();
        expect(diceAmountVariable!.totalValue).toEqual(5); // 3 + 2 = 5
        expect(diceAmountVariable!.sources).toHaveLength(2); // Rogue + Assassin

        // Verificar tipo de dado (d8 por replacement)
        const dieTypeVariable = characterSheet.customVariables.find(
            v => v.name === "classes.rogue.sneakAttackDie"
        );
        expect(dieTypeVariable).toBeDefined();
        expect(dieTypeVariable!.totalValue).toEqual(8); // REPLACEMENT overwrites 6 with 8
        expect(dieTypeVariable!.sources).toHaveLength(1); // Base + Replacement

        // Verificar que están en substitutionValues
        expect(characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDiceAmount"]).toEqual(5);
        expect(characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDie"]).toEqual(8);

        console.log("All custom variables:", characterSheet.customVariables.map(v => ({ name: v.name, value: v.totalValue })));
        console.log("Relevant substitution values:", {
            diceAmount: characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDiceAmount"],
            dieType: characterSheet.substitutionValues["customVariable.classes.rogue.sneakAttackDie"]
        });

        // Obtener el contexto de ataque del arma
        const attackContext = getWeaponAttackContext(
            rapier,
            characterSheet.attackData.attackContextChanges,
            characterSheet.attackData.attackChanges,
            characterSheet
        );

        // Buscar el contextual change de sneak attack
        const sneakAttackChange = attackContext.contextualChanges.find(
            change => change.name === "Sneak Attack"
        );
        expect(sneakAttackChange).toBeDefined();

        // Resolver el contextual change
        const resolvedSneakAttackChange: ResolvedAttackContextualChange = {
            ...sneakAttackChange!,
            variables: [],
        };

        // Crear el contexto de ataque resuelto con sneak attack aplicado
        const resolvedAttackContext: ResolvedAttackContext = {
            appliedContextualChanges: [resolvedSneakAttackChange],
            attackType: attackContext.type,
            character: characterSheet,
            weapon: attackContext.weapon,
            wieldType: attackContext.weapon.defaultWieldType,
            appliedChanges: attackContext.changes,
        };

        // Obtener la fórmula de daño con sneak attack aplicado
        const damageFormula = getAttackDamageFormula(resolvedAttackContext);

        // Verificar que la fórmula incluye los dados de sneak attack
        const damageFormulaText = getDamageFormulaText(
            damageFormula,
            characterSheet.substitutionValues
        );

        console.log("Damage formula:", damageFormula);
        console.log("Damage formula text:", damageFormulaText);

        // La fórmula debería incluir 5d8 de sneak attack (5 dados de tipo d8)
        expect(damageFormulaText[1]).toContainEqual({
            name: "Sneak Attack",
            finalText: "5d8",
            originalText: "(@customVariable.classes.rogue.sneakAttackDiceAmount)d(@customVariable.classes.rogue.sneakAttackDie)",
            numericValue: undefined,
            multipliersApplied: [],
        });

        console.log("Enhanced sneak attack dice:", diceAmountVariable!.totalValue);
        console.log("Enhanced sneak attack die type:", dieTypeVariable!.totalValue);
        console.log("Dice sources:", diceAmountVariable!.sources.map(s => ({ name: s.sourceName, value: s.value })));
        console.log("Die type sources:", dieTypeVariable!.sources.map(s => ({ name: s.sourceName, value: s.value, bonusType: s.bonusTypeId })));
    });
});

describe("Custom Variables Dependency Resolution", () => {
    it("should resolve variables with dependencies in correct order", () => {
        // Variable A depends on Variable B - system should resolve B first, then A
        const variableA: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "variableA",
            formula: { expression: "@customVariable.variableB + 5" },
            bonusTypeId: "BASE",
        };

        const variableB: CustomVariableChange = {
            type: "CUSTOM_VARIABLE", 
            uniqueId: "variableB",
            formula: { expression: "10" },
            bonusTypeId: "BASE",
        };

        const buffA = buildBuff().withChange(variableA).build();
        buffA.name = "Variable A";
        
        const buffB = buildBuff().withChange(variableB).build();
        buffB.name = "Variable B";

        const character = buildCharacter()
            .withBuff(buffA)  // A se procesa primero, pero depende de B
            .withBuff(buffB)  // B se procesa después
            .build();

        const result = calculateCharacterSheet(character);

        // System should resolve dependencies and calculate correctly
        expect(result.customVariables).toHaveLength(2);
        
        const varA = result.customVariables.find(v => v.name === "variableA");
        const varB = result.customVariables.find(v => v.name === "variableB");
        
        expect(varB?.totalValue).toEqual(10);
        expect(varA?.totalValue).toEqual(15); // Should be 10 + 5 = 15
    });

    it("should resolve simple dependency chain correctly", () => {
        // C depends on B, B depends on A
        const variableA: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "baseValue",
            formula: { expression: "5" },
            bonusTypeId: "BASE",
        };

        const variableB: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "doubleBase",
            formula: { expression: "@customVariable.baseValue * 2" },
            bonusTypeId: "BASE",
        };

        const variableC: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "finalValue",
            formula: { expression: "@customVariable.doubleBase + 3" },
            bonusTypeId: "BASE",
        };

        const buffA = buildBuff().withChange(variableA).build();
        buffA.name = "Base Value";
        
        const buffB = buildBuff().withChange(variableB).build();
        buffB.name = "Double Base";
        
        const buffC = buildBuff().withChange(variableC).build();
        buffC.name = "Final Value";

        const character = buildCharacter()
            .withBuff(buffC)  // C procesado primero (depende de B)
            .withBuff(buffB)  // B procesado segundo (depende de A)
            .withBuff(buffA)  // A procesado último (no depende de nada)
            .build();

        const result = calculateCharacterSheet(character);

        expect(result.customVariables).toHaveLength(3);
        
        const baseValue = result.customVariables.find(v => v.name === "baseValue");
        const doubleBase = result.customVariables.find(v => v.name === "doubleBase");
        const finalValue = result.customVariables.find(v => v.name === "finalValue");
        
        expect(baseValue?.totalValue).toEqual(5);
        expect(doubleBase?.totalValue).toEqual(10); // 5 * 2
        expect(finalValue?.totalValue).toEqual(13); // 10 + 3
    });

    it("should detect and warn about circular dependencies", () => {
        // A depends on B, B depends on A
        const variableA: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "circularA",
            formula: { expression: "@customVariable.circularB + 1" },
            bonusTypeId: "BASE",
        };

        const variableB: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "circularB", 
            formula: { expression: "@customVariable.circularA + 1" },
            bonusTypeId: "BASE",
        };

        const buffA = buildBuff().withChange(variableA).build();
        buffA.name = "Circular A";
        
        const buffB = buildBuff().withChange(variableB).build();
        buffB.name = "Circular B";

        // Spy on console.log to capture warnings
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const character = buildCharacter()
            .withBuff(buffA)
            .withBuff(buffB)
            .build();

        const result = calculateCharacterSheet(character);

        // Should detect circular dependency and log warning
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining("Circular dependency detected")
        );

        consoleSpy.mockRestore();
    });

    it("should handle complex dependency graph", () => {
        // Complex dependency tree:
        // A (base: 3)
        // B depends on A (A * 2 = 6)
        // C depends on A (A + 1 = 4) 
        // D depends on B and C (B + C = 10)
        // E depends on D (D * 2 = 20)

        const variables = [
            {
                uniqueId: "A",
                formula: { expression: "3" },
                name: "Variable A"
            },
            {
                uniqueId: "B", 
                formula: { expression: "@customVariable.A * 2" },
                name: "Variable B"
            },
            {
                uniqueId: "C",
                formula: { expression: "@customVariable.A + 1" },
                name: "Variable C"
            },
            {
                uniqueId: "D",
                formula: { expression: "@customVariable.B + @customVariable.C" },
                name: "Variable D"
            },
            {
                uniqueId: "E",
                formula: { expression: "@customVariable.D * 2" },
                name: "Variable E"
            }
        ];

        const buffs = variables.map(variable => {
            const change: CustomVariableChange = {
                type: "CUSTOM_VARIABLE",
                uniqueId: variable.uniqueId,
                formula: variable.formula,
                bonusTypeId: "BASE",
            };
            const buff = buildBuff().withChange(change).build();
            buff.name = variable.name;
            return buff;
        });

        let characterBuilder = buildCharacter();
        // Add buffs in wrong order (E, D, C, B, A) to test dependency resolution
        buffs.reverse().forEach(buff => {
            characterBuilder = characterBuilder.withBuff(buff);
        });

        const character = characterBuilder.build();
        const result = calculateCharacterSheet(character);

        expect(result.customVariables).toHaveLength(5);
        
        const varA = result.customVariables.find(v => v.name === "A");
        const varB = result.customVariables.find(v => v.name === "B");
        const varC = result.customVariables.find(v => v.name === "C");
        const varD = result.customVariables.find(v => v.name === "D");
        const varE = result.customVariables.find(v => v.name === "E");
        
        expect(varA?.totalValue).toEqual(3);
        expect(varB?.totalValue).toEqual(6);  // 3 * 2
        expect(varC?.totalValue).toEqual(4);  // 3 + 1
        expect(varD?.totalValue).toEqual(10); // 6 + 4
        expect(varE?.totalValue).toEqual(20); // 10 * 2
    });
});

describe("Custom Variables with Special Changes", () => {
    it("should create custom variables from CustomVariableDefinitionChange", () => {
        const customVariableDefinition = buildCustomVariableDefinition();
        
        const specialFeature = buildSpecialFeature()
            .withSpecialChange(customVariableDefinition)
            .build();

        const character = buildCharacter()
            .withSpecialFeatures([specialFeature])
            .build();

        const result = calculateCharacterSheet(character);

        // Should have the custom variable from the definition
        console.log("Custom variables:", JSON.stringify(result.customVariables, null, 2));
        expect(result.customVariables).toHaveLength(1);
        expect(result.customVariables[0].uniqueId).toEqual("maneuver_progression");
        expect(result.customVariables[0].name).toEqual("Maneuver Progression");
        expect(result.customVariables[0].totalValue).toEqual(1); // Base value from definition
        expect(result.customVariables[0].sources).toHaveLength(1);
        expect(result.customVariables[0].sources[0].sourceName).toEqual("Maneuver Progression Base");

        // Should be available in substitution values
        expect(result.substitutionValues["customVariable.maneuver_progression"]).toEqual(1);
    });

    it("should combine base sources from definitions with additional changes", () => {
        const customVariableDefinition = buildCustomVariableDefinition();
        
        const specialFeature = buildSpecialFeature()
            .withSpecialChange(customVariableDefinition)
            .build();

        // Add an additional change that affects the same variable
        const additionalChange: CustomVariableChange = {
            type: "CUSTOM_VARIABLE",
            uniqueId: "maneuver_progression",
            formula: { expression: "3" },
            bonusTypeId: "ENHANCEMENT",
        };

        const enhancementBuff = buildBuff()
            .withChange(additionalChange)
            .build();
        enhancementBuff.name = "Maneuver Enhancement";

        const character = buildCharacter()
            .withSpecialFeatures([specialFeature])
            .withBuff(enhancementBuff)
            .build();

        const result = calculateCharacterSheet(character);

        // Should have one custom variable with two sources
        expect(result.customVariables).toHaveLength(1);
        expect(result.customVariables[0].uniqueId).toEqual("maneuver_progression");
        expect(result.customVariables[0].name).toEqual("Maneuver Progression");
        expect(result.customVariables[0].totalValue).toEqual(4); // 1 (base) + 3 (enhancement) = 4
        expect(result.customVariables[0].sources).toHaveLength(2);
        
        // Check both sources are present
        const sourceNames = result.customVariables[0].sources.map(s => s.sourceName);
        expect(sourceNames).toContain("Maneuver Progression Base");
        expect(sourceNames).toContain("Maneuver Enhancement");

        // Should be available in substitution values
        expect(result.substitutionValues["customVariable.maneuver_progression"]).toEqual(4);
    });

    it("should handle multiple custom variable definitions", () => {
        const maneuverDefinition = buildCustomVariableDefinition();
        const psionicDefinition = buildPsionicPowerDefinition();
        
        const specialFeature = buildSpecialFeature()
            .withSpecialChange(maneuverDefinition)
            .withSpecialChange(psionicDefinition)
            .build();

        const character = buildCharacter()
            .withSpecialFeatures([specialFeature])
            .build();

        const result = calculateCharacterSheet(character);

        // Should have both custom variables
        expect(result.customVariables).toHaveLength(2);
        
        const maneuverVar = result.customVariables.find(v => v.uniqueId === "maneuver_progression");
        const psionicVar = result.customVariables.find(v => v.uniqueId === "psionic_power_level");
        
        expect(maneuverVar).toBeDefined();
        expect(maneuverVar!.totalValue).toEqual(1);
        
        expect(psionicVar).toBeDefined();
        expect(psionicVar!.totalValue).toEqual(1);

        // Both should be in substitution values
        expect(result.substitutionValues["customVariable.maneuver_progression"]).toEqual(1);
        expect(result.substitutionValues["customVariable.psionic_power_level"]).toEqual(1);
    });

    it("should maintain existing functionality for variables without definitions", () => {
        // This tests that the original functionality still works
        const standaloneBuff = buildBuff()
            .withChange({
                type: "CUSTOM_VARIABLE",
                uniqueId: "standalone_variable",
                formula: { expression: "5" },
                bonusTypeId: "BASE",
            })
            .build();
        standaloneBuff.name = "Standalone Variable";

        const character = buildCharacter()
            .withBuff(standaloneBuff)
            .build();

        const result = calculateCharacterSheet(character);

        // Should still create the custom variable even without a definition
        expect(result.customVariables).toHaveLength(1);
        expect(result.customVariables[0].uniqueId).toEqual("standalone_variable");
        expect(result.customVariables[0].name).toEqual("standalone_variable");
        expect(result.customVariables[0].totalValue).toEqual(5);
        expect(result.substitutionValues["customVariable.standalone_variable"]).toEqual(5);
    });
});

// Helper function to create a special feature with special changes
function buildSpecialFeature() {
    return {
        withSpecialChange: function(specialChange: any) {
            this.specialChanges = this.specialChanges || [];
            this.specialChanges.push(specialChange);
            return this;
        },
        build: function() {
            return {
                uniqueId: "test_special_feature",
                name: "Test Special Feature",
                description: "A test special feature",
                specialChanges: this.specialChanges || []
            };
        }
    };
}

// Helper function to create a custom variable definition
function buildCustomVariableDefinition() {
    return {
        type: 'CUSTOM_VARIABLE_DEFINITION',
        variableId: 'maneuver_progression',
        name: 'Maneuver Progression',
        description: 'Tracks maneuver progression level',
        baseSources: [{
            bonusTypeId: 'BASE',
            type: 'CUSTOM_VARIABLE',
            uniqueId: 'maneuver_progression',
            formula: {
                expression: '1',
            },
            name: 'Maneuver Progression Base',
            createVariableForSource: true,
        }],
    };
}

// Helper function to create another custom variable definition for testing multiple definitions
function buildPsionicPowerDefinition() {
    return {
        type: 'CUSTOM_VARIABLE_DEFINITION' as const,
        variableId: 'psionic_power_level',
        name: 'Psionic Power Level',
        description: 'Base psionic power level',
        baseSources: [{
            bonusTypeId: 'BASE' as const,
            type: 'CUSTOM_VARIABLE' as const,
            uniqueId: 'psionic_power_level',
            formula: {
                expression: '1',
            },
            name: 'Psionic Power Base',
            createVariableForSource: true,
        }],
    };
}