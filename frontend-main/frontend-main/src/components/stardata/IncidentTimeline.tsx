import { useEffect, useState } from "react";
import { Clock, ArrowRight, Users } from "lucide-react";
import { useToast } from "@/contexts/ToastProvider";
import { stardata } from "@/services/stardata";
import type { StarDataType } from "@/types/stardata_type";
import { Updating } from "../Updating";
import SmartPagination from "../usables/SmartPagination";


interface Incident {
  id: number;
  title: string;
  location: string;
  severity: "high" | "medium" | "critical";
  status: "active" | "monitoring";
  description: string;
  daysAgo: number;
  affected: number;
  responseTime: string;
  actionsTaken: number;
  resourcesDeployed: number;
}

export default function IncidentTimeline() {
  // const [incidents] = useState<Incident[]>([
  //   {
  //     id: 1,
  //     title: "Cyclone Warning – Madagascar East Coast",
  //     location: "Tamatave, Madagascar",
  //     severity: "high",
  //     status: "active",
  //     description:
  //       "Category 3 cyclone approaching eastern coast. Evacuation procedures initiated.",
  //     daysAgo: 36,
  //     affected: 8000,
  //     responseTime: "1 hour",
  //     actionsTaken: 2,
  //     resourcesDeployed: 2,
  //   },
  //   {
  //     id: 2,
  //     title: "Cholera Outbreak – Freetown",
  //     location: "Freetown, Sierra Leone",
  //     severity: "critical",
  //     status: "active",
  //     description:
  //       "Rapid increase in cholera cases in urban areas following contaminated water supply.",
  //     daysAgo: 16,
  //     affected: 1200,
  //     responseTime: "2 hours",
  //     actionsTaken: 3,
  //     resourcesDeployed: 3,
  //   },
  //   {
  //     id: 3,
  //     title: "Dengue Cases – Dar es Salaam",
  //     location: "Dar es Salaam, Tanzania",
  //     severity: "high",
  //     status: "monitoring",
  //     description:
  //       "Seasonal spike in dengue cases in coastal regions.",
  //     daysAgo: 27,
  //     affected: 450,
  //     responseTime: "4 hours",
  //     actionsTaken: 2,
  //     resourcesDeployed: 2,
  //   },
  // ]);

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false)
  const [incidents, setIncidents] = useState<StarDataType[]>()
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const PAGE_SIZE = 10
  useEffect(()=>{
  const loadStarDataChart = async()=>{
    try {
      setLoading(true)
      const response = await stardata.list(page, PAGE_SIZE)
      setCount(response.count)
      setIncidents(response.results)
      // showToast(response.message, "success", 5000);  
    } catch (error: any) {
      showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
    } finally {
      setLoading(false)
    }
  }
    loadStarDataChart()
  }, [page])

  return (
    <div className="p-6 bg-[#1B0835] rounded-xl text-white min-h-screen">
      <div className="flex flex-row items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">Incident Timeline</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Chronological list of all incidents and activities
          </p>
        </div>
        {loading && <Updating /> }
      </div>

      <div className="relative border-l border-gray-700 pl-6 space-y-8">
        {incidents?.map((item) => (
          <TimelineCard key={item.id} incident={item} />
        ))}
      </div>

      <SmartPagination
        count={count}
        pageSize={PAGE_SIZE}
        currentPage={page}
        onPageChange={(page) => setPage(page)}
        darkMode={true}
      />
    </div>
  );
}

interface CardProps {
  incident: StarDataType;
}

function TimelineCard({ incident }: CardProps) {
  const severityColors = {
    high: "bg-yellow-500",
    medium: "bg-blue-500",
    critical: "bg-red-500",
  };

  const statusColors = {
    active: "bg-red-500",
    monitoring: "bg-yellow-500",
  };

  return (
    <div className="relative bg-[#130722] p-5 rounded-xl shadow-md">
      {/* Timeline Dot */}
      <div className="absolute -left-[37px] top-8 w-4 h-4 rounded-full bg-yellow-400 border border-gray-700"></div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{incident.hazard}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full text-white font-medium capitalize `}
            >
              {incident.severity}
            </span>
          </div>

          <p className="text-gray-400 text-sm mt-1">{incident.country}</p>

          <p className="text-gray-300 text-sm mt-3 max-w-2xl">
            {incident.subgroup_of_hazards}, {incident.main_type_of_hazard}, {incident.country}
          </p>

          <div className="flex flex-wrap gap-6 mt-4 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" />
              Year {incident.year}
            </div>

            <div className="flex items-center gap-2">
              <Users className="text-gray-400" />
              Status - {incident.status}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Severity:</span>
              {incident.severity}
            </div>

            <div className="flex items-center gap-2">
              Resources
              <span className="text-gray-400">{incident.resources}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="text-gray-400" />
              Impact
              <p className="text-gray-400">{incident.impact}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs text-black capitalize `}
        >
          {incident.status}
        </span>
      </div>

      {/* View Details Button */}
      <div className="flex justify-end mt-4">
        <button className="flex items-center gap-2 text-sm text-gray-200 hover:text-blue-400 transition">
          View Details <ArrowRight />
        </button>
      </div>
    </div>
  );
}
