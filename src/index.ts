import { LangString, Qudt } from "@qudtlib/core";
export * from "@qudtlib/allunits";
import { UNIT_LABELS, QUANTITY_KIND_LABELS } from "./labels.js";
import { FR_QK_CONFIDENT, FR_QK_UNCERTAIN } from "./fr-translations.js";

for (const [iri, pairs] of Object.entries(UNIT_LABELS)) {
  const unit = Qudt.unit(iri);
  if (unit) {
    for (const [text, languageTag] of pairs) {
      unit.addLabel(new LangString(text, languageTag));
    }
  }
}

for (const [iri, pairs] of Object.entries(QUANTITY_KIND_LABELS)) {
  const qk = Qudt.quantityKind(iri);
  if (qk) {
    for (const [text, languageTag] of pairs) {
      qk.addLabel(new LangString(text, languageTag));
    }
  }
}

// AI-translated French labels (fallback — applied only where no French label exists)
for (const [iri, frLabel] of Object.entries(FR_QK_CONFIDENT)) {
  const qk = Qudt.quantityKind(iri);
  if (qk && !qk.getLabelForLanguageTag("fr")) {
    qk.addLabel(new LangString(frLabel, "fr"));
  }
}
for (const [iri, [frLabel]] of Object.entries(FR_QK_UNCERTAIN)) {
  const qk = Qudt.quantityKind(iri);
  if (qk && !qk.getLabelForLanguageTag("fr")) {
    qk.addLabel(new LangString(frLabel, "fr"));
  }
}
