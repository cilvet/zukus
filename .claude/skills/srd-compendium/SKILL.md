# SRD Compendium & Translations

Sistema de gestión del compendio D&D 3.5 SRD: datos, clasificación por libro fuente, verificación de completitud y traducciones al español.

## Cuándo consultar esta skill

- Al trabajar con datos del compendio D&D 3.5 (conjuros, dotes, items, monstruos, clases)
- Al clasificar contenido por libro fuente (SRD vs suplementos)
- Al añadir o verificar contenido SRD
- Al trabajar con traducciones al español del compendio
- Al integrar TranslationPacks en la app

## Arquitectura actual del compendio

### Punto de entrada
`packages/core/core/domain/compendiums/examples/dnd35ExampleContext.ts`

### Fuentes de datos (3 orígenes distintos)

| Fuente | Qué contiene | Ubicación |
|---|---|---|
| **testdata** | 2,789 conjuros (español, incluye suplementos) | `core/domain/entities/relations/__testdata__/spells.json` |
| **d35e-raw conversions** | 881 items de equipo (armas, armaduras, items, wondrous) | `srd/equipment/d35e/*.ts` |
| **Definiciones manuales** | 6 clases SRD, ~40 dotes, ~15 buffs, class features | `srd/*/`, `examples/entities/` |

### Datos raw no conectados
`packages/core/data/d35e-raw/` contiene 3,546 entidades en 30 JSON files del D35E Foundry VTT. La mayoría está **huérfana** (no alimenta el compendio):
- `spells.json` (673) - NO se usa (testdata usado en su lugar)
- `feats.json` (388) - NO se usa (solo ~40 manuales)
- `bestiary.json` (645) - totalmente huérfano
- `classes.json` (33) - NO se usa (clases manuales)

### Clases test (NO SRD)
En `packages/core/testClasses/`: Warblade, Psion, Warlock, Spirit Shaman, Arcanist, Wizard5e. Están mezcladas en el compendio con las SRD.

## Cobertura SRD verificada

| Tipo | Cobertura | Matched/Total | Notas |
|---|---|---|---|
| Conjuros | 99.9% | 673/674 | Falta: Blacklight |
| Dotes | 99.8% | 404/405 | Falta: Trap Sense (epic) |
| Condiciones | 100% | 38/38 | - |
| Poderes psíquicos | 99.7% | 286/287 | Falta: Deja Vu |
| Items mágicos | 96.0% | 362/377 | Variantes de naming |
| Monstruos | 87.5% | 358/409 | Categorías genéricas |
| Clases | 65.1% | 28/43 | Faltan 15 prestigio |

**D35E NO es puramente SRD**: contiene 764 entidades extra de suplementos OGL.

## Contenido SRD faltante

- **Clases base**: Barbarian, Bard, Monk, Paladin, Ranger
- **Clases prestigio**: 15 (Arcane Archer, Assassin, Blackguard, etc.)
- **Razas**: 7 core (no hay entity type)
- **Pociones**: SRD tiene 101, tenemos ~8
- **Bestiary**: 645 en raw, 0 en compendio
- **Cursed Items, Diseases, Poisons, Traps**: sin schemas

## Sistema de traducciones

### Infraestructura
- Tipos: `packages/core/core/domain/translations/types.ts` (`TranslationPack`)
- Packs existentes: `packages/core/core/domain/translations/packs/`
- App: `translationStore.ts`, `useLocalizedEntity.ts`, `useLocale.ts`

### Traducciones disponibles (generadas)
- `scripts/srd-research/output/dnd35-spells-es.ts` — 597 conjuros SRD en español
- `scripts/srd-research/output/dnd35-feats-es.ts` — 110 dotes en español
- Pendiente integrar en `translations/packs/`

### Pipeline de traducción
- **Datos scrapeados**: srd.dndtools.org/es/ (1,963 conjuros + 110 dotes)
- **Gemini batch API**: key en `.env` (GOOGLE_GENERATIVE_AI_API_KEY), ~$0.02 para todo
- **Plan**: scrape existente + Gemini batch para lo que falte + cross-validación

## Scripts de investigación

Todos en `scripts/srd-research/`:

| Script | Propósito |
|---|---|
| `verify-srd-spells.ts` | Verificar conjuros vs SRD (bun run) |
| `verify-srd-feats.ts` | Verificar dotes vs SRD |
| `verify-srd-magic-items.ts` | Verificar items mágicos vs SRD |
| `cross-reference-srd.ts` | Cross-reference completo todas las entidades |
| `split-wondrous-items.ts` | Clasificar 636 items en 8 sub-tipos |
| `extract-all-feats.ts` | Extraer 388 dotes estructuradas |
| `scrape-dndtools-es.ts` | Scraper de traducciones español |
| `classify-by-source.ts` | Clasificar conjuros por libro fuente |
| `generate-translation-packs.ts` | Generar TranslationPacks desde datos scrapeados |

### Datos de referencia (`scripts/srd-research/reference-data/`)
- Listas SRD por tipo: `srd-spells.json`, `srd-feats.json`, `srd-monsters.json`, etc.
- Mapeo por fuente: `spell-source-mapping.json` (602 conjuros → libro + nombre español)
- Items clasificados: `ring.json`, `rod.json`, `staff.json`, etc.
- Datos español: `dndtools-spells-es.json` (1,963), `dndtools-feats-es.json` (110)

## Próximos pasos (roadmap)

1. **Fase 1**: Etiquetar entidades con libro fuente, separar clases test
2. **Fase 2**: Completar SRD (5 clases, razas, dotes, bestiary, prestigio)
3. **Fase 3**: Integrar TranslationPacks + Gemini batch para el resto
4. **Fase 4**: Nuevo compendio `dnd35-srd` limpio + compendios de suplemento opcionales

## Docs de referencia
- `references/summary-report.md` — Informe completo de la investigación
- `references/data-pipeline.md` — Pipeline de datos raw → compendio
