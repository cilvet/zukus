# Pipeline de datos: Raw → Compendio

## Diagrama de flujo actual

```
d35e-raw/ (3,546 entidades en 30 JSON)
    │
    ├── equipment ──→ scripts/convert ──→ srd/equipment/d35e/*.ts ──→ COMPENDIO (881 items)
    │   (weapons, armors, shields, items, wondrous, properties)
    │
    ├── spells.json (673) ─────────────────────────────────── HUÉRFANO (no se usa)
    ├── feats.json (388) ──────────────────────────────────── HUÉRFANO (no se usa)
    ├── bestiary.json (645) ───────────────────────────────── HUÉRFANO (no se usa)
    ├── classes.json (33) ─────────────────────────────────── HUÉRFANO (no se usa)
    ├── powers.json (441) ─────────────────────────────────── HUÉRFANO (no se usa)
    └── (15+ archivos más) ────────────────────────────────── HUÉRFANO

testdata/spells.json (2,789 conjuros EN ESPAÑOL) ─────────── COMPENDIO (fuente principal de conjuros)
testdata/spell-class-relations.json ───────────────────────── COMPENDIO (relaciones conjuro-clase)

Definiciones manuales:
    srd/fighter/ ──────────────────────────────────────────── COMPENDIO (Fighter class)
    srd/rogue/ ────────────────────────────────────────────── COMPENDIO (Rogue class + features)
    srd/cleric/ ───────────────────────────────────────────── COMPENDIO (Cleric class + features)
    srd/druid/ ────────────────────────────────────────────── COMPENDIO (Druid class + features)
    srd/sorcerer/ ─────────────────────────────────────────── COMPENDIO (Sorcerer class + features)
    srd/wizard/ ───────────────────────────────────────────── COMPENDIO (Wizard class + features)
    examples/entities/feats.ts (~40 dotes) ────────────────── COMPENDIO
    examples/entities/buffs.ts (~15 buffs) ────────────────── COMPENDIO

testClasses/ (Warblade, Psion, Warlock, etc.) ────────────── COMPENDIO (mezclados con SRD)
```

## Entidades en el compendio actual (dnd35ExampleContext.ts)

| Tipo | Cantidad | Origen | SRD? |
|---|---|---|---|
| spell | 2,789 | testdata (español) | Mezcla SRD + suplementos |
| feat | ~40 | manual | SRD (parcial) |
| buff | ~15 | manual | SRD |
| weapon | 80 | d35e-raw conversion | SRD |
| armor | 12 | d35e-raw conversion | SRD |
| shield | 6 | d35e-raw conversion | SRD |
| item | 124 | d35e-raw conversion | SRD |
| wondrousItem | 581 | d35e-raw conversion | Mezcla (incluye rings, rods, staves) |
| weaponProperty | 47 | d35e-raw conversion | SRD |
| armorProperty | 31 | d35e-raw conversion | SRD |
| class | 12 | manual | 6 SRD + 6 test |
| classFeature | ~50 | manual | SRD (solo 5 clases) |
| maneuver | varios | testClasses | NO (Tome of Battle) |
| power | varios | testClasses | NO (Psionics test) |
| system_levels | 1 | manual | SRD |

## Problemas identificados

1. **Conjuros**: vienen de testdata en español (2,789), no de d35e-raw. Incluyen suplementos sin marcar.
2. **Wondrous Items**: 581 items que mezclan rings, rods, staves, artifacts (sin separar por sub-tipo).
3. **Dotes**: solo 40 de ~120 SRD estructuradas.
4. **Clases test**: mezcladas con SRD en el mismo compendio.
5. **Bestiary**: 645 monstruos en raw, 0 en compendio.
6. **Sin source attribution**: ninguna entidad tiene campo `source` poblado con libro de origen.

## Pipeline objetivo

```
d35e-raw/ (fuente canónica en inglés)
    │
    ├── scripts de conversión por tipo
    │   ├── spells → srd/spells/ (solo SRD, ~673)
    │   ├── feats → srd/feats/ (solo SRD, ~120)
    │   ├── magic-items → srd/rings/, srd/rods/, srd/staves/, srd/wondrousItems/
    │   ├── bestiary → srd/monsters/ (solo SRD, ~358)
    │   └── etc.
    │
    ├── source attribution (spell-source-mapping.json + cross-reference)
    │
    └── Compendios separados:
        ├── dnd35-srd (solo contenido SRD, en inglés)
        ├── dnd35-complete-arcane (opcional)
        ├── dnd35-complete-divine (opcional)
        └── etc.

TranslationPacks:
    ├── dnd35-srd-es (español completo del SRD)
    │   ├── conjuros (597 de dndtools + Gemini batch para resto)
    │   ├── dotes (110 de dndtools + Gemini batch)
    │   ├── items mágicos (Gemini batch)
    │   └── monstruos, clases, etc. (Gemini batch)
    └── dnd35-supplements-es (opcional, suplementos en español)
```
