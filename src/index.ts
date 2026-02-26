import { LangString, Qudt } from "@qudtlib/core";
export * from "@qudtlib/allunits";
import { UNIT_LABELS, QUANTITY_KIND_LABELS } from "./labels.js";

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
