/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/Header";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "VECTR0",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="text-blue-600 hover:text-blue-800 underline">
        Return home
      </a>
    </div>
  ),
});

function RootComponent() {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
