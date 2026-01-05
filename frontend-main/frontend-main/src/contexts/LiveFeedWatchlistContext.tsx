import { createContext, useContext } from "react";
import type { ReactNode } from "react"
import useLiveFeedWatchlist from "@/hooks/useLiveFeedWatchlist";
import type { DashboardResponse } from "@/types/liveFeed";

interface LiveFeedWatchlistContextType {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
}

// default empty context
const LiveFeedWatchlistContext = createContext<LiveFeedWatchlistContextType | undefined>(undefined);

export const LiveFeedWatchlistProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading, error } = useLiveFeedWatchlist();

  return (
    <LiveFeedWatchlistContext.Provider value={{ data, loading, error }}>
      {children}
    </LiveFeedWatchlistContext.Provider>
  );
};

export const useLiveFeedWatchlistContext = () => {
  const context = useContext(LiveFeedWatchlistContext);
  if (!context) {
    throw new Error("useLiveFeedWatchlistContext must be used inside LiveFeedWatchlistProvider");
  }
  return context;
};
