import React, { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loading } from "../Loading";
import type { District } from "@/types/chw";
import { chw } from "@/services/chw";
import { useToast } from "@/contexts/ToastProvider";


mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

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

    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [10, 20],
        zoom: 2,
      });

      districts?.forEach((district, i) => {
        new mapboxgl.Marker({ color: getColor(getValue(district)) })
          .setLngLat(getPseudoPosition(i))
          .addTo(map.current);
      });
    }, [districts]);

    if (loading && !districts) return <Loading />

  return (
    <div className="mt-6 bg-[#0a1a0f] p-6 rounded-2xl">
      <h2 className="font-bold text-xl mb-4">District-Level Distribution Map</h2>

      {/* MAP */}
      <div className="h-[600px] overflow-hidden rounded-xl border border-[#1f3327] relative">
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

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
