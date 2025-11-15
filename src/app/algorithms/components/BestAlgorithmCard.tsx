"use client";

import React from "react";
import { Cpu, Clock, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function BestAlgorithmCard({
  best,
}: {
  best: { algo: string; waiting: number; turnaround: number } | null;
}) {
  if (!best) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        bg-slate-900/80 
        backdrop-blur-xl 
        rounded-2xl 
        border border-cyan-700/40 
        shadow-[0_0_25px_rgba(0,255,255,0.08)]
        hover:shadow-[0_0_35px_rgba(0,255,255,0.15)] 
        p-6
        transition-all
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Cpu className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
        <h4 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent tracking-wide">
          Suggested Best Algorithm
        </h4>
      </div>

      {/* Algorithm Badge */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="relative flex justify-center"
      >
        {/* Glow halo */}
        <div className="absolute w-40 h-40 rounded-full bg-cyan-500/20 blur-3xl -z-10"></div>

        <span
          className="
            px-8 py-3
            rounded-full 
            text-4xl 
            font-extrabold 
            bg-gradient-to-r from-cyan-500 to-blue-500 
            text-white 
            border border-cyan-400/40
            shadow-[0_4px_20px_rgba(0,200,255,0.3)]
            tracking-wide
          "
        >
          {best.algo}
        </span>
      </motion.div>

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-700/40 to-transparent" />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Waiting Time */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="
            p-5 
            bg-slate-800/60 
            rounded-xl 
            border border-slate-700 
            shadow-inner 
            flex flex-col 
            items-center 
            text-center 
            gap-2
            hover:bg-slate-800/70
            transition-all
          "
        >
          <Clock className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]" />
          <span className="text-slate-300 text-sm tracking-wide">
            Average Waiting Time
          </span>
          <span className="text-2xl font-semibold text-white">
            {best.waiting.toFixed(2)}
          </span>
        </motion.div>

        {/* Turnaround Time */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.35 }}
          className="
            p-5 
            bg-slate-800/60 
            rounded-xl 
            border border-slate-700 
            shadow-inner 
            flex flex-col 
            items-center 
            text-center 
            gap-2
            hover:bg-slate-800/70
            transition-all
          "
        >
          <Timer className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]" />
          <span className="text-slate-300 text-sm tracking-wide">
            Average Turnaround Time
          </span>
          <span className="text-2xl font-semibold text-white">
            {best.turnaround.toFixed(2)}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
