import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/schedules')({
  component: SchedulesPage,
})

function SchedulesPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
        <p className="text-gray-600">Manage your schedules with real-time updates</p>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule List</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add Schedule
            </button>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500">No schedules found. Create your first schedule to get started.</p>
          </div>
        </div>
      </div>
    </div>
  )
}