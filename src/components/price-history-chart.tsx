"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { formatISTDateTime } from "@/lib/format-date";

type PriceHistoryItem = {
  id: string;
  price: number;
  createdAt: Date | string;
};

type PriceHistoryChartProps = {
  history: PriceHistoryItem[];
};

export default function PriceHistoryChart({
  history,
}: PriceHistoryChartProps) {
  const chartData = [...history]
    .reverse()
    .map((item) => ({
      time: formatISTDateTime(item.createdAt),
      price: item.price,
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-6 text-center">
        <p className="text-xs font-medium text-[#6b7280]">No price history available for chart yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-[#1f2937] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Price Trend Analytics</h2>
          <p className="text-xs text-[#9ca3af]">Historical price changes over time</p>
        </div>
        <span className="rounded bg-[#06b6d4]/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-[#06b6d4] border border-[#06b6d4]/20">
          {chartData.length} data logs
        </span>
      </div>

      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              minTickGap={30}
              stroke="#273142"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              domain={["auto", "auto"]}
              stroke="#273142"
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0f19",
                borderColor: "#1f2937",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#06b6d4" }}
              formatter={(value: any) => [`₹${value}`, "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 3, fill: "#06b6d4", strokeWidth: 1, stroke: "#0b0f19" }}
              activeDot={{ r: 5, fill: "#22c55e", stroke: "#000000", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}