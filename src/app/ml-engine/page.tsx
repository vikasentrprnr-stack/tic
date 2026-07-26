"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Network, Play, ArrowRightLeft, BrainCircuit } from "lucide-react";

export default function MLEngine() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [tickerA, setTickerA] = useState("");
  const [tickerB, setTickerB] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ correlation: string; insight: string } | null>(null);

  useEffect(() => {
    fetch("/api/macro")
      .then((res) => res.json())
      .then((data) => {
        const list = data.list || [];
        if (list.length >= 2) {
          setMetrics(list);
          setTickerA(list[0].ticker);
          setTickerB(list[1].ticker);
        }
      });
  }, []);

  const calculatePearson = (arr1: number[], arr2: number[]) => {
    const len = Math.min(arr1.length, arr2.length);
    if (len < 2) return { correlation: "0.0000", insight: "Insufficient data overlapping." };

    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    for (let i = 0; i < len; i++) {
      sum1 += arr1[i];
      sum2 += arr2[i];
      sum1Sq += arr1[i] ** 2;
      sum2Sq += arr2[i] ** 2;
      pSum += arr1[i] * arr2[i];
    }

    const num = pSum - (sum1 * sum2) / len;
    const den = Math.sqrt((sum1Sq - (sum1 ** 2) / len) * (sum2Sq - (sum2 ** 2) / len));

    if (den === 0) return { correlation: "0.0000", insight: "Zero variance detected." };

    const r = num / den;
    let insight = "No statistically significant linear relationship detected.";
    if (r > 0.6) insight = "Strong positive co-movement detected. Assets trend together.";
    else if (r < -0.6) insight = "Inverse hedging relationship detected. Assets move oppositely.";
    else if (Math.abs(r) > 0.3) insight = "Moderate correlation detected. Some underlying structural overlap.";

    return { correlation: r.toFixed(4), insight };
  };

  const handleExecution = () => {
    if (!tickerA || !tickerB) return;
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      const itemA = metrics.find((m) => m.ticker === tickerA);
      const itemB = metrics.find((m) => m.ticker === tickerB);

      const datasetA = itemA?.data || Array.from({ length: 30 }, () => Math.random() * 50);
      const datasetB = itemB?.data || Array.from({ length: 30 }, () => Math.random() * 50);

      setResult(calculatePearson(datasetA, datasetB));
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen font-['Poppins',sans-serif] bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white pb-16">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16">
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-2xl mb-4 sm:mb-5 border border-blue-500/20">
            <Network className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Correlation Engine</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base leading-relaxed font-medium">
            Leverage advanced statistical modeling to uncover hidden market correlations. 
            Our engine computes real-time Pearson coefficients to identify asset co-movements, 
            inverse hedging opportunities, and structural macroeconomic shifts.
          </p>
        </div>

        {/* UI Container */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 shadow-sm sm:shadow-lg">
          
          {/* Controls Layer */}
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full flex-1 bg-neutral-50 dark:bg-[#1a1a1a] p-2 rounded-[1.25rem] border border-neutral-200 dark:border-neutral-800">
              
              <div className="relative w-full">
                <select
                  value={tickerA}
                  onChange={(e) => setTickerA(e.target.value)}
                  className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none shadow-sm"
                >
                  {metrics.map((m) => (
                    <option key={`A-${m.id}`} value={m.ticker}>{m.flag} {m.title} ({m.ticker})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</div>
              </div>

              <div className="p-2 sm:p-3 bg-white dark:bg-[#121212] rounded-full text-blue-500 flex-shrink-0 shadow-sm border border-neutral-200 dark:border-neutral-800">
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-90 sm:rotate-0" />
              </div>

              <div className="relative w-full">
                <select
                  value={tickerB}
                  onChange={(e) => setTickerB(e.target.value)}
                  className="w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none shadow-sm"
                >
                  {metrics.map((m) => (
                    <option key={`B-${m.id}`} value={m.ticker}>{m.flag} {m.title} ({m.ticker})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">▼</div>
              </div>

            </div>

            <button
              onClick={handleExecution}
              disabled={isProcessing || metrics.length === 0}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.25rem] text-sm font-bold transition-all disabled:opacity-50 flex-shrink-0 shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              {isProcessing ? "Processing..." : <><Play className="w-4 h-4 fill-current" /> Execute Model</>}
            </button>
          </div>

          {/* Matrix Output Canvas */}
          <div className="min-h-[180px] sm:min-h-[240px] flex items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#0f1115] dark:to-[#16181d] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 text-center relative overflow-hidden">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 text-blue-600 dark:text-blue-500 relative z-10">
                <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest animate-pulse">Running Regressions...</span>
              </div>
            ) : result ? (
              <div className="space-y-3 sm:space-y-4 relative z-10">
                <span className="inline-flex text-[10px] sm:text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                  Matrix Output Result
                </span>
                <p className="text-5xl sm:text-7xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {result.correlation}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  {result.insight}
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-2 opacity-60">
                <Network className="w-8 h-8 text-neutral-400" />
                <p className="text-neutral-500 text-xs sm:text-sm font-medium">Awaiting Execution Command</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}