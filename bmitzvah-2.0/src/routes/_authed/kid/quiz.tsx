import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles } from 'lucide-react'
import { AnimatePresence, motion, type Transition, type Variants } from 'motion/react'
import { useEffect, useReducer, useRef, useState } from 'react'
import { TemplateChip } from '@/components/template-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTemplate, useTemplates } from '@/hooks/use-templates'
import { TEMPLATE_PALETTE } from '@/lib/content/palette'
import type { QuizQuestion, TemplateKey } from '@/lib/content/types'
import { suggestJourneyNames } from '@/lib/journey/naming'
import { splitByRecommendation } from '@/lib/providers/recommend'
import { type QuizAnswers, recommendTemplates } from '@/lib/quiz/scoring'
import { cn } from '@/lib/utils'
import { fetchOwnSettingsFn } from '@/utils/child-settings.functions'
import { fetchProvidersFn, fetchQuizContentFn } from '@/utils/content.functions'
import {
  createJourneyFn,
  fetchFavoritesFn,
  fetchOwnJourneyFn,
  setFavoriteFn,
} from '@/utils/journeys.functions'

export const Route = createFileRoute('/_authed/kid/quiz')({
  // A journey, once chosen, is permanent: kids with one never see the quiz.
  loader: async () => {
    const journey = await fetchOwnJourneyFn()
    if (journey) throw redirect({ to: '/kid' })
    // settings carries the parent's observance answer (may be unanswered —
    // scoring copes with null); providers + favorites feed the final guides
    // step so it renders without a refetch.
    const [quiz, settings, providers, favorites] = await Promise.all([
      fetchQuizContentFn(),
      fetchOwnSettingsFn(),
      fetchProvidersFn(),
      fetchFavoritesFn(),
    ])
    return { quiz, settings, providers, favorites }
  },
  component: QuizPage,
})

// Ease-out-quart, the house curve (DESIGN.md). Named once so every motion in
// the quiz shares one feel.
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1]
const STEP_TRANSITION: Transition = { duration: 0.25, ease: EASE_OUT_QUART }

// Step transitions. `custom` carries the navigation direction (1 forward, -1
// back) so a step enters from the side you are heading toward and the outgoing
// one leaves the other way. reducedMotion="user" (set in __root) drops the x
// offset to a plain crossfade when the user asks for less motion.
const stepVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
}

// Same slide-fade for the question body, keyed by question index so the header
// (progress bar, counter) stays put and animates while the body swaps. Distinct
// variant names keep the outer section's propagation from driving it twice.
const bodyVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  shown: { opacity: 1, x: 0 },
  gone: (direction: number) => ({ opacity: 0, x: direction * -24 }),
}

// Staggered list entrance for the results panels and the name suggestions.
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
}
const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: STEP_TRANSITION },
}

// The "Best match" badge pops in a beat after its panel has settled.
const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE_OUT_QUART, delay: 0.25 } },
}

// A single-choice option's check mark scales in when the option is picked.
const checkVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1 },
}

// A word chip does a small spring-free pop the moment it becomes selected. The
// label form (not an inline keyframe array) means a sibling re-render never
// re-fires the pop: motion only re-runs when the label itself changes.
const chipVariants: Variants = {
  idle: { scale: 1 },
  selected: { scale: [1, 1.05, 1] },
}

// A single-choice option's emoji does a bigger pop on select — the 240ms
// auto-advance delay gives it just enough room to land.
const emojiPopVariants: Variants = {
  idle: { scale: 1 },
  selected: { scale: [1, 1.35, 1] },
}

// One playful beat between questions, keyed by index (deterministic — no
// hidden randomness), sliding in with the question body.
const ENCOURAGEMENTS = [
  'Nice pick.',
  'Ooh, interesting.',
  'Good one.',
  'This is going somewhere.',
  "You're on a roll.",
  'No hesitation. Respect.',
] as const

function encouragementFor(index: number, total: number): string | null {
  if (index === 0) return null
  if (index === total - 1) return 'Last one — make it count.'
  return ENCOURAGEMENTS[(index - 1) % ENCOURAGEMENTS.length] ?? null
}

