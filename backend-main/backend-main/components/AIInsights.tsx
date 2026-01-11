'use client';

import { useState, useEffect } from 'react';

interface AIInsight {
  id: string;
  name: string;
  result?: any;
  voiceLine?: string;
  error?: string;
  timestamp: string;
}

interface AIInsightsProps {
  trigger: string;
  data: Record<string, any>;
  autoLoad?: boolean;
}

export default function AIInsights({ trigger, data, autoLoad = true }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger, data })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const result = await response.json();
      setInsights(result.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('AI Insights Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadInsights();
    }
  }, [trigger, JSON.stringify(data), autoLoad]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">AI analyzing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <p className="text-red-700">⚠️ {error}</p>
        <button 
          onClick={loadInsights}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <p className="text-yellow-700">No AI insights available for this event</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        🔥 AI Insights
        <span className="text-sm font-normal text-gray-500">
          ({insights.length} {insights.length === 1 ? 'model' : 'models'})
        </span>
      </h3>

      {insights.map((insight) => (
        <div 
          key={insight.id} 
          className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{insight.name}</h4>
              <p className="text-xs text-gray-500 mt-1">ID: {insight.id}</p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(insight.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Voice Line */}
          {insight.voiceLine && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mb-3">
              <p className="text-sm text-gray-800">{insight.voiceLine}</p>
            </div>
          )}

          {/* Error */}
          {insight.error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
              <p className="text-sm text-red-700">Error: {insight.error}</p>
            </div>
          )}

          {/* Result Data */}
          {insight.result && !insight.error && (
            <div className="mt-3">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  View detailed results
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(insight.result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
