# D&D 3.5 SRD Gap Analysis

**Generated**: 2026-02-08
**Purpose**: Compare our current compendium data against the full D&D 3.5 SRD to identify missing content.

---

## Summary

| Category | SRD Expected | Raw Data (d35e-raw) | Structured (srd/ or entities/) | Status |
|---|---|---|---|---|
| **Spells** | ~800 (core) | 673 | 2,789 (includes non-SRD) | GOOD - exceeds SRD |
| **Feats** | ~120 SRD core | 388 (includes non-SRD) | 37 (fighter bonus feats only) | PARTIAL - raw has plenty, structured is minimal |
| **Powers (Psionic)** | ~300 | 441 | loaded via JSON | GOOD |
| **Base Classes** | 11 + 5 NPC | 26 base (incl. psionics) | 6 (Fighter, Rogue, Cleric, Druid, Sorcerer, Wizard) | PARTIAL - missing 5 base + 5 NPC |
| **Prestige Classes** | 15 | 7 | 0 | MAJOR GAP - missing 8 prestige classes |
| **Races** | 7 core | 0 (via racial features) | 0 | MISSING entirely |
| **Skills** | 36 | 0 | referenced in class data only | NOT structured as entities |
| **Weapons** | ~80 | 85 | 80 | GOOD |
| **Armors** | ~12 | 18 (incl. shields) | 12 armors + 6 shields | GOOD |
| **Items (mundane)** | ~120 | 130 | 124 | GOOD |
| **Wondrous Items** | ~400+ | 550 (misc slot items) | 581 (includes rings, rods, staves) | GOOD but needs sub-typing |
| **Rings** | ~45 | 70 | lumped into wondrousItems | NEEDS separate schema |
| **Rods** | ~25 | 61 | lumped into wondrousItems | NEEDS separate schema |
| **Staves** | ~20 | 35 | lumped into wondrousItems | NEEDS separate schema |
| **Potions/Oils** | 101 | 8 | 0 | MAJOR GAP |
| **Scrolls** | (any spell) | 0 | 0 | MISSING - template-based |
| **Wands** | (any spell) | 0 | 0 | MISSING - template-based |
| **Specific Magic Weapons** | ~50 | ~23 in magic-items | mixed into wondrousItems | NEEDS extraction |
| **Specific Magic Armor** | ~30 | ~31 in magic-items | mixed into wondrousItems | NEEDS extraction |
| **Weapon Properties** | ~47 | 89 enhancements | 47 | GOOD |
| **Armor Properties** | ~31 | included in enhancements | 31 | GOOD |
| **Artifacts** | ~30 (minor+major) | ~5 detected | mixed into wondrousItems | MAJOR GAP |
| **Cursed Items** | ~30 | some in magic-items | 0 | MISSING |
| **Intelligent Items** | rules + examples | 0 | 0 | MISSING |
| **Monsters/Bestiary** | ~700+ | 645 | 0 (not structured) | RAW ONLY - not in compendium |
| **Conditions** | 38 | 38 | 0 (not in compendium) | RAW ONLY |
| **Templates** | ~11 | 11 | 0 | RAW ONLY |
| **Traps** | ~56 | 1 | 0 | MAJOR GAP |
| **Diseases** | ~20 | 0 | 0 | MISSING |
| **Poisons** | ~35 | 0 | 0 | MISSING |
| **Special Materials** | 6 | 17 | 0 | RAW ONLY |
| **Languages** | ~20 | structured in srd/languages.ts | srd/languages.ts | DONE |

---

## Detailed Analysis

### 1. ENTITY TYPES WE HAVE AND ARE WELL-COVERED

#### Spells (GOOD)
- **Structured**: 2,789 spells in JSON database with 5,956 spell-class relations
- **Source**: Loaded via `entities/relations/__testdata__/spells.json`
- **Schema**: `spellSchema` with addons: searchable, imageable
- **Quality**: Fully enriched with class-level relations, filterable
- **Note**: Exceeds core SRD (~800 spells) because it includes additional sourcebook content

