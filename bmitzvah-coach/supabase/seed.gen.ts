// Seed generator. Reads the authored content in src/lib/content/* and emits
// supabase/seed.sql (idempotent upserts) for the reference/catalog tables.
//
// The TypeScript content modules remain the single authoring source of truth;
// the database is a derived projection of them. content.test.ts keeps the TS
// honest, and this generator keeps the DB in sync. Regenerate with:
//
//   pnpm db:seed:gen
//
// Runs on plain Node (v22.6+/v24) via native type stripping: every content
// module imports only types, so there is nothing to resolve at runtime.

import { ACTIVITY_PROMPTS } from '../src/lib/content/prompts.ts'
import { PROVIDERS } from '../src/lib/content/providers.ts'
import { COMFORT_OPTIONS, QUIZ_QUESTIONS, TIMELINE_OPTIONS } from '../src/lib/content/quiz.ts'
import { STORIES } from '../src/lib/content/stories.ts'
import { TEMPLATES } from '../src/lib/content/templates.ts'

// --- SQL literal helpers -------------------------------------------------

const str = (value: string): string => `'${value.replaceAll("'", "''")}'`
const nullableStr = (value: string | undefined | null): string =>
  value === undefined || value === null ? 'null' : str(value)
const int = (value: number): string => String(value)
const nullableInt = (value: number | undefined | null): string =>
  value === undefined || value === null ? 'null' : String(value)
const bool = (value: boolean): string => (value ? 'true' : 'false')
const textArray = (values: readonly string[]): string =>
  values.length === 0 ? 'array[]::text[]' : `array[${values.map(str).join(', ')}]`
const jsonb = (value: unknown): string => `${str(JSON.stringify(value))}::jsonb`

// --- Table emitters ------------------------------------------------------

type Column = { readonly name: string; readonly pk?: boolean }

// Emit a single multi-row upsert. Non-pk columns are refreshed from the
// incoming row so re-running the seed updates content without touching user
// data (no truncate, so foreign keys from user tables stay intact).
function upsert(
  table: string,
  columns: readonly Column[],
  conflict: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const colNames = columns.map((c) => c.name)
  const updates = colNames
    .filter((name) => !conflict.includes(name))
    .map((name) => `${name} = excluded.${name}`)
  const values = rows.map((row) => `  (${row.join(', ')})`).join(',\n')
  const onConflict =
    updates.length === 0
      ? `on conflict (${conflict.join(', ')}) do nothing`
      : `on conflict (${conflict.join(', ')}) do update set\n    ${updates.join(',\n    ')}`
  return `insert into public.${table} (${colNames.join(', ')}) values\n${values}\n${onConflict};\n`
}

const blocks: string[] = []

// templates
blocks.push(
  upsert(
    'templates',
    [
      { name: 'key', pk: true },
      { name: 'name' },
      { name: 'emoji' },
      { name: 'tagline' },
      { name: 'description' },
      { name: 'jewish_lens' },
      { name: 'themes' },
      { name: 'celebration_ideas' },
      { name: 'getting_started' },
      { name: 'provider_types' },
      { name: 'position' },
    ],
    ['key'],
    TEMPLATES.map((t, i) => [
      str(t.key),
      str(t.name),
      str(t.emoji),
      str(t.tagline),
      str(t.description),
      str(t.jewishLens),
      textArray(t.themes),
      textArray(t.celebrationIdeas),
      textArray(t.gettingStarted),
      textArray(t.providerTypes),
      int(i),
    ]),
  ),
)

// template_milestones
blocks.push(
  upsert(
    'template_milestones',
    [
      { name: 'template', pk: true },
      { name: 'position', pk: true },
      { name: 'title' },
      { name: 'description' },
    ],
    ['template', 'position'],
    TEMPLATES.flatMap((t) =>
      t.milestones.map((m, i) => [str(t.key), int(i), str(m.title), str(m.description)]),
    ),
  ),
)

// activity_prompts
blocks.push(
  upsert(
    'activity_prompts',
    [
      { name: 'id', pk: true },
      { name: 'template' },
      { name: 'kind' },
      { name: 'title' },
      { name: 'description' },
      { name: 'position' },
    ],
    ['id'],
    ACTIVITY_PROMPTS.map((p, i) => [
      str(p.id),
      str(p.template),
      str(p.kind),
      str(p.title),
      str(p.description),
      int(i),
    ]),
  ),
)

