"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Activity, Search, ExternalLink, ChevronRight } from "lucide-react";

export default function Indicators() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    fetch("/api/macro").then(res => res.json()).then(data => { setMetrics(data.list || []); setLoading(false); });
  }, []);

  const filteredMetrics = metrics.filter(m => m.title?.toLowerCase().includes(localSearch.toLowerCase()) || m.country?.toLowerCase().includes(localSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-['Poppins',sans-serif] pb-16">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black">Indicators Database</h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-medium">Browse the full index of tracked global macroeconomic assets.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Filter database..." className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-3 sm:py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex justify-center items-center text-blue-500"><Activity className="w-8 h-8 animate-spin" /></div>
        ) : (
          <>
            {/* MOBILE VIEW: Direct Touch Links (No prices, no buttons) */}
            <div className="sm:hidden flex flex-col gap-2">
              {filteredMetrics.map(metric => (
                <Link key={metric.id} href={`/ticker/${encodeURIComponent(metric.ticker)}`} className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-transform">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{metric.flag}</span>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{metric.title}</h3>
                      <p className="text-[10px] text-neutral-500 font-bold mt-0.5">{metric.ticker} • {metric.country}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </Link>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden sm:block bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-neutral-50 dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800">
                    <tr><th className="px-6 py-4 font-bold text-xs uppercase text-neutral-500">Asset</th><th className="px-6 py-4 font-bold text-xs uppercase text-neutral-500">Country</th><th className="px-6 py-4 font-bold text-xs uppercase text-neutral-500 text-right">Value</th><th className="px-6 py-4 font-bold text-xs uppercase text-neutral-500 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {filteredMetrics.map(metric => (
                      <tr key={metric.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]">
                        <td className="px-6 py-4 font-bold"><span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md mr-2">{metric.ticker}</span>{metric.title}</td>
                        <td className="px-6 py-4">{metric.flag} {metric.country}</td>
                        <td className="px-6 py-4 text-right font-black">{typeof metric.value === 'number' ? metric.value.toLocaleString("en-US", {minimumFractionDigits: 2}) : metric.value}</td>
                        <td className="px-6 py-4 text-center"><Link href={`/ticker/${encodeURIComponent(metric.ticker)}`} className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline">Analyze <ExternalLink className="w-3 h-3 ml-1" /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}