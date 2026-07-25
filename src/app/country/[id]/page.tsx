"use client";

import { use, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import KpiCard from "@/components/KpiCard";
import { Landmark, Activity, Newspaper, Trophy } from "lucide-react";
import Link from "next/link";

const FX_RATES: Record<string, { rate: number; prefix: string }> = {
  "USD": { rate: 1.0, prefix: "$" }, "EUR": { rate: 0.92, prefix: "€" },
  "GBP": { rate: 0.79, prefix: "£" }, "INR": { rate: 83.50, prefix: "₹" },
  "JPY": { rate: 155.20, prefix: "¥" },
};

export default function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const countryId = resolvedParams.id;
  
  const [data, setData] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [targetCurrency, setTargetCurrency] = useState("USD");

  useEffect(() => {
    fetch(`/api/macro?country=${countryId}`).then(res => res.json()).then(json => {
      setData(json);
      if (json.profile?.name) {
        fetch(`/api/news?query=${encodeURIComponent(json.profile.name + ' Economy')}`).then(r => r.json()).then(n => setNews(n));
      }
    });
  }, [countryId]);

  if (!data) return <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a]"><Navbar /><div className="flex justify-center pt-32"><Activity className="w-8 h-8 animate-spin text-blue-500" /></div></div>;

  const { profile, indicators, rankedList } = data;

  const convertedIndicators = indicators.map((m: any) => {
    const nativeCode = m.nativeCurrency || "USD";
    const conversionRatio = (FX_RATES[targetCurrency]?.rate || 1.0) / (FX_RATES[nativeCode]?.rate || 1.0);
    if (typeof m.value === 'string' && m.value.includes('%')) return m;
    
    return {
      ...m,
      value: m.rawPrice * conversionRatio,
      data: m.data ? m.data.map((val: number) => val * conversionRatio) : [],
      currencyPrefix: FX_RATES[targetCurrency]?.prefix || "$",
    };
  });

  return (
    <div className="min-h-screen font-['Poppins',sans-serif] bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white pb-24">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Main Indicators Grid */}
          <div className="xl:col-span-3 space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-[#121212] p-5 sm:p-8 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-6xl">{profile.flag}</span>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black">{profile.name}</h1>
                  <span className="text-[10px] sm:text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2.5 py-1 rounded-lg mt-1 inline-block">
                    <Landmark className="w-3 h-3 inline mr-1"/> {profile.authority} (Native: {profile.currency})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 sm:pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div><span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase">GDP</span><p className="text-lg sm:text-2xl font-black mt-0.5">{profile.gdp}</p></div>
                <div><span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase">Per Capita</span><p className="text-lg sm:text-2xl font-black mt-0.5">${profile.perCapita.toLocaleString()}</p></div>
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2"><Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /><h2 className="text-lg sm:text-xl font-black">Sovereign Indicators</h2></div>
                <div className="flex items-center gap-1 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl w-full sm:w-auto justify-between">
                  {["USD", "EUR", "GBP", "INR", "JPY"].map((curr) => (
                    <button key={curr} onClick={() => setTargetCurrency(curr)} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${targetCurrency === curr ? "bg-blue-600 text-white shadow-md" : "text-neutral-500"}`}>{curr}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {convertedIndicators.map((ind: any) => <Link key={ind.id} href={`/ticker/${encodeURIComponent(ind.ticker)}`} className="block outline-none"><KpiCard metric={ind} /></Link>)}
              </div>
            </div>

            {/* Country News Stream */}
            <div>
              <div className="flex items-center gap-2 mb-4 sm:mb-6"><Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /><h2 className="text-lg sm:text-xl font-black">{profile.name} News Stream</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {news.map((item) => (
                  <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-[#121212] p-4 rounded-[1.25rem] border border-neutral-200 dark:border-neutral-800 flex gap-3 hover:border-blue-500 transition-colors">
                    <img src={item.imageUrl} alt="News" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div><h3 className="text-xs sm:text-sm font-bold line-clamp-2">{item.headline}</h3><p className="text-[9px] text-blue-500 font-bold mt-1">{item.source}</p></div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Ranking Sidebar (Moves underneath main view on mobile/tablet) */}
          <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800"><Trophy className="w-4 h-4 text-blue-500" /><h3 className="font-bold text-xs sm:text-sm">Global GDP Per Capita Ranks</h3></div>
            <div className="space-y-1.5 max-h-[400px] xl:max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {rankedList?.map((c: any) => (
                <Link key={c.id} href={`/country/${c.id}`} className={`flex items-center justify-between p-2.5 rounded-xl transition-all border ${c.id === countryId ? "bg-blue-600 text-white" : "hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] border-transparent"}`}>
                  <div className="flex items-center gap-2.5"><span className="text-[10px] font-bold w-4">#{c.rank}</span><span>{c.flag}</span><span className="text-xs font-bold">{c.name}</span></div>
                  <span className="text-xs font-extrabold">${c.perCapita.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}