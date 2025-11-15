"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Process as Proc } from "@/lib/algorithms/types";
import { Cpu, Timer, Clock, CheckCircle } from "lucide-react";

export default function ProcessQueue({
  processes,
  currentTime,
}: {
  processes: Proc[];
  currentTime: number;
}) {
  const palette = [
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-purple-500 to-indigo-500",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-500",
    "from-yellow-400 to-amber-500",
  ];

  const pidColors: Record<string, string> = {};
  processes.forEach((p, i) => {
    pidColors[p.pid] = palette[i % palette.length];
  });

  // Live execution states
  const nextProcess = useMemo(
    () => processes.find((p) => p.arrival <= currentTime),
    [processes, currentTime]
  );

  const currentExecuting = useMemo(() => {
    // We don’t know the block’s end here — the SimulationPage *MUST PASS* current process.
    // But for now:
    return nextProcess?.pid ?? null;
  }, [nextProcess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="
        bg-slate-950/70 backdrop-blur-xl 
        p-6 rounded-2xl 
        border border-slate-700/60
        shadow-[0_0_25px_rgba(0,255,255,0.05)]
      "
    >
      <h4 className="text-cyan-300 text-lg font-semibold mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-cyan-400" />
        Process Queue (Live)
      </h4>

      <div className="space-y-3">
        {processes.map((p, i) => {
          const arrived = p.arrival <= currentTime;
          const finished = currentTime >= p.arrival + p.burst;
          const active = currentExecuting === p.pid;

          return (
            <motion.div
              key={p.pid}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`
                relative p-4 rounded-xl flex items-center justify-between
                border border-slate-700/50
                shadow-inner transition-all

                ${arrived ? "bg-slate-900/50" : "bg-slate-900/20 opacity-60"}

                ${active ? "ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.3)] scale-[1.02]" : ""}
                ${finished ? "bg-emerald-900/20 border-emerald-600/40" : ""}
              `}
            >
              <div className="flex items-center gap-4">
                {/* PID Badge */}
                <motion.div
                  animate={
                    active
                      ? { scale: [1, 1.05, 1], boxShadow: "0 0 12px rgba(0,255,255,0.5)" }
                      : arrived
                      ? { opacity: 1 }
                      : { opacity: 0.6 }
                  }
                  transition={{ repeat: active ? Infinity : 0, duration: 1.2 }}
                  className={`
                    px-4 py-1.5 rounded-full text-white font-bold shadow-md 
                    border border-slate-600/40
                    bg-gradient-to-br ${pidColors[p.pid]}
                  `}
                >
                  {p.pid}
                </motion.div>

                {/* Info */}
                <div className="text-sm">
                  <div className="text-slate-200 font-medium">
                    <Clock className="inline w-4 h-4 mr-1 text-cyan-400" />
                    Arrival: <span className="text-cyan-300">{p.arrival}</span>
                  </div>

                  <div className="text-slate-300">
                    <Timer className="inline w-4 h-4 mr-1 text-green-400" />
                    Burst: <span className="text-green-300">{p.burst}</span>
                  </div>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div>
                {finished ? (
                  <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Done
                  </div>
                ) : arrived ? (
                  <div className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/40">
                    Ready
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-lg bg-slate-700/30 text-slate-400 text-xs border border-slate-600/40">
                    Waiting
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
