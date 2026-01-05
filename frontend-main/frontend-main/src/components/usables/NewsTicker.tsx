import { useEffect, useState } from "react";
import type { NewsItem, NewsResponse, NewsType } from "@/types";
import { useLocation } from "react-router-dom";
import { service } from "@/services";
import { useToast } from "@/contexts/ToastProvider";
import { useNews } from "@/contexts/NewsProvider";

export default function NewsTicker() {
  const { pathname } = useLocation();
  const { newsData, loading, reloadNews } = useNews();

  const [news, setNews] = useState<NewsItem[]>([]);
  

  useEffect(() => {
    const fetchNews = () => {
      const data: NewsItem[] = [
        { country: "Madagascar", score: 8.5, value: 6372 },
        { country: "Tanzania", score: 8.5, value: 6372 },
        { country: "Kenya", score: 8.5, value: 6372 },
        { country: "Ghana", score: 8.5, value: 6372 },
        { country: "Senegal", score: 8.5, value: 6372 },
      ];
      setNews(data);
    };

    fetchNews();
  }, []);
  
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
    <div className={`relative w-full h-10 overflow-hidden ${layoutColor} text-white flex items-center rounded-md`}>
        <p className={`${layoutColor} z-40 p-3 text-sm`}>News |</p>
        {/* Scrolling marquee line */}
        <div className="absolute left-20 -translate-y-1/2 w-fit whitespace-nowrap flex gap-10 animate-marquee py-1.5">
            {
              Object.entries(newsData??{}).map(([outerKey, list]: [string, NewsType[]]) => (
                <div className="flex items-center gap-2 text-sm" key={outerKey}>
                  <div className="text-white bg-yellow-500 p-3">{outerKey.toUpperCase()}</div>
                  {list.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="font-light">{item.key}</span>
                        <span className="opacity-80">{item.value_1}</span>
                        <span className="text-yellow-400 text-xs">▲</span>
                        <span className="opacity-80">{item.value_2}</span>
                    </div>
                  ))}
                  <div className="text-white bg-yellow-500 p-3">{outerKey.toUpperCase()}</div>
                </div>
              ))
            }
            {/* {[...news, ...news].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
                <span className="font-light">{item.country}</span>
                <span className="opacity-80">{item.score.toFixed(2)}</span>
                <span className="text-yellow-400 text-xs">▲</span>
                <span className="opacity-80">{item.value}</span>
            </div>
            ))} */}
        </div>
    </div>
  );
}
