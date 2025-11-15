import { Calendar } from 'lucide-react';

interface EventsEmptyStateProps {
  onCreateEvent: () => void;
}

export default function EventsEmptyState({ onCreateEvent }: EventsEmptyStateProps) {
  return (
    <div className="flex mb-10 items-center justify-center min-h-[600px] px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6 mt-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Welcome to Voxxy!
        </h1>
        <p className="text-white/70 text-base lg:text-lg mb-8">
          You're all set! Let's create your first event and start connecting with amazing vendors.
        </p>

        {/* CTA Button */}
        <button
          onClick={onCreateEvent}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium text-base hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Calendar className="w-5 h-5" />
          Create Your First Event
        </button>

        {/* How to Get Started Section */}
        <div className="mt-16 bg-white/5 rounded-2xl p-8 text-left">
          <h2 className="text-xl font-semibold text-white mb-6">
            How to Get Started
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Create an Event</h3>
                <p className="text-white/60 text-sm">
                  Add details about your event, like event including date, location, and vendor categories needed
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Review Applications</h3>
                <p className="text-white/60 text-sm">
                  As vendors apply for your event, review their profiles, portfolios, and decide who to work with
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Use Command Center</h3>
                <p className="text-white/60 text-sm">
                  Manage event applications, chat with vendors from a central hub - track applications, coordinate with your team, and organize logistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
