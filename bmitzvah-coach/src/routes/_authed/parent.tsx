import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ParentShell } from '@/components/shell/parent-shell'
import { fetchDirectoryAccessFn } from '@/utils/journeys.functions'

export const Route = createFileRoute('/_authed/parent')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'parent') throw redirect({ to: '/kid' })
  },
  loader: () => fetchDirectoryAccessFn(),
  component: ParentLayout,
})

function ParentLayout() {
  const { user } = Route.useRouteContext()
  const access = Route.useLoaderData()
  return (
    <ParentShell user={user} access={access}>
      <Outlet />
    </ParentShell>
  )
}
