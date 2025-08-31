import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useUser, UserButton, useOrganization, OrganizationSwitcher } from "@clerk/clerk-react";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ location }) => {
    // Note: We can't check Clerk auth here since it's not available in beforeLoad
    // So we'll handle the redirect in the component
  },
  component: AppLayout,
});

function AppLayout() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { organization } = useOrganization();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect to login route
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {organization?.name}
            </h1>
            <OrganizationSwitcher hideSlug hidePersonal />
            <div className="flex items-center space-x-4">
              <aside className="flex gap-4">
                <Link
                  to="/app"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:bg-blue-50"
                  activeOptions={{ exact: true }}
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
              <div className="flex flex-row items-center space-x-3">
                <UserButton showName />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* App Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
