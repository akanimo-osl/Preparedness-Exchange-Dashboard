import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Layers,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { CHWOverview, EsparOverview, ReadinessOverview, StardataOverview } from "@/types";
import { useState } from "react";
import { capitalize } from "@/utils";

// Custom colored icon maker
const createIcon = (color: string) =>
  new L.DivIcon({
    html: `<span style="background:${color}; width:12px; height:12px; border-radius:50%; display:block;"></span>`,
    className: "",
    iconSize: [12, 12],
  });

const sampleMarkers = [
  { lat: 49.85, lng: 11.57, color: "#ff5722" },
  { lat: 49.78, lng: 11.49, color: "#4caf50" },
  { lat: 49.80, lng: 11.70, color: "#ffc107" },
  { lat: 49.88, lng: 11.65, color: "#03a9f4" },
];

interface Prop {
  chw: CHWOverview;
  espar: EsparOverview;
  readiness: ReadinessOverview;
  stardata: StardataOverview;
}
export default function DashboardMap({chw, espar, readiness, stardata}:Prop) {
  const [tabs, setTabs] = useState(['CHW', 'e-SPAR', 'Readiness', 'STAR'])
  const [activeTab, setActivetab] = useState('CHW')

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* LEFT MAP SECTION */}
      <div className="col-span-2 bg-[#0d1424] rounded-xl p-4 relative border border-white/5">

        {/* Controls (left side icons) */}
        <div className="absolute left-4 top-4 flex flex-col gap-3 z-[500]">
          <button className="p-2 bg-black/40 rounded-lg border border-white/10">
            <ZoomIn className="text-white w-4 h-4" />
          </button>
          <button className="p-2 bg-black/40 rounded-lg border border-white/10">
            <ZoomOut className="text-white w-4 h-4" />
          </button>
        </div>

        {/* Layers Button (top-right) */}
        <div className="absolute right-4 top-4 z-[500]">
          <button className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center gap-2 text-white">
            <Layers size={16} /> Layers
          </button>
        </div>

        {/* REAL MAP */}
        <MapContainer
          center={[49.82, 11.57]}
          zoom={10}
          scrollWheelZoom={true}
          className="w-full h-[400px] rounded-lg"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sampleMarkers.map((m, i) => (
            <Marker
              key={i}
              position={[m.lat, m.lng]}
              icon={createIcon(m.color)}
            >
              <Popup>
                Marker: {m.lat}, {m.lng}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* LEGEND */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-3 rounded-xl text-sm">
          <div className="font-semibold mb-2">CHW per 10k Population</div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#ff4d4d]" />
            <span className="w-4 h-4 rounded-full bg-[#ff9900]" />
            <span className="w-4 h-4 rounded-full bg-[#ffcc00]" />
            <span className="w-4 h-4 rounded-full bg-[#33cc33]" />
            <span className="w-4 h-4 rounded-full bg-[#0099ff]" />
          </div>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="bg-[#0d1424] rounded-xl p-2 border border-white/5 space-y-5">

        {/* Tabs */}
        <div className="flex gap-6 text-gray-400 text-sm font-medium">
          {tabs.map((item, _)=>(
            <button onClick={()=>{setActivetab(item)}} className={`${(activeTab == item) && 'text-blue-400'}`}>{item}</button>
          ))}
        </div>

        {/* Global Summary */}
        {(activeTab == 'CHW')? <CHWPanel data={chw} />
        :
        (activeTab == 'e-SPAR')?  <EsparPanel data={espar} />
        : 
        (activeTab == 'Readiness')? <ReadinessPanel data={readiness} />
        :
        (activeTab == 'STAR')? <StardataPanel data={stardata} />
        :
        null
        }
       

      </div>

    </div>
  );
}

