import { Circle, TrendingUp, TrendingDown } from "lucide-react";
import { useLiveFeedWatchlistContext } from "@/contexts/LiveFeedWatchlistContext";
import { useLocation } from "react-router-dom";

export default function LiveFeedWatchlist() {
  const { pathname } = useLocation();
  const { data, loading, error } = useLiveFeedWatchlistContext();

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  const watchlist = data?.watchlist ?? [];
  const liveFeed = data?.liveFeed ?? [];

  // Map each route to a color
    const colors: Record<string, any> = {
        "/chw": ["bg-[#081D10]", "bg-[#1B291A]"],
        "/ihr": ["bg-[#091920]", "bg-[#0B2B3A]"], 
        "/readiness": ["bg-[#1C1607]", "bg-[#100C03]"],
        "/star_tracker": ["bg-[#1B0835]", "bg-[#130722]"],
        "/alerts": ["bg-[#202328]", "bg-[#33363C]"],
    };

    // Default color
    const layoutColor = colors[pathname]?.[0] || "bg-[#090F1F]";
    const layoutColor2 = colors[pathname]?.[1] || "bg-[#090F1F]";

  return (
    <div className={`${layoutColor} text-white space-y-6 w-[300px] flex-shrink-0 sticky top-0 p-3 `}>
      {/* Live Feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">Live Feed</span>
          <Circle size={8} className="text-green-500 fill-green-500" />
        </div>

        <div className={`${layoutColor2} rounded-lg p-2 space-y-2`}>
          <p className="text-sm">{liveFeed[0].title}</p>
          <p className="text-xs text-gray-400">
            {liveFeed[0].source} • {liveFeed[0].timeAgo}
          </p>

          {/* Progress bars */}
          <div className="flex gap-2 mt-3">
            {liveFeed[0].progress.map((val: number, i: number) => (
              <div
                key={i}
                className={`h-2 rounded-md ${layoutColor2} overflow-hidden w-full`}
              >
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${val}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div>
        <h2 className="font-semibold mb-2">Watchlist</h2>

        <div className="space-y-4">
          {watchlist.map((item: any, i: number) => (
            <div key={i} className={`${layoutColor2} rounded-lg p-4 space-y-2`}>
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.country}</p>
                  <p className="text-xs text-gray-400">{item.metric}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">{item.value}</p>

                  <div
                    className={`flex items-center gap-1 text-xs ${
                      item.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {item.change}%
                  </div>
                </div>
              </div>

              {/* Mini bars */}
              <div className="flex gap-2 mt-2">
                {item.bars.map((val: number, j: number) => (
                  <div
                    key={j}
                    className="h-6 w-full bg-[#0f2344] rounded-sm overflow-hidden"
                  >
                    <div
                      className="h-full bg-[#0C7AE933]"
                      style={{ height: `${val}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
