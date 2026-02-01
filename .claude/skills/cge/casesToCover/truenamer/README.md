# Truenamer - Truespeak

## Estado: FUERA DEL MODELO CGE

El Truenamer no encaja en ninguno de los patrones actuales de CGE (SLOTS, POOL, NONE) porque su sistema de "coste" no es un recurso consumible tradicional.

---

## Por que esta fuera del modelo

### El problema fundamental

CGE modela recursos consumibles:
- **SLOTS**: Cantidad fija por nivel, se consumen al usar
- **POOL**: Puntos totales, cada uso resta puntos
- **NONE**: Sin coste, uso ilimitado

El Truenamer tiene un sistema completamente diferente: **coste acumulativo basado en DC**.

### Como funciona el Truenamer

1. No tiene slots ni puntos
2. Puede intentar usar cualquier utterance conocida en cualquier momento
3. Cada uso requiere un **Truespeak check** (1d20 + skill) vs DC
4. **Law of Resistance**: Cada uso EXITOSO de una utterance incrementa su DC en +2 para el resto del dia
5. Reset diario

Esto significa:
- No hay "usos restantes" que trackear
- El recurso no se "gasta", la dificultad aumenta
- Teoricamente puede intentar infinitas veces (si acepta DCs imposibles)
- El tracking es por utterance individual, no global

---

## Mecanica: Law of Resistance

> When you speak an utterance, the universe itself attempts to right the balance you upset. For each time you have successfully spoken a given utterance since you last recovered your utterances, the DC of the Truespeak check for that utterance increases by 2.

Ejemplo:
- Utterance "Word of Nurturing" tiene DC 15 base
- Primer uso exitoso: DC 15 (luego sube a 17)
- Segundo uso exitoso: DC 17 (luego sube a 19)
- Tercer uso exitoso: DC 19 (luego sube a 21)
- etc.

---

## Datos del juego

### Utterances conocidas

El Truenamer conoce utterances limitadas por nivel de clase:

| Nivel | Utterances conocidas |
|-------|---------------------|
| 1     | 1                   |
| 2     | 2                   |
| 3     | 3                   |
| ...   | ...                 |

### Lexicons (categorias)

Las utterances se dividen en tres lexicons:
- **Evolving Mind**: Afecta criaturas
- **Crafted Tool**: Afecta objetos
- **Perfected Map**: Afecta lugares

---

## Posibles soluciones futuras

### Opcion A: Nuevo tipo de recurso "DC_MODIFIER"

Un recurso que no representa disponibilidad sino modificador:
```typescript
type DCModifierResource = {
  type: 'DC_MODIFIER'
  usesToday: number  // Cuantas veces se ha usado exitosamente
  dcIncrement: number  // +2 por uso
  // No tiene maxValue - siempre disponible
}
```

### Opcion B: Sistema separado fuera de CGE

El Truenamer podria usar un sistema paralelo que:
- Trackea "usos exitosos hoy" por utterance
- Calcula DC dinamicamente: base + (usos * 2)
- No bloquea el uso, solo informa la dificultad

### Opcion C: Ignorar la mecanica de DC

Simplificar tratandolo como NONE (sin tracking de recursos) y dejar el calculo de DC al jugador manualmente.

---

## Referencia: Texto original (Tome of Magic)

> **Utterances**: A truenamer's power comes from speaking truenames--the words that define the fundamental nature of all things. Unlike spells, utterances don't consume daily uses or spell slots.
>
> **Truespeak Check**: When you speak an utterance, you must make a Truespeak check (1d20 + your Truespeak skill modifier) against the utterance's DC.
