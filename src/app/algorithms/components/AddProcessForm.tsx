"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Hash, Clock, GaugeCircle, TrendingUp } from "lucide-react";
import { Process as ProcType } from "@/lib/algorithms/types";
import { motion } from "framer-motion";

type Props = {
  form: ProcType;
  setForm: (f: ProcType) => void;
  onAdd: (p: ProcType) => void;
  algorithm: string;
};

export default function AddProcessForm({ form, setForm, onAdd, algorithm }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-xl shadow-black/40"
    >
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-300">
        <Plus className="w-5 h-5 text-cyan-400" />
        Add Process
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PID */}
        <div>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1">
            <Hash className="w-4 h-4 text-cyan-400" /> PID
          </label>
          <div className="relative">
            <Input
              value={form.pid}
              onChange={(e) => setForm({ ...form, pid: e.target.value })}
              className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 focus-visible:ring-cyan-400"
            />
            <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Arrival */}
        <div>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-cyan-400" /> Arrival Time
          </label>
          <div className="relative">
            <Input
              type="number"
              value={form.arrival}
              onChange={(e) =>
                setForm({ ...form, arrival: Math.max(0, Number(e.target.value)) })
              }
              className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 focus-visible:ring-cyan-400"
            />
            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Burst */}
        <div>
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1">
            <GaugeCircle className="w-4 h-4 text-cyan-400" /> Burst Time
          </label>
          <div className="relative">
            <Input
              type="number"
              min={1}
              value={form.burst}
              onChange={(e) =>
                setForm({ ...form, burst: Math.max(1, Number(e.target.value)) })
              }
              className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 focus-visible:ring-cyan-400"
            />
            <GaugeCircle className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Priority (only for Priority Scheduling) */}
        {algorithm === "priority" && (
          <div>
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Priority
            </label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Math.max(0, Number(e.target.value)) })
                }
                className="pl-10 bg-slate-800/70 border-slate-700 text-slate-200 focus-visible:ring-cyan-400"
              />
              <TrendingUp className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={() => onAdd(form)}
        className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md shadow-cyan-500/30 rounded-xl py-3 transition-all"
      >
        <Plus className="w-5 h-5 mr-2" /> Add Process
      </Button>
    </motion.div>
  );
}