#### Weapons (GOOD)
- **Structured**: 80 weapons in `srd/equipment/d35e/weapons.ts`
- **Schema**: `weaponSchema` with addons: searchable, imageable, dnd35item, effectful, equippable
- **Fields**: damageDice, damageType, critRange, critMultiplier, weaponCategory, weaponType, weightClass, finesse, isMasterwork
- **Coverage**: All SRD simple, martial, and exotic weapons

#### Armors & Shields (GOOD)
- **Structured**: 12 armors + 6 shields in separate files
- **Schemas**: `armorSchema` and `shieldSchema`
- **Coverage**: Complete for SRD base armors and shields

#### Items - Mundane Gear (GOOD)
- **Structured**: 124 items in `srd/equipment/d35e/items.ts`
- **Schema**: `itemSchema` with addons: searchable, imageable, taggable, dnd35item, stackable
- **Coverage**: Adventuring gear, tools, containers, etc.

#### Weapon/Armor Properties (GOOD)
- **Structured**: 47 weapon properties + 31 armor properties
- **Schemas**: `weaponPropertySchema` and `armorPropertySchema`
- **Coverage**: Flaming, Keen, Vorpal, Fortification, Shadow, etc.

#### Powers - Psionics (GOOD)
- **Structured**: Loaded via JSON, enriched with class-level relations
- **Schema**: `powerSchema`
- **Coverage**: Full Expanded Psionics Handbook content (441 powers)

#### Languages (DONE)
- **Structured**: `srd/languages.ts`

---

### 2. ENTITY TYPES WITH PARTIAL COVERAGE

#### Classes (PARTIAL)
**Currently structured (6 of 11 base + 0 of 15 prestige):**
- Fighter (with class schema, 164 lines)
- Rogue (with class features, 230+464 lines)
- Cleric (with class features, 95+165 lines)
- Druid (with class features, 99+246 lines)
- Sorcerer (with class features, 84+159 lines)
- Wizard (with class features, 99+144 lines)

**Missing base classes (5):**
- Barbarian
- Bard (exists in `classes.ts` but not as full SRD implementation)
- Monk
- Paladin
- Ranger

**Missing prestige classes (ALL 15):**
- Arcane Archer, Arcane Trickster, Archmage, Assassin, Blackguard
- Dragon Disciple, Duelist, Dwarven Defender, Eldritch Knight
- Hierophant, Horizon Walker, Loremaster, Mystic Theurge
- Shadowdancer, Thaumaturgist

**Missing NPC classes (5):**
- Adept, Aristocrat, Commoner, Expert, Warrior

**Raw data**: All 33 classes exist in `classes.json` (26 base + 7 prestige)
**Note**: Raw data has 7 prestige classes, SRD has 15 -- raw data is also incomplete

#### Feats (PARTIAL)
- **Structured**: Only 37 fighter bonus feats in `entities/feats.ts`
- **Raw data**: 388 feats in `feats.json`
- **SRD expected**: ~120 core feats
- **Gap**: Need to convert all SRD feats to structured format
- **Note**: Raw data exceeds SRD because it includes feats from supplemental sources

#### Wondrous Items (NEEDS RESTRUCTURING)
- **Structured**: 581 items in `srd/equipment/d35e/wondrousItems.ts` -- all typed as `entityType: "wondrousItem"`
- **Problem**: This file is a catch-all that includes items that should be separate entity types:
  - **Rings** (70 items with slot=ring): Should be `entityType: "ring"` with a `ringSchema`
  - **Rods** (61 items): Should be `entityType: "rod"` with a `rodSchema`
  - **Staves** (35 items): Should be `entityType: "staff"` with a `staffSchema`
  - **Specific magic armor** (~31): Should be `entityType: "specificArmor"` or merged with armor
  - **Specific magic weapons** (~23): Should be `entityType: "specificWeapon"` or merged with weapons
  - **Artifacts** (~5 detected, should be ~30): Should be `entityType: "artifact"`
  - **Cursed items**: Some exist but not flagged
- **Recommendation**: Create separate schemas and split the wondrousItems file

#### Bestiary / Monsters (RAW ONLY)
- **Raw data**: 645 creatures in `bestiary.json` with full stat blocks
- **Structured**: Not in the compendium at all -- no schema, no entity type
- **Creature types**: dragon (148), outsider (99), animal (83), magicalBeast (63), undead (43), vermin (38), aberration (36), elemental (33), construct (27), humanoid (23), monstrousHumanoid (15), giant (13), plant (10), fey (8), ooze (6)
- **Priority**: HIGH -- this is a large body of content that already exists as raw data

