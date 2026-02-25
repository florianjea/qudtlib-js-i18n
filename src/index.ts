import { LangString, Qudt } from "@qudtlib/core";
export * from "@qudtlib/allunits";
import { UNIT_LABELS } from "./labels.js";

for (const [iri, pairs] of Object.entries(UNIT_LABELS)) {
  const unit = Qudt.unit(iri);
  if (unit) {
    for (const [text, languageTag] of pairs) {
      unit.addLabel(new LangString(text, languageTag));
    }
  }
}
