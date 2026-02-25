# qudtlib-js-i18n

Multilingual labels extension for [`@qudtlib/allunits`](https://github.com/qudtlib/qudtlib-js).

`@qudtlib/allunits` ships only English (`en` / `en-US`) labels. This package patches every live unit instance at import time with ~11,000 non-English labels sourced from the [QUDT ontology](https://qudt.org/vocab/unit), covering 20+ languages.

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

Arabic (`ar`), Bulgarian (`bg`), Czech (`cs`), German (`de`), Greek (`el`), Spanish (`es`), Persian (`fa`), French (`fr`), Hebrew (`he`), Hindi (`hi`), Hungarian (`hu`), Italian (`it`), Japanese (`ja`), Latin (`la`), Malay (`ms`), Polish (`pl`), Portuguese (`pt`), Romanian (`ro`), Russian (`ru`), Slovenian (`sl`), Turkish (`tr`), Chinese (`zh`), and more.

## Keeping labels up to date

Labels are regenerated weekly from the live QUDT ontology via a GitHub Actions workflow. You can also regenerate manually:

```bash
npm run generate
```

## ESM only

This package is ESM-only (`"type": "module"`).
