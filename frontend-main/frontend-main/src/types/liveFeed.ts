export interface LiveFeed {
  title: string;
  source: string;
  timeAgo: string;
  progress: number[];
}

export interface WatchItem {
  country: string;
  metric: string;
  value: number;
  change: number;
  trend: "up" | "down";
  bars: number[];
}

export interface DashboardResponse {
  liveFeed: LiveFeed[];
  watchlist: WatchItem[];
}
