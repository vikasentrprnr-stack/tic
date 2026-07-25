"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import KpiCard, { MetricData } from "@/components/KpiCard";
import { Activity, Search, Map, Globe, X, Building2, ArrowRight } from "lucide-react";

const FX_RATES: Record<string, { rate: number; prefix: string }> = {
  "USD": { rate: 1.0, prefix: "$" },
  "EUR": { rate: 0.92, prefix: "€" },
  "GBP": { rate: 0.79, prefix: "£" },
  "INR": { rate: 83.50, prefix: "₹" },
  "JPY": { rate: 155.20, prefix: "¥" },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/macro")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data.list || []);
        setCountries(data.countries || []);
        setLoading(false);
      });
  }, []);

  // Filter by Title, Ticker, or Country
  const filteredMetrics = metrics.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Highlight Engine (Finds highest delta in current view)
  if (filteredMetrics.length > 0) {
    let maxIdx = 0;
    let maxVal = -1;
    filteredMetrics.forEach((m, idx) => {
      const val = Math.abs(parseFloat(m.delta));
      if (val > maxVal) { maxVal = val; maxIdx = idx; }
    });
    filteredMetrics.forEach((m, idx) => m.isHighlighted = idx === maxIdx);
    // Sort so highlighted is always first
    filteredMetrics.sort((a, b) => (b.isHighlighted ? 1 : 0) - (a.isHighlighted ? 1 : 0));
  }

  // Currency Converter
  const convertedMetrics = filteredMetrics.map((m) => {
    const nativeCode = (m as any).nativeCurrency || "USD";
    const nativeFx = FX_RATES[nativeCode]?.rate || 1.0;
    const targetFx = FX_RATES[targetCurrency]?.rate || 1.0;
    
    // Skip scaling math for Macro strings (like "4.20%")
    if (typeof m.value === 'string' && m.value.includes('%')) return m;

    // Apply the exact FX multiplier to BOTH the main price and the chart array
    const conversionRatio = targetFx / nativeFx;
    
    return {
      ...m,
      value: m.rawPrice * conversionRatio,
      data: m.data ? m.data.map(val => val * conversionRatio) : [],
      currencyPrefix: FX_RATES[targetCurrency]?.prefix || "$",
    };
  });

  const modalCountries = countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24">
      
      {/* Top Header Row with Currency Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Global Dashboard</h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-1">Real-time indicators for 20+ Sovereign Economies.</p>
        </div>
        
        {/* Currency Switcher (Scrollable on mobile) */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl shadow-sm w-full sm:w-auto overflow-x-auto custom-scrollbar">
          {Object.keys(FX_RATES).map((curr) => (
            <button key={curr} onClick={() => setTargetCurrency(curr)} className={`flex-1 sm:flex-none px-4 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${targetCurrency === curr ? "bg-blue-600 text-white shadow-md" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}>
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Search & Country Modal Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search indicator or country..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl sm:rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-colors" />
        </div>
        <button onClick={() => setIsExplorerOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl sm:rounded-2xl text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all">
          <Globe className="w-4 h-4" /> Browse Countries
        </button>
      </div>

      {/* Grid Engine with Device-Specific Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
          {/* Highlight Skeleton (Spans 2 columns on desktop) */}
          <div className="h-[88px] sm:h-[220px] sm:col-span-2 rounded-2xl sm:rounded-[1.25rem] bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] border border-transparent dark:border-neutral-800/50" />
          
          {/* Standard Skeletons */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-[88px] sm:h-[220px] rounded-2xl sm:rounded-[1.25rem] bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] border border-transparent dark:border-neutral-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
          {convertedMetrics.map((metric) => (
            <Link key={metric.id} href={`/ticker/${encodeURIComponent(metric.ticker)}`} className={`block outline-none active:scale-95 transition-transform sm:active:scale-100 ${metric.isHighlighted ? "sm:col-span-2" : ""}`}>
              <KpiCard metric={metric} />
            </Link>
          ))}
        </div>
      )}

      {/* Country Modal Pop-Up */}
      {isExplorerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] w-full max-w-5xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col border border-neutral-200 dark:border-neutral-800">
            <div className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-black">Select Profile</h2>
              <button onClick={() => setIsExplorerOpen(false)} className="p-2 bg-neutral-100 dark:bg-[#1a1a1a] rounded-full active:scale-90"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 custom-scrollbar">
              {modalCountries.map((c) => (
                <Link key={c.id} href={`/country/${c.id}`} className="group bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800/50 p-4 rounded-2xl active:bg-neutral-200 dark:active:bg-neutral-800 hover:border-blue-500 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.flag}</span>
                    <div>
                      <h3 className="font-bold text-sm">{c.name}</h3>
                      <p className="text-[10px] text-neutral-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.currency}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-['Poppins',sans-serif]">
      <Navbar />
      <Suspense fallback={<div className="pt-32 text-center"><Activity className="w-8 h-8 animate-spin text-blue-500 mx-auto"/></div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}