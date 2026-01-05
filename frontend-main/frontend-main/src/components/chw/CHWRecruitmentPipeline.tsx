import React, { useEffect, useMemo, useState } from "react";
import type { FC, } from "react";
import { Users, Award, Package, ArrowDownRight, Loader } from "lucide-react";
import { Loading } from "../Loading";
import type { ChwPipelineResponse } from "@/types/chw";
import { chw } from "@/services/chw";
import { useToast } from "@/contexts/ToastProvider";
import { Updating } from "../Updating";
import Dropdown from "../usables/Dropdown";

interface BadgeProps { children: React.ReactNode; className?: string; }
const Badge: FC<BadgeProps> = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#0F3B27] text-gray-200 ${className}`}
  >
    {children}
  </span>
);

interface StatProps { label: string; value: string | number; sub?: string; }
function Stat({ label, value, sub }:StatProps) {
  return (
    <div className="text-center">
        <div className="text-sm text-gray-500 mt-1">{label}</div>
        <div className="text-2xl font-semibold leading-none">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

interface ProgressProps { pct: number; className?: string; }
function Progress({ pct, className = "" }:ProgressProps) {
  return (
    <div className={`w-full bg-[#0F3B27] rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

const CHWRecruitmentPipeline = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

    const [country, setCountry] = useState("Madagascar")
    const [pipeline, setPipeline] = useState<ChwPipelineResponse["data"]>()
    useEffect(()=>{
      const loadPipeline = async()=>{
        try {
          setLoading(true)
          const response = await chw.pipeline(country)
          setPipeline(response.data)
          // showToast(response.message, "success", 5000);  
        } catch (error: any) {
          showToast(error?.message || "An Error ocurred while pipeline data", "error", 5000);
        } finally {
          setLoading(false)
        }
      }
      loadPipeline()
    }, [country])
      
    if (loading && !pipeline) return <Loading />

  return (
    <div className="bg-[#081D10] rounded-xl text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">CHW Recruitment Pipeline</h1>
            {loading && <Updating />}
          </div>
          <Dropdown
          label="Country"
          showLabel={false}
          value={country}
          onChange={setCountry}
          items={pipeline?.countries ?? []}
          bgColor="#16A24933"
          allowEmptyDefault={false}
          />
        </div>

        {/* Pipeline Blocks */}
         <div className="space-y-6">
          {/* Total CHWs */}
          <div className="rounded-md border border-[#1B291A] px-6 py-3 relative">
            <div className="flex items-center gap-5">
              <Users size={28} />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold">{pipeline?.country_summary.total_chws.toLocaleString()}</p>
                  <p className="text-sm text-gray-300">Total CHWs</p>
                </div>
                <div className="text-xs text-gray-400 mt-1">{pipeline?.country_summary.population.toLocaleString()} population</div>
              </div>
            </div>
          </div>

          {/* CHW Density */}
          <div className="relative w-[85%] mx-auto">
            <div className="rounded-md border border-[#1B291A] px-6 py-3">
              <div className="flex items-center gap-5">
                <Award size={28} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold">{pipeline?.country_summary.chw_density}</p>
                        <p className="text-sm text-gray-300">CHWs / 10k</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">National density</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Region */}
          <div className="rounded-xl border-2 border-[#16A249] bg-[#16A24933] px-6 py-3 relative w-[70%] mx-auto">
            <div className="flex items-center gap-5">
              <Package size={28} className="text-[#16A249]" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold text-[#16A249]">
                        {pipeline?.country_summary.top_region.avg_chws_per_10k ?? "-"}
                      </p>
                      <p className="text-sm mt-1 text-[#16A249]">
                        Top Region
                      </p>
                    </div>
                    <div className="text-xs text-[#16A249]">{pipeline?.country_summary.top_region.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-[#F9FAFB80] border border-[#DAE0E7]">
                      {pipeline?.country_summary.top_region.drop_pct}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Stat label="Total Regions" value={pipeline?.country_summary.total_regions.toLocaleString() || ""} sub="Regions in country" />
            <Stat label="Total Districts" value={pipeline?.country_summary.total_districts.toLocaleString() || ""} sub="Districts in country" />
            <Stat label="Population 2024" value={pipeline?.country_summary.population.toLocaleString() || ''} sub="Population" />
          </div>
        </div>

        {/* Top Performing Regions */}
        <div className="mt-10">
          <div>
            <h3 className="text-base font-semibold mb-4">Top Performing Regions</h3>

            <div className="space-y-4">
              {pipeline?.top_region.map((r) => (
                <div key={r.region} className="flex items-center">
                    <div className="text-sm grow">{r.region}</div>
                    <div className="flex items-center gap-4 w-[300px]">
                        <Progress pct={r.percentage} />
                        <div className="text-sm text-gray-200">{r.percentage}%</div>
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Notes & Quick Filters</h3>
            <div className="text-sm text-gray-300">
              Use the small controls to filter the cohort, view by training date range, or export the list.
              <div className="mt-4">
                <button className="px-4 py-2 rounded bg-[#0F3B27] text-sm">Filter</button>
                <button className="px-4 py-2 rounded ml-3 bg-green-600 text-sm">Export</button>
              </div>
            </div>
          </div> */}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

export default CHWRecruitmentPipeline;