#### Conditions (RAW ONLY)
- **Raw data**: 38 conditions in `conditions.json` -- matches SRD exactly
- **Structured**: Not in the compendium
- **Note**: Conditions are important for gameplay tracking

#### Templates (RAW ONLY)
- **Raw data**: 11 templates (Half-Fiend, Half-Dragon, Skeleton, Fiendish, Half-Celestial, Celestial, Lich, Zombie, Vampire, Ghost, Phrenic)
- **Structured**: Not in the compendium

#### Special Materials (RAW ONLY)
- **Raw data**: 17 materials (SRD has 6: Adamantine, Darkwood, Dragonhide, Cold Iron, Mithral, Alchemical Silver)
- **Structured**: Not in the compendium

---

### 3. ENTITY TYPES COMPLETELY MISSING

#### Races (MISSING)
- **SRD races**: Human, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling
- **Raw data**: Racial features (32) and racial abilities (41) exist but no race entity type
- **Need**: `raceSchema` with fields for ability modifiers, size, speed, racial traits, favored class, languages
- **Priority**: HIGH -- fundamental character creation data

#### Potions & Oils (MAJOR GAP)
- **SRD**: 101 potions and oils (organized by market price)
- **Raw data**: Only 8 potion/elixir items in magic-items.json
- **Structured**: None
- **Need**: `potionSchema` -- relatively simple (spell stored, caster level, market price)
- **Note**: In D&D 3.5, potions are spells of 3rd level or lower at minimum caster level. Could potentially be generated from spell data

#### Scrolls (MISSING)
- **SRD**: Scrolls can contain any spell; pricing is formulaic
- **Raw data**: None
- **Structured**: None
- **Note**: Scrolls are template-based -- the SRD provides the formula (spell level x caster level x 25 gp for arcane, x25 gp for divine). Could be generated from spell data rather than stored individually

#### Wands (MISSING)
- **SRD**: Wands can contain spells of 4th level or lower; 50 charges
- **Raw data**: None
- **Structured**: None
- **Note**: Like scrolls, wands are formulaic (spell level x caster level x 750 gp). Could be generated

#### Artifacts (MAJOR GAP)
- **SRD**: ~15 minor artifacts + ~15 major artifacts
- **Raw data**: Only ~5 detected in magic-items.json
- **Minor artifacts**: Book of Infinite Spells, Deck of Many Things, Sphere of Annihilation, etc.
- **Major artifacts**: Codex of the Infinite Planes, Cup and Talisman of Al'Akbar, Jacinth of Inestimable Beauty, etc.
- **Need**: `artifactSchema` with special fields for artifact-specific properties

#### Cursed Items (MISSING)
- **SRD**: ~30 specific cursed items plus cursed item creation rules
- **Examples**: Bag of Devouring, Boots of Dancing, Helm of Opposite Alignment, etc.
- **Need**: `cursedItemSchema` or a `cursed` flag on existing item schemas

#### Intelligent Items (MISSING)
- **SRD**: Rules for intelligent items with examples
- **Properties**: Intelligence, Wisdom, Charisma, Ego score, communication, senses, powers
- **Could be**: An addon or flag on weapon/wondrous item schemas

#### Diseases (MISSING)
- **SRD**: ~20 diseases (Blinding Sickness, Cackle Fever, Devil Chills, Filth Fever, Mindfire, Mummy Rot, Red Ache, Shakes, Slimy Doom, etc.)
- **Fields needed**: infection type, DC, incubation, damage
- **Need**: `diseaseSchema`

#### Poisons (MISSING)
- **SRD**: ~35 poisons (Black Lotus Extract, Wyvern Poison, Drow Poison, etc.)
- **Fields needed**: type (injury/contact/ingested/inhaled), DC, initial damage, secondary damage, price
- **Need**: `poisonSchema`

