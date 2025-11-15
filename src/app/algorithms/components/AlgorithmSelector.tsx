"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Cpu, Timer } from "lucide-react";

type Props = {
  algorithm: string;
  onChange: (a: string) => void;
  timeQuantum: number;
  setTimeQuantum: (n: number) => void;
};

export default function AlgorithmSelector({
  algorithm,
  onChange,
  timeQuantum,
  setTimeQuantum,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-lg shadow-black/30"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-cyan-400" />
        <h3 className="text-xl font-semibold text-cyan-300">Algorithm</h3>
      </div>

      {/* Dropdown */}
      <label className="text-sm text-slate-300 mb-1 block">
        Select Scheduling Algorithm
      </label>
      <Select onValueChange={onChange} defaultValue={algorithm}>
        <SelectTrigger className="h-11 bg-slate-800/70 border-slate-700 text-slate-200 focus:ring-cyan-400 select-trigger-custom rounded-lg">
          <SelectValue placeholder="Choose algorithm" />
        </SelectTrigger>

        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200 shadow-xl rounded-lg">
          <SelectItem value="fcfs" className="cursor-pointer hover:bg-slate-800">
            FCFS
          </SelectItem>
          <SelectItem value="sjf" className="cursor-pointer hover:bg-slate-800">
            SJF (Non-preemptive)
          </SelectItem>
          <SelectItem value="srtf" className="cursor-pointer hover:bg-slate-800">
            SRTF (Preemptive)
          </SelectItem>
          <SelectItem value="rr" className="cursor-pointer hover:bg-slate-800">
            Round Robin
          </SelectItem>
          <SelectItem
            value="priority"
            className="cursor-pointer hover:bg-slate-800"
          >
            Priority (Non-preemptive)
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Time quantum input (only for RR) */}
      {algorithm === "rr" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-5 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-2"
        >
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            Time Quantum
          </label>

          <Input
            type="number"
            min={1}
            value={timeQuantum}
            onChange={(e) =>
              setTimeQuantum(Math.max(1, Number(e.target.value)))
            }
            className="bg-slate-900/60 border-slate-700 text-slate-200 focus-visible:ring-cyan-400 rounded-lg px-4"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
