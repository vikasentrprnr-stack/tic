"use client";

import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  gradientId: string;
  currencyPrefix: string;
}

export default function MiniSparkline({ data, color = "#2563eb", gradientId, currencyPrefix }: SparklineProps) {
  const chartData = (data || []).map((val, i) => ({ index: i, value: val }));

  return (
    <div className="h-16 w-full mt-2 cursor-crosshair">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Tooltip 
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-xl border border-neutral-700 dark:border-neutral-200">
                    {currencyPrefix}{Number(payload[0].value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}