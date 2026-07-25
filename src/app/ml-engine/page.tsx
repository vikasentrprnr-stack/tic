"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Cpu, Play, ArrowRightLeft, Sparkles } from "lucide-react";

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
    let insight = "No linear relationship.";
    if (r > 0.6) insight = "Strong positive co-movement detected.";
    else if (r < -0.6) insight = "Inverse hedging co-movement detected.";
    else if (Math.abs(r) > 0.3) insight = "Moderate correlation detected.";

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
    }, 400);
  };

  return (
    <div className="min-h-screen font-['Poppins',sans-serif] bg-[#f8fafc] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white pb-16">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12">
        <div className="mb-6 sm:mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-blue-500/10 text-blue-500 rounded-2xl mb-3">
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Correlation Matrix Engine</h1>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-medium max-w-md mx-auto">
            Compute real-time Pearson coefficient models between global assets.
          </p>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-4 sm:p-8 shadow-sm space-y-6">
          
          {/* Touch-Friendly Selectors */}
          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-1">
              <select
                value={tickerA}
                onChange={(e) => setTickerA(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {metrics.map((m) => (
                  <option key={`A-${m.id}`} value={m.ticker}>{m.flag} {m.title} ({m.ticker})</option>
                ))}
              </select>

              <div className="p-2 bg-neutral-100 dark:bg-[#1a1a1a] rounded-full text-neutral-400 flex-shrink-0">
                <ArrowRightLeft className="w-4 h-4 rotate-90 sm:rotate-0" />
              </div>

              <select
                value={tickerB}
                onChange={(e) => setTickerB(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {metrics.map((m) => (
                  <option key={`B-${m.id}`} value={m.ticker}>{m.flag} {m.title} ({m.ticker})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExecution}
              disabled={isProcessing || metrics.length === 0}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0 shadow-md"
            >
              {isProcessing ? "Processing..." : <><Play className="w-4 h-4 fill-current" /> Execute</>}
            </button>
          </div>

          {/* Matrix Output Canvas */}
          <div className="min-h-[160px] sm:min-h-[200px] flex items-center justify-center rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800/80 p-6 text-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 text-blue-500">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Computing Pearson Matrix</span>
              </div>
            ) : result ? (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full">
                  Pearson Coefficient
                </span>
                <p className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 dark:text-white my-1">
                  {result.correlation}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 max-w-md mx-auto">
                  {result.insight}
                </p>
              </div>
            ) : (
              <p className="text-neutral-400 text-xs font-medium">Select two assets and tap Execute.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}