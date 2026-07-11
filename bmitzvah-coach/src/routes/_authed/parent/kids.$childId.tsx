import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, Circle } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { TemplateChip } from '@/components/template-chip'
import { Button } from '@/components/ui/button'
import { TEMPLATE_PALETTE } from '@/lib/content/palette'
import { journeyProgress } from '@/lib/journey/progress'
import { cn } from '@/lib/utils'
import { fetchKidJourneyFn, fetchKidsFn } from '@/utils/journeys.functions'
import type { CelebrationView, JourneyView } from '@/utils/journeys.server'

export const Route = createFileRoute('/_authed/parent/kids/$childId')({
  loader: async ({ params }) => {
    const [journey, kids] = await Promise.all([
      fetchKidJourneyFn({ data: { childId: params.childId } }),
      fetchKidsFn(),
    ])
    const kid = kids.find((k) => k.id === params.childId) ?? null
    return { journey, kid }
  },
  component: KidJourneyPage,
})

const EASE: [number, number, number, number] = [0.25, 1, 0.5, 1]

const pageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
}

function KidJourneyPage() {
  const { journey, kid } = Route.useLoaderData()
  if (!kid) return <KidNotFound />
  const firstName = kid.displayName.split(' ')[0] ?? kid.displayName
  if (!journey) return <NoJourney firstName={firstName} />
  return <ReadOnlyJourney journey={journey} firstName={firstName} />
}

function KidNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">We couldn't find that kid</h1>
      <p className="text-muted-foreground">
        This might not be one of your kids, or the link is out of date.
      </p>
      <Button render={<Link to="/parent" />}>Back to family</Button>
    </section>
  )
}

function BackBar({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Link
        to="/parent"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to family
      </Link>
      <p className="text-sm text-muted-foreground">
        This is {firstName}'s design. Cheer, don't steer.
      </p>
    </div>
  )
}

function NoJourney({ firstName }: { firstName: string }) {
  return (
    <motion.div
      className="flex flex-col gap-8"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <BackBar firstName={firstName} />
      </motion.div>
      <motion.section
        className="flex flex-col gap-3 rounded-3xl border bg-secondary/40 p-8 sm:p-10"
        variants={fadeUp}
      >
        <h1 className="font-display text-3xl font-semibold">
          {firstName} hasn't started a journey yet
        </h1>
        <p className="max-w-xl text-muted-foreground">
          The quiz is {firstName}'s move to make. Once they log in and take it, the journey they
          design and everything they plan will show up right here.
        </p>
      </motion.section>
    </motion.div>
  )
}

function ReadOnlyJourney({ journey, firstName }: { journey: JourneyView; firstName: string }) {
  const palette = TEMPLATE_PALETTE[journey.template]
  const progress = journeyProgress(journey.milestones.map((m) => m.status))
  const celebration = journey.celebration
  const hasCelebration =
    celebration !== null &&
    (celebration.what !== '' || celebration.whoWith !== '' || celebration.whereAt !== '')

  return (
    <motion.div
      className="flex flex-col gap-10"
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <BackBar firstName={firstName} />
      </motion.div>

      <motion.section
        className={cn('rounded-2xl border p-6 sm:p-7', palette.soft, palette.borderSoft)}
        variants={fadeUp}
      >
        <div className="flex flex-col gap-4">
          <TemplateChip template={journey.template} variant="solid" />
          <h1 className={cn('font-display text-3xl font-semibold sm:text-4xl', palette.softText)}>
            {journey.name}
          </h1>
          <div className="flex items-center gap-4">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full bg-foreground/10"
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
                transition={{ duration: 0.6, ease: EASE }}
              />
            </div>
            <span className={cn('whitespace-nowrap text-sm font-bold', palette.softText)}>
              {progress.done} of {progress.total} milestones
            </span>
          </div>
        </div>
      </motion.section>

      <motion.div className="grid gap-10 lg:grid-cols-2" variants={fadeUp}>
        <MilestoneList journey={journey} />
        <ActivityList journey={journey} firstName={firstName} />
      </motion.div>

      {hasCelebration ? (
        <motion.div variants={fadeUp}>
          <CelebrationPanel celebration={celebration} />
        </motion.div>
      ) : null}
    </motion.div>
  )
}

function MilestoneList({ journey }: { journey: JourneyView }) {
  const palette = TEMPLATE_PALETTE[journey.template]
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-2xl font-semibold">Milestones</h2>
      <ol className="flex flex-col">
        {journey.milestones.map((milestone, index) => {
          const isLast = index === journey.milestones.length - 1
          return (
            <li key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    milestone.status === 'done' && cn(palette.dot, 'text-white'),
                    milestone.status === 'in_progress' &&
                      cn('border-2 border-current bg-background', palette.softText),
                    milestone.status === 'todo' &&
                      'border-2 border-border bg-background text-border',
                  )}
                >
                  {milestone.status === 'done' ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Circle className="size-2.5" fill="currentColor" aria-hidden />
                  )}
                </span>
                {isLast ? null : <span className="w-0.5 flex-1 bg-border" aria-hidden />}
              </div>
              <div className={cn('flex flex-1 flex-col gap-1 pb-8', isLast && 'pb-0')}>
                <h3 className="font-bold">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function ActivityList({ journey, firstName }: { journey: JourneyView; firstName: string }) {
  const palette = TEMPLATE_PALETTE[journey.template]
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-2xl font-semibold">Activities</h2>
      {journey.activities.length === 0 ? (
        <p className="rounded-2xl bg-secondary/60 px-5 py-6 text-sm text-muted-foreground">
          No activities on the list yet. They'll show up here as {firstName} adds them.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {journey.activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3 rounded-2xl border px-4 py-3">
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2',
                  activity.status === 'done'
                    ? cn(palette.dot, 'border-transparent text-white')
                    : 'border-input',
                )}
              >
                {activity.status === 'done' ? <Check className="size-3.5" aria-hidden /> : null}
              </span>
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-bold',
                    activity.status === 'done' && 'text-muted-foreground line-through',
                  )}
                >
                  {activity.title}
                </p>
                {activity.description ? (
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CelebrationPanel({ celebration }: { celebration: CelebrationView }) {
  const rows = [
    { label: 'What', value: celebration.what },
    { label: 'Who', value: celebration.whoWith },
    { label: 'Where', value: celebration.whereAt },
  ] as const
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-accent p-6 text-accent-foreground sm:p-8">
      <h2 className="font-display text-xl font-semibold">The celebration, so far</h2>
      <dl className="flex flex-col gap-3">
        {rows
          .filter((row) => row.value !== '')
          .map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt className="text-xs font-bold uppercase tracking-wide opacity-70">{row.label}</dt>
              <dd className="text-sm">{row.value}</dd>
            </div>
          ))}
      </dl>
    </section>
  )
}
