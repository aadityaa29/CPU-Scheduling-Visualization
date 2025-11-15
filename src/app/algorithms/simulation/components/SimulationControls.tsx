"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCw, Gauge } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

export default function SimulationControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  speed,
  setSpeed,
  totalDuration,
  currentTime,
}: any) {
  // Displayed speed multiplier (1x → 10x)
  const speedDisplay = (speed / 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="
        bg-slate-950/80 backdrop-blur-xl
        p-6 rounded-2xl 
        border border-slate-700/60
        shadow-[0_0_24px_rgba(0,255,255,0.08)]
        flex flex-col gap-5
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Gauge className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_6px_cyan]" />
        <h3 className="text-cyan-300 font-semibold text-lg">
          Simulation Controls
        </h3>
      </div>

      {/* Play / Pause / Reset */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={isRunning ? onPause : onStart}
          className="
            flex-1 flex items-center justify-center gap-2
            bg-gradient-to-r from-cyan-600 to-blue-600
            hover:from-cyan-500 hover:to-blue-500
            text-white font-semibold py-2 rounded-xl
            shadow-[0_0_14px_rgba(0,200,255,0.3)]
            transition-all
          "
        >
          {isRunning ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {isRunning ? "Pause" : "Start"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onReset}
          className="
            flex items-center gap-2 px-4 py-2
            bg-slate-800/50 hover:bg-slate-700/60
            text-slate-200 border border-slate-700 rounded-xl
            transition-all shadow-inner
          "
        >
          <RotateCw className="w-5 h-5 text-cyan-300" />
          Reset
        </motion.button>
      </div>

      {/* Speed Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-slate-300">Speed</label>
          <span className="text-xs text-cyan-300 font-semibold">
            {speedDisplay}x
          </span>
        </div>

        {/* FIXED SPEED LOGIC — right = fast, left = slow */}
        <Slider
          value={[speed]}
          min={100}       // slowest
          max={1000}      // fastest
          step={100}
          onValueChange={(v) => setSpeed(v[0])}
          className="cursor-pointer"
        />

        <div className="mt-1 text-[11px] text-slate-500">
          Slow ← → Fast
        </div>
      </div>

      {/* Time Display + Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Time: {currentTime}</span>
          <span>{totalDuration}</span>
        </div>

        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden border border-slate-700/40">
          <motion.div
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentTime / Math.max(totalDuration, 1)) * 100}%`,
            }}
            transition={{ ease: "linear", duration: 0.2 }}
            className="
              h-full bg-gradient-to-r from-cyan-400 to-blue-500
              shadow-[0_0_10px_rgba(0,200,255,0.5)]
            "
          />
        </div>
      </div>
    </motion.div>
  );
}
