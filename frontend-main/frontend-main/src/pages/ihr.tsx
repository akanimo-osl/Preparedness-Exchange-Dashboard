import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { ChevronDown, Loader2, TrendingUp } from "lucide-react";
import NewsTicker from "@/components/usables/NewsTicker";
import LiveFeedWatchlist from "@/components/usables/LiveFeedWatchlist";
import type { EsparComparisonResponse, EsparSummaryResponse } from "@/types/espar_type";
import { espar } from "@/services/espar";
import { useToast } from "@/contexts/ToastProvider";
import { Loading } from "@/components/Loading";
import Dropdown from "@/components/usables/Dropdown";
import { Updating } from "@/components/Updating";


const CustomDot = (props: any) => {
  const { cx, cy, value, stroke } = props;

  return (
    <>
      {/* Outer white border */}
      <circle
        cx={cx}
        cy={cy}
        r={7}          // outer radius
        fill="white"
      />

      {/* Inner colored dot */}
      <circle
        cx={cx}
        cy={cy}
        r={5}          // inner radius
        fill={stroke}
      />

      {/* Value text */}
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fontSize={12}
        fill={stroke}
      >
        {value}
      </text>
    </>
  );
};


const WrappedTick = ({ x, y, payload }: any) => {
  if (x === undefined || y === undefined) return null; // safety check

  const words = payload.value.split(" ");

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={12}
      fill="#94a3b8"
    >
      {words.map((word: string, index: number) => (
        <tspan
          key={index}
          x={x}
          dy={index === 0 ? 0 : 14} // line spacing
        >
          {word}
        </tspan>
      ))}
    </text>
  );
};


const COLORS = ["#6366f1", "#06b6d4", "#f97316", "#10b981"]
interface CountryComparisonProp {
  countries: string[];
  years: string[];
  capacity_summary: EsparSummaryResponse["data"]["capacity_summary"];
}
interface SelectedCountry {
  country: string;
  year: number | string;
}

export function CountryComparison({ countries, years }: CountryComparisonProp) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EsparComparisonResponse["data"]>();

  // Initialize selected countries
  const [selectedCountries, setSelectedCountries] = useState<SelectedCountry[]>([
    { country: "Algeria", year: 2024 },
    { country: "Nigeria", year: 2024 },
    { country: "Cameroon", year: 2024 },
    { country: "Egypt", year: 2024 },
  ]);

  // Derive country names for easier access
  const c1 = selectedCountries[0].country;
  const c2 = selectedCountries[1].country;
  const c3 = selectedCountries[2].country;
  const c4 = selectedCountries[3].country;

  // Handler for dropdown changes
  const handleCountryChange = (index: number, country: string) => {
    const newSelected = [...selectedCountries];
    newSelected[index].country = country;
    setSelectedCountries(newSelected);
  };

  const handleYearChange = (index: number, year: string) => {
    const newSelected = [...selectedCountries];
    newSelected[index].year = year;
    setSelectedCountries(newSelected);
  };

  // Load comparison data whenever selectedCountries changes
  useEffect(() => {
    const loadEsparSummary = async () => {
      try {
        setLoading(true);
        const response = await espar.comparison(selectedCountries);
        setData(response.data);
        // showToast(response.message, "success", 5000);
      } catch (error: any) {
        showToast(error?.message || "An error occurred while retrieving data", "error", 5000);
      } finally {
        setLoading(false);
      }
    };
    loadEsparSummary();
  }, [selectedCountries]);

  // Prepare chart data
  const categories = data?.categories || []; // adjust according to your API
  const countryScores = data?.country_scores || {}; // adjust according to your API

  const chartData = categories.map((cat) => ({
    category: cat,
    [c1]: countryScores[c1]?.[cat] ?? 0,
    [c2]: countryScores[c2]?.[cat] ?? 0,
    [c3]: countryScores[c3]?.[cat] ?? 0,
    [c4]: countryScores[c4]?.[cat] ?? 0,
  }));

  return (
    <div className="p-6 bg-[#090F1F] text-white min-h-screen">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold mb-1">Country Comparison</h2>
          {loading && <Updating /> }
        </div>
        <p className="text-gray-400 text-sm mb-6">Compare capacity scores across multiple countries</p>

      {/* Dropdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <Dropdown flat={false} label="Country 1" value={c1} onChange={(val) => handleCountryChange(0, val)} items={countries} />
          <Dropdown flat={false} label="Year" value={String(selectedCountries[0].year)} onChange={(val) => handleYearChange(0, val)} items={years} />
        </div>
        <div className="flex flex-col gap-2">
          <Dropdown flat={false} label="Country 2" value={c2} onChange={(val) => handleCountryChange(1, val)} items={countries} />
          <Dropdown flat={false} label="Year" value={String(selectedCountries[1].year)} onChange={(val) => handleYearChange(1, val)} items={years} />
        </div>
        <div className="flex flex-col gap-2">
          <Dropdown flat={false} label="Country 3" value={c3} onChange={(val) => handleCountryChange(2, val)} items={countries} />
          <Dropdown flat={false} label="Year" value={String(selectedCountries[2].year)} onChange={(val) => handleYearChange(2, val)} items={years} />
        </div>
        <div className="flex flex-col gap-2">
          <Dropdown flat={false} label="Country 4" value={c4} onChange={(val) => handleCountryChange(3, val) } items={countries} />
          <Dropdown flat={false} label="Year" value={String(selectedCountries[3].year)} onChange={(val) => handleYearChange(3, val)} items={years} />
        </div>
      </div>

      {/* Chart Box */}
      <div className="bg-[#0B172A]  rounded-xl shadow-lg">
        <div className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="category" stroke="#94a3b8" interval={0} height={70} tick={<WrappedTick />} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px" }}
                labelStyle={{ color: "white" }}
              />
              {[c1, c2, c3, c4].map((country, index) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={COLORS[index]}
                  strokeWidth={1}
                  dot={<CustomDot stroke={COLORS[index]} />}
                />
              ))}
              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 50 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}