// The progress counter picks up steam as the kid gets closer to the end.
function progressEmoji(percent: number): string | null {
  if (percent >= 90) return '✨'
  if (percent >= 50) return '🔥'
  return null
}

// One-shot dot burst above the results reveal — the same celebratory language
// as the dashboard's completion banner, tinted by the best-match palette.
const resultsBurst: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const resultsBurstDot: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: EASE_OUT_QUART } },
}
const RESULTS_BURST_KEYS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'] as const

type QuizState =
  | { readonly step: 'intro' }
  | {
      readonly step: 'question'
      readonly index: number
      readonly answers: QuizAnswers
    }
  | {
      readonly step: 'results'
      readonly answers: QuizAnswers
    }
  | {
      readonly step: 'name'
      readonly template: TemplateKey
      readonly answers: QuizAnswers
    }
  | {
      // The journey exists by this point, so there is no way back: the only
      // exits lead to the dashboard or the full guide directory.
      readonly step: 'guides'
      readonly template: TemplateKey
    }

type QuizAction =
  | { readonly type: 'start' }
  | { readonly type: 'answer-single'; readonly optionId: string }
  | { readonly type: 'toggle-word'; readonly optionId: string }
  | { readonly type: 'continue' }
  | { readonly type: 'back' }
  | { readonly type: 'choose-template'; readonly template: TemplateKey }
  | { readonly type: 'journey-created' }

function quizReducer(
  questions: readonly QuizQuestion[],
  state: QuizState,
  action: QuizAction,
): QuizState {
  switch (action.type) {
    case 'start':
      return state.step === 'intro' ? { step: 'question', index: 0, answers: {} } : state
    case 'answer-single': {
      if (state.step !== 'question') return state
      const question = questions[state.index]
      if (question?.kind !== 'single') return state
      const answers = { ...state.answers, [question.id]: [action.optionId] }
      const nextIndex = state.index + 1
      return nextIndex >= questions.length
        ? { step: 'results', answers }
        : { ...state, index: nextIndex, answers }
    }
    case 'toggle-word': {
      if (state.step !== 'question') return state
      const question = questions[state.index]
      if (question?.kind !== 'words') return state
      const picked = state.answers[question.id] ?? []
      const next = picked.includes(action.optionId)
        ? picked.filter((id) => id !== action.optionId)
        : picked.length < question.pickExactly
          ? [...picked, action.optionId]
          : picked
      return { ...state, answers: { ...state.answers, [question.id]: next } }
    }
    case 'continue': {
      if (state.step !== 'question') return state
      const question = questions[state.index]
      if (question?.kind !== 'words') return state
      if ((state.answers[question.id] ?? []).length !== question.pickExactly) return state
      const nextIndex = state.index + 1
      return nextIndex >= questions.length
        ? { step: 'results', answers: state.answers }
        : { ...state, index: nextIndex }
    }
    case 'back': {
      if (state.step === 'question') {
        return state.index === 0 ? { step: 'intro' } : { ...state, index: state.index - 1 }
      }
      if (state.step === 'results') {
        return { step: 'question', index: questions.length - 1, answers: state.answers }
      }
      if (state.step === 'name') {
        return { step: 'results', answers: state.answers }
      }
      return state
    }
    case 'choose-template':
      return state.step === 'results'
        ? { step: 'name', template: action.template, answers: state.answers }
        : state
    case 'journey-created':
      return state.step === 'name' ? { step: 'guides', template: state.template } : state
    default:
      return state
  }
}

function pickedWords(questions: readonly QuizQuestion[], answers: QuizAnswers): readonly string[] {
  const wordsQuestion = questions.find((q) => q.kind === 'words')
  if (!wordsQuestion) return []
  const picked = answers[wordsQuestion.id] ?? []
  return wordsQuestion.options
    .filter((option) => picked.includes(option.id))
    .map((option) => option.label)
}

type StepProps<S extends QuizState['step']> = {
  state: Extract<QuizState, { step: S }>
  dispatch: React.Dispatch<QuizAction>
  direction: number
}

