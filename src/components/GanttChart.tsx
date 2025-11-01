"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface GanttChartProps {
  data: {
    pid: string;
    start: number;
    finish: number;
  }[];
}

export default function GanttChart({ data }: GanttChartProps) {
  // Prepare chart data with "offset" and "duration"
  const chartData = data.map((item) => ({
    process: item.pid,
    start: item.start,
    duration: item.finish - item.start,
    finish: item.finish,
  }));

  return (
    <div className="bg-slate-900 rounded-xl p-6 shadow-lg mt-6 border border-slate-700">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4 text-center tracking-wide">
        Gantt Chart Visualization
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 40, bottom: 20, left: 80 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
          <XAxis
            type="number"
            domain={[
              0,
              Math.max(...chartData.map((p) => p.finish)) + 1,
            ]}
            tick={{ fill: "#e2e8f0" }}
            label={{
              value: "Time (units)",
              position: "insideBottom",
              offset: -5,
              fill: "#94a3b8",
            }}
          />
          <YAxis
            type="category"
            dataKey="process"
            tick={{ fill: "#e2e8f0", fontSize: 14 }}
          />

          {/* Tooltip showing detailed info */}
          <Tooltip
            formatter={(value, _, entry: any) => [
              `${value} units`,
              "Duration",
            ]}
            labelFormatter={(label: string) => `Process: ${label}`}
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              color: "#f1f5f9",
              borderRadius: "8px",
            }}
          />

          {/* Main Gantt Bar */}
          <Bar
            dataKey="duration"
            stackId="a"
            fill="#06b6d4"
            radius={[8, 8, 8, 8]}
            background={{ fill: "#1e293b" }}
            label={{
              position: "insideRight",
              formatter: (value: any) => `${value}`,
              fill: "#fff",
            }}
          >
            <LabelList
              dataKey="start"
              position="left"
              fill="#94a3b8"
              formatter={(start) => `Start: ${start}`}
            />
            <LabelList
              dataKey="finish"
              position="right"
              fill="#f1f5f9"
              formatter={(finish) => `${finish}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
