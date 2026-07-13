# Local full-corpus editorial acceptance

This checklist governs the local 20-source corpus and the static material built
from it.

## Canonical integrity

- Exactly 20 acquired sources and 1,999 unique canonical segments.
- Every exact-text SHA-256, word count, character count, source order, source
  locator, and per-source reconstruction hash validates.
- Quarantined extraction failures remain visible and cannot become runtime
  modules.

## Complete local organization

- One schema-valid dossier exists for every source.
- Every dossier states its voice, best uses, beginner risks, political context,
  credit requirements, exclusions, and review status.
- Every recommended sequence contains 2–8 segments from one source in strict
  source order.
- A sequence explains what a beginner needs to know before reading it and why
  its passages belong together.
- Specialist, historical, activist, and fandom sources are contextual or
  opt-in where appropriate rather than silently excluded.

## Runtime sequence quality

- The runtime inserts a reviewed sequence, never a keyword-matched fragment.
- Exact source language remains unchanged. House-written orientation and
  bridges are separate blocks.
- The two complete procedural backbones still provide all 14 Seder sections in
  order; featured sequences deepen a section without replacing required ritual
  instructions or the Exodus narrative.
- Concise outputs use short sequences. Longer outputs may add longer sequences,
  but must preserve the document's dominant voice and narrative arc.
- Every selected source appears once on the final credits page; no line-by-line
  reader citations are required.

## Beginner access

- Ritual actions identify the object, substance, person acting, and what happens
  next.
- The opening explains what Passover and a Seder are, how the evening works,
  and that guests may take turns reading or pass.
- The Exodus section tells a comprehensible story rather than listing names or
  keywords.
- Discussion prompts are concrete, answerable, and appropriate for the stated
  audience.
- Specialist readings receive a plain-language introduction.

## Political and attribution gates

- Collective blame, dehumanization, exclusive territorial claims, expulsion,
  collective punishment, violence against civilians, and anti-Palestinian or
  anti-Jewish rhetoric are excluded.
- Modern partisan or nationalist claims require an explicit gate and do not
  appear in default generation.
- “Next year in Jerusalem” is available only when `traditional` is selected and
  `social-justice` is not selected. Otherwise the closing is “Next year in
  peace.”
- Biblical Israel/Israelites and historical Palestine references are not
  excluded merely because those words appear.
- Source-level reuse permission and conditions are retained. Printed third-party
  attribution is preserved in internal metadata and the final source credit.

## Honest review labels

- Local Codex-agent review is labeled `local-agent-reviewed-demo` and never
  called human review.
- The build manifest records `externalModelApiUsed: false` and
  `humanReviewClaimed: false`.
- Public-release copy must not claim that every source passage received human
  editorial or legal review.

