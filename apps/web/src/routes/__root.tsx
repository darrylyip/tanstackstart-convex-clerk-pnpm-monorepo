/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

import Header from "@/components/Header";

import appCss from "@/styles/app.css?url";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

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
    links: [{ rel: "stylesheet", href: appCss }],
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
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <html>
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
            <Scripts />
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
