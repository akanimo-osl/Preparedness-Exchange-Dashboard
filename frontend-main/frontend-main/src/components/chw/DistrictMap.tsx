import React, { useEffect, useState } from "react";
import { MapContainer, CircleMarker, Tooltip, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loading } from "../Loading";
import type { District } from "@/types/chw";
import { chw } from "@/services/chw";
import { useToast } from "@/contexts/ToastProvider";


export const DistrictMap = () => {
    const { showToast } = useToast();

  const getValue = (d: District) => d.chws_per_10k;

  const getColor = (value: number) => {
    if (value > 6) return "#16A249"; // green
    if (value >= 4) return "#FBBF24"; // yellow
    return "#EF4444"; // red
  };

  // pseudo-coordinate generation (grid layout)
  const getPseudoPosition = (index: number) => {
    const row = Math.floor(index / 10); // 10 per row
    const col = index % 10;
    return [row * 20 + 10, col * 20 + 10];
  };

  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>()
    useEffect(()=>{
      const loadPipeline = async()=>{
        try {
          setLoading(true)
          const response = await chw.map()
          setDistricts(response)
          // showToast(response.message, "success", 5000);  
        } catch (error: any) {
          showToast(error?.message || "An Error ocurred while pipeline data", "error", 5000);
        } finally {
          setLoading(false)
        }
      }
      loadPipeline()
    }, [])

    if (loading && !districts) return <Loading />

  return (
    <div className="mt-6 bg-[#0a1a0f] p-6 rounded-2xl">
      <h2 className="font-bold text-xl mb-4">District-Level Distribution Map</h2>

      {/* MAP */}
      <div className="h-[600px] overflow-hidden rounded-xl border border-[#1f3327] relative">
  <MapContainer
    center={[20, 10]} // valid pseudo-center
    zoom={2}
    scrollWheelZoom={false}
    className="h-full w-full"
  >
    <TileLayer url="https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

    {districts?.map((d, i) => {
      const [lat, lng] = getPseudoPosition(i);
      return (
        <CircleMarker
          key={d.district_name}
          center={[lat, lng]}
          radius={15}
          color="white"
          weight={2}
          fillOpacity={0.7}
          fillColor={getColor(getValue(d))}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <div className="text-black">
              <strong>{d.district_name}</strong>
              <br />
              {getValue(d)} per 10k
            </div>
          </Tooltip>
        </CircleMarker>
      );
    })}
  </MapContainer>

  {/* LEGEND */}
  <div className="absolute bottom-4 right-4 bg-[#0d1f14] px-4 py-3 rounded-md border border-[#1b3526] shadow text-sm">
    <p className="font-semibold mb-2">CHWs per 10k</p>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-green-500 rounded"></span> &gt; 6 (Good)
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-yellow-500 rounded"></span> 4–6 (Warning)
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-red-500 rounded"></span> &lt; 4 (Critical)
    </div>
  </div>
</div>

    </div>
  );
};
