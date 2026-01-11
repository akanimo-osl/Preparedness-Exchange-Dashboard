import { useEffect, useRef, useState } from "react";
import Dropdown from "@/components/usables/Dropdown";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import NewsTicker from "@/components/usables/NewsTicker";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import AnalyticsDashboard from "@/components/stardata/AnalyticsDashboard";
import IncidentTimeline from "@/components/stardata/IncidentTimeline";
import type { StardataSummaryResponse } from "@/types/stardata_type";
import { useToast } from "@/contexts/ToastProvider";
import { stardata } from "@/services/stardata";
import { Loading } from "@/components/Loading";
import { Updating } from "@/components/Updating";

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

// Example incident data (replace with API later)
const incidents = [
  {
    id: 1,
    severity: "Critical",
    position: [11.0039, 49.5897], // Near Erlangen
  },
  {
    id: 2,
    severity: "High",
    position: [11.0301, 49.6205],
  },
  {
    id: 3,
    severity: "High",
    position: [11.05, 49.625],
  },
  {
    id: 4,
    severity: "Medium",
    position: [11.09, 49.61],
  },
];

const criticalIcon = "https://cdn-icons-png.flaticon.com/512/565/565547.png";
const highIcon = "https://cdn-icons-png.flaticon.com/512/168/168732.png";
const mediumIcon = "https://cdn-icons-png.flaticon.com/512/190/190411.png";

export default function StarData() {
  const [search, setSearch] = useState("");

  const getIcon = (severity: string) => {
    if (severity === "Critical") return criticalIcon;
    if (severity === "High") return highIcon;
    return mediumIcon;
  };

    const { showToast } = useToast();
    const [hazard, setHazard] = useState("");
    const [hazardType, setHazardType] = useState("");
    const [severity, setSeverity] = useState("")
    const [status, setStatus] = useState("")
  
    const [loading, setLoading] = useState(false)
    const [summaryData, setSummaryData] = useState<StardataSummaryResponse['data']>()
    useEffect(()=>{
      const loadEsparSummary = async()=>{
        try {
          setLoading(true)
          const response = await stardata.summary(hazard, hazardType, severity, status)
          setSummaryData(response.data)
          // showToast(response.message, "success", 5000);  
        } catch (error: any) {
          showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
        } finally {
          setLoading(false)
        }
      }
      loadEsparSummary()
    }, [hazard, hazardType, severity, status])

    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
      if (map.current) return; // initialize map only once
      if (!mapboxToken) return;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [11.0039, 49.5897],
        zoom: 5,
      });

      incidents.forEach(incident => {
        new mapboxgl.Marker({ 
            color: incident.severity === "Critical" ? "#EF4343" : incident.severity === "High" ? "#E6B91E" : "#3BB143",
            // icon: getIcon(incident.severity)
          })
          .setLngLat(incident.position)
          .addTo(map.current);
      });
    }, []);

    if (loading && !summaryData) return <Loading />

  return (
    <div className="w-full text-white">
        <section className="flex flex-row gap-3 justify-stretch mt-4">
            <section className="grow space-y-6">
                <NewsTicker />
                <div>
                    <div className="flex gap-1 items-center">
                        <h1 className="text-2xl font-semibold">STAR Activity Tracker</h1>
                        {loading && <Updating /> }
                    </div>
                    <p className="text-sm text-gray-400">
                    Situation, Task, Action, Result – Incident Management
                    </p>
                </div>

                {/* FILTER BAR */}
                <div className="bg-[#1B0835] p-4 rounded-md grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* <div>
                    <p className="text-gray-400 text-sm mb-1">Search incidents</p>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search incidents..."
                        className="w-full bg-[#0c7be910] px-4 py-2 rounded-lg text-sm outline-none"
                    />
                    </div> */}

                    <Dropdown
                    label="Hazards"
                    showLabel={false}
                    value={hazard}
                    onChange={setHazard}
                    items={summaryData?.filters.hazards?? []}
                    bgColor="#130722"
                    />
                    <Dropdown
                    label="Hazard Type"
                    showLabel={false}
                    value={hazardType}
                    onChange={setHazardType}
                    items={summaryData?.filters.hazard_types?? []}
                    bgColor="#130722"
                    />
                    <Dropdown
                    label="Severity"
                    showLabel={false}
                    value={severity}
                    onChange={setSeverity}
                    items={summaryData?.filters.severities??[]}
                    bgColor="#130722"
                    />
                    <Dropdown
                    label="Status"
                    showLabel={false}
                    value={status}
                    onChange={setStatus}
                    items={summaryData?.filters.statuses??[]}
                    bgColor="#130722"
                    />
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Incidents" value={summaryData?.incident.total??0} />
                    <StatCard label="Active" value={summaryData?.incident.active??0} highlight />
                    <StatCard label="Affected Country" value={summaryData?.incident.affected_country??0} />
                    {/* <StatCard label="Avg Response Time" value={stats.responseTime} /> */}
                </div>

                {/* MAP SECTION */}
                <div>
                    <h2 className="text-lg font-semibold mb-1">Incident Map</h2>
                    <p className="text-sm text-gray-400 mb-3">
                    Geographic distribution of all incidents
                    </p>

                    <div className="relative h-[500px] rounded-xl overflow-hidden border border-gray-800">
                    <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />

                    {/* Severity Legend */}
                    <div className="absolute bottom-4 left-4 bg-[#0d1b2adc] p-4 rounded-lg text-sm backdrop-blur-sm">
                        <p className="font-semibold mb-2">Severity</p>
                        <LegendItem color="bg-red-500" label="Critical" />
                        <LegendItem color="bg-yellow-500" label="High" />
                        <LegendItem color="bg-green-500" label="Medium" />
                    </div>
                    </div>
                </div>
            </section>

            <section className="">
                <LiveFeedWatchlist />
            </section>
        </section>

        <div className="mt-8">
            <AnalyticsDashboard />
        </div>

        <div className="mt-8">
            <IncidentTimeline />
        </div>
    </div>
  );
}

/* ---------------------------- COMPONENTS ---------------------------- */

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl bg-[#1B0835]`}
    >
      <p className="text-gray-400 text-xs">{label}</p>
      <h3 className={`text-2xl font-semibold mt-1 ${highlight && 'text-[#EF4343]'}`}>{value}</h3>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
