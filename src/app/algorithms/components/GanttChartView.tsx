"use client";

import React, { useMemo, useState } from "react";
import { Process as ProcType } from "@/lib/algorithms/types";
import { motion } from "framer-motion";
import { LayoutGrid, Rows } from "lucide-react";

export default function GanttChartView({
  gantt,
  processes,
}: {
  gantt: any[];
  processes: ProcType[];
}) {
  const [view, setView] = useState<"block" | "row">("block");

  const processed = useMemo(() => {
    if (!gantt || gantt.length === 0) return [];

    const sorted = [...gantt].sort((a, b) => a.start - b.start);
    const out: any[] = [];

    for (const b of sorted) {
      if (
        out.length &&
        out[out.length - 1].pid === b.pid &&
        out[out.length - 1].finish === b.start
      ) {
        out[out.length - 1].finish = b.finish;
      } else {
        out.push({ ...b });
      }
    }

    return out;
  }, [gantt]);

  const timelineLength = useMemo(
    () => (processed.length ? processed[processed.length - 1].finish : 0),
    [processed]
  );

  if (processed.length === 0) return null;

  // Color palette
  const colors: Record<string, string> = {};
  const palette = [
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-500",
    "from-yellow-400 to-amber-500",
  ];

  let idx = 0;
  for (const p of processes) {
    if (!colors[p.pid]) {
      colors[p.pid] = palette[idx % palette.length];
      idx++;
    }
  }

  // ----------------------------
  // New View: Row-based Gantt
  // ----------------------------
  const rowView = (
    <div className="overflow-x-auto">
      <div
        className="grid gap-4"
        style={{ minWidth: `${Math.max(timelineLength * 50, 500)}px` }}
      >
        {processes.map((proc) => {
          const bars = processed.filter((g) => g.pid === proc.pid);

          return (
            <div key={proc.pid} className="w-full">
              <p className="text-xs text-slate-400 mb-1 font-medium">
                {proc.pid}
              </p>

              <div className="relative h-12 bg-slate-800/60 rounded-lg shadow-inner border border-slate-700">
                {bars.map((b, i) => {
                  const left = b.start * 50;
                  const width = (b.finish - b.start) * 50;

                  return (
                    <motion.div
                      key={i}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`
                        absolute top-1 h-10 rounded-md
                        bg-gradient-to-br ${colors[b.pid]}
                        border border-slate-900/30
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                      `}
                      style={{ left, minWidth: 40 }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold drop-shadow">
                        {b.pid}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Time ticks */}
              <div className="relative mt-1 h-5">
                {Array.from({ length: timelineLength + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute -top-0 text-[10px] text-slate-500"
                    style={{
                      left: `${(i / Math.max(1, timelineLength)) * 100}%`,
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ----------------------------
  // Original Block View
  // ----------------------------
  const blockView = (
    <div className="overflow-x-auto pb-6">
      <div
        className="relative h-20 flex items-center bg-slate-800/60 rounded-xl shadow-inner"
        style={{
          minWidth: `${Math.max(timelineLength * 50, 400)}px`,
        }}
      >
        {processed.map((b, i) => {
          const width = (b.finish - b.start) * 50;
          const pid = b.pid.toUpperCase();
          const isIdle = pid === "IDLE";

          return (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`
                h-full flex items-center justify-center text-sm font-bold border-r border-slate-900/50 relative
                ${isIdle ? "bg-slate-700/50 text-slate-400" : ""}
              `}
              style={{ minWidth: 40 }}
            >
              {!isIdle && (
                <div
                  className={`
                    absolute inset-0 bg-gradient-to-br ${colors[pid]} opacity-90 rounded-md
                  `}
                />
              )}

              <span className="relative z-10 drop-shadow-sm">
                {isIdle ? "" : pid}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* time ticks */}
      <div
        className="relative mt-3"
        style={{
          minWidth: `${Math.max(timelineLength * 50, 400)}px`,
        }}
      >
        <div className="absolute inset-0 h-px bg-slate-700/40" />

        {Array.from({ length: timelineLength + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute -top-5 text-xs text-slate-400 font-medium"
            style={{
              left: `${(i / Math.max(1, timelineLength)) * 100}%`,
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );

  // ----------------------------
  // Final Render
  // ----------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-cyan-300 text-lg font-semibold">Gantt Chart</h4>

        {/* View toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("block")}
            className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm ${
              view === "block"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Block
          </button>

          <button
            onClick={() => setView("row")}
            className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm ${
              view === "row"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <Rows className="w-4 h-4" /> Row
          </button>
        </div>
      </div>

      {view === "block" ? blockView : rowView}
    </motion.div>
  );
}
