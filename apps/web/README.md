Welcome to your new TanStack app! 

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.




## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

### Layout Organization Pattern

For better organization of nested layouts, use the `route.tsx` pattern:

- `routes/app.tsx` → `routes/app/route.tsx` (layout for `/app`)
- Keep child routes in the same directory: `routes/app/index.tsx`, `routes/app/users.tsx`, etc.

This pattern keeps all related routes organized under their parent layout directory.

## Import Alias Rules

Always use aliased imports when not importing from the local directory:

- **Local directory imports**: Use relative paths (e.g., `./Header`, `../utils`)
- **App-level imports**: Use `@/` alias (e.g., `@/components/Header`, `@/lib/utils`)
- **Package imports**: Use workspace aliases (e.g., `@vectr0/ui`, `@vectr0/utils`)

```tsx
// ✅ Good - using aliases for non-local imports
import Header from "@/components/Header"
import { Button } from "@vectr0/ui"
import { cn } from "@/lib/utils"

// ✅ Good - using relative for local directory
import { validateForm } from "./utils"
import UserCard from "./UserCard"

// ❌ Bad - using relative paths for distant directories
import Header from "../../../components/Header"
```

The `@` alias is configured in `tsconfig.json` to point to the `src/` directory.

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

For state management, this project uses [nanostores](https://github.com/nanostores/nanostores) - an extremely lightweight (286 bytes) state management library that's perfect for React applications.

First you need to add nanostores and its React integration as dependencies:

```bash
pnpm add nanostores @nanostores/react
```

### Basic Atom Store

Let's create a simple counter store. Create a new file `src/stores/counter.ts`:

```tsx
import { atom } from 'nanostores'

export const $counter = atom(0)

// Helper functions
export const increment = () => $counter.set($counter.get() + 1)
export const decrement = () => $counter.set($counter.get() - 1)
export const reset = () => $counter.set(0)
```

Now use it in a React component:

```tsx
import { useStore } from '@nanostores/react'
import { $counter, increment, decrement, reset } from '../stores/counter'

function Counter() {
  const count = useStore($counter)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

### Map Stores for Objects

For more complex state like user data, use map stores. Create `src/stores/user.ts`:

```tsx
import { map } from 'nanostores'

export const $user = map({
  name: '',
  email: '',
  isAuthenticated: false
})

export const setUser = (userData: { name: string; email: string }) => {
  $user.setKey('name', userData.name)
  $user.setKey('email', userData.email)
  $user.setKey('isAuthenticated', true)
}

export const logout = () => {
  $user.set({ name: '', email: '', isAuthenticated: false })
}
```

### Computed Stores

Create derived state that automatically updates when dependencies change:

```tsx
import { computed } from 'nanostores'
import { $counter } from './counter'

export const $doubledCounter = computed($counter, count => count * 2)
export const $isEven = computed($counter, count => count % 2 === 0)
```

Use in React:

```tsx
import { useStore } from '@nanostores/react'
import { $counter, $doubledCounter, $isEven } from '../stores/counter'

function EnhancedCounter() {
  const count = useStore($counter)
  const doubled = useStore($doubledCounter)
  const isEven = useStore($isEven)
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### Benefits of Nanostores

- **Tiny Bundle Size**: Only 286 bytes
- **Tree Shakable**: Only include stores you use
- **Framework Agnostic**: Works with React, Vue, Svelte, and vanilla JS
- **TypeScript Support**: Full type safety
- **Fine-Grained Reactivity**: Components only re-render when their specific stores change
- **Lazy Initialization**: Stores are only created when needed

Learn more about nanostores in the [official documentation](https://github.com/nanostores/nanostores).

## Backend Integration with Convex

This app uses [Convex](https://convex.dev) as the backend, providing real-time data synchronization and serverless functions.

### Using Convex in Components

First, install the Convex React client:

```bash
pnpm add convex
```

#### Querying Data

Use the `useQuery` hook to fetch data that updates in real-time:

```tsx
import { useQuery } from "convex/react";
import { api } from "@vectr0/convex";

function UserList() {
  const users = useQuery(api.queries.users.listByOrganization, {
    organizationId: "org_123"
  });

  if (users === undefined) return <div>Loading...</div>;
  if (users === null) return <div>No users found</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user._id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

#### Mutations

Use the `useMutation` hook to modify data:

```tsx
import { useMutation } from "convex/react";
import { api } from "@vectr0/convex";

function CreateSchedule() {
  const createSchedule = useMutation(api.mutations.schedules.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchedule({
      title: "New Schedule",
      organizationId: "org_123",
      startDate: Date.now(),
      endDate: Date.now() + 86400000
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Create Schedule</button>
    </form>
  );
}
```

#### Optimistic Updates

Combine mutations with local state for instant UI feedback:

```tsx
import { useMutation } from "convex/react";
import { api } from "@vectr0/convex";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

const $isCreating = atom(false);

function OptimisticCreate() {
  const createItem = useMutation(api.mutations.items.create);
  const isCreating = useStore($isCreating);

  const handleCreate = async () => {
    $isCreating.set(true);
    try {
      await createItem({ name: "New Item" });
    } finally {
      $isCreating.set(false);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isCreating}>
      {isCreating ? "Creating..." : "Create Item"}
    </button>
  );
}
```

#### Real-time Subscriptions

Data fetched with `useQuery` automatically subscribes to changes:

```tsx
function LiveDashboard() {
  // This will automatically update when schedules change
  const schedules = useQuery(api.queries.schedules.listByOrganization, {
    organizationId: "org_123"
  });

  const activeCount = schedules?.filter(s => s.status === "active").length ?? 0;

  return <div>Active Schedules: {activeCount}</div>;
}
```

### Multi-tenancy

All queries and mutations are designed with multi-tenancy in mind. Always pass the `organizationId`:

```tsx
// ✅ Good - includes organizationId
const users = useQuery(api.queries.users.listByOrganization, {
  organizationId: currentOrg.id
});

// ❌ Bad - missing organizationId
const users = useQuery(api.queries.users.list);
```

### Error Handling

Wrap mutations in try-catch blocks for proper error handling:

```tsx
const handleAction = async () => {
  try {
    await myMutation({ data });
    toast.success("Success!");
  } catch (error) {
    console.error("Mutation failed:", error);
    toast.error("Something went wrong");
  }
};
```

For more detailed Convex backend documentation, see [packages/convex/README.md](../../packages/convex/README.md).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
