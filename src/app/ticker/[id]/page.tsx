"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TickerChart from "@/components/TickerChart";
import { Send, Bot, Newspaper, ArrowLeft, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FX_RATES: Record<string, { rate: number; prefix: string }> = {
  "USD": { rate: 1.0, prefix: "$" }, "EUR": { rate: 0.92, prefix: "€" },
  "GBP": { rate: 0.79, prefix: "£" }, "INR": { rate: 83.50, prefix: "₹" },
  "JPY": { rate: 155.20, prefix: "¥" },
};

export default function TickerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const rawTickerId = decodeURIComponent(resolvedParams.id).replace(/^%5E/, "^");

  const [timeframe, setTimeframe] = useState("1Y");
  const [metricData, setMetricData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [targetCurrency, setTargetCurrency] = useState("USD");

  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  
  // Mobile Chat State
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingChart(true);
    fetch(`/api/macro?ticker=${encodeURIComponent(rawTickerId)}&tf=${timeframe}`)
      .then(res => res.json())
      .then((data) => {
        if (isMounted) {
          setMetricData(data);
          setLoadingChart(false);
          if (messages.length === 0) setMessages([{ role: "ai", content: `Agent initialized for ${data.title}. Ask me about macroeconomic impacts.` }]);
          fetch(`/api/news?query=${encodeURIComponent(data.title)}`).then(r => r.json()).then(n => setNewsData(Array.isArray(n) ? n : []));
        }
      });
    return () => { isMounted = false; };
  }, [rawTickerId, timeframe]);

  let displayValue = metricData?.value;
  let displayData = metricData?.fullChart || [];
  let displayPrefix = "$";

  if (metricData && typeof metricData.rawPrice === 'number') {
    const isMacro = metricData.category === 'Macro Indicator' || metricData.category === 'Central Bank Policy' || (typeof metricData.value === 'string' && metricData.value.includes('%'));
    if (!isMacro) {
      const nativeCode = metricData.nativeCurrency || "USD";
      const conversionRatio = (FX_RATES[targetCurrency]?.rate || 1.0) / (FX_RATES[nativeCode]?.rate || 1.0);
      displayValue = metricData.rawPrice * conversionRatio;
      displayPrefix = FX_RATES[targetCurrency]?.prefix || "$";
      displayData = displayData.map((d: any) => ({ ...d, value: d.value * conversionRatio }));
    } else {
      displayPrefix = "";
    }
  }

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    setMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    setIsChatting(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: chatInput, ticker: metricData?.title || rawTickerId }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } finally { setIsChatting(false); }
  };

  return (
    <div className="min-h-screen font-['Poppins',sans-serif] bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white pb-32 xl:pb-20">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Chart */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm sm:flex sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {metricData?.countryId && (
                  <Link href={`/country/${metricData.countryId}`} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md active:scale-95 transition-transform">
                    <ArrowLeft className="w-3 h-3" /> {metricData.flag} {metricData.country}
                  </Link>
                )}
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{metricData?.category || "Asset"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{metricData?.title || rawTickerId}</h1>
              <p className="text-2xl sm:text-3xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">
                {displayPrefix}{typeof displayValue === 'number' ? displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : displayValue || "..."}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-1 bg-neutral-100 dark:bg-[#1a1a1a] p-1 rounded-xl w-full sm:w-auto">
                {["USD", "EUR", "GBP", "INR", "JPY"].map((curr) => (
                  <button key={curr} onClick={() => setTargetCurrency(curr)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${targetCurrency === curr ? "bg-blue-600 text-white" : "text-neutral-500"}`}>{curr}</button>
                ))}
              </div>
              <div className="flex justify-between sm:justify-start bg-neutral-100 dark:bg-[#1a1a1a] p-1 rounded-xl w-full sm:w-auto border border-neutral-200 dark:border-neutral-800">
                {["1D", "5D", "1M", "6M", "1Y"].map((tf) => (
                  <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeframe === tf ? "bg-blue-600 text-white shadow-md" : "text-neutral-500"}`}>{tf}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[300px] sm:h-[460px] bg-white dark:bg-[#121212] rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-sm select-none">
            {loadingChart ? <div className="h-full w-full rounded-2xl bg-gradient-to-r from-neutral-100 via-neutral-200 dark:from-[#121212] dark:via-[#1a1a1a] animate-[shimmer_1.5s_infinite]" /> : <TickerChart data={displayData} timeframe={timeframe} currencyPrefix={displayPrefix} />}
          </div>

          {/* Mobile News Stream (Shows below chart on mobile) */}
          <div className="xl:hidden bg-white dark:bg-[#121212] rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Newspaper className="w-4 h-4 text-blue-500"/> Catalyst News</h3>
            <div className="space-y-3">
              {newsData.length === 0 ? <p className="text-xs text-neutral-400">Fetching...</p> : newsData.slice(0,3).map(news => (
                <a key={news.id} href={news.link} target="_blank" className="flex items-center gap-3 active:scale-95 transition-transform">
                  <img src={news.imageUrl} alt="Thumb" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400"><span className="text-blue-500">{news.source}</span><span>{news.time}</span></div>
                    <p className="text-xs font-semibold line-clamp-2">{news.headline}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Chat (Hidden on Mobile) */}
        <div className="hidden xl:flex flex-col gap-6 h-[calc(100vh-8rem)] sticky top-24">
          <div className="flex-1 flex flex-col bg-white dark:bg-[#121212] rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-neutral-50 dark:bg-[#1a1a1a]">
              <Bot className="w-5 h-5 text-blue-500" /><h3 className="font-bold text-sm">Llama 3 Agent</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 text-xs font-medium leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-md" : "bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-2xl rounded-tl-xs"}`}>{msg.content}</div>
                </div>
              ))}
              {isChatting && <div className="flex items-center gap-2 text-xs text-blue-500 font-bold animate-pulse"><Activity className="w-3 h-3 animate-spin"/> Analyzing...</div>}
            </div>
            <form onSubmit={handleChat} className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] relative">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask agent..." className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:border-blue-500" />
              <button type="submit" disabled={isChatting} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg"><Send className="w-4 h-4" /></button>
            </form>
          </div>
          <div className="h-1/3 bg-white dark:bg-[#121212] rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-neutral-50 dark:bg-[#1a1a1a]"><Newspaper className="w-4 h-4 text-blue-500" /><h3 className="font-bold text-xs">Catalyst News</h3></div>
            <div className="p-3 overflow-y-auto space-y-2">
              {newsData.map(news => (
                <a key={news.id} href={news.link} target="_blank" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors group">
                  <img src={news.imageUrl} alt="Thumb" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400"><span className="text-blue-500">{news.source}</span><span>{news.time}</span></div>
                    <p className="text-xs font-semibold line-clamp-2 group-hover:text-blue-500 transition-colors">{news.headline}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY AI CHAT POPUP */}
      <div className={`xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-neutral-200 dark:border-neutral-800 transition-all duration-300 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] rounded-t-3xl pb-safe flex flex-col ${isMobileChatOpen ? 'h-[75vh]' : 'h-auto'}`}>
        
        {/* Expanded Chat History */}
        <AnimatePresence>
          {isMobileChatOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-blue-500"/><span className="text-xs font-bold">Llama 3 Agent</span></div>
                <button onClick={() => setIsMobileChatOpen(false)} className="p-1.5 bg-neutral-100 dark:bg-[#1a1a1a] rounded-full"><X className="w-4 h-4"/></button>
              </div>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 text-xs font-medium ${msg.role === "user" ? "bg-blue-600 text-white rounded-2xl rounded-tr-xs" : "bg-neutral-100 dark:bg-[#1a1a1a] rounded-2xl rounded-tl-xs"}`}>{msg.content}</div>
                </div>
              ))}
              {isChatting && <div className="text-xs text-blue-500 font-bold animate-pulse">Analyzing...</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always-Visible Input Field */}
        <form onSubmit={handleChat} className="p-3 sm:p-4">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput} 
              onFocus={() => setIsMobileChatOpen(true)}
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder={`Ask agent about ${metricData?.title || rawTickerId}...`} 
              className="w-full bg-neutral-100 dark:bg-[#1a1a1a] border border-transparent rounded-2xl pl-4 pr-12 py-3.5 text-xs font-medium focus:outline-none focus:border-blue-500" 
            />
            <button type="submit" disabled={isChatting} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}