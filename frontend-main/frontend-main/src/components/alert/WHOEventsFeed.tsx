import { useState } from 'react';
import { Globe, Building2, MapPin, Activity, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import type { WHOSignalEvent, WHODataMetadata } from '@/types';

interface WHOEventsFeedProps {
  events: WHOSignalEvent[];
  metadata?: WHODataMetadata;
  loading?: boolean;
  onEventClick?: (event: WHOSignalEvent) => void;
  selectedEvent?: WHOSignalEvent | null;
}

type TabType = 'all' | 'national' | 'subnational' | 'signals';

const gradeStyles: Record<string, string> = {
  'Grade 1': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Grade 2': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Grade 3': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Ungraded': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const eventTypeStyles: Record<string, string> = {
  'PHE': 'bg-red-500/20 text-red-400',
  'SIGNAL': 'bg-orange-500/20 text-orange-400',
  'RRA': 'bg-yellow-500/20 text-yellow-400',
  'EIS': 'bg-blue-500/20 text-blue-400',
  'Readiness': 'bg-green-500/20 text-green-400',
  'ReadinessCategory': 'bg-purple-500/20 text-purple-400',
};

export default function WHOEventsFeed({ 
  events, 
  metadata, 
  loading, 
  onEventClick,
  selectedEvent 
}: WHOEventsFeedProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Filter events based on active tab
  const filteredEvents = events.filter(event => {
    switch (activeTab) {
      case 'national':
        return !event.isSubnational && event.dataType !== 'signal';
      case 'subnational':
        return event.isSubnational;
      case 'signals':
        return event.dataType === 'signal';
      default:
        return true;
    }
  });

  // Group events by disease for summary
  const diseaseGroups = filteredEvents.reduce((acc, event) => {
    const disease = event.disease || 'Unknown';
    if (!acc[disease]) {
      acc[disease] = { count: 0, countries: new Set<string>() };
    }
    acc[disease].count++;
    acc[disease].countries.add(event.country);
    return acc;
  }, {} as Record<string, { count: number; countries: Set<string> }>);

  const tabs = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'signals', label: 'Signals', icon: AlertTriangle },
    { id: 'national', label: 'National', icon: Building2 },
    { id: 'subnational', label: 'Regional', icon: MapPin },
  ];

  return (
    <div className="bg-[#202328] text-white w-[320px] flex-shrink-0 sticky top-0 rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold">WHO Events Feed</h2>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
        </div>
        <p className="text-xs text-gray-400">
          {metadata?.total_events || events.length} events from {metadata?.files_summary?.total_csv_files || 0} sources
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-2 px-2 text-xs font-medium transition-colors flex items-center justify-center gap-1
              ${activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Disease Summary */}
      <div className="p-3 border-b border-white/10 bg-[#1a1d21]">
        <div className="text-xs font-medium text-gray-400 mb-2">By Disease/Hazard</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(diseaseGroups).slice(0, 6).map(([disease, data]) => (
            <span 
              key={disease}
              className="px-2 py-1 bg-[#33363C] rounded text-xs text-gray-300"
              title={`${data.count} events in ${data.countries.size} countries`}
            >
              {disease.split('/')[0].split('(')[0].trim()}: {data.count}
            </span>
          ))}
          {Object.keys(diseaseGroups).length > 6 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{Object.keys(diseaseGroups).length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto max-h-[500px] divide-y divide-white/5">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No events found for this filter
          </div>
        ) : (
          filteredEvents.slice(0, 50).map((event, index) => (
            <div
              key={event.id || index}
              onClick={() => onEventClick?.(event)}
              className={`p-3 hover:bg-white/5 cursor-pointer transition-colors
                ${selectedEvent?.id === event.id ? 'bg-blue-500/10 border-l-2 border-blue-400' : ''}`}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{event.disease}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {event.country}
                    {event.district && <span className="text-gray-500">• {event.district}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${eventTypeStyles[event.eventType] || 'bg-gray-500/20 text-gray-400'}`}>
                  {event.eventType}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${gradeStyles[event.grade] || gradeStyles['Ungraded']}`}>
                  {event.grade}
                </span>
                {event.status && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#33363C] text-gray-300">
                    {event.status}
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                {event.cases !== undefined && event.cases > 0 && (
                  <span>Cases: <span className="text-white">{event.cases.toLocaleString()}</span></span>
                )}
                {event.deaths !== undefined && event.deaths > 0 && (
                  <span>Deaths: <span className="text-red-400">{event.deaths.toLocaleString()}</span></span>
                )}
                {event.avgCategoryScore !== undefined && (
                  <span>Score: <span className="text-blue-400">{event.avgCategoryScore.toFixed(1)}</span></span>
                )}
                {event.responseRate !== undefined && (
                  <span>Response: <span className="text-green-400">{event.responseRate}%</span></span>
                )}
              </div>
            </div>
          ))
        )}
        
        {filteredEvents.length > 50 && (
          <div className="p-3 text-center text-xs text-gray-500">
            Showing 50 of {filteredEvents.length} events
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {metadata && (
        <div className="p-3 border-t border-white/10 bg-[#1a1d21]">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-400">
              Signals: <span className="text-white">{metadata.by_data_type?.signal_events || 0}</span>
            </div>
            <div className="text-gray-400">
              Readiness: <span className="text-white">{metadata.by_data_type?.readiness_summaries || 0}</span>
            </div>
            <div className="text-gray-400">
              Countries: <span className="text-white">{metadata.filters?.countries?.length || 0}</span>
            </div>
            <div className="text-gray-400">
              Diseases: <span className="text-white">{metadata.filters?.diseases?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
