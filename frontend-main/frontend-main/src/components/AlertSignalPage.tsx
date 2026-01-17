import { useState, useEffect } from 'react';
import WHOEventsMap from '@/components/alert/WHOEventsMap';
import { service } from '@/services';
import type { WHOSignalEvent } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AlertSignalPage() {
  const [events, setEvents] = useState<WHOSignalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<WHOSignalEvent | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        // Fetching both Signals and PHEs for this consolidated view
        const response = await service.who.getData({
          dataType: 'all'
        });

        if (response && response.data && response.data.events) {
          setEvents(response.data.events);
        }
      } catch (err) {
        console.error('Failed to fetch WHO events:', err);
        setError('Unable to load event data. Please ensure the backend is running and reachable.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Alerts & Signals</h1>
        <p className="text-gray-400">
          Real-time WHO Signal Intelligence and Public Health Events tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="xl:col-span-2 bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden shadow-xl min-h-[500px]">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Initializing Mapbox Intelligent Layer...</p>
            </div>
          ) : error ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-red-400 p-8 text-center">
              <AlertCircle className="w-12 h-12 opacity-50" />
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <WHOEventsMap
              events={events}
              onEventClick={setSelectedEvent}
              selectedEvent={selectedEvent}
            />
          )}
        </div>

        {/* Sidebar / List View */}
        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
          <div className="bg-[#1A1D21] rounded-xl border border-white/5 p-4 sticky top-0 bg-opacity-95 backdrop-blur-md z-10 font-semibold text-sm text-gray-300 flex justify-between items-center">
            <span>Recent Events ({events.length})</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Signal</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> PHE</span>
            </div>
          </div>

          {events.length === 0 && !loading && !error && (
            <div className="text-center py-12 text-gray-500 italic">
              No active signals or events detected in this region.
            </div>
          )}

          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`
                group p-4 rounded-xl border transition-all cursor-pointer
                ${selectedEvent?.id === event.id
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/5'
                  : 'bg-[#1A1D21] border-white/5 hover:border-white/20'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                  ${event.eventType?.toLowerCase() === 'phe' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}
                `}>
                  {event.eventType}
                </span>
                <span className="text-[10px] text-gray-500">{event.reportDate}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {event.disease} in {event.country}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Grade: <span className="text-gray-300">{event.grade}</span></span>
                <span className="text-blue-400 font-medium">View Correlation →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}