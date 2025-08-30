import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-4 bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold text-gray-900">
          <Link to="/" className="hover:text-blue-600">
            VECTR0
          </Link>
        </div>
        
        <nav className="flex gap-6">
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
          <Link 
            to="/app" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to App
          </Link>
        </nav>
      </div>
    </header>
  )
}
