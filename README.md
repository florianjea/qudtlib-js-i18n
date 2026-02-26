# qudtlib-js-i18n

Multilingual labels extension for [`@qudtlib/allunits`](https://github.com/qudtlib/qudtlib-js).

`@qudtlib/allunits` ships only English (`en` / `en-US`) labels. This package patches `Unit` and `QuantityKind` instances at import time with ~14,000 labels from two sources:

- **[QUDT ontology](https://qudt.org/vocab/unit)** — 20+ languages for units and quantity kinds
- **[Wikidata](https://www.wikidata.org/)** — French (`fr`) only, filling gaps not covered by QUDT

## Installation

```bash
npm install qudtlib-js-i18n
```

Peer dependencies (`@qudtlib/allunits` and `@qudtlib/core`) must also be installed:

```bash
npm install @qudtlib/allunits @qudtlib/core
```

## Usage

Replace your existing import:

```typescript
// Before
import { Units, Qudt } from "@qudtlib/allunits";

// After
import { Units, Qudt } from "qudtlib-js-i18n";
```

Everything from `@qudtlib/allunits` is re-exported, and multilingual labels are applied as a side effect at import time.

```typescript
import { Units } from "qudtlib-js-i18n";

Units.M.getLabelForLanguageTag("de"); // "Meter"
Units.M.getLabelForLanguageTag("fr"); // "Mètre"
Units.M.getLabelForLanguageTag("ja"); // "メートル"
Units.M.getLabelForLanguageTag("zh"); // "米"
Units.M.getLabelForLanguageTag("en"); // "Metre" (still works)
```

## Languages covered

| Source | Languages |
|---|---|
| QUDT ontology | Arabic (`ar`), Bulgarian (`bg`), Czech (`cs`), German (`de`), Greek (`el`), Spanish (`es`), Persian (`fa`), French (`fr`), Hebrew (`he`), Hindi (`hi`), Hungarian (`hu`), Italian (`it`), Japanese (`ja`), Latin (`la`), Malay (`ms`), Polish (`pl`), Portuguese (`pt`), Romanian (`ro`), Russian (`ru`), Slovenian (`sl`), Turkish (`tr`), Chinese (`zh`), and more |
| Wikidata | French (`fr`) — units and quantity kinds only |

French has the broadest coverage as it is supplemented by both sources.

## Keeping labels up to date

Labels are regenerated weekly from the QUDT ontology and Wikidata via a GitHub Actions workflow. You can also regenerate manually:

```bash
npm run generate
```

## ESM only

This package is ESM-only (`"type": "module"`).
