# Supabase + React Native (Zukus) - Plan de implementacion

## Objetivo
Integrar Supabase en la app React Native (Expo) con Auth y acceso a personajes usando arquitectura hexagonal. Esta planificacion es online-only (sin offline-first ni cache local). El servidor es la fuente de verdad y cada apertura de personaje hace fetch remoto.

## Fuentes (docs oficiales)
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
- https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/reference/javascript/auth-signinwithidtoken
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- Referencia interna: `zukusnextmicon/supabase-db-documentation.md`

## Decisiones de diseno
- Online-only: sin cache local persistente.
- Last-write-wins para updates de personaje.
- La app siempre hace fetch remoto al abrir un personaje para asegurar version mas reciente.

## Versiones y dependencias
- SDK principal: `@supabase/supabase-js` (v2 actual).
- React Native polyfill: `react-native-url-polyfill/auto` (requerido por docs para URL en RN).
- Persistencia de sesion en RN: `@react-native-async-storage/async-storage`.
- Social auth (opcional):
  - Apple: `@invertase/react-native-apple-authentication` o `expo-apple-authentication`.
  - Google: `@react-native-google-signin/google-signin` o `expo-auth-session` (si usamos flujo web).

## Estado actual de la DB (segun zukusnextmicon)
Tabla `characters` ya existe y se usa asi:
- Columnas: `id`, `user_id`, `name`, `character_data`, `character_base_data`, `created_at`, `modified`, `_deleted`.
- El codigo actual escribe/lee `character_data` con `CharacterBaseData` (no usa `character_base_data`).
- `modified` existe pero no se actualiza desde el cliente actual.
- RLS existe para usuarios (select/insert/update/delete por user).
- Imagenes: se usa bucket `images` con ruta `${userId}/${characterId}`.

## Como se usa hoy en zukusnextmicon (resumen)
- Servicio `SupabaseCharacterService` en `src/infrastructure/services/character/SupabaseCharacterService.ts`.
- `getCharacterData`: busca primero en IndexedDB, luego Supabase (`characters.character_data`).
- `updateCharacterData`: escribe en IndexedDB y hace `UPDATE character_data = ...` sin control de version.
- `subscribeToCharacterData`: realtime en `characters` por id, actualiza cache local.
- `listCharacters`: `SELECT *` filtrando por `user_id`.
- `getCharacterImageUrl`: usa `storage.images` con `${userId}/${characterId}` y cache en localStorage.

## Problemas detectados en zukusnextmicon (para evitar)
- Mezcla de cache local (IndexedDB/localStorage) con fuente remota sin reglas claras; puede mostrar datos viejos.
- `updateCharacterData` no actualiza `modified` ni usa control de concurrencia; LWW sin timestamp real.
- `createCharacter` retorna `void` pero la UI espera un objeto (bug en lista).
- Multiples clientes Supabase creados en distintos servicios, sin singleton compartido.
- `getCharacterImageUrl` asume usuario logeado y usa cache local no invalidado en cambios de login.
- `listCharacters` hace `SELECT *` (payload grande) en lugar de columnas minimas.

