"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Landmark, Coins } from "lucide-react";
import MiniSparkline from "./MiniSparkline";

export interface MetricData {
  id: string;
  ticker: string;
  title: string;
  country: string;
  flag: string;
  authority?: string;
  gdp?: string;
  perCapita?: string;
  rawPrice: number;
  value: number | string;
  delta: string;
  isPositive: boolean;
  isHighlighted?: boolean;
  data: number[];
  currencyPrefix?: string;
}

export default function KpiCard({ metric }: { metric: MetricData }) {
  const { id, title, country, flag, authority, gdp, perCapita, value, delta, isPositive, isHighlighted, data, currencyPrefix = "" } = metric;
  const strokeColor = isPositive ? "#2563eb" : "#64748b"; 

  const displayValue = typeof value === 'number' && !isNaN(value) 
    ? `${currencyPrefix}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : value;

    return (
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        className={`relative overflow-hidden transition-all flex group ${
          // MOBILE: Exact 88px list row | DESKTOP: 220px block
          "flex-row items-center justify-between p-3.5 h-[88px] rounded-2xl sm:flex-col sm:items-start sm:p-5 sm:h-[220px] sm:rounded-[1.25rem]"
        } ${
          isHighlighted 
            ? "bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 border border-blue-500/40 text-white sm:shadow-lg" 
            : "bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 sm:shadow-sm"
        }`}
      >
    
      {/* Top/Left Info */}
      <div className="flex sm:block items-center gap-3 w-full">
        <div className="flex items-center justify-between sm:mb-2 w-max sm:w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-xl">{flag}</span>
            <div className="hidden sm:block">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isHighlighted ? "text-blue-200" : "text-neutral-500"}`}>{country}</p>
              {authority && <p className={`text-[9px] font-semibold flex items-center gap-1 ${isHighlighted ? "text-blue-100/70" : "text-neutral-400"}`}><Landmark className="w-2.5 h-2.5" /> {authority}</p>}
            </div>
          </div>
          {/* Desktop Delta */}
          <span className={`hidden sm:flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            isHighlighted ? "bg-white/10 border-white/20 text-white" : isPositive ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40" : "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50"
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />} {delta}
          </span>
        </div>
        
        <div>
          <h3 className={`text-sm sm:text-base font-bold tracking-tight line-clamp-1 ${isHighlighted ? "text-white" : "text-neutral-900 dark:text-white"}`}>
            {title} <span className="hidden sm:inline text-xs font-medium opacity-60 ml-1">({metric.ticker})</span>
          </h3>
          {/* Mobile sub-text */}
          <p className={`sm:hidden text-[10px] mt-0.5 font-semibold ${isHighlighted ? "text-blue-200" : "text-neutral-500"}`}>{metric.ticker} • {country}</p>
        </div>
      </div>

      {/* Desktop GDP Stats (Hidden on Mobile) */}
      {(gdp && perCapita) && (
        <div className={`hidden sm:flex items-center gap-4 mt-2 text-[10px] font-medium ${isHighlighted ? "text-blue-100" : "text-neutral-500"}`}>
          <div className="flex flex-col"><span className="opacity-70 text-[8px] uppercase tracking-wider">GDP</span><span className="font-bold flex items-center gap-1"><Coins className="w-3 h-3"/> {gdp}</span></div>
          <div className="h-5 w-px bg-current opacity-20" />
          <div className="flex flex-col"><span className="opacity-70 text-[8px] uppercase tracking-wider">Per Capita</span><span className="font-bold">{perCapita}</span></div>
        </div>
      )}

      {/* Right/Bottom Values */}
      <div className="flex flex-col items-end sm:items-start sm:mt-auto sm:pt-2 flex-shrink-0">
        <span className={`text-base sm:text-2xl font-black tracking-tight ${isHighlighted ? "text-white" : "text-neutral-900 dark:text-white"}`}>
          {displayValue}
        </span>
        {/* Mobile Delta */}
        <span className={`sm:hidden flex items-center text-[10px] font-bold mt-1 ${isPositive ? (isHighlighted ? "text-blue-200" : "text-emerald-500") : (isHighlighted ? "text-red-200" : "text-rose-500")}`}>
          {delta}
        </span>
      </div>

      {/* Sparkline (Hidden on Mobile to keep list minimal) */}
      <div className="hidden sm:block -mx-2 -mb-3 relative z-10 w-full">
        <MiniSparkline data={data} color={isHighlighted ? "#ffffff" : strokeColor} gradientId={`spark-${id}`} currencyPrefix={currencyPrefix} />
      </div>
    </motion.div>
  );
}