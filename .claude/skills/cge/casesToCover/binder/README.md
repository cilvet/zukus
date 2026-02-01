# Binder - Pact Magic

## Estado: FUERA DEL MODELO CGE

El Binder no encaja en el sistema CGE actual. Requiere un sistema propio de "Binding" o "Vinculos Activos".

---

## Por que no encaja en CGE

El CGE modela clases que:
1. **Conocen** entidades (spells, maneuvers, invocations)
2. **Preparan** un subconjunto para el dia
3. **Gastan recursos** al usar (slots, uses)

El Binder funciona diferente:
1. **Acceso total**: Todos los vestiges estan disponibles (solo requiere nivel)
2. **Binding, no preparacion**: Negocias un pacto, no "preparas" una entidad
3. **Check con consecuencias**: La vinculacion puede fallar, afectando al personaje
4. **Poderes otorgados**: El vestige da habilidades, no son "entidades usables"

---

## Mecanica del Binder

### Soul Binding

Cada dia, el Binder puede intentar vincular uno o mas vestiges:

1. **Eleccion**: Elige un vestige de nivel apropiado
2. **Ritual**: 1 minuto de ceremonial
3. **Binding Check**: 1d20 + nivel de binder + CHA vs DC del vestige
4. **Resultado**:
   - Exito = buen pacto, control total
   - Fallo = influencia del vestige (restricciones de roleplay)
5. **Duracion**: 24 horas

### Capacidad de Vinculacion

| Nivel Binder | Vestiges Simultaneos |
|--------------|---------------------|
| 1-4          | 1                   |
| 5-9          | 2                   |
| 10-14        | 3                   |
| 15-19        | 4                   |
| 20           | 5                   |

### Poderes de Vestige

Cada vestige vinculado otorga:
- **Habilidades especiales**: Algunas at-will, otras con cooldown (tipicamente 5 rounds)
- **Signo fisico**: Marca visible del pacto
- **Influencia**: Si fallaste el binding check, restricciones de comportamiento

---

## Diferencias clave con CGE

| Aspecto | CGE (Spells/Maneuvers) | Binder |
|---------|------------------------|--------|
| Pool | Lista conocida o preparable | Todos los vestiges disponibles |
| Seleccion | Preparar entidades | Negociar vinculo |
| Fallo | No aplica | Influencia del vestige |
| Uso | Gastar recurso | At-will o cooldown |
| Resultado | Efecto de la entidad | Obtener poderes |

---

## Posibles soluciones futuras

### Opcion A: Sistema de Vinculos separado

Crear un sistema "BindingSystem" independiente:
- Gestiona vestiges vinculados actualmente
- Maneja binding checks y sus consecuencias
- Trackea influencias activas
- Registra poderes otorgados como Effects temporales

### Opcion B: CGE adaptado

Forzar el modelo CGE con interpretacion liberal:
- `knownSource`: "FULL_LIST" (todos los vestiges)
- `preparationStyle`: "BINDING" (nuevo tipo)
- `resources`: No slots, sino "capacidad de vinculacion"

Esta opcion es menos elegante porque binding no es realmente "preparacion".

### Opcion C: Vestiges como Buffs/Addons

Tratar cada vestige vinculado como un Addon temporal que:
- Otorga poderes via Effects
- Tiene metadata de "influencia" si fallo el check
- Se remueve automaticamente a las 24 horas

---

## Referencia: Tome of Magic

> **Soul Binding**: A binder's power comes from binding vestiges - the remnants of dead or banished entities that exist outside the normal planes. Each day, a binder can attempt to contact and bind one or more vestiges.
>
> **Binding Check**: When you attempt to bind a vestige, you must make a binding check (1d20 + your effective binder level + your Charisma modifier) against the vestige's binding DC.
