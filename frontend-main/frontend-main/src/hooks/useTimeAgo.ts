import { useEffect, useState } from "react";

type Options = {
  interval?: number; // milliseconds → default: 10 seconds
};

export function useTimeAgo(timestamp: Date | number, options: Options = {}) {
  const { interval = 10_000 } = options;

  const [now, setNow] = useState(Date.now());

  // Auto refresh "now" every interval
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  // Allow external manual refresh (optional)
  function refresh() {
    setNow(Date.now());
  }

  function getTimeAgo() {
    if (!timestamp) return "";

    const ts = typeof timestamp === "number" ? timestamp : timestamp.getTime();
    const diff = Math.floor((now - ts) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return { getTimeAgo, refresh };
}