interface ChwProp {
  data: CHWOverview
}
function CHWPanel({data }:ChwProp) {
  const COLORS = ['#22c55e', '#22c55e', '#22c55e', '#f59e0b', '#ef4444']
  return (
    <div>
          <div className="text-white font-semibold mb-1">Global Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total CHWs</span>
              <span className="text-white">{data.total_chw.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>CHWs per 10k</span>
              <span className="text-white">{Number(data.total_chw_per_10k).toFixed(2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Countries Covered</span>
              <span className="text-white">{data.countries.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Regions Covered</span>
              <span className="text-white">{data.regions}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>District Covered</span>
              <span className="text-white">{data.districts}</span>
            </div>
          </div>

        <div className="mt-5">
          <div className="text-white font-semibold mb-1">Top Regions</div>
          <div className="space-y-2 text-sm">
            {data.top_region.map((item, _) => (
              <div key={_} className="flex justify-between items-center">
                <span className="text-gray-300">{item.region}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white">{item.percentage}%</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[_] ?? '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}



interface EsparProp {
  data: EsparOverview
}
function EsparPanel({data }:EsparProp) {
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444']
  return (
    <div>
          <div className="text-white font-semibold mb-1">Global Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total Capacities</span>
              <span className="text-white">{data.total_capacities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Countries Covered</span>
              <span className="text-white">{data.countries.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Years Covered</span>
              <span className="text-white">{data.years.length}</span>
            </div>
          </div>

        <div className="mt-5">
          <div className="text-white font-semibold mb-1">Available Years</div>
          <div className="space-y-2 text-sm">
            {data.years.map((item, _) => (
              <div key={_} className="flex justify-between items-center">
                <span className="text-gray-300">{item}</span>
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[_] ?? '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}


interface ReadinessProp {
  data: ReadinessOverview
}
function ReadinessPanel({data }:ReadinessProp) {
  return (
    <div>
        <div className="text-white font-semibold mb-1">Global Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span className="text-white/80">Total hazards covered</span>
              <span className="text-white/80">{data.total_hazards}</span>
            </div>
          </div>

        <div className="mt-4 max-h-[280px] overflow-y-scroll">
          <div className="text-white font-semibold mb-1">Tablular summary</div>
          
          <table border={1} cellPadding={8}>
          <thead>
            <tr className="text-white bg-blue-700/50">
              <th className="text-white/80 text-sm font-normal text-start">Hazard</th>
              <th className="text-white/80 text-sm font-normal text-start">Total</th>
              <th className="text-white/80 text-sm font-normal text-start">Answered</th>
              <th className="text-white/80 text-sm font-normal text-start">%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.summary).map(([key, value]) => (
              <tr className="hover:bg-blue-700/40" key={key}>
                <td className="text-white/80 text-sm">{capitalize(key.replace(/_/g, " "))}</td>
                <td className="text-white/80 text-sm">{value.total}</td>
                <td className="text-white/80 text-sm">{value.answered}</td>
                <td className="text-white/80 text-sm">{value.completion_pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


interface StardataProp {
  data: StardataOverview
}
function StardataPanel({data }:StardataProp) {
  const COLORS = ['#22c55e', '#22c55e', '#22c55e', '#f59e0b', '#ef4444']
  return (
    <div className="mt-4 max-h-[340px] overflow-y-scroll">
          <div className="text-white font-semibold mb-1">Global Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Countries Covered</span>
              <span className="text-white">{data.countries}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Hazards Covered</span>
              <span className="text-white">{data.hazards}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Hazards Type Covered</span>
              <span className="text-white">{data.hazards}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Active Hazards</span>
              <span className="text-white">{data.active}</span>
            </div>
          </div>

        <div className="mt-5">
          <div className="text-white font-semibold mb-1">Levels</div>
          <div className="space-y-2 text-sm">
            {data.levels.map((item, _) => (
              <div key={_} className="flex justify-between items-center">
                <span className="text-gray-300">{item}</span>
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[_] ?? '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-white font-semibold mt-2 mb-1">Years</div>
          <div className="space-y-2 text-sm">
            {data.years.map((item, _) => (
              <div key={_} className="flex justify-between items-center">
                <span className="text-gray-300">{item}</span>
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[_] ?? '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}