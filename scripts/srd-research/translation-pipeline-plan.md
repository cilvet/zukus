# Gemini Batch Translation Pipeline Plan

## Environment Assessment

### Existing API Keys
- `GOOGLE_GENERATIVE_AI_API_KEY` is already configured in:
  - Root `.env` (line 12)
  - `packages/core/visualPlayground/.env` (line 3)
- Key format: `AIzaSy...` (Google AI Studio key, works with Gemini Developer API)

### Existing AI Integration
- **Server chat** (`apps/server/src/chat.ts`) already uses Gemini via `@ai-sdk/google` (Vercel AI SDK)
  - Model: `gemini-3-flash-preview`
  - Uses `@ai-sdk/google` package (in `apps/server/package.json`)
- The Vercel AI SDK (`@ai-sdk/google`) does NOT support the Batch API -- it's designed for streaming/interactive use

### Existing Translation System
- Translation types defined in `packages/core/core/domain/translations/types.ts`
- `TranslationPack` format: keyed by entity ID, each entry has field name -> translated string
- Example pack exists: `dnd35-feats-es.ts` with ~35 feats translated (name, description, category, benefit)
- Fields are simple key-value pairs: `{ name: string, description: string, benefit?: string, category?: string }`

---

## Gemini Batch API Overview

### How It Works
The Gemini Batch API processes large volumes of requests asynchronously at **50% of the standard cost**. Target turnaround is 24 hours, but most jobs complete much faster.

### Key Features
- **50% cost reduction** compared to real-time API
- **Two input methods**:
  1. **Inline requests**: Embedded directly in the batch create call (for batches < 20MB)
  2. **JSONL file input**: Upload via File API (for larger batches, up to 2GB)
- **Context caching** supported (cached tokens priced same as non-batch)
- **Status tracking**: Jobs go through PENDING -> RUNNING -> SUCCEEDED/FAILED/CANCELLED/EXPIRED
- Jobs expire after 48 hours if not completed

### Supported SDK
- **Package**: `@google/genai` (npm) -- this is the official Google Gen AI SDK for TypeScript
- **NOT** `@ai-sdk/google` (Vercel AI SDK, which the server already uses for chat)
- The batch script would use `@google/genai` as a dev/script dependency, separate from the server

---

## Proposed Pipeline Architecture

### Overview

```
[Entity JSON files] -> [Prompt Builder] -> [Gemini Batch API] -> [Response Parser] -> [TranslationPack .ts files]
```

### Step-by-Step Flow

#### Phase 1: Extract entities to translate
1. Read existing compendium entity data from the project (spells, feats, items, etc.)
2. Identify translatable fields per entity type using `EntityFieldDefinition.translatable`
3. Generate a manifest of entities + fields that need translation

#### Phase 2: Build batch requests
1. For each entity, create a Gemini prompt that:
   - Provides the English entity data (name, description, etc.)
   - Instructs Gemini to translate to Spanish using D&D terminology
   - Includes a system prompt with Devir terminology reference table
   - Requests structured JSON output matching `TranslatedFields` format
2. Format as inline requests or JSONL file depending on batch size
3. Use `gemini-2.5-flash` (cheap, fast, good at translation) as the model

#### Phase 3: Submit and monitor batch
1. Submit batch job via `@google/genai` SDK
2. Poll for completion
3. Download results

#### Phase 4: Parse and validate
1. Parse Gemini responses (JSON structured output)
2. Validate translations (check for missing fields, untranslated terms)
3. Cross-reference key terms against known Devir translations
4. Flag any entries that need manual review

#### Phase 5: Generate TranslationPack files
1. Format validated translations into `TranslationPack` TypeScript files
2. One pack per entity type: `dnd35-spells-es.ts`, `dnd35-feats-es.ts`, `dnd35-items-es.ts`
3. Place in `packages/core/core/domain/translations/packs/`

---

## Script Design

### File: `scripts/translate-entities.ts`

```typescript
// Pseudocode outline -- DO NOT implement yet

import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

// 1. Load entities from compendium data
const entities = loadEntities('spells') // from existing compendium JSON

// 2. Build translation requests
const requests = entities.map(entity => ({
  contents: [{
    parts: [{
      text: buildTranslationPrompt(entity)
    }],
    role: 'user'
  }]
}))

// 3. Submit batch (inline for small batches, JSONL for large)
const batch = await ai.batches.create({
  model: 'gemini-2.5-flash',
  src: requests,
  config: { displayName: 'translate-spells-es' }
})

// 4. Poll until done
let job = batch
while (job.state === 'JOB_STATE_PENDING' || job.state === 'JOB_STATE_RUNNING') {
  await sleep(30_000)
  job = await ai.batches.get({ name: batch.name })
}

// 5. Parse results and generate TranslationPack
const translations = parseResults(job)
writeTranslationPack('dnd35-spells-es', translations)
```

