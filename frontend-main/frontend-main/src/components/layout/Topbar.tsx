import { useState, useEffect } from "react";
import { Search, CalendarDays, Download } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function TopBar() {
  const { pathname } = useLocation();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Simulate API call
  useEffect(() => {
    if (!debounced) return;

    setLoading(true);

    const fetchData = setTimeout(() => {
      console.log("API SEARCH RESULT FOR:", debounced);
      setLoading(false);
    }, 800);

    return () => clearTimeout(fetchData);
  }, [debounced]);


  // Fake export
  const handleExport = () => {
    alert("Export started!");
  };

  // Fake date filter
  const handleDateRange = () => {
    alert("Date filter clicked: last 30 days");
  };

    // Map each route to a color
    const colors: Record<string, string> = {
        "/chw": "bg-[#081D10]",
        "/ihr": "bg-[#091920]", 
        "/readiness": "bg-[#1C1607]",
        "/star_tracker": "bg-[#1B0835]",
        "/alerts": "bg-[#202328]",
    };

    // Default color
    const defaultColor = "bg-[#090F1F]";

    const layoutColor = colors[pathname] || defaultColor;

  return (
    <div className="w-full flex items-center justify-between py-4">

      {/* Search box */}
      <div className={`flex items-center ${layoutColor} px-4 py-2 rounded-md w-[350px] text-gray-300`}>
        <Search size={18} className="mr-3 text-gray-400" />

        <input
          type="text"
          placeholder="Search countries, regions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent text-sm outline-none w-full"
        />

        {loading && (
          <div className="border-2 border-gray-400 border-t-transparent rounded-full h-4 w-4 animate-spin" />
        )}
      </div>


      {/* Right-side buttons */}
      <div className="flex items-center gap-3">

        {/* Last 30 Days */}
        <button
          onClick={handleDateRange}
          className={`flex items-center gap-2 ${layoutColor} px-4 py-2 rounded-md text-gray-200 text-sm hover:bg-[#0d203f]`}
        >
          <CalendarDays size={16} />
          Last 30 Days
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className={`flex items-center gap-2 ${layoutColor} px-4 py-2 rounded-md text-gray-200 text-sm hover:bg-[#0d203f]`}
        >
          <Download size={16} />
          Export
        </button>

      </div>
    </div>
  );
}
