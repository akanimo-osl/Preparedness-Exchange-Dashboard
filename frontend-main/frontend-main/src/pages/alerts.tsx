import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Search,
  MapPin,
  CalendarDays,
  Loader2,
  PlusCircle,
  Activity,
  Radio,
  FileWarning,
  Shield,
  Globe,
  RefreshCw
} from "lucide-react";
import Dropdown from "@/components/usables/Dropdown";
import NewsTicker from "@/components/usables/NewsTicker";
import { useToast } from "@/contexts/ToastProvider";
import { service } from "@/services";
import { Loading } from "@/components/Loading";
import SmartPagination from "@/components/usables/SmartPagination";
import type { AlertType, WHOSignalEvent, WHODataMetadata } from "@/types";
import { formatDateTimeLocal, toSnakeCase, useDebounce } from "@/utils";
import { Updating } from "@/components/Updating";
import { AlertCreateModal } from "@/components/alert/AlertCreateModal";
import WHOEventsMap from "@/components/alert/WHOEventsMap";
import WHOEventsFeed from "@/components/alert/WHOEventsFeed";


const severityStyles = {
  CRITICAL: "bg-red-500 text-white",
  HIGH: "bg-orange-400 text-white",
  MEDIUM: "bg-yellow-300 text-black",
  LOW: "bg-blue-400 text-white",
};

