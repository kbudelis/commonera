# Haggadah copy provenance audit

Audited July 11, 2026 against the local PDFs of *Haggadah Shir Ge’ulah v2.1* and *The Velveteen Rabbi’s Haggadah for Pesach v9*.

## Current runtime status

The runtime is source-first. It has two complete, generation-ready primary spines:

- `shir-geulah-primary`, from *Haggadah Shir Ge’ulah / Song of Liberation* by Emily Aviva Kapor-Mater;
- `velveteen-rabbi-primary`, from *The Velveteen Rabbi’s Haggadah for Pesach* by Rabbi Rachel Barenblat.

Each spine has reviewed source coverage for all 14 seder sections at the 20-, 45-, and 90-minute tiers. The generator selects exactly one spine for the entire Haggadah before it assembles any section. It does not switch source voices paragraph by paragraph.

Every completed assembly is validated to contain all 14 sections in order, at least one exact reviewed primary-source block in every section, only allowed categories of short house copy, and at least **50% reviewed-source words** across the assembled Haggadah. If it falls below that floor, generation fails rather than presenting the result as source-first.

## What is source text and what is house copy

Reviewed source passages are immutable paragraph-level blocks. The runtime resolves them by stable passage ID and rejects rewritten, truncated, cross-section, or randomly stitched source text.

House copy is stored and measured separately. It is limited to:

- beginner orientation;
- concrete ritual directions;
- short bridges;
- table prompts;
- accessibility clarifications.

Traditional liturgy is a third category, separate from both authored source prose and house copy. Quotations are independently allowlisted and attributed.

The result is intentionally hybrid: the selected Haggadah supplies the primary reading voice, while concise house directions ensure that a host and guests with no Passover background know what to do, why the ritual is happening, and that they may take turns reading or pass.

## Spine coverage and honest tier limitations

Both spines cover every section at every supported duration, but coverage does not mean that every section gains a different passage at every longer tier.

### Shir Ge’ulah

The reviewed Shir corpus currently contains 29 source blocks:

- 20-minute tier: 1,361 reviewed source words;
- 45-minute tier: 1,981 reviewed source words;
- 90-minute tier: 2,066 reviewed source words.

Distinct additions at 45 minutes currently occur in Kadesh, Maggid, Korech, Tzafun, Barech, and Hallel. Other sections reuse their approved short-tier reading. Nirtzah is the only section with a distinct 90-minute-only addition; the other sections reuse their approved 45-minute source selections at 90 minutes. This is deliberate evidence reuse, not a claim that unreviewed longer source text exists.

### Velveteen Rabbi

Every section has an exact reviewed reading at all three tiers. Kadesh, Maggid, and Nirtzah gain an additional reading at 45 minutes. Hallel gains an additional reading at 45 minutes and another at 90 minutes. Ten sections currently reuse the same reviewed reading at all three durations. The encoded Velveteen Maggid corpus supplies a source opening and a longer reflection; the beginner house block supplies the complete plain-language Exodus outline until additional source narrative pages are reviewed.

## Primary-source cohesion and secondary mixing

Secondary-source mixing is currently disabled. Both spines have empty compatibility lists and limits of zero secondary sources and zero secondary inserts. A Shir-primary output therefore uses Shir source prose only; a Velveteen-primary output uses Velveteen source prose only. Traditional liturgy, concise house copy, and separately approved quotations do not change the identity of the primary spine.

If secondary seams are introduced later, each must be explicitly reviewed for its section, seam, source, and insertion limit. Theme scoring alone can never authorize cross-source mixing.

## Internal provenance

Internal records retain, as applicable:

- stable passage and source IDs;
- exact reviewed text;
- containing Haggadah and creator;
- PDF page and printed section heading;
- original source-presented attribution for embedded material;
- treatment or normalization note;
- license or permission basis;
- SHA-256 provenance hash.

Material embedded in an approved Haggadah is eligible under the inclusive policy, but its printed attribution is preserved exactly alongside the containing-Haggadah provenance. Build and assembly validation reject stale hashes, missing attributions, unknown passage IDs, altered source blocks, section mismatches, and incomplete spine coverage.

## Reader-facing credits

The detailed passage metadata above is for internal editorial QA. The reader-facing Haggadah and PDF show no inline citations, footnotes, page locators, hashes, or repeated passage notes. The final credits page lists the selected source Haggadah once, using a compact source-level credit. Any separately reproduced quotation receives its normal quotation credit.

## Historical correction

An earlier prototype used only 14 short licensed anchors surrounded by mostly original explanatory prose. That description is obsolete. The current runtime uses one of two complete reviewed primary spines and enforces a majority-source floor while keeping beginner directions and prompts visibly separate in the assembly model.
