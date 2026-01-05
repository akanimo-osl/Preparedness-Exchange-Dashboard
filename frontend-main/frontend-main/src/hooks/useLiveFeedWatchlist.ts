import type { DashboardResponse } from "@/types/liveFeed";
import { useState, useEffect } from "react";

export function fetchDashboardData(): Promise<DashboardResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        liveFeed: [{
          title:
            "Madagascar: Cyclone preparedness drill completed in 12 districts",
          source: "WHO",
          timeAgo: "2h ago",
          progress: [80, 40, 60, 20, 90],
        }],
        watchlist: [
          {
            country: "Madagascar",
            metric: "IHR Score",
            value: 68,
            change: 5,
            trend: "up",
            bars: [20, 40, 60, 50, 30, 80],
          },
          {
            country: "Tanzania",
            metric: "CHW/10k",
            value: 12.4,
            change: 8,
            trend: "up",
            bars: [10, 20, 40, 60, 80, 100],
          },
          {
            country: "Ghana",
            metric: "Readiness",
            value: 85,
            change: -3,
            trend: "down",
            bars: [40, 50, 50, 40, 30, 20],
          },
          {
            country: "Kenya",
            metric: "Active Incidents",
            value: 2,
            change: 1,
            trend: "up",
            bars: [10, 10, 20, 40, 60, 60],
          },
        ],
      });
    }, 800);
  });
}

export default function useLiveFeedWatchlist() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDashboardData()
      .then((res: DashboardResponse) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}