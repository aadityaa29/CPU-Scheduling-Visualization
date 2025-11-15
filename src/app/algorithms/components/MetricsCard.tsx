"use client";

import React from "react";
import { Timer, Clock, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricsCard({
  algorithm,
  metrics,
}: {
  algorithm: string;
  metrics: { waiting: number; turnaround: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        bg-slate-900/80 backdrop-blur-xl 
        p-6 rounded-2xl 
        border border-cyan-700/40
        shadow-[0_0_30px_rgba(0,255,255,0.05)]
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Cpu className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]" />
        <h4 className="text-lg font-semibold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          {algorithm.toUpperCase()} — Metrics
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Avg Waiting Time */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="
            p-5 rounded-xl border border-slate-700 
            bg-slate-800/60 shadow-inner 
            flex flex-col items-center gap-2 text-center
            hover:bg-slate-800/70 transition-all
          "
        >
          <Clock className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.7)]" />
          <span className="text-slate-300 text-sm tracking-wide">
            Average Waiting Time
          </span>
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white drop-shadow"
          >
            {metrics.waiting.toFixed(2)}
          </motion.span>
        </motion.div>

        {/* Avg Turnaround Time */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="
            p-5 rounded-xl border border-slate-700 
            bg-slate-800/60 shadow-inner 
            flex flex-col items-center gap-2 text-center
            hover:bg-slate-800/70 transition-all
          "
        >
          <Timer className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.7)]" />
          <span className="text-slate-300 text-sm tracking-wide">
            Average Turnaround Time
          </span>
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white drop-shadow"
          >
            {metrics.turnaround.toFixed(2)}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
