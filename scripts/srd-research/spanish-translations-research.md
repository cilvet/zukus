# Spanish Translations of D&D 3.5 SRD Content - Research

## Summary

There are several online sources with Spanish translations of D&D 3.5 SRD content. The most useful for structured extraction is **srd.dndtools.org/es/** which has a near-complete Spanish SRD. Community sites like **nivel20.com** and **rolroyce.com** also provide translated content. No ready-made structured data files (JSON, CSV) were found -- all sources are HTML/web-based.

---

## Key Sources

### 1. srd.dndtools.org (Spanish section)
**URL**: https://srd.dndtools.org/es/
**Coverage**: Most complete single source. Has Spanish translations of:
- **Spells**: Full spell lists by class (wizard, cleric, druid, bard, paladin, ranger)
  - Example: https://srd.dndtools.org/es/srd/magic/spells/classSpellLists/wizardSpells.html
  - Contains 300+ wizard/sorcerer spells with Spanish names across all levels
  - Sample: "Misil magico", "Bola de fuego", "Detectar magia", "Mano de mago"
- **Feats**: Full feat list with Spanish names and descriptions
  - Example: https://srd.dndtools.org/es/srd/feats/featsAll.html
  - Categories, prerequisites, and benefits all translated
  - Sample: "Acrobatico", "Vigilancia", "Lucha a Ciegas", "Combate Casting"
- **Magic Items**: Creation rules, wondrous items, intelligent items, cursed items
  - Example: https://srd.dndtools.org/es/srd/equipment/magicItemsWI.html
  - Full magic item descriptions in Spanish
- **Classes, Skills, Combat, Equipment**: Appears to have full SRD coverage in Spanish

**Quality**: Community-translated. Translations match the official Devir terminology in most cases.
**Format**: HTML pages. Would need web scraping to extract structured data.
**Assessment**: BEST single source for scraping. Consistent URL structure makes programmatic extraction feasible.

### 2. nivel20.com
**URL**: https://nivel20.com/games/dnd-3-5/feats
**Coverage**: D&D 3.5 feats (dotes) with both Spanish and English names
- Provides Spanish-to-English mapping which is very useful for matching
- Sample mappings found:
  - "Abstención de materiales" = Eschew Materials
  - "Acrobático" = Acrobatic
  - "Afinidad con los animales" = Animal Affinity
  - "Ataque poderoso" = Power Attack
  - "Combate con dos armas" = Two-Weapon Fighting
  - "Competencia con arma exótica" = Exotic Weapon Proficiency
- Paginated list (multiple pages)

**Quality**: Good quality translations. Includes both languages which helps with entity matching.
**Format**: HTML. Paginated.
**Assessment**: Excellent for feat name mapping (EN <-> ES). Good secondary reference.

### 3. rolroyce.com
**URL**: https://www.rolroyce.com/rol/DDP/Clases/
**Coverage**: D&D 3.5 class descriptions, spell lists by class
- Has Mago (Wizard), Hechicero (Sorcerer), Robaconjuros (Spellthief) pages
- Also has Pathfinder content (separate section)
- Spell lists embedded within class pages

**Quality**: Good translations, uses official Devir terminology.
**Format**: HTML pages.
**Assessment**: Useful as cross-reference for class-specific spell lists.

### 4. rincondeldm.com
**URL**: https://www.rincondeldm.com/wiki/dungeons-dragons/35/
**Coverage**: D&D 3.5 wiki with:
- Magic items and properties ("Objetos magicos y Propiedades")
  - Includes items like "Anillo almacenaconjuros" (Ring of Spell Storing)
- Other SRD content categories

**Quality**: Community wiki format. Decent translations.
**Format**: Wiki HTML pages.
**Assessment**: Good supplementary reference for magic items.

### 5. srd.nosolorol.com (D&D 5e only)
**URL**: https://srd.nosolorol.com/DD5/index.html
**Coverage**: SRD 5.1 in Spanish (NOT 3.5)
- Professional translation by Ana Navalon
- Includes spells, feats, classes, items

**Note**: This is 5e, not 3.5. However, many spell/feat names overlap between editions and could serve as a reference for consistent terminology choices.

### 6. Comunidad Umbria
**URL**: https://www.comunidadumbria.com/
**Coverage**: Spanish RPG community with D&D 3.5 play-by-post games
- Forum threads discussing feats, spells, builds
- Has a thread titled "HERRAMIENTAS D&D 3.5 EN ESPANOL"
- Not a structured reference, but good for terminology verification

**Assessment**: Forum-based. Useful for verifying community-accepted terminology, not for bulk extraction.

---

## Official Devir Translations

Devir Iberia published the official Spanish translations of D&D 3.5 core books:
- **Manual del Jugador** (Player's Handbook)
- **Guia del Dungeon Master** (Dungeon Master's Guide)
- **Manual de Monstruos** (Monster Manual)

These established the "canonical" Spanish terminology for D&D 3.5. The community translations above largely follow Devir's terminology. However:
- The official PDFs are not freely available
- Known translation errors exist in the Devir editions
- Some community sites recommend cross-referencing with English errata

---

## Structured Data Sources (English SRD 3.5)

While no Spanish structured data was found, English structured data exists that can be used as the base for translation:
- **SRD 3.5 XML/MySQL Database**: https://www.enworld.org/threads/srd-3-5-xml-and-mysql-database.106300/
  - Full SRD in XML and MySQL formats with classes, feats, monsters, powers, skills, spells
- **Foundry VTT D35E System**: https://foundryvtt.com/packages/D35E
  - Compendiums with monsters, classes, spells, feats, magic items in JSON
- **The project's own d35e-raw data**: Already imported via `scripts/convert-d35e-to-entities.ts`

---

## Translation Terminology Reference

Key term mappings (Devir official terminology):

| English | Spanish |
|---------|---------|
| Spell | Conjuro / Hechizo |
| Feat | Dote |
| Skill | Habilidad |
| Class | Clase |
| Magic Item | Objeto Magico |
| Armor | Armadura |
| Weapon | Arma |
| Hit Points | Puntos de Golpe |
| Saving Throw | Tirada de Salvacion |
| Attack Roll | Tirada de Ataque |
| Damage Roll | Tirada de Dano |
| Ability Score | Puntuacion de Caracteristica |
| Strength | Fuerza |
| Dexterity | Destreza |
| Constitution | Constitucion |
| Intelligence | Inteligencia |
| Wisdom | Sabiduria |
| Charisma | Carisma |
| Level | Nivel |
| Experience | Experiencia |
| Caster Level | Nivel de Lanzador |
| Duration | Duracion |
| Range | Alcance |
| Components | Componentes |
| School | Escuela |

---

## Recommendation for Translation Pipeline

1. **Primary reference**: Use srd.dndtools.org/es/ as the main source for Spanish translations. It has the broadest coverage.
2. **Cross-reference**: Use nivel20.com for feat EN<->ES mappings, and rolroyce.com for class-specific spell lists.
3. **Approach**: Since no structured data exists in Spanish, the best approach is:
   - Use the existing English entity data from the project's compendiums
   - Use Gemini batch API to translate entity fields (name, description, benefit, etc.)
   - Cross-reference Gemini translations with srd.dndtools.org/es/ to verify accuracy
   - Use Devir terminology as the standard for well-known terms
4. **Volume estimate**: ~750 spells + ~100 feats + ~300 magic items + ~100 monsters = ~1,250+ entities to translate, each with 3-6 translatable fields.
