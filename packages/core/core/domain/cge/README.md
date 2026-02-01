# CGE - Character Generation Engine (Entity Management)

Sistema que gestiona como los personajes interactuan con entidades accionables (conjuros, maniobras, poderes, invocaciones, etc.).

---

## Documentacion

**La documentacion completa del sistema CGE esta en la skill de Claude:**

```
.claude/skills/cge/
  SKILL.md           # Resumen ejecutivo
  docs/
    architecture.md  # Arquitectura detallada
    design.md        # Decisiones de diseno
    cases.md         # Analisis de casos por clase
```

---

## Codigo

| Archivo | Proposito |
|---------|-----------|
| [types.ts](./types.ts) | Tipos CGEConfig, CalculatedCGE, CGEState |
| [knownOperations.ts](./knownOperations.ts) | Add/remove known entities |
| [preparationOperations.ts](./preparationOperations.ts) | BOUND preparation operations |
| [slotOperations.ts](./slotOperations.ts) | Slot usage and refresh |
| [index.ts](./index.ts) | Exports publicos |

---

## Referencia Historica

La carpeta [casesToCover/](./casesToCover/) contiene analisis originales por clase durante el diseno del sistema. Estos archivos usan nomenclatura antigua - ver [NOMENCLATURE.md](./casesToCover/NOMENCLATURE.md) para el mapeo a tipos reales.
