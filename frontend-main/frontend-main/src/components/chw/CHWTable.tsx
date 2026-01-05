import { useEffect, useState } from "react";
import {
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Loading } from "../Loading";
import { useToast } from "@/contexts/ToastProvider";
import type { District } from "@/types/chw";
import { chw } from "@/services/chw";
import SmartPagination from "../usables/SmartPagination";
import { Updating } from "../Updating";

export default function ChwTable() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false)
  const [chwList, setChwList] = useState<District[]>([])
  const [totalCountry, setTotalCountry] = useState(0)

  const sortBy = (key: keyof District) => {
    const sorted = [...chwList].sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb));
    });
    setChwList(sorted);
  };
  
  const exportCSV = () => {
    const header = Object.keys(chwList[0]).join(",");
    const body = chwList
      .map((r) =>
        Object.values(r)
          .map(String)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([header + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chw_distribution.csv";
    a.click();
  };

  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const PAGE_SIZE = 12

  useEffect(()=>{
    const loadChwList = async()=>{
      try {
        setLoading(true)
        const response = await chw.list(page, PAGE_SIZE)
        setChwList(response.results)
        setCount(response.count)
        setTotalCountry(response.total_countries)
        // showToast(response.message, "success", 5000);  
      } catch (error: any) {
        showToast(error?.message || "An Error Ocurred while table data", "error", 5000);
      } finally {
        setLoading(false)
      }
    }
    loadChwList()
  }, [page])
    
  if (loading && !chwList) return <Loading />

  return (
    <div className="text-white bg-[#081D10] p-8 rounded-xl">
      <div className="">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">CHW Distribution Data</h1>
              {loading && <Updating />}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Showing {count} districts across {totalCountry} countries
            </p>
          </div>  
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#1B291A] hover:bg-white/10 px-3 py-2 rounded-md text-sm transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto mt-4 border border-white/5 rounded-md">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 text-xs bg-[#1B291A]">
                {[
                  "District ID",
                  "Region",
                  "Country",
                  "District",
                  "CHW Count",
                  "CHWs/10k",
                  "Population Est",
                ].map((col, idx) => (
                  <th
                    key={idx}
                    className="py-3 px-3 cursor-pointer select-none"
                    onClick={() =>
                      sortBy(
                        col
                          .toLowerCase()
                          .replace("/", "chws_per_10k")
                          .replace(" ", "") as keyof District
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-gray-200">
              {chwList?.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-3 px-3">{row.district_id}</td>
                  <td className="py-3 px-3">{row.region?.region_name}</td>
                  <td className="py-3 px-3">{row.country?.country}</td>
                  <td className="py-3 px-3">{row.district_name}</td>
                  <td className="py-3 px-3">{row.chw_count}</td>
                  <td className="py-3 px-3 font-semibold">{row.chws_per_10k}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs`}
                    >
                      {row.population_est} 
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SmartPagination
        count={count}
        pageSize={PAGE_SIZE}
        currentPage={page}
        onPageChange={(page) => setPage(page)}
        darkMode={true}
        />
      </div>
    </div>
  );
}
