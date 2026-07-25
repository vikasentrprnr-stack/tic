"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ChartPoint {
  date: string;
  value: number;
}

interface TickerChartProps {
  data: ChartPoint[];
  timeframe: string;
  currencyPrefix?: string;
}

export default function TickerChart({ data, timeframe, currencyPrefix = "" }: TickerChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !data || data.length === 0) {
    return <div className="h-full w-full animate-pulse bg-neutral-100 dark:bg-neutral-800/40 rounded-2xl" />;
  }

  const isDark = resolvedTheme === "dark";
  const strokeColor = "#2563eb"; // Blue-600

  return (
    <div className="h-full w-full min-h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#a3a3a3" : "#737373", fontSize: 11, fontWeight: 500 }}
            dy={8}
            minTickGap={25}
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#a3a3a3" : "#737373", fontSize: 11, fontWeight: 500 }}
            tickFormatter={(val: number) =>
              val >= 10000 ? `${(val / 1000).toFixed(1)}k` : val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1)
            }
            width={52}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const point = payload[0].payload as ChartPoint;
                return (
                  <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-4 py-2.5 rounded-xl shadow-xl border border-neutral-800 dark:border-neutral-200 text-xs font-semibold">
                    <p className="text-neutral-400 dark:text-neutral-500 font-medium mb-0.5">{point.date}</p>
                    <p className="text-sm font-bold text-rose-500 dark:text-rose-600">
                      {currencyPrefix}
                      {typeof point.value === "number"
                        ? point.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : point.value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#chartGradient)"
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}