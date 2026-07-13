# Local corpus organization and pregeneration

The source workflow is local-only. It does not upload the source collection to
an external model API.

## Canonical source library

The tracked canonical corpus contains the complete normalized extraction of all
20 acquired Haggadahs:

- `research/generated/source-segment-manifest.json`
- `research/generated/source-segments/*.jsonl`

The manifest verifies 1,999 ordered segments, approximately 1.85 million exact
source characters, 867 PDF pages plus four complete official-source snapshots,
and reconstruction coverage for every source. Extraction failures remain in the
library as quarantined records so nothing disappears silently.

Raw PDFs, official snapshots, and searchable working extracts remain local and
gitignored. The normalized, hashed, source-located corpus is tracked so the
content pack can be reproduced without committing restricted or oversized files.

## Editorial order of operations

1. Read each source locally in source order.
2. Write one structured dossier at
   `research/source-dossier-reviews/<source-id>.json`.
3. Identify coherent groups of 2–8 same-source segments, preserving source
   order and enough surrounding context to make sense to a beginner.
4. Record the source's voice, best uses, beginner risks, political context,
   credits, exclusions, themes, tones, and required opt-ins.
5. Resolve every reviewed segment ID back to its exact text, page/block locator,
   provenance hash, rights metadata, and printed attribution.
6. Compile reviewed sequences into static runtime modules. The matcher chooses
   a whole reviewed sequence; it does not choose an isolated paragraph merely
   because a keyword matches.

Local Codex-agent review is labeled honestly as `local-agent-reviewed-demo`.
It is not represented as human editorial approval.

## Build commands

Validate the complete corpus without writing generated files:

```bash
npm run sources:segments:validate
node scripts/build-local-corpus-library.mjs --check
```

After all 20 dossier files exist, compile the local static library:

```bash
node scripts/build-local-corpus-library.mjs --require-complete
```

The command writes:

- `research/generated/source-dossiers/*.json` — resolved editorial dossiers;
- `content/generated/local-corpus/source-packs/*.json` — reviewed exact
  sequence modules only, split by source;
- `content/generated/local-corpus/source-module-catalog.json` — compact matcher
  metadata without exact text;
- `content/generated/local-corpus/source-sequences.json` — coherent sequence
  recipes and beginner introductions;
- `content/generated/local-corpus/local-corpus-manifest.json` — complete-corpus
  and review coverage counts;
- `content/generated/local-corpus/source-pack-loaders.ts` — lazy per-source
  imports so a visitor does not download the whole corpus.

The build script contains no API client, does not inspect an API key, and does
not use the network.

## Runtime boundary

Every canonical segment is preserved in the research JSONL library, including
candidate and quarantined records. The complete library is not bundled into the
browser build. Inclusion in research does not make a record eligible for
automatic insertion.

Only source-order sequences named in a completed dossier become selectable
demo modules. Runtime validation rechecks their exact hash, source identity,
section, theme, audience, tone, rights, attribution, political gates, and
explicit opt-in requirements. Unknown gates fail closed. The app loads at most
the selected featured source and one compatible supporting source.

This separation provides the breadth the project needs—hundreds of pages from
all 20 sources—without treating all 1,999 extracted chunks as interchangeable
or editorially safe.