// providers
blocks.push(
  upsert(
    'providers',
    [
      { name: 'key', pk: true },
      { name: 'name' },
      { name: 'tagline' },
      { name: 'overview' },
      { name: 'approach' },
      { name: 'format' },
      { name: 'location' },
      { name: 'price_range' },
      { name: 'org_type' },
      { name: 'verified' },
      { name: 'position' },
    ],
    ['key'],
    PROVIDERS.map((p, i) => [
      str(p.key),
      str(p.name),
      str(p.tagline),
      str(p.overview),
      str(p.approach),
      str(p.format),
      str(p.location),
      str(p.priceRange),
      str(p.orgType),
      bool(p.verified),
      int(i),
    ]),
  ),
)

// provider_testimonials
blocks.push(
  upsert(
    'provider_testimonials',
    [
      { name: 'provider_key', pk: true },
      { name: 'position', pk: true },
      { name: 'quote' },
      { name: 'attribution' },
    ],
    ['provider_key', 'position'],
    PROVIDERS.flatMap((p) =>
      p.testimonials.map((t, i) => [str(p.key), int(i), str(t.quote), str(t.attribution)]),
    ),
  ),
)

// provider_templates (many-to-many, ordered)
blocks.push(
  upsert(
    'provider_templates',
    [{ name: 'provider_key', pk: true }, { name: 'template', pk: true }, { name: 'position' }],
    ['provider_key', 'template'],
    PROVIDERS.flatMap((p) => p.templates.map((template, i) => [str(p.key), str(template), int(i)])),
  ),
)

// quiz_questions
blocks.push(
  upsert(
    'quiz_questions',
    [
      { name: 'id', pk: true },
      { name: 'kind' },
      { name: 'prompt' },
      { name: 'helper' },
      { name: 'pick_exactly' },
      { name: 'position' },
    ],
    ['id'],
    QUIZ_QUESTIONS.map((question, i) => [
      str(question.id),
      str(question.kind),
      str(question.prompt),
      nullableStr(question.helper),
      nullableInt(question.kind === 'words' ? question.pickExactly : null),
      int(i),
    ]),
  ),
)

// quiz_options
blocks.push(
  upsert(
    'quiz_options',
    [
      { name: 'id', pk: true },
      { name: 'question_id' },
      { name: 'label' },
      { name: 'emoji' },
      { name: 'weights' },
      { name: 'position' },
    ],
    ['id'],
    QUIZ_QUESTIONS.flatMap((question) =>
      question.options.map((option, i) => [
        str(option.id),
        str(question.id),
        str(option.label),
        str(option.emoji),
        jsonb(option.weights),
        int(i),
      ]),
    ),
  ),
)

// timeline_options
blocks.push(
  upsert(
    'timeline_options',
    [{ name: 'key', pk: true }, { name: 'label' }, { name: 'helper' }, { name: 'position' }],
    ['key'],
    TIMELINE_OPTIONS.map((o, i) => [str(o.key), str(o.label), str(o.helper), int(i)]),
  ),
)

// comfort_options
blocks.push(
  upsert(
    'comfort_options',
    [{ name: 'key', pk: true }, { name: 'label' }, { name: 'helper' }, { name: 'position' }],
    ['key'],
    COMFORT_OPTIONS.map((o, i) => [str(o.key), str(o.label), str(o.helper), int(i)]),
  ),
)

// stories
blocks.push(
  upsert(
    'stories',
    [
      { name: 'slug', pk: true },
      { name: 'child_name' },
      { name: 'age' },
      { name: 'template' },
      { name: 'journey_name' },
      { name: 'story' },
      { name: 'quote' },
      { name: 'celebration' },
      { name: 'position' },
    ],
    ['slug'],
    STORIES.map((s, i) => [
      str(s.slug),
      str(s.childName),
      int(s.age),
      str(s.template),
      str(s.journeyName),
      str(s.story),
      str(s.quote),
      str(s.celebration),
      int(i),
    ]),
  ),
)

const header = `-- GENERATED FILE. Do not edit by hand.
-- Source: src/lib/content/* (the authoring source of truth).
-- Regenerate: pnpm db:seed:gen
-- Loaded automatically by \`supabase db reset\` (see [db.seed] in config.toml).

`

process.stdout.write(`${header}begin;\n\n${blocks.join('\n')}\ncommit;\n`)
