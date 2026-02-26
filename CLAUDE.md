# CLAUDE.md — qudtlib-js-i18n

## What this project is

A standalone ESM-only npm package that patches `@qudtlib/allunits` unit and quantity kind instances at import time with multilingual labels. `@qudtlib/allunits` only ships English labels; this package adds ~14,000 non-English labels from two sources without requiring any changes to the upstream library.

Users replace:
```typescript
import { Units, Qudt } from "@qudtlib/allunits";
```
with:
```typescript
import { Units, Qudt } from "qudtlib-js-i18n";
```

Everything from `@qudtlib/allunits` is re-exported. Labels are applied as a side effect at import time via `unit.addLabel()` / `qk.addLabel()`.

---

## Architecture

```
scripts/generate-labels.ts   # Run once to regenerate src/labels.ts
src/labels.ts                # GENERATED — checked in, ~14k labels
src/index.ts                 # Re-exports allunits + applies labels
```

`src/labels.ts` is committed to the repo so consumers don't need to run the generator. It is regenerated weekly by GitHub Actions (`.github/workflows/update-labels.yml`).

---

## Key technical facts

### IRI format
- qudtlib-js uses **`http://`** IRIs (not `https://`), e.g. `http://qudt.org/vocab/unit/M`
- The QUDT Turtle files also use `http://` — no conversion needed
- This tripped us up early: an `http→https` normalisation was added then removed

### qudtlib-js API
- `Qudt.unit(iri)` — looks up a Unit by full IRI (requires `@qudtlib/allunits` to be imported first to register units)
- `Qudt.quantityKind(iri)` — looks up a QuantityKind
- `Qudt.prefix(iri)` — looks up a Prefix
- `Qudt.allUnits()`, `Qudt.allQuantityKinds()`, `Qudt.allPrefixes()`
- `unit.addLabel(new LangString(text, languageTag))` — public, works on Unit and QuantityKind
- `unit.getLabelForLanguageTag(tag)` — available on Unit and QuantityKind, **not on Prefix**
- `LangString` and `Qudt` are imported from `@qudtlib/core`

### Prefix labels
Prefix labels are **intentionally excluded**. The QUDT ontology only has 3 non-English prefix labels (`Deka/de`, `Etto/it`, `Chilo/it`) and they are already built into qudtlib-js itself — adding them again would create duplicates. Also, `Prefix` has no `getLabelForLanguageTag` method.

### Data sources

| Vocabulary | URL | IRIs | Non-English labels |
|---|---|---|---|
| QUDT units | `https://qudt.org/vocab/unit` | 957 | 11,481 |
| QUDT quantity kinds | `https://qudt.org/vocab/quantitykind` | 125 | 1,713 |
| Wikidata (FR only) | `https://query.wikidata.org/sparql` | +852 | +852 |

**Wikidata properties:**
- `P2968` = QUDT unit ID (local name, e.g. `"M"`)
- `P8393` = QUDT quantity kind ID (local name, e.g. `"Mass"`)

Wikidata labels are only added where the QUDT ontology has no French label — QUDT always takes precedence.

### IPv6 / Wikidata timeout
Wikidata's SPARQL endpoint times out on IPv6 in some environments. Fixed by calling `dns.setDefaultResultOrder("ipv4first")` at the top of `generate-labels.ts`.

---

## Scope decisions

- **Units** ✅ — full multilingual support
- **QuantityKinds** ✅ — full multilingual support
- **Prefixes** ❌ — excluded (see above)
- **French enrichment via Wikidata** ✅ — fills gaps not in QUDT
- **Other languages via Wikidata** — not yet implemented, but straightforward to add by extending `fetchWikidataFrenchLabels` to accept a language parameter

---

## Build & workflow

```bash
npm run generate     # Fetch QUDT + Wikidata, write src/labels.ts
npm run build        # tsc → dist/ (ESM, target ESNext)
```

- ESM-only (`"type": "module"` in package.json)
- `tsconfig.json` — `target: ESNext`, `module: NodeNext`
- `tsconfig.scripts.json` — used by `tsx` to run the generate script
- No CJS build (deliberately dropped in favour of ESM-only)

---

## Extending to more languages

To add Wikidata enrichment for another language (e.g. German), in `generate-labels.ts`:

1. Change `fetchWikidataFrenchLabels` into a generic `fetchWikidataLabels(property, iriPrefix, lang)`
2. Call it for each desired language
3. The `mergeWikidataFrench` function already handles deduplication — rename/generalise it accordingly
