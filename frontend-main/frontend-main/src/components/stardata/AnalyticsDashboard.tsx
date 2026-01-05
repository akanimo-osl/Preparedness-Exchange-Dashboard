import { useToast } from "@/contexts/ToastProvider";
import { stardata } from "@/services/stardata";
import type { StardataChartResponse } from "@/types/stardata_type";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Dropdown from "../usables/Dropdown";
import { Updating } from "../Updating";

export default function AnalyticsDashboard() {
  const resourceData = [
    { resource: "Diagnostic Kits", deployed: 0.3, available: 1 },
    { resource: "Treatment Centers", deployed: 0.4, available: 1 },
    { resource: "Emergency Supplies", deployed: 0.5, available: 1 },
    { resource: "Medical Personnel", deployed: 0.6, available: 1 },
  ];

    const { showToast } = useToast();
    const [loading, setLoading] = useState(false)
    const [starChart, setStarChart] = useState<StardataChartResponse['data']>()
    const [country, setCountry] = useState("Zambia");
    useEffect(()=>{
        const loadStarDataChart = async()=>{
          try {
            setLoading(true)
            const response = await stardata.charts(country)
            setStarChart(response.data)
            // console.log(response)
            // showToast(response.message, "success", 5000);  
          } catch (error: any) {
            showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
          } finally {
            setLoading(false)
          }
        }
        loadStarDataChart()
    }, [country])
    
    const frequencyCount = starChart?.hazard_frequency.reduce((acc, item) => {
        acc[item.value] = (acc[item.value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const frequencychartData = Object.entries(frequencyCount || {}).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // Pastel color generator
    function randomPastel() {
      const r = Math.floor(Math.random() * 127 + 127);
      const g = Math.floor(Math.random() * 127 + 127);
      const b = Math.floor(Math.random() * 127 + 127);
      return `rgb(${r}, ${g}, ${b})`;
    }

    function buildSeverityChartData(starChart?: StardataChartResponse["data"]) {
      if (!starChart) return [];

      const severity_distribution = starChart.severity_distribution ?? [];
      const severityCount: Record<string, number> = {};

      // Count severity frequency
      severity_distribution.forEach(item => {
        const key = item.value.toString().trim();
        severityCount[key] = (severityCount[key] || 0) + 1;
      });

      // Assign pastel colors
      const severityColors: Record<string, string> = {};
      Object.keys(severityCount).forEach(severity => {
        severityColors[severity] = randomPastel();
      });

      // Build final recharts format
      return Object.entries(severityCount).map(([severity, count]) => ({
        name: severity,
        value: count,
        color: severityColors[severity],
      }));
    }
    const severityData = buildSeverityChartData(starChart);

    function buildStatusChartPercentage(statusArray: { name: string; value: string | number }[]) {
      const total = statusArray.length;
      const activeCount = statusArray.filter(item => item.value === "1").length;
      const monitoringCount = total - activeCount;

      return [
        { name: "active", value: (activeCount / total) * 100, color: "#ef4444" },
        { name: "monitoring", value: (monitoringCount / total) * 100, color: "#facc15" },
      ];
    }
    const statusOverview = buildStatusChartPercentage(starChart?.status??[])
    
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Dropdown
        label="Country"
        value={country}
        onChange={setCountry}
        items={starChart?.filters.countries?? []}
        />
        {loading && <Updating /> }
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
        {/* ----------------- HAZARD FREQUENCY ----------------- */}
        <Card title="Hazard Frequency" subtitle="Distribution of incidents by hazard type">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={frequencychartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ----------------- SEVERITY DISTRIBUTION ----------------- */}
        <Card title="Severity Distribution" subtitle="Incidents by severity level">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {severityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* ----------------- RESOURCE UTILIZATION ----------------- */}
        {/* <Card title="Resource Utilization" subtitle="Impact vs available resources">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resourceData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#94a3b8" }} />
              <YAxis dataKey="resource" type="category" tick={{ fill: "#94a3b8" }} width={130} />
              <Tooltip />
              <Legend />
              <Bar dataKey="deployed" fill="#3b82f6" name="deployed" />
              <Bar dataKey="available" fill="#60a5fa" name="available" />
            </BarChart>
          </ResponsiveContainer>
        </Card> */}

        {/* ----------------- STATUS OVERVIEW ----------------- */}
        <Card title="Status Overview" subtitle="Current incident status distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusOverview}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {statusOverview.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ----------------- SHARED CARD COMPONENT ----------------- */
interface Prop {
    title: string;
    subtitle: string;
    children: any;
}
function Card({ title, subtitle, children }: Prop) {
  return (
    <div className="bg-[#1B0835] p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{subtitle}</p>
      {children}
    </div>
  );
}
