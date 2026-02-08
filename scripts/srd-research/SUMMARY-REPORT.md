# SRD Compendium Research - Summary Report

**Date**: 2026-02-08
**Objective**: Separate D&D 3.5 compendium content by source book, verify SRD completeness, and prepare Spanish translations.

---

## 1. Current State of d35e-raw Data

Our compendium data comes from **D35E Foundry VTT** (https://github.com/Rughalt/D35E), exported as 30 JSON files in `packages/core/data/d35e-raw/`.

| Entity Type | Count | File |
|---|---|---|
| Spells | 673 | spells.json |
| Magic Items | 636 | magic-items.json |
| Bestiary | 645 | bestiary.json |
| Psionic Powers | 441 | powers.json |
| Feats | 388 | feats.json |
| Weapon Enhancements | 89 | enhancements.json |
| Weapons & Ammo | 85 | weapons-and-ammo.json |
| Items | 130 | items.json |
| Class Abilities | 129 | class-abilities.json |
| Classes | 33 | classes.json |
| Spell-like Abilities | 62 | spell-like-abilities.json |
| Racial Abilities | 41 | racial-abilities.json |
| Conditions | 38 | conditions.json |
| Common Buffs | 37 | commonbuffs.json |
| Armors & Shields | 18 | armors-and-shields.json |
| Racial Features | 32 | racialfeatures.json |
| Materials | 17 | materials.json |
| **TOTAL** | **~3,546** | 30 files |

**Key insight**: D35E raw data has **NO source/book metadata** — `source` fields exist but are empty strings.

---

## 2. SRD Coverage (Cross-Reference Results)

**Overall: 96.0% SRD coverage** (2,144 matched / 2,233 SRD entities)

| Type | SRD Total | Matched | Missing | Extra (non-SRD) | Coverage |
|---|---|---|---|---|---|
| Spells | 674 | 673 | 1 | 0 | 99.9% |
| Feats | 405 | 404 | 1 | 0 | 99.8% |
| Conditions | 38 | 38 | 0 | 0 | 100% |
| Psionic Powers | 287 | 286 | 1 | 154 | 99.7% |
| Magic Items | 377 | 357 | 20 | 288 | 94.7% |
| Monsters | 409 | 358 | 51 | 317 | 87.5% |
| Classes | 43 | 28 | 15 | 5 | 65.1% |

### Missing from SRD
- **1 spell**: Blacklight (Darkness domain)
- **1 feat**: Trap Sense (epic)
- **1 psionic power**: Deja Vu
- **20 magic items**: Mostly naming variants (Figurines of Wondrous Power, Ioun Stones listed individually in SRD)
- **51 monsters**: Generic category entries (Demon, Devil, Dragon) where D35E uses specific variants
- **15 classes**: All prestige classes (including psionic prestige: Cerebremancer, Elocater, etc.)

### Extra (non-SRD) in D35E
- **154 extra psionic powers** (from expanded OGL content)
- **288 extra magic items** (from OGL supplements)
- **317 extra monsters** (from OGL supplements)
- **5 extra classes** (non-SRD)

**Critical insight**: D35E is NOT purely SRD. It contains significant OGL supplement content. Source attribution IS needed.

---

## 3. Source Book Classification

The dndtools.org scraper provided **source book attribution** for 1,963 spells via the `source` field:

| Source Code | Book Name | Spell Count |
|---|---|---|
| spellsAllCore | Player's Handbook (SRD) | 624 |
| spellsphb2 | Player's Handbook II | 122 |
| spellsCMage | Complete Mage | 118 |
| spellsCDiv | Complete Divine | 106 |
| spellsfrost | Frostburn | 100 |
| spellsCA | Complete Arcane | 94 |
| spellsboed | Book of Exalted Deeds | 84 |
| spellsph | Planar Handbook | 72 |
| spellsCAdv | Complete Adventurer | 68 |
| spellssand | Sandstorm | 66 |
| spellsmh | Miniatures Handbook | 62 |
| spellsdrac | Draconomicon | 56 |
| spellsCC | Complete Champion | 52 |
| spellsstorm | Stormwrack | 42 |
| spellsdragonmagic | Dragon Magic | 41 |
| spellslm | Libris Mortis | 43 |
| spellsmoi | Magic of Incarnum | 35 |
| spellsrotd | Races of the Dragon | 35 |
| spellsCScou | Complete Scoundrel | 27 |
| spellshob | Heroes of Battle | 23 |
| spellstom | Tome of Magic | 21 |
| + 11 more books | Various | ~100 |

The `spell-source-mapping.json` file maps 602 of our 673 D35E spells to their source book, D35E entity ID, and Spanish name (71 spells unmatched due to naming differences or domain-only spells).

---

## 4. Spanish Translations

### Scraped Data (from srd.dndtools.org/es/)
- **1,963 spells** with Spanish names (597 core SRD + 1,366 supplement)
- **110 feats** with Spanish names and benefit text
- Quality: Good for names, partial for descriptions (some remain in English)

### Translation Infrastructure
- Existing: `TranslationPack` system in `packages/core/core/domain/translations/`
- Existing pack: `dnd35-feats-es.ts` (~100 feats translated)
- **Gemini API key** already configured in `.env` (GOOGLE_GENERATIVE_AI_API_KEY)
- Estimated batch translation cost: ~$0.02 for ALL entities via Gemini 2.5 Flash

### Translation Sources
| Source | Quality | Coverage | Format |
|---|---|---|---|
| srd.dndtools.org/es/ | Good (community) | Spells + Feats | Scraped to JSON |
| Devir official editions | Best (official) | Full PHB/DMG/MM | Not available digitally |
| Gemini batch API | Variable | Everything | Automated pipeline |

---

## 5. Tools Built

| Script | Purpose |
|---|---|
| `verify-srd-spells.ts` | Cross-reference our spells vs SRD reference (99.9% match) |
| `verify-srd-feats.ts` | Cross-reference our feats vs SRD reference (99.8% match) |
| `cross-reference-srd.ts` | Full cross-reference of ALL entity types vs SRD |
| `split-wondrous-items.ts` | Classify 636 magic items into 8 sub-types |
| `extract-all-feats.ts` | Extract & structure 388 feats with categories |
| `scrape-dndtools-es.ts` | Scrape Spanish translations from dndtools.org/es/ |
| `classify-by-source.ts` | Map spells to source books using dndtools data |

### Research Documents

| Document | Description |
|---|---|
| `srd-spell-list.md` | Complete SRD spell lists by class (Sorc/Wiz, Cleric, Druid, Bard, Paladin, Ranger) + all 23 cleric domains |
| `srd-content-all-types.md` | Complete SRD content lists for ALL entity types (races, classes, feats, skills, conditions, equipment, magic items, monsters, psionics, epic) |
| `raw-data-analysis.md` | Analysis of d35e-raw JSON structure, field availability, source metadata gaps |
| `srd-gap-analysis.md` | Gap analysis: structured compendium vs raw data vs full SRD |
| `spanish-translations-research.md` | Spanish translation sources, quality assessment, Devir terminology reference |
| `translation-pipeline-plan.md` | Gemini Batch API pipeline plan with cost estimates (~$0.02 total) |

---

## 6. Reference Data Files

| File | Description | Count |
|---|---|---|
| `srd-spells.json` | SRD spell name reference | 674 |
| `srd-feats.json` | SRD feat name reference | 405 |
| `srd-monsters.json` | SRD monster name reference | 409 |
| `srd-classes.json` | SRD class reference (base + prestige) | 43 |
| `srd-races.json` | SRD race reference | 7 |
| `srd-skills.json` | SRD skill reference | 36 |
| `srd-conditions.json` | SRD condition reference | 38 |
| `srd-magic-items.json` | SRD magic items by sub-type | 377 |
| `srd-psionic-powers.json` | SRD psionic power reference | 287 |
| `srd-cross-reference.json` | Full cross-reference results | — |
| `spell-source-mapping.json` | Spell → source book + Spanish name | 602 |
| `all-feats-structured.json` | All feats structured with categories | 388 |
| `dndtools-spells-es.json` | Scraped Spanish spell translations | 1,963 |
| `dndtools-feats-es.json` | Scraped Spanish feat translations | 110 |
| `ring.json` / `rod.json` / `staff.json` / etc. | Split magic items by sub-type | 636 total |

---

## 7. Gap Analysis — Missing SRD Content

### Entity types with NO schema/data
- **Races** (7 core SRD races)
- **Potions/Oils** (SRD has ~101, we have ~8)
- **Scrolls, Wands** (template-based, generate from spells)
- **Cursed Items** (~30 in SRD)
- **Diseases** (~20), **Poisons** (~35)
- **Traps** (~56 sample, we have 1)
- **Skills** as entities (36 total, currently just string references)

### Incomplete entity types
- **Classes**: Only 6 of 11 base classes structured. Missing: Barbarian, Bard, Monk, Paladin, Ranger. 0 of 15 prestige classes.
- **Feats**: Only 37 structured in compendium out of 388 raw (~120 SRD)
- **Wondrous Items**: Need splitting into rings, rods, staves, etc. (script built, not yet applied)
- **Bestiary**: 645 in raw data, not in compendium

### 15 new entity schemas needed
race, ring, rod, staff, potion, artifact, cursedItem, disease, poison, trap, skill, monster, condition, template, specialMaterial

---

## 8. Recommended Next Steps (Priority Order)

### Phase 1: Source Attribution & Filtering
1. Apply `spell-source-mapping.json` to tag all spells with source book
2. Build similar source mappings for other entity types (feats, items, monsters)
3. Create a "SRD-only" filter that uses cross-reference data to include only matched entities

### Phase 2: Complete Missing SRD Content
1. Structure remaining 5 base classes (Barbarian, Bard, Monk, Paladin, Ranger)
2. Add prestige classes (15 missing)
3. Create race entities (7 core)
4. Split wondrous items into proper sub-types (script ready)
5. Add potions, cursed items, diseases, poisons

### Phase 3: Spanish Translation Pipeline
1. Generate TranslationPacks from scraped dndtools data (script needed)
2. Set up Gemini batch pipeline for remaining translations
3. Cross-validate automated translations against scraped community data
4. Manual review pass for quality

### Phase 4: Compendium Restructuring
1. Apply source book tags to all entities
2. Create clean SRD-only compendium export
3. Create supplement compendiums (Complete Arcane, Complete Divine, etc.)
4. Register all TranslationPacks in the app

---

## 9. Key Insights

1. **D35E ≠ SRD**: The Foundry VTT D35E system includes OGL supplement content beyond the SRD. We have 764 extra entities that are NOT in the SRD.
2. **dndtools.org is the key**: The `source` field from dndtools provides book attribution that D35E lacks. This is essential for separating content by book.
3. **Near-complete SRD**: For core types (spells, feats, powers, conditions), we have 99%+ SRD coverage. Gaps are mainly in prestige classes, races, and some magic item variants.
4. **Translation feasible**: 1,963 Spanish spell names + 110 feat names already scraped. Gemini batch can fill the rest for ~$0.02.
5. **Name normalization required**: Smart quotes (U+2019 vs ASCII apostrophe) and preposition casing differences need handling in any matching pipeline.
