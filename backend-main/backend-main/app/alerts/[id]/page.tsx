'use client';

import { useState } from 'react';
import AIInsights from '@/components/AIInsights';

/**
 * Example: WHO Alert Page with AI Integration
 * 
 * Demonstrates how to trigger MoScripts when alert data arrives
 */
export default function AlertPage() {
  const [alertData, setAlertData] = useState({
    disease: 'Mpox',
    location: 'Kinshasa, DRC',
    cases: 142,
    population: 15000000
  });

  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">WHO Disease Alert</h1>

      {/* Alert Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Alert Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Disease</label>
            <p className="font-medium">{alertData.disease}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <p className="font-medium">{alertData.location}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirmed Cases</label>
            <p className="font-medium">{alertData.cases.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Population</label>
            <p className="font-medium">{alertData.population.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => setShowInsights(!showInsights)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          {showInsights ? 'Hide' : 'Get'} AI Analysis
        </button>
      </div>

      {/* AI Insights Section */}
      {showInsights && (
        <AIInsights 
          trigger="onAlertReceived"
          data={alertData}
          autoLoad={true}
        />
      )}
    </div>
  );
}
