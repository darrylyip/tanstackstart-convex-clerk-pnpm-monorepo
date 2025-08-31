import { createFileRoute } from "@tanstack/react-router";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Redirect to app if already signed in
      window.location.href = '/app';
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Redirecting to app...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to VECTR0
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your dashboard and manage your account
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            redirectUrl="/app"
            signUpUrl="/signup"
          />
        </div>
      </div>
    </div>
  );
}