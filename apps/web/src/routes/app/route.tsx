import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">VECTR0 App</h1>
            <aside className="flex space-x-4">
              <Link
                to="/app"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:bg-blue-50"
              >
                Dashboard
              </Link>
              <Link
                to="/app/schedules"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:bg-blue-50"
              >
                Schedules
              </Link>
              <Link
                to="/app/users"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:bg-blue-50"
              >
                Users
              </Link>
            </aside>
          </div>
        </div>
      </header>

      {/* App Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}