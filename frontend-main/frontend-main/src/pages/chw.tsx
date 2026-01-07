import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import NewsTicker from "@/components/usables/NewsTicker";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import CHWRecruitmentPipeline from "@/components/chw/CHWRecruitmentPipeline";
import ChwTable from "@/components/chw/CHWTable";
import type { ChwListResponse, District } from "@/types/chw";
import { chw } from "@/services/chw";
import { useToast } from "@/contexts/ToastProvider";
import { Loading } from "@/components/Loading";

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

type Metric = "chws" | "vacancy" | "coverage";

type District2 = {
  name: string;
  chws: number;
  vacancy: number;
  coverage: number;
  lat: number;
  lng: number;
};

const CHWDistribution: React.FC = () => {
  const { showToast } = useToast();
  const [metric, setMetric] = useState<Metric>("chws");

  const districts: District2[] = [
    {
      name: "Antananarivo",
      chws: 8.5,
      vacancy: 12,
      coverage: 78,
      lat: -18.8792,
      lng: 47.5079,
    },
    {
      name: "Nairobi",
      chws: 9.1,
      vacancy: 10,
      coverage: 82,
      lat: -1.286389,
      lng: 36.817223,
    },
    {
      name: "Mombasa",
      chws: 6.3,
      vacancy: 8,
      coverage: 75,
      lat: -4.0435,
      lng: 39.6682,
    },
    {
      name: "Accra",
      chws: 7.2,
      vacancy: 14,
      coverage: 69,
      lat: 5.6037,
      lng: -0.1870,
    },
    {
      name: "Dar es Salaam",
      chws: 6.8,
      vacancy: 11,
      coverage: 71,
      lat: -6.7924,
      lng: 39.2083,
    },
  ];

  const getValue = (d: District2) => d[metric];

  const getColor = (value: number) => {
    if (metric === "chws") {
      if (value > 6) return "green";
      if (value >= 4) return "yellow";
      return "red";
    }

    if (metric === "vacancy") {
      if (value > 15) return "red";
      if (value >= 8) return "yellow";
      return "green";
    }

    if (metric === "coverage") {
      if (value > 75) return "green";
      if (value >= 60) return "yellow";
      return "red";
    }

    return "blue";
  };

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [36.817223, -1.286389],
      zoom: 5,
    });

    districts.forEach((district) => {
      new mapboxgl.Marker()
        .setLngLat([district.lng, district.lat])
        .addTo(map.current);
    });
  }, []);

  return (
    <div className="w-full text-white">
      <section className="flex flex-row gap-3 justify-stretch mt-4">
        <section className="grow space-y-6">
          <NewsTicker />
          <div className="text-white">
            <h1 className="text-2xl font-bold">CHW Distribution</h1>
            <p className="text-neutral-400 text-sm">
              Community Health Worker workforce distribution and gaps analysis
            </p>

            <div
              ref={mapContainer}
              style={{ width: "100%", height: "500px" }}
            />
          </div>

          <CHWRecruitmentPipeline />

          <div>
            <ChwTable />
          </div>
        </section>

        <section className="">
          <LiveFeedWatchlist />
        </section>
      </section>
    </div>
  );
};

export default CHWDistribution;
