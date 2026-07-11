import { createServerFn } from '@tanstack/react-start'
import {
  getActivityPrompts,
  getComfortOptions,
  getProviders,
  getQuizQuestions,
  getStories,
  getTemplates,
  getTimelineOptions,
} from '@/utils/content.server'
import { getSupabaseServerClient } from '@/utils/supabase'

// The RPC surface for the reference catalog. Each wrapper is a thin GET that
// delegates to content.server. Called from route loaders; the catalog is
// public, so these work for anon and authenticated visitors alike.

export const fetchTemplatesFn = createServerFn({ method: 'GET' }).handler(async () =>
  getTemplates(getSupabaseServerClient()),
)

export const fetchActivityPromptsFn = createServerFn({ method: 'GET' }).handler(async () =>
  getActivityPrompts(getSupabaseServerClient()),
)

export const fetchProvidersFn = createServerFn({ method: 'GET' }).handler(async () =>
  getProviders(getSupabaseServerClient()),
)

export const fetchStoriesFn = createServerFn({ method: 'GET' }).handler(async () =>
  getStories(getSupabaseServerClient()),
)

export const fetchQuizContentFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const [questions, timeline, comfort] = await Promise.all([
    getQuizQuestions(supabase),
    getTimelineOptions(supabase),
    getComfortOptions(supabase),
  ])
  return { questions, timeline, comfort }
})

export const fetchTimelineOptionsFn = createServerFn({ method: 'GET' }).handler(async () =>
  getTimelineOptions(getSupabaseServerClient()),
)
