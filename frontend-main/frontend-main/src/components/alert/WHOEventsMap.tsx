import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { WHOSignalEvent } from '@/types';

interface WHOEventsMapProps {
  events: WHOSignalEvent[];
  onEventClick?: (event: WHOSignalEvent) => void;
  selectedEvent?: WHOSignalEvent | null;
}

// Event type colors
const eventTypeColors: Record<string, string> = {
  'PHE': '#ef4444',       // red
  'SIGNAL': '#f97316',    // orange
  'RRA': '#eab308',       // yellow
  'EIS': '#3b82f6',       // blue
  'Readiness': '#22c55e', // green
  'phe': '#ef4444',
  'signal': '#f97316',
  'rra': '#eab308',
  'eis': '#3b82f6',
  'readiness': '#22c55e',
};

const gradeColors: Record<string, string> = {
  'Grade 1': '#22c55e',
  'Grade 2': '#eab308',
  'Grade 3': '#ef4444',
  'Ungraded': '#6b7280',
};

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

// Map Controller for programmatic navigation
function MapController({ selectedEvent }: { selectedEvent?: WHOSignalEvent | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent?.lat && selectedEvent?.lon) {
      map.flyTo([selectedEvent.lon, selectedEvent.lat], 5, {
        duration: 1.5
      });
    }
  }, [selectedEvent, map]);

  return null;
}

export default function WHOEventsMap({ events, onEventClick, selectedEvent }: WHOEventsMapProps) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Filter events with valid coordinates
  const eventsWithCoords = useMemo(() => 
    events.filter(e => Number.isFinite(e.lat) && Number.isFinite(e.lon) && e.lat !== 0 && e.lon !== 0),
    [events]
  );

  // Calculate center based on events or default to Africa
  const center = useMemo(() => {
    if (eventsWithCoords.length === 0) return [0, 20] as [number, number];
    const avgLat = eventsWithCoords.reduce((sum, e) => sum + (e.lat || 0), 0) / eventsWithCoords.length;
    const avgLon = eventsWithCoords.reduce((sum, e) => sum + (e.lon || 0), 0) / eventsWithCoords.length;
    return [avgLon, avgLat] as [number, number];
  }, [eventsWithCoords]);

  const getColor = (event: WHOSignalEvent) => {
    if (event.dataType === 'signal') {
      return eventTypeColors[event.eventType] || eventTypeColors[event.eventType?.toLowerCase()] || '#6b7280';
    }
    return gradeColors[event.grade] || '#22c55e';
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapboxToken) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: (selectedEvent?.lon && selectedEvent?.lat) ? [selectedEvent.lon, selectedEvent.lat] : center,
      zoom: 5,
    });

    eventsWithCoords.forEach(event => {
      new mapboxgl.Marker()
        .setLngLat([event.lon, event.lat])
        .addTo(map.current);
    });
  }, [eventsWithCoords, selectedEvent, center]);

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
        <div className="text-sm text-gray-300">
          Map disabled: missing `VITE_MAPBOX_ACCESS_TOKEN`.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-white/10">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-[#202328]/90 backdrop-blur-sm rounded-lg p-3 text-xs z-[1000]">
        <div className="font-semibold mb-2 text-white">Event Types</div>
        <div className="space-y-1">
          {[
            { type: 'PHE', color: eventTypeColors['PHE'] },
            { type: 'SIGNAL', color: eventTypeColors['SIGNAL'] },
            { type: 'RRA', color: eventTypeColors['RRA'] },
            { type: 'EIS', color: eventTypeColors['EIS'] },
            { type: 'Readiness', color: eventTypeColors['Readiness'] },
          ].map(({ type, color }) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-300">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-3 right-3 bg-[#202328]/90 backdrop-blur-sm rounded-lg p-3 z-[1000]">
        <p className="text-xs text-gray-400">Events on map</p>
        <p className="text-xl font-semibold text-white">{eventsWithCoords.length}</p>
      </div>
    </div>
  );
}
