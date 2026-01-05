import { useToast } from "@/contexts/ToastProvider";
import { readiness } from "@/services/readiness";
import type { RegionScore } from "@/types/readiness_type";
import React, { useEffect, useState } from "react";
import { Loading } from "../Loading";


interface Prop {
  readinessType: string
}
const RegionalHeatmap: React.FC<Prop> = ({readinessType}) => {
  const { showToast } = useToast();

  // ---- CATEGORY FUNCTION ----
  const getCategory = (score: number) => {
    if (score >= 80)
      return { label: "High", color: "bg-green-600", pill: "bg-green-700/50" };

    if (score >= 60)
      return { label: "Medium", color: "bg-yellow-600", pill: "bg-yellow-700/50" };

    return { label: "Low", color: "bg-orange-600", pill: "bg-orange-700/50" };
  };

  const [loading, setLoading] = useState(false)
  const [heatMap, setHeatMap] = useState<RegionScore[]>()
  useEffect(()=>{
    const loadHeatMap = async()=>{
      try {
        setLoading(true)
        const response = await readiness.heatmap(readinessType)
        setHeatMap(response)
        // showToast(response.message, "success", 5000);  
      } catch (error: any) {
        showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
      } finally {
        setLoading(false)
      }
    }
    loadHeatMap()
  }, [readinessType])

  if (loading && !heatMap) return <Loading />

  return (
    <div className="p-6 bg-[#1C1607] rounded-xl text-white">
      <h1 className="text-xl font-bold">Regional Readiness Heatmap</h1>
      <p className="text-neutral-400 mb-6">Preparedness scores by region</p>

      {/* ---- COUNTRY GROUPS ---- */}
        <div className="mb-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {heatMap?.map((i, _) => {
              const c = getCategory(i.score);

              return (
                <div
                  key={_}
                  className={`rounded-xl p-4 text-white shadow-md ${c.color} bg-opacity-80`}
                >
                  <h3 className="text-sm opacity-90">{i.region}</h3>

                  <p className="text-3xl font-bold mt-1">{i.score}%</p>

                  <span
                    className={`text-xs mt-2 inline-block px-3 py-1 rounded-full ${c.pill}`}
                  >
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      {/* ---- LEGEND ---- */}
      {/* <div className="flex items-center gap-6 mt-10 text-sm text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-600 rounded"></span> High (≥80%)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-600 rounded"></span> Medium (60–79%)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-orange-600 rounded"></span> Low (&lt;60%)
        </div>
      </div> */}
    </div>
  );
};

export default RegionalHeatmap;