## Cliente Supabase en React Native
- Crear un singleton `supabaseClient` con `createClient`.
- Configurar Auth para RN:
  - `storage: AsyncStorage`
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: false`
- Importar `react-native-url-polyfill/auto` en el entrypoint.

## Sesion y Auth (UI)
1) SessionProvider
- En el arranque:
  - `supabase.auth.getSession()`
  - `supabase.auth.onAuthStateChange(...)`
- Exponer `session`, `user`, `signIn`, `signUp`, `signOut`.

2) Pantallas
- Login (email/password).
- Signup.
- Character list.
- Character detail.

3) Social auth (opcional)
- Preferir flujo nativo con `signInWithIdToken` (Apple/Google) por fiabilidad en RN.
- Ver doc de Expo Social Auth para ejemplo con Apple (signInWithIdToken).
Nota:
- En v1: solo email/password (sin social auth).

## Arquitectura hexagonal
### Puerto (dominio/aplicacion)
`CharacterRepository` con metodos:
- `listByUser()`
- `getById(id)`
- `create(baseData)`
- `save(id, baseData)`
- `delete(id)`
- `subscribe(id, onChange)` (opcional)

### Adaptador Supabase
- Implementa el puerto usando `supabase.from('characters')`.
- Usa `character_data` para `CharacterBaseData` (alineado con zukusnextmicon).
- Si decidimos usar `character_base_data`, definir la estrategia y migracion (ver dudas).

## Flujos de datos
### Lista de personajes
- `listByUser()` hace `SELECT id, character_data, modified` y el nombre se toma de `character_data.name`.
- No usar cache local.

### Apertura de personaje (garantizar version mas reciente)
- `getById(id)` siempre hace fetch remoto.
- UI usa el resultado remoto y reemplaza estado local si lo habia.

### Update de personaje (LWW)
- `save(id, baseData)` hace `UPDATE character_data = ..., modified = now()`.
- Si hay dos dispositivos, el ultimo en guardar gana.

### Realtime (opcional)
- `subscribe(id)` con `supabase.channel(...).on('postgres_changes', ...)`.
- Al recibir cambio remoto, reemplazar el estado local.

## Flujo de UI y navegacion (propuesta RN)
### Estructura de pantallas
- `AuthStack`: `Login`, `Signup`.
- `AppStack`: `CharacterList`, `CharacterDetail`.
- Root decide stack segun `session` (SessionProvider).

### Estados de UI (por pantalla)
#### Login/Signup
- `idle`: formulario editable.
- `loading`: boton deshabilitado, spinner.
- `error`: mensaje claro (credenciales invalidas, red).
- `success`: redirecciona a `CharacterList`.

#### CharacterList
- `loading`: spinner/placeholder.
- `error`: retry.
- `empty`: CTA crear personaje o importar.
- `ready`: lista con nombre + fecha `modified`.

#### CharacterDetail
- `loading`: skeleton de hoja.
- `error`: retry / back.
- `ready`: hoja editable, indicator "Guardando..." cuando `save`.

### Navegacion y permisos
- Si `session` caduca, volver a `AuthStack`.
- Si no hay session, redirigir a login.

## Plan de implementacion (detallado con UI + APIs)
### 1) Contratos y DTOs
Acciones:
- Definir `CharacterListItem` (id, name, modified) y `CharacterDetail` (id, characterData).
- Documentar tipado desde `CharacterBaseData`.
Dudas:
- `character_data` usa `CharacterBaseData` completo? Hay versionado o campos opcionales?
Decisiones:
- `character_data` contiene siempre `CharacterBaseData` completo (sin versionado de schema por ahora).

### 2) Mapeo DB y queries
Acciones:
- Estandarizar en el adapter `character_data` y `modified`.
- Filtrar `_deleted = false` si se usa soft delete.
Dudas:
- `_deleted` se usa en la app actual o es solo legado?
- El servidor actualiza `modified` con trigger o lo hace el cliente?
Decisiones:
- `_deleted` se usa (soft delete activo).
- `modified` lo actualiza el cliente en cada `save`.

### 3) Supabase client RN
Acciones:
- Crear singleton con `createClient` y AsyncStorage.
- Importar `react-native-url-polyfill/auto` en entrypoint.
Dudas:
- Se usa Expo Go o dev client? (afecta social auth).
Decisiones:
- Solo email/password en v1 (no social auth), por tanto Expo Go vale.

### 4) SessionProvider + Auth
Acciones:
- `getSession()` al iniciar, `onAuthStateChange`.
- Exponer `signIn`, `signUp`, `signOut`.
Dudas:
- Social auth requerido ahora o solo email/password?
Decisiones:
- Solo email/password en v1.

### 5) Repositorio de personajes (adapter)
Acciones:
- `listByUser()`: select de columnas minimas.
- `getById(id)`: select `character_data`, `modified`.
- `save(id, data)`: update `character_data` + `modified=now()`.
- `create(data)`: insert con `user_id`, `name`, `character_data`.
- `delete(id)`: delete o `_deleted=true`.
Dudas:
- `name` proviene siempre de `character_data.name`?
- Necesitamos `character_base_data` por compatibilidad?
Decisiones:
- `name` viene siempre de `character_data.name`.
- No usar `character_base_data` en v1.

### 6) CharacterList screen
Acciones:
- Llamar `listByUser()` on mount.
- Mostrar estado `empty` si lista vacia.
- Navegar a detail con `id`.
Dudas:
- Requiere busqueda/filtros en v1?
- Paginacion necesaria?
Decisiones:
- Sin busqueda/filtros ni paginacion en v1.

### 7) CharacterDetail screen
Acciones:
- `getById(id)` on mount (siempre remoto).
- Renderizar sheet con datos calculados.
- Guardado LWW con `save`.
Dudas:
- Guardado automatico por cambio o boton "Guardar"?
- Mostrar estado "guardando" en UI?
Decisiones:
- Guardado automatico para todos los cambios (controlado por `characterStore`).
- Sin UI de guardado; updates silenciosos.

### 8) (Opcional) Realtime
Acciones:
- `subscribe(id)` en detail y refrescar estado.
Dudas:
- Se requiere en v1? costo/consumo en mobile?
Decisiones:
- Realtime en v1 (replica cambios a dispositivos conectados).

### 9) QA en dos dispositivos
Acciones:
- Probar login, lista, detail, updates consecutivos.
Dudas:
- Que escenarios minimos validan LWW y consistencia en el server?

## API calls por pantalla (exactos)
### Login
- `supabase.auth.signInWithPassword({ email, password })`
Errores esperados:
- `AuthApiError` (credenciales invalidas), `AuthRetryableFetchError` (red).

### Signup
- `supabase.auth.signUp({ email, password })`
Notas:
- Si email confirmation esta activa, manejar estado "verifica tu email".

### CharacterList
- `supabase.from('characters').select('id, character_data, modified').eq('user_id', user.id).eq('_deleted', false)`
Notas:
- Si `_deleted` no aplica, omitir filtro.

### CharacterDetail (get)
- `supabase.from('characters').select('id, character_data, modified').eq('id', id).single()`
Notas:
- `character_data` se mapea a `CharacterBaseData`.
- El nombre se lee de `character_data.name` (la columna `name` no se usa como fuente principal).

### CharacterDetail (save)
- `supabase.from('characters').update({ character_data: data, modified: new Date().toISOString() }).eq('id', id)`
Notas:
- LWW sin control de version.

### CharacterCreate
- `supabase.from('characters').insert({ id, user_id, name: data.name, character_data: data })`
Notas:
- Aunque el nombre se toma de `character_data.name`, se rellena `name` por compatibilidad con legacy.

### CharacterDelete
- Hard delete: `supabase.from('characters').delete().eq('id', id)`
- Soft delete (si aplica): `update({ _deleted: true, modified: now })`

## Checklist de validacion
- Login/Signup funcional en dispositivo real.
- `getSession()` y `onAuthStateChange` mantienen la sesion.
- Abrir personaje siempre muestra ultimo `modified` del servidor.
- Updates LWW: dos dispositivos guardan, el ultimo prevalece.
- RLS bloquea accesos cruzados entre usuarios.
