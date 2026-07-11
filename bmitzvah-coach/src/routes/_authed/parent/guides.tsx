import { createFileRoute } from '@tanstack/react-router'
import { LockedDirectory } from '@/components/locked-directory'
import { ProviderDirectory } from '@/components/provider-directory'
import { fetchProvidersFn } from '@/utils/content.functions'
import { fetchDirectoryAccessFn } from '@/utils/journeys.functions'

export const Route = createFileRoute('/_authed/parent/guides')({
  loader: async () => {
    const [access, providers] = await Promise.all([fetchDirectoryAccessFn(), fetchProvidersFn()])
    return { access, providers }
  },
  component: ParentGuidesPage,
})

function ParentGuidesPage() {
  const { access, providers } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  if (!access.unlocked) return <LockedDirectory access={access} viewer="parent" />
  return <ProviderDirectory user={user} providers={providers} />
}
