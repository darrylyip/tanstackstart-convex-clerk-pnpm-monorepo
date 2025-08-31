import { createFileRoute } from "@tanstack/react-router";
import { SignInButton, useUser } from "@clerk/clerk-react";
import Header from "@/components/Header";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to VECTR0
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A unified web and mobile application platform built with TanStack
            Start and Convex backend.
          </p>
          <div className="space-x-4">
            <a
              href="/features"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Learn More
            </a>
            {/* {!isLoaded ? (
              <div className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg">
                Loading...
              </div>
            ) : isSignedIn ? (
              <a
                href="/app"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to App
              </a>
            ) : (
              <div className="space-x-4">
                <SignInButton mode="modal">
                  <button className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
