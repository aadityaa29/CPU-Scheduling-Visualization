"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";

export default function ComparisonChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        bg-slate-900/80 
        backdrop-blur-xl 
        p-6 
        rounded-2xl 
        border border-cyan-700/40 
        shadow-[0_0_25px_rgba(0,255,255,0.08)] 
        hover:shadow-[0_0_35px_rgba(0,255,255,0.15)]
        transition-all
      "
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <PieChart className="w-6 h-6 text-cyan-300" />
        <h4 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          Algorithm Comparison
        </h4>
      </div>

      {/* Chart */}
      <div className="w-full h-[340px]">
        <ResponsiveContainer>
          <BarChart
            data={data}
            barSize={32}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.15)"
            />

            <XAxis
              dataKey="algo"
              tick={{ fill: "#cbd5e1", fontSize: 13, fontWeight: 500 }}
              stroke="#64748b"
            />

            <YAxis
              tick={{ fill: "#cbd5e1", fontSize: 13 }}
              stroke="#64748b"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(51,65,85,0.5)",
                borderRadius: "10px",
                boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
                padding: "12px",
              }}
              labelStyle={{
                color: "#38bdf8",
                fontWeight: 600,
                marginBottom: 6,
              }}
              itemStyle={{
                padding: "6px 0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e2e8f0",
              }}
              formatter={(value: number, name: string) => [
                value.toFixed(2),
                name,
              ]}
            />

            <Legend
              wrapperStyle={{
                paddingTop: 12,
                color: "#e2e8f0",
                fontSize: 13,
              }}
              iconType="circle"
            />

            {/* Bars with gradients */}
            <defs>
              <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#0e7490" stopOpacity={0.4} />
              </linearGradient>

              <linearGradient id="turnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#065f46" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <Bar
              dataKey="waiting"
              name="Avg Waiting Time"
              fill="url(#waitGrad)"
              radius={[10, 10, 4, 4]}
            />

            <Bar
              dataKey="turnaround"
              name="Avg Turnaround Time"
              fill="url(#turnGrad)"
              radius={[10, 10, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
