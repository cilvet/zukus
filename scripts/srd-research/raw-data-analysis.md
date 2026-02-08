# D35E Raw Data Analysis: Source/Book Metadata

## Key Finding

**The D35E raw JSON data does NOT contain explicit source book metadata.** There is no field that directly identifies which sourcebook (PHB, DMG, XPH, etc.) an entity comes from. The `source` and `classSource` fields exist in the schema but are empty for virtually all entities.

## Detailed Field Analysis

### `source` field
- Present on most entity types (spells, feats, classes, items, etc.)
- **Empty string (`""`) for all entities** except:
  - `class-abilities.json`: one entry has `"source": "Ranger 1"` (refers to class level, not book)
- This field is part of the D35E Foundry VTT schema but was never populated with book references.

### `classSource` field
- Present on feats and some other types
- **Empty for all entities** except:
  - `feats.json`: one feat has `"classSource": "human"` (refers to race, not book)
  - `bestiary.json`: several entries have `"classSource": "human"` on embedded feats
- This field refers to racial/class origin, NOT source book.

### `tags` field
- Only present on some feats (not a universal field)
- Contains gameplay tags, not source attribution
- Distinct values found: `"Epic"`, `"Dromite"`
- Could help identify some content origin (Epic = Epic Level Handbook/SRD, Dromite = XPH)

### `isPower` field (spells/powers)
- `spells.json`: 673 entries, all with `isPower: false` (arcane/divine spells)
- `powers.json`: 441 entries, all with `isPower: true` (psionic powers)
- **This is the primary distinguisher between PHB spells and XPH powers**

### `pack` field
- Only found in `spell-school-domain.json` as references: `"pack": "D35E.spells"`
- Pack names are generic (e.g., `D35E.spells`) and do NOT differentiate by source book

### `img` paths
- All use generic icon paths like `systems/D35E/icons/spells/school/evo.png`
- No source-book-specific icon directories

### Description text
- Does NOT contain explicit source book references (PHB, DMG, XPH, etc.)
- Contains raw rule text only
- Some content can be identified by psionic terminology ("Psionic Discipline", "Power Points", "manifesting")

## Entity Counts by File

| File | Count | Likely Source(s) |
|------|-------|------------------|
| spells.json | 673 | SRD (PHB/DMG spells) |
| powers.json | 441 | SRD (XPH psionic powers) |
| feats.json | 388 | SRD (PHB + XPH + Epic) |
| classes.json | 33 | SRD (PHB + XPH + NPC + Prestige) |
| magic-items.json | 636 | SRD (DMG + XPH psionic items) |
| items.json | 130 | SRD (PHB mundane items) |
| armors-and-shields.json | 18 | SRD (PHB) |
| weapons-and-ammo.json | 85 | SRD (PHB) |
| bestiary.json | 645 | SRD (MM) |
| class-abilities.json | 129 | SRD (PHB + XPH class features) |
| spell-school-domain.json | 43 | SRD (PHB domains + XPH disciplines) |
| enhancements.json | 89 | SRD (DMG weapon/armor enhancements) |
| conditions.json | 38 | SRD (PHB/DMG conditions) |
| templates.json | 11 | SRD (MM templates like Lich, Vampire) |
| materials.json | 17 | SRD (DMG special materials) |
| commonbuffs.json | 37 | D35E system buffs |
| natural-attacks.json | 14 | SRD |
| srd-rules.json | 4 | SRD rules |
| racial-abilities.json | 41 | SRD racial traits |
| racialfeatures.json | 32 | SRD racial features |
| racial-hd.json | 15 | SRD racial HD |
| spell-like-abilities.json | 62 | SRD |
| damage-types.json | 21 | D35E system |
| roll-tables.json | 47 | SRD (DMG random tables) |
| traps.json | 1 | SRD |
| minions.json | 12 | SRD (summoned creatures) |
| minion-classes.json | 4 | SRD |
| itembuffs.json | 1 | D35E system |
| commonauras.json | 1 | D35E system |
| item-roll-tables.json | 4 | SRD |

## How to Distinguish SRD Content

Since the D35E system is specifically the **SRD implementation** for Foundry VTT, essentially ALL content in these files is SRD content. The D35E system does not include non-OGL content from supplement books. The content breaks down by SRD source:

### By SRD Section
1. **Core SRD (from PHB)**: base classes, spells (arcane/divine), feats, mundane items, armor, weapons
2. **Psionic SRD (from XPH)**: psionic classes, powers, psionic items, psionic feats
3. **Monster SRD (from MM)**: bestiary, templates, racial features
4. **DMG SRD**: magic items, enhancements, special materials, random tables
5. **Epic SRD**: epic feats (tagged "Epic"), epic magic items, epic powers

### Identifying Psionic vs Core Content
- **Psionic classes**: Psion variants, Psychic Warrior, Wilder, Soulknife (from `spellcastingType: "psionic"`)
- **Psionic powers**: entire `powers.json` file (441 entries, all `isPower: true`)
- **Psionic items**: ~37 psionic magic items in `magic-items.json` (identifiable by description keywords: "psionic", "psi", "crystal", "power points")
- **Psionic feats**: identifiable by `requiresPsionicFocus: true` or psionic keywords in description

### Classes by Source
- **Core SRD (PHB)**: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Wizard
- **Psionic SRD (XPH)**: Psion (6 variants), Psychic Warrior, Wilder, Soulknife
- **NPC classes (DMG)**: Warrior, Commoner, Aristocrat, Expert, Adept
- **Prestige classes (DMG)**: Arcane Archer, Arcane Trickster, Archmage, Assassin, Blackguard, Dwarven Defender, Eldritch Knight, Mystic Theurge

### Spell Class References (in learnedAt)
Classes referenced in spells: Assassin, Bard, Blackguard, Cleric, Druid, Paladin, Ranger, Sorcerer, Wizard
Domains referenced: 35 domains including Air, Animal, Chaos, Death, etc.

### Power Class References (in learnedAt)
Classes referenced in powers: Egoist, Kineticist, Nomad, Psion, Psion/Wilder, Psychic Warrior, Seer, Shaper, Telepath, Wilder

## Implications for SRD Filtering

Since all D35E content IS SRD content, filtering for "SRD only" is not needed at the data level. However, if future non-SRD content is added, the recommended approach would be:

1. **File-level separation**: Keep SRD and non-SRD content in separate JSON files (as D35E already does for spells vs. powers)
2. **Tag-based filtering**: Add a `"srdSource"` tag to entities (e.g., `"srd-core"`, `"srd-psionic"`, `"srd-epic"`, `"srd-monster"`)
3. **Psionic detection**: Use `isPower`, `spellcastingType: "psionic"`, and psionic keywords in descriptions to identify XPH content
