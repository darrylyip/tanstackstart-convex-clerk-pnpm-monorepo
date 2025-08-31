import Header from '@/components/Header';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Platform Features
          </h1>
          <p className="text-xl text-gray-600">
            Discover what makes VECTR0 the perfect choice for your business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Multi-tenant Architecture
            </h3>
            <p className="text-gray-600">
              Built-in multi-tenancy support with Convex backend for scalable
              enterprise applications.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Real-time Updates
            </h3>
            <p className="text-gray-600">
              Live data synchronization across all devices using Convex
              subscriptions.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Unified Codebase
            </h3>
            <p className="text-gray-600">
              Share types, utilities, and backend logic between web and mobile
              applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}