#### Traps (MAJOR GAP)
- **SRD**: ~56 sample traps organized by CR (1-10)
- **Raw data**: Only 1 trap (Camouflaged Pit Trap)
- **Need**: `trapSchema` with fields for CR, type, trigger, reset, effect, Search DC, Disable DC

#### Skills (NOT STRUCTURED)
- **SRD**: 36 skills
- **Currently**: Referenced by name in class data (e.g., `classSkills: ["appraise", ...]`)
- **Need**: `skillSchema` with fields for key ability, trained only, armor check penalty, description, synergies
- **Priority**: MEDIUM -- needed for complete character sheets but currently handled as string references

---

### 4. PRESTIGE CLASS GAP DETAIL

Classes missing from raw data (d35e has 7 of 15 SRD prestige classes):

| Prestige Class | In Raw Data | In Structured SRD | Missing |
|---|---|---|---|
| Arcane Archer | YES | NO | Need to structure |
| Arcane Trickster | YES | NO | Need to structure |
| Archmage | YES | NO | Need to structure |
| Assassin | YES | NO | Need to structure |
| Blackguard | YES (as base) | NO | Need to structure |
| Dragon Disciple | NO | NO | Need raw data + structure |
| Duelist | NO | NO | Need raw data + structure |
| Dwarven Defender | YES | NO | Need to structure |
| Eldritch Knight | YES | NO | Need to structure |
| Hierophant | NO | NO | Need raw data + structure |
| Horizon Walker | NO | NO | Need raw data + structure |
| Loremaster | NO | NO | Need raw data + structure |
| Mystic Theurge | YES | NO | Need to structure |
| Shadowdancer | NO | NO | Need raw data + structure |
| Thaumaturgist | NO | NO | Need raw data + structure |

---

### 5. RECOMMENDED PRIORITIES

#### Priority 1 -- High Impact, Data Exists
1. **Convert bestiary** (645 creatures) to structured compendium entities
2. **Split wondrousItems** into proper sub-types (rings, rods, staves, specific weapons/armor)
3. **Convert all SRD feats** from raw data to structured entities (currently only 37 of ~120)
4. **Structure remaining base classes** (Barbarian, Bard, Monk, Paladin, Ranger)
5. **Structure conditions** (38 items, data exists)

#### Priority 2 -- Missing Content, Needed for Completeness
6. **Create races** as structured entities (7 core races)
7. **Generate potions** from spell data (101 potions, formulaic)
8. **Add diseases** (20 entries, simple schema)
9. **Add poisons** (35 entries, simple schema)
10. **Add traps** (56 entries, only 1 in raw data)

#### Priority 3 -- Nice to Have
11. **Structure prestige classes** (15 classes, complex)
12. **Add artifacts** (30 items, partially in raw data)
13. **Add cursed items** (30 items)
14. **Create skills** as structured entities (36 skills)
15. **Add scrolls/wands** as generated template items

---

### 6. NEW SCHEMAS NEEDED

```
raceSchema          - Core playable races (7)
ringSchema          - Separate from wondrous items (70 in data)
rodSchema           - Separate from wondrous items (61 in data)
staffSchema         - Separate from wondrous items (35 in data)
potionSchema        - Consumable spell-in-a-bottle (101)
artifactSchema      - Minor + major artifacts (~30)
cursedItemSchema    - Specific cursed items (~30)
diseaseSchema       - SRD diseases (~20)
poisonSchema        - SRD poisons (~35)
trapSchema          - SRD sample traps (~56)
skillSchema         - SRD skills (36)
monsterSchema       - Bestiary creatures (645 in raw data)
conditionSchema     - Status conditions (38 in raw data)
templateSchema      - Creature templates (11 in raw data)
specialMaterialSchema - Special weapon/armor materials (6 SRD, 17 raw)
```

---

### 7. DATA SOURCES

- **Primary**: `/packages/core/data/d35e-raw/` -- D35E Foundry VTT export
- **Structured**: `/packages/core/srd/` -- Hand-crafted TypeScript entities
- **Example Entities**: `/packages/core/core/domain/compendiums/examples/entities/` -- Compendium entities
- **Schemas**: `/packages/core/core/domain/compendiums/examples/schemas/` -- Entity schema definitions
- **Online SRD**: https://www.d20srd.org/ -- Authoritative reference for content verification
