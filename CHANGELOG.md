# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-02-26

### Added

- QuantityKind multilingual labels (1,713 labels across 125 IRIs from QUDT)
- French label enrichment via [Wikidata](https://query.wikidata.org/sparql): +462 French unit labels (property P2968) and +390 French quantity kind labels (property P8393) for entries missing French in the QUDT ontology
- Total: 14,046 labels across 1,931 IRIs

## [0.1.0] - 2026-02-25

### Added

- Initial release
- 11,481 non-English labels across 957 units sourced from the [QUDT ontology](https://qudt.org/vocab/unit)
- Languages: Arabic, Bulgarian, Czech, German, Greek, Spanish, Persian, French, Hebrew, Hindi, Hungarian, Italian, Japanese, Latin, Malay, Polish, Portuguese, Romanian, Russian, Slovenian, Turkish, Chinese, and more
- Re-exports all of `@qudtlib/allunits` — drop-in replacement import
- Weekly automated label regeneration via GitHub Actions
- ESM-only build (`"type": "module"`)

[Unreleased]: https://github.com/florianjea/qudtlib-js-i18n/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/florianjea/qudtlib-js-i18n/releases/tag/v0.1.0
