"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

type Block = { pid: string; start: number; end: number };

export default function CPUVisualizer({
  timeline,
  currentTime,
}: {
  timeline: Block[];
  currentTime: number;
}) {
  // Auto-scroll container so camera follows current execution
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;

    const x =
      (currentTime / Math.max(1, totalTime)) * container.scrollWidth -
      container.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, x),
      behavior: "smooth",
    });
  }, [currentTime]);

  // Merge repeated blocks
  const processed = useMemo(() => {
    if (!timeline?.length) return [];

    const sorted = [...timeline].sort((a, b) => a.start - b.start);
    const merged: Block[] = [];

    for (const b of sorted) {
      if (
        merged.length &&
        merged[merged.length - 1].pid === b.pid &&
        merged[merged.length - 1].end === b.start
      ) {
        merged[merged.length - 1].end = b.end;
      } else merged.push({ ...b });
    }

    return merged;
  }, [timeline]);

  const totalTime = processed.length
    ? processed[processed.length - 1].end
    : 0;

  // PID neon color palette
  const palette = [
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-purple-500 to-fuchsia-500",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-500",
    "from-yellow-400 to-amber-500",
  ];

  const pidColors: Record<string, string> = {};
  let idx = 0;

  processed.forEach((b) => {
    if (!pidColors[b.pid] && b.pid !== "Idle") {
      pidColors[b.pid] = palette[idx % palette.length];
      idx++;
    }
  });

  if (!processed.length)
    return (
      <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-800 text-center text-slate-400">
        No Simulation Loaded
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="
        col-span-1 md:col-span-2
        bg-slate-950/80 backdrop-blur-xl
        p-6 rounded-2xl 
        border border-slate-700/60
        shadow-[0_0_35px_rgba(0,255,255,0.07)]
      "
    >
      <h4 className="text-cyan-300 text-lg font-semibold mb-4">
        CPU Live Execution
      </h4>

      {/* Scroll Container */}
      <div ref={scrollRef} className="overflow-x-auto pb-8 select-none relative">
        {/* Timeline Row */}
        <div
          className="
            relative flex items-center h-24 
            bg-slate-900/40 rounded-xl shadow-inner 
            border border-slate-700/50 overflow-visible
          "
          style={{ minWidth: `${Math.max(totalTime * 60, 500)}px` }}
        >
          {processed.map((b, i) => {
            const width = (b.end - b.start) * 60;
            const active = currentTime >= b.start && currentTime < b.end;
            const isIdle = b.pid === "Idle";

            return (
              <motion.div
                key={i}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                  type: "spring",
                }}
                className="relative h-full flex items-center justify-center"
                style={{ minWidth: 50 }}
              >
                {/* Main block background */}
                <div
                  className={`absolute inset-0 rounded-lg 
                    ${
                      isIdle
                        ? "bg-slate-700/40 border border-slate-600/40 backdrop-blur-sm"
                        : `bg-gradient-to-br ${pidColors[b.pid]}`
                    }
                    ${active ? "scale-[1.02]" : ""}
                  `}
                />

                {/* Glow effect */}
                {!isIdle && (
                  <div
                    className={`
                      absolute inset-0 opacity-40 rounded-lg 
                      bg-gradient-to-b ${pidColors[b.pid]}
                      blur-md
                    `}
                  />
                )}

                {/* Shimmer wave inside active block */}
                {active && (
                  <motion.div
                    animate={{ x: ["-20%", "120%"] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="
                      absolute top-0 bottom-0 w-10
                      bg-gradient-to-b from-white/20 to-transparent 
                      blur-md opacity-40 rounded-md pointer-events-none
                    "
                  />
                )}

                {/* PID Label */}
                <span className="relative z-10 text-white font-bold text-sm drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]">
                  {isIdle ? "IDLE" : b.pid}
                </span>

                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  whileHover={{ opacity: 1, y: 0, scale: 1 }}
                  className="
                    absolute bottom-[-42px] left-1/2 -translate-x-1/2
                    bg-slate-900/95 text-slate-200 px-3 py-1 rounded-md text-xs 
                    border border-slate-700 shadow-[0_0_12px_rgba(0,0,0,0.6)]
                    pointer-events-none whitespace-nowrap
                  "
                >
                  {b.pid}: {b.start} → {b.end}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Time Marker */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="
              absolute top-[-6px] bottom-[-6px] w-[3px]
              bg-gradient-to-b from-red-300 via-red-500 to-red-700
              shadow-[0_0_18px_rgba(255,0,0,0.9)]
              rounded-full
            "
            style={{
              left: `${(currentTime / Math.max(1, totalTime)) * 100}%`,
            }}
          />

          {/* Time Marker Trail */}
          <div
            className="
              absolute top-0 bottom-0 w-[45px] 
              bg-gradient-to-r from-red-500/20 to-transparent
              blur-md pointer-events-none
            "
            style={{
              left: `${(currentTime / Math.max(1, totalTime)) * 100}%`,
            }}
          />
        </div>

        {/* Time Ticks */}
        <div
          className="relative mt-4 text-xs text-slate-400 font-medium"
          style={{ minWidth: `${Math.max(totalTime * 60, 500)}px` }}
        >
          <div className="absolute inset-0 h-px bg-slate-700/40" />

          {Array.from({ length: totalTime + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute -top-5"
              style={{
                left: `${(i / Math.max(1, totalTime)) * 100}%`,
              }}
            >
              <span className="text-slate-400">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
