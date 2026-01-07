
// AnalyticsDashboard.tsx — Drilldown dashboard for STAR/ESPAR data
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSyncData } from '../camino_frontend_sync_context';

export default function AnalyticsDashboard() {
  const liveData = useSyncData();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (liveData) {
      const chartData = liveData.map(d => ({
        hazard: d.hazard,
        count: d.count,
      }));
      setData(chartData);
    }
  }, [liveData]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <h2>Hazard Frequency (Live)</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="hazard" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