function QuizPage() {
  const { quiz } = Route.useLoaderData()
  const [state, dispatch] = useReducer(
    (current: QuizState, action: QuizAction) => quizReducer(quiz.questions, current, action),
    { step: 'intro' },
  )
  // Direction lives here, not in the reducer: it is a view concern that tells
  // the step transition which way to slide. Every action moves forward except
  // an explicit Back.
  const [direction, setDirection] = useState(1)
  const navigate = (action: QuizAction) => {
    setDirection(action.type === 'back' ? -1 : 1)
    dispatch(action)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* initial={false}: the first paint renders in place (visible by default,
          per DESIGN), only navigation between steps animates. */}
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {state.step === 'intro' ? (
          <IntroStep key="intro" state={state} dispatch={navigate} direction={direction} />
        ) : null}
        {state.step === 'question' ? (
          <QuestionStep key="question" state={state} dispatch={navigate} direction={direction} />
        ) : null}
        {state.step === 'results' ? (
          <ResultsStep key="results" state={state} dispatch={navigate} direction={direction} />
        ) : null}
        {state.step === 'name' ? (
          <NameStep key="name" state={state} dispatch={navigate} direction={direction} />
        ) : null}
        {state.step === 'guides' ? (
          <GuidesStep key="guides" state={state} dispatch={navigate} direction={direction} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function IntroStep({ dispatch, direction }: StepProps<'intro'>) {
  const { quiz } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const firstName = user.displayName.split(' ')[0] ?? user.displayName
  return (
    <motion.section
      className="flex flex-col gap-8 py-8"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={STEP_TRANSITION}
    >
      <div className="flex flex-col gap-3">
        <span className="text-5xl" aria-hidden>
          🎯
        </span>
        <h1 className="font-display text-4xl font-semibold">{firstName}, which journey are you?</h1>
        <p className="text-muted-foreground">
          {quiz.questions.length} questions. Zero wrong answers, no grades, nobody watching over
          your shoulder. Go with your gut — it knows.
        </p>
      </div>
      <Button size="lg" onClick={() => dispatch({ type: 'start' })}>
        Let's go
      </Button>
    </motion.section>
  )
}

function QuestionStep({ state, dispatch, direction }: StepProps<'question'>) {
  const { quiz } = Route.useLoaderData()
  const question = quiz.questions[state.index]
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  // Reset the highlight and kill any pending auto-advance whenever the
  // question changes, so tapping Back right after an answer cannot let a stale
  // timer overwrite the previous question's answer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: state.index drives the reset
  useEffect(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
    setPendingOption(null)
  }, [state.index])

  if (!question) return null
  const picked = state.answers[question.id] ?? []
  const progress = Math.round((state.index / quiz.questions.length) * 100)

  return (
    <motion.section
      className="flex flex-col gap-8 py-8"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={STEP_TRANSITION}
    >
      {/* Header stays mounted across questions so the bar can animate its width
          rather than reset on every step. */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back"
          onClick={() => dispatch({ type: 'back' })}
        >
          <ArrowLeft aria-hidden />
        </Button>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={state.index}
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
          aria-label="Quiz progress"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ duration: 0.4, ease: EASE_OUT_QUART }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground">
          {progressEmoji(progress) ? (
            <motion.span
              key={progressEmoji(progress)}
              className="mr-1 inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              aria-hidden
            >
              {progressEmoji(progress)}
            </motion.span>
          ) : null}
          {state.index + 1}/{quiz.questions.length}
        </span>
      </div>

      {/* initial={false}: the body sits still when the whole section first
          slides in, then slide-fades on each question change. */}
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={state.index}
          className="flex flex-col gap-8"
          custom={direction}
          variants={bodyVariants}
          initial="hidden"
          animate="shown"
          exit="gone"
          transition={STEP_TRANSITION}
        >
          <div className="flex flex-col gap-2">
            {encouragementFor(state.index, quiz.questions.length) ? (
              <p className="text-sm font-bold text-primary">
                {encouragementFor(state.index, quiz.questions.length)}
              </p>
            ) : null}
            <h1 className="font-display text-3xl font-semibold">{question.prompt}</h1>
            {question.helper ? <p className="text-muted-foreground">{question.helper}</p> : null}
            {question.kind === 'words' ? (
              <p className="text-sm font-bold text-primary">
                Pick {question.pickExactly}. You've got {question.pickExactly - picked.length} left.
              </p>
            ) : null}
          </div>

          {question.kind === 'words' ? (
            <div className="flex flex-wrap gap-2.5">
              {question.options.map((option) => {
                const selected = picked.includes(option.id)
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => dispatch({ type: 'toggle-word', optionId: option.id })}
                    initial={false}
                    variants={chipVariants}
                    animate={selected ? 'selected' : 'idle'}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background hover:border-primary/50',
                    )}
                  >
                    <span aria-hidden>{option.emoji}</span>
                    {option.label}
                  </motion.button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {question.options.map((option) => {
                const selected = pendingOption === option.id || picked.includes(option.id)
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    initial={false}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (pendingOption) return
                      setPendingOption(option.id)
                      advanceTimer.current = setTimeout(
                        () => dispatch({ type: 'answer-single', optionId: option.id }),
                        240,
                      )
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left font-bold',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-input bg-background hover:border-primary/50',
                    )}
                  >
                    <motion.span
                      className="text-2xl"
                      aria-hidden
                      initial={false}
                      variants={emojiPopVariants}
                      animate={selected ? 'selected' : 'idle'}
                      transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
                    >
                      {option.emoji}
                    </motion.span>
                    {option.label}
                    <AnimatePresence>
                      {selected ? (
                        <motion.span
                          className="ml-auto flex"
                          variants={checkVariants}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
                        >
                          <Check className="size-5 text-primary" aria-hidden />
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          )}

          {question.kind === 'words' ? (
            <Button
              size="lg"
              disabled={picked.length !== question.pickExactly}
              onClick={() => dispatch({ type: 'continue' })}
            >
              Continue
            </Button>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  )
}

function ResultsStep({ state, dispatch, direction }: StepProps<'results'>) {
  const { quiz, settings } = Route.useLoaderData()
  const templates = useTemplates()
  const ranked = recommendTemplates(quiz.questions, state.answers, settings.comfort)
  const recommendedKeys = ranked.map((r) => r.key)
  const rest = templates.filter((t) => !recommendedKeys.includes(t.key))
  const bestPalette = ranked[0] ? TEMPLATE_PALETTE[ranked[0].key] : null

  // A beat of suspense before the reveal: long enough to feel like the quiz is
  // thinking, short enough that nobody reaches for the reload button.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!revealed) {
    return (
      <motion.section
        key="reading"
        className="flex flex-col items-center gap-4 py-24 text-center"
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={STEP_TRANSITION}
      >
        <span className="text-5xl" aria-hidden>
          🥁
        </span>
        <p className="font-display text-2xl font-semibold">Reading your answers</p>
        <div className="flex items-center gap-1.5" aria-hidden>
          {['d1', 'd2', 'd3'].map((key, i) => (
            <motion.span
              key={key}
              className="size-2.5 rounded-full bg-primary"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      key="revealed"
      className="flex flex-col gap-10 py-8"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={STEP_TRANSITION}
    >
      <div className="flex flex-col gap-3">
        {bestPalette ? (
          <motion.div
            variants={resultsBurst}
            initial="hidden"
            animate="show"
            className="flex items-center gap-1.5"
            aria-hidden
          >
            {RESULTS_BURST_KEYS.map((key, i) => (
              <motion.span
                key={key}
                variants={resultsBurstDot}
                className={cn(
                  'size-2.5 rounded-full',
                  i % 2 === 0 ? bestPalette.dot : 'bg-accent-deep',
                )}
              />
            ))}
          </motion.div>
        ) : null}
        <p className="inline-flex items-center gap-1.5 font-bold text-primary">
          <Sparkles className="size-4" aria-hidden />
          Quiz done
        </p>
        <h1 className="font-display text-4xl font-semibold">Your results are in</h1>
        <p className="text-muted-foreground">
          Your answers point at these three. Pick the one that makes you want to start today, or
          browse the rest. Nothing is locked in; the journey bends to you.
        </p>
      </div>

      <motion.div
        className="flex flex-col gap-4"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {ranked.map(({ key }, index) => {
          const template = templates.find((t) => t.key === key)
          const palette = TEMPLATE_PALETTE[key]
          if (!template) return null
          return (
            <motion.button
              key={key}
              type="button"
              variants={listItemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => dispatch({ type: 'choose-template', template: key })}
              className={cn('flex flex-col gap-2 rounded-3xl p-6 text-left', palette.soft)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  {template.emoji}
                </span>
                <span className={cn('font-display text-2xl font-semibold', palette.softText)}>
                  {template.name}
                </span>
                {index === 0 ? (
                  <motion.span
                    variants={badgeVariants}
                    className={cn(
                      'ml-auto rounded-full px-3 py-1 text-xs font-bold',
                      palette.solid,
                    )}
                  >
                    Best match
                  </motion.span>
                ) : null}
              </div>
              <p className={cn('font-semibold', palette.softText)}>{template.tagline}</p>
              <p className={cn('text-sm opacity-90', palette.softText)}>{template.description}</p>
              <p className={cn('text-sm font-bold underline-offset-4', palette.softText)}>
                Choose this path
              </p>
            </motion.button>
          )
        })}
      </motion.div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Or browse the other three</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {rest.map((template) => (
            <motion.button
              key={template.key}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'choose-template', template: template.key })}
              className="flex flex-col gap-2 rounded-2xl border-2 border-input p-4 text-left hover:border-primary/50"
            >
              <span className="text-2xl" aria-hidden>
                {template.emoji}
              </span>
              <span className="font-bold">{template.name}</span>
              <span className="text-sm text-muted-foreground">{template.tagline}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function NameStep({ state, dispatch, direction }: StepProps<'name'>) {
  const router = useRouter()
  const { user } = Route.useRouteContext()
  const { quiz } = Route.useLoaderData()
  const template = useTemplate(state.template)
  const palette = TEMPLATE_PALETTE[state.template]
  const firstName = user.displayName.split(' ')[0] ?? user.displayName
  const suggestions = suggestJourneyNames({
    template: state.template,
    childName: firstName,
    words: pickedWords(quiz.questions, state.answers),
  })
  const [name, setName] = useState('')
  const mutation = useMutation({
    mutationFn: () =>
      createJourneyFn({
        data: {
          template: state.template,
          name: name.trim(),
          answers: state.answers as Record<string, string[]>,
        },
      }),
    onSuccess: async (result) => {
      // On success, stay in-page and move to the guides step. No
      // router.invalidate() yet: this route's loader redirects away the moment
      // a journey exists, and the kid still has one choice to make here.
      if (result.ok) {
        dispatch({ type: 'journey-created' })
        return
      }
      // A journey already existing means another tab beat us to it; the right
      // place to be is the dashboard.
      if (result.error === 'already-has-journey') {
        await router.invalidate()
        await router.navigate({ to: '/kid' })
      }
    },
  })
  const failed = mutation.data && !mutation.data.ok && mutation.data.error !== 'already-has-journey'
  if (!template) return null

  return (
    <motion.section
      className="flex flex-col gap-8 py-8"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={STEP_TRANSITION}
    >
      <Button variant="ghost" className="self-start" onClick={() => dispatch({ type: 'back' })}>
        <ArrowLeft aria-hidden />
        Back to matches
      </Button>
      <div className={cn('flex flex-col gap-3 rounded-3xl p-6', palette.soft)}>
        <TemplateChip template={state.template} variant="solid" className="self-start" />
        <p className={cn('text-sm', palette.softText)}>{template.description}</p>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl font-semibold">Name your journey</h1>
        <p className="text-muted-foreground">
          This is the name you'll see every day, so make it feel like yours. Steal one of these or
          write your own.
        </p>
      </div>
      <motion.div
        className="flex flex-wrap gap-2.5"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion}
            type="button"
            variants={listItemVariants}
            whileTap={{ scale: 0.97 }}
            onClick={() => setName(suggestion)}
            aria-pressed={name === suggestion}
            className={cn(
              'rounded-full border-2 px-4 py-2 text-sm font-bold',
              name === suggestion
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input hover:border-primary/50',
            )}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="journey-name">Journey name</Label>
        <Input
          id="journey-name"
          value={name}
          maxLength={80}
          placeholder="Write your own"
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      {failed ? (
        <p className="text-sm font-bold text-destructive" role="alert">
          We couldn't save your journey. Try again in a second.
        </p>
      ) : null}
      <Button
        size="lg"
        disabled={name.trim().length === 0 || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Building your journey...' : 'Start this journey'}
      </Button>
    </motion.section>
  )
}

// The journey exists by now; this is the last call before the dashboard.
// Going it alone is a first-class choice, not a failure state — hearts here
// are the kid's "I'm interested" signal that the parent later acts on.
function GuidesStep({ state, direction }: StepProps<'guides'>) {
  const router = useRouter()
  const { providers, favorites } = Route.useLoaderData()
  const palette = TEMPLATE_PALETTE[state.template]
  const { recommended, rest } = splitByRecommendation(providers, [state.template])
  const picks = [...recommended, ...rest].slice(0, 3)
  const [hearted, setHearted] = useState<readonly string[]>(favorites.map((f) => f.providerKey))
  const [leaving, setLeaving] = useState(false)

  const favoriteMutation = useMutation({
    mutationFn: (input: { providerKey: string; favorited: boolean }) =>
      setFavoriteFn({ data: input }),
    onSuccess: (result, input) => {
      if (result.ok) {
        setHearted((current) =>
          input.favorited
            ? [...current, input.providerKey]
            : current.filter((key) => key !== input.providerKey),
        )
      }
    },
  })

  // The quiz loader redirects once a journey exists, so invalidating here (and
  // only here, on the way out) lands the kid on the fresh dashboard.
  const leave = async (to: '/kid' | '/kid/guides') => {
    setLeaving(true)
    await router.invalidate()
    await router.navigate({ to })
  }

  return (
    <motion.section
      className="flex flex-col gap-8 py-8"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={STEP_TRANSITION}
    >
      <div className="flex flex-col gap-3">
        <p className="inline-flex items-center gap-1.5 font-bold text-primary">
          <Sparkles className="size-4" aria-hidden />
          Journey saved
        </p>
        <h1 className="font-display text-4xl font-semibold">Go it alone, or bring someone in?</h1>
        <p className="text-muted-foreground">
          These guides know journeys like yours. They help you stay on track, make the big idea
          real, and find the meaning in it — a rabbi, a mentor, or the person who helps you build
          the wild part. Tap the heart on anyone interesting and your parent can reach out. Or skip
          it: doing this your own way is a great plan too.
        </p>
      </div>

      <motion.div
        className="flex flex-col gap-3"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {picks.map((provider) => {
          const favorited = hearted.includes(provider.key)
          return (
            <motion.div
              key={provider.key}
              variants={listItemVariants}
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5',
                palette.soft,
              )}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className={cn('font-display text-lg font-semibold', palette.softText)}>
                  {provider.name}
                </p>
                <p className={cn('text-sm opacity-90', palette.softText)}>{provider.tagline}</p>
              </div>
              <Button
                variant={favorited ? 'default' : 'outline'}
                size="sm"
                aria-pressed={favorited}
                disabled={favoriteMutation.isPending}
                onClick={() =>
                  favoriteMutation.mutate({ providerKey: provider.key, favorited: !favorited })
                }
              >
                <Heart className={cn('size-4', favorited && 'fill-current')} aria-hidden />
                {favorited ? 'Interested' : "I'm interested"}
              </Button>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="flex flex-col gap-3">
        <Button size="lg" disabled={leaving} onClick={() => leave('/kid')}>
          {hearted.length > 0 ? 'Start my journey' : "I've got this — go it alone"}
          <ArrowRight aria-hidden />
        </Button>
        <button
          type="button"
          disabled={leaving}
          className="self-center text-sm font-bold text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => leave('/kid/guides')}
        >
          See all the guides first
        </button>
      </div>
    </motion.section>
  )
}
