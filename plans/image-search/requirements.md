# Requerimientos

## Requerimientos funcionales

### RF1: Biblioteca de iconos
- 6293 iconos de fantasia organizados por categorias
- Categorias: ArmorIcons, WeaponIcons, SkillsIcons, MedievalIcons, ProfessionIcons, etc.

### RF2: Busqueda clasica
- Busqueda por nombre (substring match)
- Filtro por categoria
- Filtro por tags
- Full-text search en Postgres

### RF3: Selector de iconos
- Componente generico para seleccionar iconos
- Usado en: personajes, buffs, items, spells, etc.
- Preview del icono seleccionado
- Busqueda integrada

### RF4: Cache agresivo
- Una vez descargado un icono, no volver a pedirlo
- `expo-image` con `cachePolicy="memory-disk"`
- Los iconos no cambian, cache puede ser muy largo

## Requerimientos no funcionales

### RNF1: Performance
- CDN global para servir imagenes rapidamente
- Imagenes en formato WebP (no PNG) para reducir tamano
- Tamano estimado total: ~30-50 MB (vs ~100-150 MB en PNG)

### RNF2: Costos
- Usar Supabase Storage (incluido en plan actual)
- Sin servicios adicionales de pago
- Sin servidores adicionales corriendo

### RNF3: Licencias
- Las imagenes tienen restricciones de licencia
- NO exponer publicamente en GitHub Releases ni similares
- Bucket de Supabase puede ser publico (sin auth) pero no promocionado

## Exclusiones (fuera de scope actual)

### EX1: Busqueda semantica
- CLIP / busqueda por significado - postponido
- Se puede anadir despues con pgvector + Jina AI

### EX2: Modo offline
- Descarga de ZIP con todas las imagenes - postponido
- El cache agresivo cubre la mayoria de casos

### EX3: Subida de imagenes por usuarios
- Solo iconos del sistema por ahora
- URLs externas si se permiten (el usuario pone una URL)

## Tipos de imagenes soportadas

| Tipo | Descripcion | Estado |
|------|-------------|--------|
| Iconos del sistema | 6293 iconos en Supabase Storage | Implementar |
| URLs externas | Usuario pone URL de imagen externa | Soportado |
| Subida de usuario | Usuario sube su propia imagen | Futuro |
