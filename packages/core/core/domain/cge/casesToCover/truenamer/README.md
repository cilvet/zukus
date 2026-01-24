# Truenamer - Truespeak

## CGE Generico: Pendiente de disenar

## Estado: NO RESUELTO

---

## Resumen Mecanico

El Truenamer usa "utterances" con mecanica de DC incrementante:
- Conoce utterances limitadas
- Cada uso requiere check de Truespeak vs DC
- El DC sube con cada uso exitoso en el mismo dia

---

## Pool Source

**Tipo**: CURATED_SELECTION

- Conoce utterances limitadas por nivel
- Tres "lexicons": Evolving Mind, Crafted Tool, Perfected Map

---

## Selection Stage

**Tipo**: NONE

- No prepara utterances
- Puede intentar usar cualquier conocida

---

## Resources

**Estrategia**: No tradicional

No usa slots ni pool. En su lugar:
- Cada utterance tiene un DC base
- Cada uso exitoso de ESA utterance incrementa el DC en +2 para el resto del dia
- Reset diario

---

## Problema Principal

El "coste" no es un recurso consumible, sino una dificultad creciente.

Esto no encaja en el modelo de Resource actual que tiene:
- currentValue
- maxValue
- consume/restore

Posibles soluciones:
1. Resource por utterance que trackea "veces usada hoy" (afecta DC, no disponibilidad)
2. Sistema separado de "DC modifiers acumulativos"

---

## Law of Resistance

Mecanica central que define el incremento de DC:

> When you speak an utterance, the universe itself attempts to right the balance you upset. For each time you have successfully spoken a given utterance since you last recovered your utterances, the DC of the Truespeak check for that utterance increases by 2.

---

## Texto Original (Tome of Magic)

> **Utterances**: A truenamer's power comes from speaking truenames—the words that define the fundamental nature of all things. Unlike spells, utterances don't consume daily uses or spell slots.
>
> **Truespeak Check**: When you speak an utterance, you must make a Truespeak check (1d20 + your Truespeak skill modifier) against the utterance's DC.
