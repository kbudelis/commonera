# Source-first cohesion architecture

## Decision

Each generated Haggadah selects exactly one primary source spine before assembly:

- `shir-geulah-primary` — clear, justice-centered ritual voice;
- `velveteen-rabbi-primary` — reflective and poetic ritual voice.

Both are `generation-ready-with-house-copy`. Each covers all 14 ordered seder sections at 20, 45, and 90 minutes. The selection is profile-based and applies to the complete document, preventing paragraph-by-paragraph oscillation between source styles.

## Block and seam rules

- A reviewed source passage is an indivisible paragraph-level block. Its assembled text must exactly match the passage inventory.
- Every section must contain primary-source prose from the selected spine at the chosen tier.
- House copy is a separate block and may orient a beginner, state a ritual action, bridge sections, ask a table question, or add an accessibility clarification.
- Traditional liturgy is tracked separately from both house copy and authored source words.
- Source passages may not move to another section, be silently paraphrased, or be stitched together with house prose.
- Compatibility is explicit metadata, never a theme-score coincidence.

## Source-majority rule

`sourceShareMetrics()` reports total, reviewed-source, house, and traditional-liturgical words, plus per-source shares. After structural validation, runtime generation requires a reviewed-source word share of at least 50%. The generator throws if the assembled document falls below that floor.

The percentage is a guardrail, not permission to pad with irrelevant excerpts. Section order, exact passage identity, placement, and narrative coherence are validated first.

## Secondary sources

Secondary mixing is currently closed. Both spines have:

- no approved secondary compatibility records;
- `maxSecondarySources: 0`;
- `maxSecondaryInserts: 0`.

Future secondary material may enter only through a specifically reviewed section and seam with an explicit insertion limit. Until then, one generated Haggadah has one authored source voice.

## Provenance and reader display

Internal records retain exact source text, containing Haggadah, creator, permission or license, original printed attribution, modification note, PDF page/section locator, and SHA-256 hash. Material embedded in an approved Haggadah remains eligible when its original source-presented attribution and containing-Haggadah provenance are preserved.

Reader-facing output follows a deliberately simpler rule: list the selected source Haggadah once on the final credits page. Do not print inline source citations, paragraph credits, page locators, hashes, or modification notes. `readerCredits()` deduplicates at the source-work level; `internalProvenance()` retains the detailed audit record.

## Runtime sequence

1. Select one complete source spine from the generation profile.
2. Resolve exact reviewed passages for every section and the selected 20/45/90 tier.
3. Add only approved house-copy roles and optional traditional liturgy.
4. Represent the result as ordered `AssemblyBlock`s rather than arbitrary concatenated strings.
5. Run `validateAssembly()` to enforce the spine, section order, source identity, exact text, tier, seam, and house-copy boundaries.
6. Run `sourceShareMetrics()` and enforce the 50% reviewed-source minimum.
7. Convert the validated blocks into the screen/print document while retaining passage IDs internally.
8. Render one compact source-level credit for the selected Haggadah on the final credits page.

## Tier limitations

Both spines have complete tier coverage, but some longer tiers intentionally reuse an already reviewed reading. Shir gains distinct medium material in six sections and distinct full-only material in Nirtzah. Velveteen gains medium material in Kadesh, Maggid, Hallel, and Nirtzah, and full-only material in Hallel. These gaps remain visible in the source-pack metadata and must not be described as newly transcribed longer source text.
