import Header from '@/components/Header';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Simple Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 border border-gray-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Starter
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $29<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Up to 5 users</li>
              <li>✓ Basic features</li>
              <li>✓ Email support</li>
            </ul>
          </div>

          <div className="p-8 border-2 border-blue-500 rounded-lg relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Professional
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $99<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Up to 25 users</li>
              <li>✓ Advanced features</li>
              <li>✓ Priority support</li>
              <li>✓ Real-time analytics</li>
            </ul>
          </div>

          <div className="p-8 border border-gray-200 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Enterprise
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $299<span className="text-lg text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Unlimited users</li>
              <li>✓ All features</li>
              <li>✓ 24/7 support</li>
              <li>✓ Custom integrations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}