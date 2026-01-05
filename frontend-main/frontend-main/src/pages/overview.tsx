import { Loading } from "@/components/Loading";
import DashboardMap from "@/components/usables/DashboardMap";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import NewsTicker from "@/components/usables/NewsTicker";
import { useToast } from "@/contexts/ToastProvider";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { service } from "@/services";
import type { OverviewResponse } from "@/types";
import { Users, Shield, AlertTriangle, Activity, Globe, RefreshCcw, Loader2, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Overview() {
    const { showToast } = useToast();
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const { getTimeAgo, refresh } = useTimeAgo(lastRefresh, { interval: 10000 });

    const chwPer10k = [
    { year: "2023", country: "Ghana", rate: 6.4 },
    { year: "2023", country: "Kenya", rate: 8.3 },
    { year: "2024", country: "Madagascar", rate: 14.2 },
    { year: "2023", country: "Senegal", rate: 27.7 },
    { year: "2025", country: "Tanzania", rate: 8.5 },
    ];

    const ChartLabel = ({ x, y, value }: any) => {
    const xPos = typeof x === "number" ? x : 0;
    const yPos = typeof y === "number" ? y : 0;

    return (
        <text
        x={xPos}
        y={yPos - 10}
        fill="#ffffff"
        fontSize={12}
        fontWeight="600"
        textAnchor="middle"
        >
        {typeof value === "number" ? value.toLocaleString() : value}
        </text>
    );
    };

    const [loading, setLoading] = useState(false)
    const [reloadCounter, setReloadCounter] = useState(0)
    const [overviewData, setOverviewData] = useState<OverviewResponse['data']>()
    useEffect(()=>{
        const loadOverview = async()=>{
            try {
                setLoading(true)
                const response = await service.overview()
                setOverviewData(response.data)
                setLastRefresh(new Date());
                // if(reloadCounter==0) showToast(response.message, "success", 5000);
            } catch (error: any) {
                showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
            } finally {
                setLoading(false)
            }
        }
        loadOverview()
    }, [reloadCounter])

    if (!overviewData) return <Loading />

    return (
        <div className="">
            <section className="flex flex-row gap-3 justify-stretch mt-4">
                <section className="grow flex flex-col justify-between">
                    <NewsTicker />
                    <div className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Total CHWs */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <div className="p-2 bg-blue-900/20 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-white mt-1">Total CHWs</p>
                                <div className="text-2xl font-bold text-white mt-1">24,847</div>
                                <div className="text-gray-400 text-xs">vs prev period</div>
                            </div>

                            {/* Mean HR Score */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <div className="p-2 bg-blue-900/20 rounded-lg">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-white mt-1">Mean HR Score</p>
                                <div className="text-2xl font-bold text-white mt-1">74</div>
                                <div className="text-gray-400 text-xs">weighted average</div>
                            </div>

                            {/* Active Incidents */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <div className="p-2 bg-blue-900/20 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-white mt-1">Active Incidents</p>
                                <div className="text-2xl font-bold text-white mt-1">7</div>
                                <div className="text-gray-400 text-xs">across regions</div>
                            </div>

                            {/* Readiness Index */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <div className="p-2 bg-blue-900/20 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-white mt-1">Readiness Index</p>
                                <div className="text-2xl font-bold text-white mt-1">78%</div>
                                <div className="text-gray-400 text-xs">composite score</div>
                            </div>

                            {/* Countries */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <div className="p-2 bg-blue-900/20 rounded-lg">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-white mt-1">Countries</p>
                                <div className="text-2xl font-bold text-white mt-1">8</div>
                                <div className="text-gray-400 text-xs">monitored</div>
                            </div>

                            {/* Last Refresh */}
                            <div className="bg-[#0d1424] rounded-xl p-4 border border-white/5">
                                <div 
                                onClick={()=>{setReloadCounter(reloadCounter+1)}}
                                className="flex items-center gap-2 text-blue-300">
                                    <button className="p-2 bg-blue-900/20 rounded-lg">
                                    <RefreshCcw className={`${loading && 'animate-spin'} w-5 h-5 text-blue-400`} />
                                    </button>
                                </div>
                                <p className="text-xs text-white mt-1">Last Refresh</p>
                                <div className="text-2xl font-bold text-white mt-1">{getTimeAgo()}</div>
                                <div className="text-gray-400 text-xs">auto-sync</div>
                            </div>
                        </div>
                    </div>

                    <DashboardMap 
                    chw={overviewData.chw} 
                    espar={overviewData.espar} 
                    readiness={overviewData.readiness} 
                    stardata={overviewData.stardata}
                    />
                </section>
                <section className="">
                    <LiveFeedWatchlist />
                </section>
            </section>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="bg-[#08121C] p-6 rounded-xl shadow-lg">
                    <h3 className="text-white text-lg font-semibold mb-4">
                    Total CHW and Population 2024 by Country and Year
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={overviewData.chart.total_chw_and_population_2024}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1d2939" />
                        <XAxis dataKey="country" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />

                        <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px" }}
                        labelStyle={{ color: "white" }}
                        />

                        <Area
                        type="monotone"
                        dataKey="chw"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.35}
                        name="Total CHW"
                        label={<ChartLabel />}
                        />

                        <Area
                        type="monotone"
                        dataKey="population"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.32}
                        name="Population 2024"
                        label={<ChartLabel />}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2 */}
                <div className="bg-[#08121C] p-6 rounded-xl shadow-lg">
                    <h3 className="text-white text-lg font-semibold mb-4">
                    CHW per 10000 by Country and Year
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chwPer10k}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1d2939" />
                        <XAxis dataKey="country" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />

                        <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px" }}
                        labelStyle={{ color: "white" }}
                        />

                        <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#fb7185"
                        fill="#fb7185"
                        fillOpacity={0.35}
                        label={<ChartLabel />}
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    )
}