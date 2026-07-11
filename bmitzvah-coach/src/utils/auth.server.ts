import type { SupabaseClient } from '@supabase/supabase-js'
import { kidEmailFor } from '@/lib/auth/kid-credentials'
import type { AppRole, AuthUser } from '@/lib/auth/types'
import { asUserId } from '@/lib/ids'
import { err, ok, type Result } from '@/lib/result'
import type { Database } from '@/types/database'
import { getSupabaseAdminClient } from '@/utils/supabase-admin.server'

type Supabase = SupabaseClient<Database>

const PG_UNIQUE_VIOLATION = '23505'

export async function getCurrentUser(supabase: Supabase): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, display_name, username')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) return null

  return {
    id: asUserId(profile.id),
    role: profile.role as AppRole,
    displayName: profile.display_name,
    username: profile.username,
  }
}

export type SignupParentInput = {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export type SignupParentError = 'email-taken' | 'signup-failed'

export async function signupParent(
  supabase: Supabase,
  input: SignupParentInput,
): Promise<Result<AuthUser, SignupParentError>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })
  if (error) {
    return err(error.code === 'user_already_exists' ? 'email-taken' : 'signup-failed')
  }
  if (!data.user) return err('signup-failed')

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    role: 'parent',
    display_name: input.displayName,
  })
  // A unique violation means the profile already exists from an earlier
  // attempt with this account, which is fine.
  if (profileError && profileError.code !== PG_UNIQUE_VIOLATION) {
    console.error('signupParent: profile insert failed', profileError)
    return err('signup-failed')
  }

  return ok({
    id: asUserId(data.user.id),
    role: 'parent',
    displayName: input.displayName,
    username: null,
  })
}

export type LoginError = 'invalid-credentials'

export async function loginWithPassword(
  supabase: Supabase,
  email: string,
  password: string,
): Promise<Result<AuthUser, LoginError>> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return err('invalid-credentials')
  const user = await getCurrentUser(supabase)
  if (!user) return err('invalid-credentials')
  return ok(user)
}

export type RegisterKidInput = {
  readonly username: string
  readonly displayName: string
  readonly password: string
}

export type RegisterKidError = 'not-a-parent' | 'username-taken' | 'registration-failed'

export type RegisteredKid = {
  readonly id: string
  readonly username: string
  readonly displayName: string
}

// The one deliberate service-role path in the app: a parent creating their
// kid's login. The caller is verified as a parent before the admin client is
// touched, and the admin client never leaves this module's callees.
export async function registerKid(
  supabase: Supabase,
  input: RegisterKidInput,
): Promise<Result<RegisteredKid, RegisterKidError>> {
  const parent = await getCurrentUser(supabase)
  if (parent?.role !== 'parent') return err('not-a-parent')

  const admin = getSupabaseAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: kidEmailFor(input.username),
    password: input.password,
    email_confirm: true,
  })
  if (createError) {
    return err(createError.code === 'email_exists' ? 'username-taken' : 'registration-failed')
  }
  if (!created.user) return err('registration-failed')

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    role: 'child',
    display_name: input.displayName,
    username: input.username,
    parent_id: parent.id,
  })
  if (profileError) {
    // Roll the auth user back so the username is not stranded half-created.
    await admin.auth.admin.deleteUser(created.user.id)
    if (profileError.code === PG_UNIQUE_VIOLATION) return err('username-taken')
    console.error('registerKid: profile insert failed', profileError)
    return err('registration-failed')
  }

  return ok({ id: created.user.id, username: input.username, displayName: input.displayName })
}

export async function logout(supabase: Supabase): Promise<void> {
  await supabase.auth.signOut()
}
