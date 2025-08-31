import { createFileRoute } from "@tanstack/react-router";
import { SignUp, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
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
            Sign up for VECTR0
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account and get started
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            redirectUrl="/app"
            signInUrl="/login"
          />
        </div>
      </div>
    </div>
  );
}