export default function AlertsManagement() {
  const { showToast } = useToast();

  // Existing alert state
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
  const [reloadCounter, setReloadCounter] = useState(0)
  const [isModalOpen, setModalOpen] = useState(false)

  // WHO Signal Intelligence state
  const [whoEvents, setWhoEvents] = useState<WHOSignalEvent[]>([]);
  const [whoMetadata, setWhoMetadata] = useState<WHODataMetadata | null>(null);
  const [whoLoading, setWhoLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WHOSignalEvent | null>(null);
  
  // WHO Filters
  const [whoDataType, setWhoDataType] = useState<string>('all');
  const [whoCountryFilter, setWhoCountryFilter] = useState('');
  const [whoDiseaseFilter, setWhoDiseaseFilter] = useState('');

  // Consolidated metrics
  const [consolidatedMetrics, setConsolidatedMetrics] = useState({
    phe: 0,
    signal: 0,
    rra: 0,
    eis: 0,
    readiness: 0,
    totalCountries: 0,
    totalDiseases: 0,
  });

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

  // Load existing alerts
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
        console.log("Alerts load:", error?.message);
      } finally {
        setLoading(false)
      }
    }
    loadAlerts()
  }, [page, debouncedSearch, severityFilter, statusFilter, categoryFilter, reloadCounter])

  // Load WHO Signal Intelligence data
  useEffect(() => {
    const loadWHOData = async () => {
      try {
        setWhoLoading(true);
        const response = await service.who.getData({
          dataType: whoDataType as any,
          country: whoCountryFilter || undefined,
          disease: whoDiseaseFilter || undefined,
        });
        
        if (response.status === 'OK' && response.data) {
          setWhoEvents(response.data.events || []);
          setWhoMetadata(response.data.metadata || null);
          
          // Update consolidated metrics
          if (response.data.metadata) {
            const meta = response.data.metadata;
            setConsolidatedMetrics({
              phe: meta.event_types?.phe || 0,
              signal: meta.event_types?.signal || 0,
              rra: meta.event_types?.rra || 0,
              eis: meta.event_types?.eis || 0,
              readiness: meta.event_types?.readiness || 0,
              totalCountries: meta.filters?.countries?.length || 0,
              totalDiseases: meta.filters?.diseases?.length || 0,
            });
          }
        }
      } catch (error: any) {
        console.error("WHO data load error:", error);
      } finally {
        setWhoLoading(false);
      }
    };
    loadWHOData();
  }, [whoDataType, whoCountryFilter, whoDiseaseFilter, reloadCounter]);

  const handleEventClick = (event: WHOSignalEvent) => {
    setSelectedEvent(event);
  };

  const refreshData = () => {
    setReloadCounter(prev => prev + 1);
    setAlertData(undefined);
  };

  if (loading && !alertData && whoLoading && whoEvents.length === 0) return <Loading />

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
                        <h1 className="text-2xl font-semibold">Alerts & Signal Intelligence</h1>
                        {(loading || whoLoading) && <Updating />}
                      </div>
                      <p className="text-gray-400 mt-1">
                          Monitor WHO events, signals, and manage system alerts across {consolidatedMetrics.totalCountries} countries
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshData}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title="Refresh data"
                      >
                        <RefreshCw size={20} className={`text-gray-400 ${(loading || whoLoading) ? 'animate-spin' : ''}`} />
                      </button>
                      <button onClick={()=>setModalOpen(true)} title="Create new alert">
                        <PlusCircle size={40} className="text-white hover:text-gray-400"/>
                      </button>
                    </div>
                  </div>

                    {/* === Consolidated Stats Row === */}
                    <div className="grid grid-cols-6 gap-3 mt-6">
                      {[
                        { label: "PHE Events", count: consolidatedMetrics.phe, icon: <AlertTriangle className="text-red-500" />, color: "border-red-500/30" },
                        { label: "Signals", count: consolidatedMetrics.signal, icon: <Radio className="text-orange-400" />, color: "border-orange-500/30" },
                        { label: "RRA", count: consolidatedMetrics.rra, icon: <FileWarning className="text-yellow-400" />, color: "border-yellow-500/30" },
                        { label: "EIS", count: consolidatedMetrics.eis, icon: <Shield className="text-blue-400" />, color: "border-blue-500/30" },
                        { label: "Readiness", count: consolidatedMetrics.readiness, icon: <Activity className="text-green-400" />, color: "border-green-500/30" },
                        { label: "Countries", count: consolidatedMetrics.totalCountries, icon: <Globe className="text-purple-400" />, color: "border-purple-500/30" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`bg-[#202328] px-4 py-3 rounded-xl border border-white/5 ${item.color} flex items-center justify-between`}
                        >
                          <div>
                            <p className="text-xs text-gray-400">{item.label}</p>
                            <p className="text-xl font-semibold">{item.count}</p>
                          </div>
                          {item.icon}
                        </div>
                      ))}
                    </div>

                    {/* === System Alerts Stats (if any) === */}
                    {(summary.critical > 0 || summary.high > 0 || summary.medium > 0 || summary.low > 0) && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        {[
                          { label: "Critical Alerts", count: summary.critical, icon: <AlertTriangle className="text-red-500" /> },
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
                    )}

                    {/* === Filters === */}
                    <div className="flex items-center gap-4 mt-6 bg-[#202328] py-4 px-3 rounded-lg flex-wrap">
                        {/* Search */}
                        <div className="flex items-center px-4 py-2 bg-[#33363C] rounded-sm grow min-w-[200px]">
                            <Search className="text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search alerts & events..."
                                className="bg-transparent outline-none ml-2 w-full text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* WHO Data Type */}
                        <Dropdown
                          label="Data Type"
                          showLabel={false}
                          value={whoDataType}
                          onChange={setWhoDataType}
                          items={["all", "signal", "readiness_summary", "readiness_category"]}
                          bgColor="#33363C"
                        />

                        {/* Country Filter */}
                        {whoMetadata?.filters?.countries && (
                          <Dropdown
                            label="Country"
                            showLabel={false}
                            value={whoCountryFilter}
                            onChange={setWhoCountryFilter}
                            items={whoMetadata.filters.countries}
                            bgColor="#33363C"
                          />
                        )}

                        {/* Disease Filter */}
                        {whoMetadata?.filters?.diseases && (
                          <Dropdown
                            label="Disease"
                            showLabel={false}
                            value={whoDiseaseFilter}
                            onChange={setWhoDiseaseFilter}
                            items={whoMetadata.filters.diseases}
                            bgColor="#33363C"
                          />
                        )}

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

                    {/* === WHO Events Map === */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          WHO Signal Intelligence Map
                        </h2>
                        <span className="text-sm text-gray-400">
                          {whoEvents.filter(e => e.lat && e.lon).length} events with coordinates
                        </span>
                      </div>
                      <WHOEventsMap
                        events={whoEvents}
                        onEventClick={handleEventClick}
                        selectedEvent={selectedEvent}
                      />
                    </div>

                    {/* === Selected Event Details === */}
                    {selectedEvent && (
                      <div className="mt-4 bg-[#202328] p-4 rounded-xl border border-blue-500/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{selectedEvent.disease}</h3>
                            <p className="text-gray-400 text-sm">
                              {selectedEvent.country}{selectedEvent.district ? ` - ${selectedEvent.district}` : ''}
                            </p>
                          </div>
                          <button 
                            onClick={() => setSelectedEvent(null)}
                            className="text-gray-500 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-400">Event Type</p>
                            <p className="font-medium">{selectedEvent.eventType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Grade</p>
                            <p className="font-medium">{selectedEvent.grade}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className="font-medium">{selectedEvent.status}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Source</p>
                            <p className="font-medium">{selectedEvent.source}</p>
                          </div>
                          {selectedEvent.cases !== undefined && selectedEvent.cases > 0 && (
                            <div>
                              <p className="text-xs text-gray-400">Cases</p>
                              <p className="font-medium text-orange-400">{selectedEvent.cases.toLocaleString()}</p>
                            </div>
                          )}
                          {selectedEvent.deaths !== undefined && selectedEvent.deaths > 0 && (
                            <div>
                              <p className="text-xs text-gray-400">Deaths</p>
                              <p className="font-medium text-red-400">{selectedEvent.deaths.toLocaleString()}</p>
                            </div>
                          )}
                          {selectedEvent.avgCategoryScore !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Readiness Score</p>
                              <p className="font-medium text-green-400">{selectedEvent.avgCategoryScore.toFixed(2)}</p>
                            </div>
                          )}
                          {selectedEvent.responseRate !== undefined && (
                            <div>
                              <p className="text-xs text-gray-400">Response Rate</p>
                              <p className="font-medium text-blue-400">{selectedEvent.responseRate}%</p>
                            </div>
                          )}
                        </div>
                        {selectedEvent.description && (
                          <p className="mt-3 text-sm text-gray-300">{selectedEvent.description}</p>
                        )}
                      </div>
                    )}
                    
                    {/* === Alerts List === */}
                    {alertData && alertData.length > 0 && (
                      <>
                        <h2 className="text-lg font-semibold mt-8 mb-4 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-yellow-400" />
                          System Alerts
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                          {alertData.map((alert) => (
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
                      </>
                    )}

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
                <WHOEventsFeed
                  events={whoEvents}
                  metadata={whoMetadata || undefined}
                  loading={whoLoading}
                  onEventClick={handleEventClick}
                  selectedEvent={selectedEvent}
                />
            </section>
        </section>
    </div>
  );
}
