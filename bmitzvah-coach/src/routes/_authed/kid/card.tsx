import { createFileRoute, Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { TemplateChip } from '@/components/template-chip'
import { Button } from '@/components/ui/button'
import { useTemplate } from '@/hooks/use-templates'
import { TEMPLATE_PALETTE } from '@/lib/content/palette'
import { journeyProgress } from '@/lib/journey/progress'
import { cn } from '@/lib/utils'
import { fetchOwnJourneyFn } from '@/utils/journeys.functions'
import type { ActivityView, JourneyView } from '@/utils/journeys.server'

export const Route = createFileRoute('/_authed/kid/card')({
  loader: () => fetchOwnJourneyFn(),
  component: CardPage,
})

function CardPage() {
  const journey = Route.useLoaderData()
  if (!journey) return <EmptyCard />
  return <JourneyCard journey={journey} />
}

function EmptyCard() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🪪
      </span>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        Your card shows up once you have a journey
      </h1>
      <p className="text-muted-foreground">
        Take the quiz, name your path, and this turns into a snapshot worth sending to someone.
      </p>
      <Button size="lg" render={<Link to="/kid/quiz" />}>
        Take the quiz
      </Button>
    </section>
  )
}

function JourneyCard({ journey }: { journey: JourneyView }) {
  const { user } = Route.useRouteContext()
  const firstName = user.displayName.split(' ')[0] ?? user.displayName
  const palette = TEMPLATE_PALETTE[journey.template]
  const template = useTemplate(journey.template)
  const themes = template?.themes ?? []
  const progress = journeyProgress(journey.milestones.map((m) => m.status))
  const activities = journey.activities.slice(0, 3)
  const celebrationWhat = journey.celebration?.what.trim() ?? ''
  const celebration = celebrationWhat.length > 0 ? celebrationWhat : null

  const summary = buildSummary({
    journeyName: journey.name,
    templateName: template?.name ?? '',
    firstName,
    progress,
    themes,
    activities,
    celebration,
  })

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className={cn('rounded-3xl p-8 sm:p-10', palette.soft)}>
        <TemplateChip template={journey.template} variant="solid" />
        <h1
          className={cn(
            'mt-6 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl',
            palette.softText,
          )}
        >
          {journey.name}
        </h1>
        <p className={cn('mt-3 text-sm font-bold opacity-80', palette.softText)}>
          {firstName} is building this
        </p>

        {themes.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {themes.map((theme) => (
              <li
                key={theme}
                className={cn(
                  'rounded-full bg-background/60 px-3 py-1 text-xs font-bold',
                  palette.softText,
                )}
              >
                {theme}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-7">
          <span className={cn('text-sm font-bold', palette.softText)}>
            {progress.done} of {progress.total} milestones
          </span>
          <div
            className="mt-2 h-3 overflow-hidden rounded-full bg-background/60"
            role="progressbar"
            aria-valuenow={progress.done}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-label="Milestones done"
          >
            <motion.div
              className={cn('h-full rounded-full', palette.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress.percent, 3)}%` }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            />
          </div>
        </div>

        {activities.length > 0 ? (
          <ul className="mt-7 flex flex-col gap-2.5">
            {activities.map((activity) => {
              const done = activity.status === 'done'
              return (
                <li key={activity.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full',
                      done ? cn(palette.dot, 'text-white') : cn('border-2', palette.borderSoft),
                    )}
                  >
                    {done ? <Check className="size-3" aria-hidden /> : null}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      palette.softText,
                      done && 'line-through opacity-70',
                    )}
                  >
                    {activity.title}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : null}

        {celebration ? (
          <p
            className={cn(
              'mt-7 line-clamp-1 border-t pt-5 text-sm font-semibold',
              palette.softText,
              palette.borderSoft,
            )}
          >
            <span aria-hidden>🎉 </span>
            {celebration}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Screenshot it, send it to someone who gets it.
        </p>
        <CopyButton summary={summary} />
      </div>
    </div>
  )
}

function CopyButton({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" onClick={onCopy}>
      {copied ? 'Copied' : 'Copy as text'}
    </Button>
  )
}

function buildSummary({
  journeyName,
  templateName,
  firstName,
  progress,
  themes,
  activities,
  celebration,
}: {
  journeyName: string
  templateName: string
  firstName: string
  progress: { done: number; total: number }
  themes: readonly string[]
  activities: readonly ActivityView[]
  celebration: string | null
}): string {
  const lines: string[] = [
    journeyName,
    `${firstName}'s B'Mitzvah journey${templateName ? ` · ${templateName}` : ''}`,
    '',
    `${progress.done} of ${progress.total} milestones done`,
  ]
  if (themes.length > 0) lines.push(`Themes: ${themes.join(', ')}`)
  if (activities.length > 0) {
    lines.push('', 'Up next:')
    for (const activity of activities) {
      lines.push(`${activity.status === 'done' ? '[x]' : '[ ]'} ${activity.title}`)
    }
  }
  if (celebration) lines.push('', `Celebration: ${celebration}`)
  lines.push('', "Built on B'Mitzvah 2.0")
  return lines.join('\n')
}
