"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { ListChecks, Timer, Clock, Flag, Layers } from "lucide-react";

type ResultRow = {
  pid: string;
  start: number;
  finish: number;
  waiting: number;
  turnaround: number;
};

export default function ResultsTable({ results }: { results: ResultRow[] }) {
  if (!results || results.length === 0) return null;

  const palette = [
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-orange-400 to-red-500",
    "from-pink-500 to-rose-500",
    "from-yellow-400 to-amber-500",
  ];

  const pidColors: Record<string, string> = {};
  results.forEach((r, i) => {
    if (!pidColors[r.pid]) pidColors[r.pid] = palette[i % palette.length];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        bg-slate-950/80 backdrop-blur-xl 
        p-6 rounded-2xl 
        border border-slate-700/60
        shadow-[0_0_24px_rgba(0,255,255,0.08)]
        overflow-x-auto
      "
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <ListChecks className="w-5 h-5 text-cyan-300" />
        <h4 className="text-lg font-semibold text-cyan-300">Results</h4>
      </div>

      <div className="relative overflow-x-auto">
        {/* glow line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/40 via-blue-500/30 to-transparent" />

        <Table className="min-w-full table-auto text-slate-200">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/40">

              <TableHead className="text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  PID
                </div>
              </TableHead>

              <TableHead className="text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-slate-400" />
                  Start
                </div>
              </TableHead>

              <TableHead className="text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-slate-400" />
                  Finish
                </div>
              </TableHead>

              <TableHead className="text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-300" />
                  Waiting
                </div>
              </TableHead>

              <TableHead className="text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-300" />
                  Turnaround
                </div>
              </TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>
            {results.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="
                  group
                  transition-all
                  border-b border-slate-800/40
                  hover:bg-slate-800/50
                "
              >
                {/* PID Badge */}
                <TableCell>
                  <div
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-bold text-white
                      bg-gradient-to-br ${pidColors[r.pid]}
                      border border-slate-700/40
                      shadow-[0_0_10px_rgba(0,200,255,0.15)]
                    `}
                  >
                    {r.pid}
                  </div>
                </TableCell>

                {/* Start */}
                <TableCell className="text-slate-300 group-hover:text-cyan-300 transition-colors">
                  {r.start}
                </TableCell>

                {/* Finish */}
                <TableCell className="text-slate-300 group-hover:text-cyan-300 transition-colors">
                  {r.finish}
                </TableCell>

                {/* Waiting */}
                <TableCell>
                  <span
                    className="
                      bg-slate-800/60 px-3 py-1 rounded-lg text-sm
                      border border-slate-700/40
                      group-hover:text-emerald-300 
                      group-hover:border-emerald-600/40
                      transition-all
                    "
                  >
                    {r.waiting}
                  </span>
                </TableCell>

                {/* Turnaround */}
                <TableCell>
                  <span
                    className="
                      bg-slate-800/60 px-3 py-1 rounded-lg text-sm
                      border border-slate-700/40
                      group-hover:text-amber-300 
                      group-hover:border-amber-600/40
                      transition-all
                    "
                  >
                    {r.turnaround}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
