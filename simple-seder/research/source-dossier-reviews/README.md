# Local source dossier review overrides

Create one file per source at `research/source-dossier-reviews/<source-id>.json`, validated against [`../source-dossier-schema.json`](../source-dossier-schema.json).

Reviews cite canonical segment IDs only; never copy exact source text into an override. The dossier builder resolves each ID to its exact local page/block locator, SHA-256, word count, and source-presented credits. Every recommended sequence must contain 2–8 same-source IDs in strict canonical order and explain why those passages form a coherent sequence for a beginner table.

The required review label is deliberately narrow:

```json
{
  "mode": "local-codex-agent",
  "externalModelApiUsed": false,
  "batchModelReviewed": false,
  "humanReviewed": false
}
```

All resulting modules and sequences remain candidate-only. These files never grant runtime eligibility or comprehensive approval.
