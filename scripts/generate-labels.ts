import { setDefaultResultOrder } from "dns";
import { Parser, Quad } from "n3";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Prefer IPv4 — Wikidata's IPv6 endpoint times out in some environments
setDefaultResultOrder("ipv4first");

const __dirname = dirname(fileURLToPath(import.meta.url));

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
// All lowercase — compared case-insensitively
const SKIP_LANGS = new Set(["en", "en-us"]);

// Note: prefix labels are intentionally excluded — the handful of non-English
// prefix labels in the QUDT ontology are already built into qudtlib-js.
const VOCABS = [
  {
    url: "https://qudt.org/vocab/unit",
    iriPrefix: "http://qudt.org/vocab/unit/",
    exportName: "UNIT_LABELS",
    // P2968 = QUDT unit ID
    wikidataProperty: "P2968",
  },
  {
    url: "https://qudt.org/vocab/quantitykind",
    iriPrefix: "http://qudt.org/vocab/quantitykind/",
    exportName: "QUANTITY_KIND_LABELS",
    // P8393 = QUDT quantity kind ID
    wikidataProperty: "P8393",
  },
];

const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";
const WIKIDATA_USER_AGENT =
  "qudtlib-js-i18n/generate-labels (+https://github.com/florianjea/qudtlib-js-i18n)";

async function fetchQudtLabels(
  url: string,
  iriPrefix: string
): Promise<Record<string, Array<[string, string]>>> {
  console.log(`Fetching ${url} ...`);
  const response = await fetch(url, { headers: { Accept: "text/turtle" } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const turtle = await response.text();
  console.log(`  Downloaded ${(turtle.length / 1024).toFixed(0)} KB`);

  const quads: Quad[] = await new Promise((resolve, reject) => {
    const parser = new Parser({ format: "text/turtle" });
    const collected: Quad[] = [];
    parser.parse(turtle, (error, quad, _prefixes) => {
      if (error) return reject(error);
      if (quad) collected.push(quad);
      else resolve(collected);
    });
  });

  console.log(`  Parsed ${quads.length} quads`);

  const labelMap: Record<string, Array<[string, string]>> = {};

  for (const quad of quads) {
    if (
      quad.predicate.value !== RDFS_LABEL ||
      !quad.subject.value.startsWith(iriPrefix) ||
      quad.object.termType !== "Literal"
    ) {
      continue;
    }

    const lang = quad.object.language;
    if (!lang || SKIP_LANGS.has(lang.toLowerCase())) continue;

    const iri = quad.subject.value;
    if (!labelMap[iri]) labelMap[iri] = [];
    labelMap[iri].push([quad.object.value, lang]);
  }

  return labelMap;
}

async function fetchWikidataFrenchLabels(
  wikidataProperty: string,
  iriPrefix: string
): Promise<Map<string, string>> {
  console.log(`  Fetching Wikidata French labels (${wikidataProperty}) ...`);

  const query = `
SELECT ?qudtId (SAMPLE(?label) AS ?frLabel) WHERE {
  ?item wdt:${wikidataProperty} ?qudtId.
  ?item rdfs:label ?label.
  FILTER(LANG(?label) = "fr")
}
GROUP BY ?qudtId
`;

  const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": WIKIDATA_USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`Wikidata SPARQL HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    results: { bindings: Array<Record<string, { value: string }>> };
  };

  const result = new Map<string, string>();
  for (const binding of data.results.bindings) {
    const localname = binding.qudtId?.value;
    const label = binding.frLabel?.value;
    if (localname && label) {
      result.set(iriPrefix + localname, label);
    }
  }

  return result;
}

function mergeWikidataFrench(
  labelMap: Record<string, Array<[string, string]>>,
  wdFr: Map<string, string>
): number {
  let added = 0;
  for (const [iri, frLabel] of wdFr) {
    const existing = labelMap[iri] ?? [];
    const hasFr = existing.some(([, lang]) => lang.toLowerCase() === "fr");
    if (!hasFr) {
      if (!labelMap[iri]) labelMap[iri] = [];
      labelMap[iri].push([frLabel, "fr"]);
      added++;
    }
  }
  return added;
}

function renderExport(
  exportName: string,
  labelMap: Record<string, Array<[string, string]>>
): { block: string; iriCount: number; labelCount: number } {
  const sortedIris = Object.keys(labelMap).sort();
  let labelCount = 0;

  const entries = sortedIris.map((iri) => {
    const pairs = labelMap[iri];
    pairs.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
    labelCount += pairs.length;
    const pairsStr = pairs
      .map(
        ([text, tag]) =>
          `    [${JSON.stringify(text)}, ${JSON.stringify(tag)}]`
      )
      .join(",\n");
    return `  ${JSON.stringify(iri)}: [\n${pairsStr}\n  ]`;
  });

  return {
    block: `export const ${exportName}: Record<string, Array<[string, string]>> = {\n${entries.join(",\n")}\n};`,
    iriCount: sortedIris.length,
    labelCount,
  };
}

async function main() {
  const blocks: string[] = [];
  let totalIris = 0;
  let totalLabels = 0;

  for (const { url, iriPrefix, exportName, wikidataProperty } of VOCABS) {
    const labelMap = await fetchQudtLabels(url, iriPrefix);

    const wdFr = await fetchWikidataFrenchLabels(wikidataProperty, iriPrefix);
    const added = mergeWikidataFrench(labelMap, wdFr);
    console.log(
      `  → ${Object.keys(labelMap).length} IRIs from QUDT, +${added} French labels from Wikidata`
    );

    const { block, iriCount, labelCount } = renderExport(exportName, labelMap);
    blocks.push(block);
    totalIris += iriCount;
    totalLabels += labelCount;
  }

  const isoDate = new Date().toISOString().slice(0, 10);
  const sources = [
    ...VOCABS.map((v) => `//   ${v.url}`),
    "//   https://query.wikidata.org/sparql (French labels via P2968 / P8393)",
  ].join("\n");

  const output = `// Generated by scripts/generate-labels.ts on ${isoDate}
// Sources:
${sources}
// Do not edit manually — run \`npm run generate\` to refresh

${blocks.join("\n\n")}
`;

  const outPath = join(__dirname, "../src/labels.ts");
  writeFileSync(outPath, output, "utf8");
  console.log(
    `\nWrote ${totalIris} IRIs, ${totalLabels} labels to src/labels.ts`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
