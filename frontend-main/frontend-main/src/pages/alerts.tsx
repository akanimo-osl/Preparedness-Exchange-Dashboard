import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Search,
  MapPin,
  CalendarDays,
  Loader2,
  PlusCircle
} from "lucide-react";
import Dropdown from "@/components/usables/Dropdown";
import NewsTicker from "@/components/usables/NewsTicker";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import { useToast } from "@/contexts/ToastProvider";
import { service } from "@/services";
import { Loading } from "@/components/Loading";
import SmartPagination from "@/components/usables/SmartPagination";
import type { AlertType } from "@/types";
import { formatDateTimeLocal, toSnakeCase, useDebounce } from "@/utils";
import { Updating } from "@/components/Updating";
import { AlertCreateModal } from "@/components/alert/AlertCreateModal";


const severityStyles = {
  CRITICAL: "bg-red-500 text-white",
  HIGH: "bg-orange-400 text-white",
  MEDIUM: "bg-yellow-300 text-black",
  LOW: "bg-blue-400 text-white",
};

export default function AlertsManagement() {
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(false)
  const [alertData, setAlertData] = useState<AlertType[]>()
  const [summary, setSummary] = useState({
    critical: 0, high: 0, medium: 0, low: 0
  })
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const PAGE_SIZE = 10

  const [lockedID, setLockedId] = useState<any[]>([])
  const acknowledge = async (id: number) => {
    try {
      setLockedId(prev => (prev.includes(id) ? prev : [...prev, id]));
      await service.alert.acknowledge(id)
      showToast("Alert acknolwedge", "success", 5000);
      const found = alertData?.find((a) => a.id === id);
      if (found && found.status !== "acknowledged") {
        found.status = "acknowledged";
        found.acknowledged_by = "You just now";
      }
    } catch (error: any) {
      showToast(error?.message || "Failed to acknowlegde", "error", 5000);
    } finally {
      setLockedId(prev => prev.filter(x => x !== id));
    }
  };

  const resolve = async(id: number) => {
    try {
      setLockedId(prev => (prev.includes(id) ? prev : [...prev, id]));
      await service.alert.resolve(id)
      showToast("Alert resolved", "success", 5000);
      const found = alertData?.find((a) => a.id === id);
      if (found) found.status = "resolved";
    } catch (error: any) {
      showToast(error?.message || "Failed to resolve", "error", 5000);
    } finally {
      setLockedId(prev => prev.filter(x => x !== id));
    }
  };

  const debouncedSearch = useDebounce(search, 1000);
  const [reloadCounter, setReloadCounter] = useState(0)
  useEffect(()=>{
    const loadAlerts = async()=>{
      try {
        setLoading(true)
        const response = await service.alert.list(
          page, PAGE_SIZE, severityFilter.toLowerCase(), 
          statusFilter, toSnakeCase(categoryFilter), search
        )
        setSummary({ critical: response.critical, high: response.high, medium: response.medium, low: response.low })
        setCount(response.count)
        setAlertData(response.results)
      } catch (error: any) {
        showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
      } finally {
        setLoading(false)
      }
    }
    loadAlerts()
  }, [page, debouncedSearch, severityFilter, statusFilter, categoryFilter, reloadCounter])

  const [isModalOpen, setModalOpen] = useState(false)

  if (loading && !alertData) return <Loading />

  return (
    <div className="w-full text-white">
      <AlertCreateModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() =>{setReloadCounter(reloadCounter+1); setAlertData(undefined)}}
      />
        <section className="flex flex-row gap-3 justify-stretch mt-4">
            <section className="grow space-y-6">
                <NewsTicker />
                <div className="text-white pb-20">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">Alerts Management</h1>
                        {loading && <Updating />}
                      </div>
                      <p className="text-gray-400 mt-1">
                          Monitor, acknowledge, and manage system alerts
                      </p>
                    </div>
                    <button
                    onClick={()=>setModalOpen(true)}
                    >
                      <PlusCircle size={40} className="text-white hover:text-gray-400"/>
                    </button>
                  </div>

                    {/* === Stats Row === */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        {[
                        { label: "Critical", count: summary.critical, icon: <AlertTriangle className="text-red-500" /> },
                        { label: "High", count: summary.high, icon: <AlertTriangle className="text-orange-400" /> },
                        { label: "Medium", count: summary.medium, icon: <AlertTriangle className="text-yellow-300" /> },
                        { label: "Low", count: summary.low, icon: <Bell className="text-blue-500" /> },
                        ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-[#202328] px-4 py-3 rounded-xl border border-white/5 flex items-center justify-between"
                        >
                            <div>
                            <p className="text-sm text-gray-400">{item.label}</p>
                            <p className="text-xl font-semibold">{item.count}</p>
                            </div>
                            {item.icon}
                        </div>
                        ))}
                    </div>

                    {/* === Filters === */}
                    <div className="flex items-center gap-4 mt-6 bg-[#202328] py-4 px-3 rounded-lg">
                        {/* Search */}
                        <div className="flex items-center px-4 py-2  bg-[#33363C] rounded-sm grow">
                            <Search className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                className="bg-transparent outline-none ml-2 w-full text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Severity */}
                        <Dropdown
                        label="Severities"
                        showLabel={false}
                        value={severityFilter}
                        onChange={setSeverityFilter}
                        items={["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
                        bgColor="#33363C"
                        />

                        {/* Status */}
                        <Dropdown
                        label="Statuses"
                        showLabel={false}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        items={["active", "acknowledged", "resolved"]}
                        bgColor="#33363C"
                        />

                        {/* Category */}
                        <Dropdown
                        label="Categories"
                        showLabel={false}
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        items={[
                            "Disease Outbreak",
                            "Resource Shortage",
                            "Natural Disaster",
                            "Administrative",
                            "Capacity Alert",
                        ]}
                        bgColor="#33363C"
                        />
                    </div>
                    
                      {(alertData?.length == 0) && (
                        <p className="italic text-center mt-6">No alerts found</p>
                      )}
                    
                    {/* === Alerts List === */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {alertData?.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-[#202328] p-4 rounded-xl border border-white/5 shadow-sm"
                        >
                            {/* Tags */}
                            <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-1 text-xs rounded-full font-semibold ${severityStyles[alert.severity]}`}
                            >
                                {alert.severity}
                            </span>

                            <span className="px-2 py-1 bg-gray-600/20 rounded-full text-xs border border-white">
                                {alert.category}
                            </span>

                            <span
                                className={`text-xs flex items-center gap-1 ${
                                alert.status === "active" ? "text-red-400" :
                                alert.status === "acknowledged" ? "text-yellow-300" :
                                "text-green-400"
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {alert.status}
                            </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-semibold mt-3">{alert.title}</h2>
                            <p className="text-gray-400 text-sm">{alert.description}</p>

                            {/* Location & Date */}
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-3">
                            <div className="flex items-center gap-1">
                                <MapPin size={15} />
                                {alert.country}
                                {alert.region ? ` - ${alert.region}` : ""}
                            </div>

                            <div className="flex items-center gap-1">
                                <CalendarDays size={15} />
                                {formatDateTimeLocal(alert.date)}
                            </div>
                            </div>

                            {/* Acknowledged By */}
                            {alert.acknowledged_by && (
                            <p className="text-xs mt-2 text-gray-500">
                                Acknowledged by {alert.acknowledged_by}
                            </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                            {alert.status !== "acknowledged" && alert.status !== "resolved" && (
                                <button
                                disabled={lockedID.includes(alert.id)}
                                onClick={() => acknowledge(alert.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-[#33363C] text-white rounded-md transition text-sm"
                                >
                                  {lockedID.includes(alert.id) && <Loader2 className="animate-spin w-4 h-4" />}
                                  Acknowledge
                                </button>
                            )}

                            {alert.status !== "resolved" && (
                                <button
                                disabled={lockedID.includes(alert.id)}
                                onClick={() => resolve(alert.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-[#33363C] text-white rounded-md transition text-sm"
                                >
                                  {lockedID.includes(alert.id) && <Loader2 className="animate-spin w-4 h-4" />}
                                  Resolve
                                </button>
                            )}
                            </div>
                        </div>
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
            </section>

            <section className="">
                <LiveFeedWatchlist />
            </section>
        </section>
    </div>
  );
}
