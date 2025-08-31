import { Link } from '@tanstack/react-router'
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";

export default function Header() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="p-4 bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold text-gray-900">
          <Link to="/" className="hover:text-blue-600">
            VECTR0
          </Link>
        </div>
        
        <nav className="flex gap-6 items-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-semibold"
          >
            Home
          </Link>
          <Link 
            to="/features" 
            className="text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-semibold"
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className="text-gray-600 hover:text-gray-900 [&.active]:text-blue-600 [&.active]:font-semibold"
          >
            Pricing
          </Link>
          
          {!isLoaded ? (
            <div className="text-gray-500">Loading...</div>
          ) : isSignedIn ? (
            <div className="flex gap-4 items-center">
              <Link 
                to="/app" 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Go to App
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex gap-2">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100">
                  Sign In
                </button>
              </SignInButton>
              {/* <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              </SignUpButton> */}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
