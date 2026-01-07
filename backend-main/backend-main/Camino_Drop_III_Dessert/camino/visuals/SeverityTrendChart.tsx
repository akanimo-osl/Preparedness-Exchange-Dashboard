
// Line chart for severity trends using Recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SeverityTrendChart({ data }) {
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <h3>Severity Over Time</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="severity" stroke="#d62728" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
