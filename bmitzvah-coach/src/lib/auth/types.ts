import type { UserId } from '@/lib/ids'

export type AppRole = 'parent' | 'child'

export type AuthUser = {
  readonly id: UserId
  readonly role: AppRole
  readonly displayName: string
  readonly username: string | null
}