### Translation Prompt Template

```
You are translating D&D 3.5 SRD content from English to Spanish.
Use the official Devir (Spain) terminology for D&D 3.5.

Key terminology reference:
- Spell = Conjuro
- Feat = Dote
- Skill = Habilidad
- Hit Points = Puntos de Golpe
- Saving Throw = Tirada de Salvacion
- Armor Class = Clase de Armadura
- Caster Level = Nivel de Lanzador
[... full terminology table ...]

Translate the following entity. Return ONLY valid JSON with the translated fields.

Entity type: Spell
Entity data:
{
  "name": "Magic Missile",
  "description": "A missile of magical energy darts forth...",
  "school": "Evocation [Force]",
  "components": "V, S",
  "range": "Medium (100 ft. + 10 ft./level)",
  "duration": "Instantaneous",
  "savingThrow": "None",
  "spellResistance": "Yes"
}

Return JSON:
{
  "name": "...",
  "description": "...",
  "school": "...",
  "components": "...",
  "range": "...",
  "duration": "...",
  "savingThrow": "...",
  "spellResistance": "..."
}
```

---

## Cost Estimate

### Entity counts (approximate)
| Entity Type | Count | Fields/Entity | Total Fields |
|------------|-------|---------------|-------------|
| Spells | ~750 | 6-8 | ~5,000 |
| Feats | ~100 | 4 | ~400 |
| Magic Items | ~300 | 3-5 | ~1,200 |
| Classes | ~30 | 3-5 | ~120 |
| Monsters | ~300 | 4-6 | ~1,500 |
| **Total** | **~1,480** | | **~8,220** |

### Token estimates per entity
- Input: ~200 tokens (system prompt) + ~150 tokens (entity data) = ~350 tokens
- Output: ~150 tokens (translated fields)
- Total per entity: ~500 tokens

### Cost with Gemini 2.5 Flash (batch pricing at 50% discount)
- Input: $0.015/1M tokens (batch) x 350 x 1,480 = ~$0.008
- Output: $0.042/1M tokens (batch) x 150 x 1,480 = ~$0.009
- **Total estimated cost: ~$0.02** (extremely cheap)

Even with generous padding (longer prompts, retries), the total cost would be well under $1.

---

## Setup Steps Required

1. **Install `@google/genai`** as a dev dependency in root or scripts:
   ```bash
   bun add -D @google/genai
   ```

2. **Verify API key** works with Gemini 2.5 Flash:
   ```bash
   # Quick test (DO NOT run yet, just documenting)
   bun -e "
     const { GoogleGenAI } = require('@google/genai');
     const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
     const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Say hello' });
     console.log(r.text);
   "
   ```

3. **Create the translation script** at `scripts/translate-entities.ts`

4. **Test with a small batch** (e.g., 5 feats) before running full translation

---

## Alternative Approaches Considered

### 1. Google Cloud Translation API
- Pros: Purpose-built for translation, fast, cheap
- Cons: Generic translation, doesn't understand D&D terminology. Would translate "Magic Missile" literally rather than using "Misil Magico"

### 2. Scraping srd.dndtools.org/es/
- Pros: Uses established community translations, no AI hallucination risk
- Cons: Requires web scraping, may have incomplete coverage, harder to match entities by ID
- Could be used as a validation step after Gemini translation

### 3. Manual translation
- Pros: Highest quality
- Cons: Extremely time-consuming for 1,400+ entities

### 4. Hybrid approach (RECOMMENDED)
- Use Gemini Batch API for the initial translation of all entities
- Cross-reference results against srd.dndtools.org/es/ for key terms (spell/feat names)
- Manual review of flagged entries
- This gives the best balance of speed, cost, and quality

---

## Next Steps

1. Get approval on this approach
2. Install `@google/genai` dependency
3. Write the translation script with the prompt template
4. Test with a small batch (5-10 entities)
5. Review output quality and adjust prompts
6. Run full batch for each entity type
7. Generate TranslationPack files
8. Integrate packs into the app