export default function IHR() {
  const { showToast } = useToast();
  const [country, setCountry] = useState("Algeria");
  const [year, setYear] = useState("2024")

  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const [summaryData, setSummaryData] = useState<EsparSummaryResponse['data']>()
  useEffect(()=>{
    const loadEsparSummary = async()=>{
      try {
        setLoading(true)
        const response = await espar.summary(country, year)
        setSummaryData(response.data)
        // showToast(response.message, "success", 5000);  
      } catch (error: any) {
        showToast(error?.message || "An Error Ocurred while retrieving data", "error", 5000);
      } finally {
        setLoading(false)
        if(!initialLoad) setInitialLoad(true)
      }
    }
    loadEsparSummary()
  }, [country, year])

  if (loading && !initialLoad) return <Loading />

  return (
    <div className="text-white">
      <section className="flex flex-row gap-3 justify-stretch mt-4">
        <section className="grow">
          <NewsTicker />
          <div className="flex flex-row items-center justify-between mt-7">
            {/* Page Header */}
            <div>
              <div className="flex flex-row gap-2">
                <h1 className="text-xl font-bold">IHR / e-SPAR Monitoring</h1>
                {loading && <Updating /> }
              </div>
              <p className="text-sm text-gray-200 mb-6">
                International Health Regulations - State Party Self-Assessment Annual
                Reporting
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Dropdown
                label="Country"
                value={country}
                onChange={setCountry}
                items={summaryData?.filters.countries ?? []}
              />

              <Dropdown
                label="Year"
                value={year}
                onChange={setYear}
                items={summaryData?.filters.years ?? []}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="col-span-2 bg-[#090F1F] p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-1">
                {summaryData?.capacity_summary.length?? 0} Core Capacities Assessment
              </h2>

              <p className="text-sm text-gray-400 mb-6">
                {country} - {year} Self-Assessment
              </p>

              <div className="w-full h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={summaryData?.capacity_summary} outerRadius="80%">
                    <PolarGrid stroke="#6b7280" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "#aebaca", fontSize: 12 }}
                    />

                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      axisLine={false}
                      tick={({ x, y, payload }) => {
                        // payload.value is the tick value (0, 25, 50, 75, 100)
                        let fillColor = "#64748b"; // default color

                        if (payload.value < 60) fillColor = "#ef4444";
                        else if (payload.value >= 60 && payload.value <= 75) fillColor = "#eab308";
                        else if (payload.value >= 80) fillColor = "#22c55e";

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={fillColor}
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    
                    <Radar
                      name="Capacity Score"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />

                    {/* Recharts Legend (unstyled; we use custom legend below) */}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <LegendDot color="#22c55e" label="Strong (≥80)" />
                <LegendDot color="#eab308" label="Moderate (60–79)" />
                <LegendDot color="#ef4444" label="Weak (<60)" />
              </div>
            </div>

        {/* Score Card */}
        <div className="flex flex-col gap-6">
          <ScoreCard score={summaryData?.overall.value ?? 0} change={summaryData?.overall.change ?? 0} prev_year={summaryData?.overall.prev_year ?? 0} capacities={summaryData?.capacity_summary ?? []} />
          <div className="bg-[#090F1F] p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Capacity Average</h3>
            <div className="grid grid-cols-3 gap-2">
              {summaryData?.capacity_average &&
              Object.entries(summaryData.capacity_average).map(([key, value]) => (
                <div className="font-semibold flex justify-between bg-primary-LIGHTER px-2 rounded-md text-sm" key={key}>
                  <p key={key} className=" text-green-500" >{key}</p>
                  <p className="">-</p>
                  <p className=" text-gray-300">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>
      <section className="">
        <LiveFeedWatchlist />
      </section>
      </section>
      
      <div className="mt-8 rounded-lg overflow-hidden">
        <CountryComparison 
        years={summaryData?.filters.years??[]}
        countries={summaryData?.filters.countries??[]} 
        capacity_summary={summaryData?.capacity_summary ?? []} 
        />
      </div>
    </div>
  );
}


interface ScoreCardProps {
  score: number;
  change: number;
  prev_year: string | number;
  capacities: EsparSummaryResponse['data']['capacity_summary']
}

function ScoreCard({ score, change, prev_year, capacities }: ScoreCardProps) {
  return (
    <div className="bg-[#090F1F] p-6 rounded-xl shadow-lg">

      <h3 className="text-lg font-semibold mb-4">Overall IHR Score</h3>

      <p className="text-4xl font-bold">{score}</p>

      <div className="flex items-center gap-2 mt-1">
        <TrendingUp className="text-green-500 w-4 h-4" /> 
        <p className="text-green-500 font-normal">{Number(change).toFixed(2)} from {prev_year}</p>
      </div>

      <div className="text-sm text-gray-300 mt-4 space-y-1">
        <p className="flex justify-between">
          Capacities ≥80:{" "}
          <span className="text-white font-light">{capacities.filter(item => Number(item.value) >= 80).length} of {capacities.length}</span>
        </p>
        <p className="flex justify-between">
          Capacities &lt;60:{" "}
          <span className="text-yellow-500 font-light">{capacities.filter(item => Number(item.value) < 60).length} of {capacities.length}</span>
        </p>
      </div>
    </div>
  );
}

interface LegendDotProps {
  color: string;
  label: string;
}

function LegendDot({ color, label }: LegendDotProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-300">{label}</span>
    </div>
  );
}
