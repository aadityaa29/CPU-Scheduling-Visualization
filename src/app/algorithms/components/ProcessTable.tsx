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
import { Button } from "@/components/ui/button";
import { Trash2, ListTree, ArrowRightCircle } from "lucide-react";
import { Process as ProcType } from "@/lib/algorithms/types";
import { motion } from "framer-motion";

type Props = {
  processes: ProcType[];
  onDelete: (pid: string) => void;
};

export default function ProcessTable({ processes, onDelete }: Props) {
  if (processes.length === 0) return null;

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
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <ListTree className="w-5 h-5 text-cyan-300" />
        <h4 className="text-lg font-semibold text-cyan-300">
          Process Queue ({processes.length})
        </h4>
      </div>

      {/* Table */}
      <Table className="min-w-full text-slate-200">
        <TableHeader>
          <TableRow className="border-slate-700/50 bg-slate-900/60">
            <TableHead className="text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <ArrowRightCircle className="w-4 h-4 text-cyan-400" />
                PID
              </div>
            </TableHead>

            <TableHead className="text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <ArrowRightCircle className="w-4 h-4 text-blue-400" />
                Arrival
              </div>
            </TableHead>

            <TableHead className="text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <ArrowRightCircle className="w-4 h-4 text-purple-400" />
                Burst
              </div>
            </TableHead>

            <TableHead className="text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <ArrowRightCircle className="w-4 h-4 text-amber-400" />
                Priority
              </div>
            </TableHead>

            <TableHead className="text-right text-slate-200 font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {processes.map((p, index) => (
            <motion.tr
              key={p.pid}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                group
                border-b border-slate-800/40
                hover:bg-slate-800/40 
                transition-all
              "
            >
              {/* PID */}
              <TableCell className="font-semibold">
                <span
                  className="
                    px-4 py-1.5 rounded-full
                    bg-slate-800/70 
                    border border-slate-700/50
                    text-cyan-300 text-sm
                    font-semibold
                    shadow-[0_0_12px_rgba(0,200,255,0.15)]
                  "
                >
                  {p.pid}
                </span>
              </TableCell>

              <TableCell className="text-slate-300 group-hover:text-white transition-colors">
                {p.arrival}
              </TableCell>

              <TableCell className="text-slate-300 group-hover:text-white transition-colors">
                {p.burst}
              </TableCell>

              <TableCell className="text-slate-300 group-hover:text-white transition-colors">
                {p.priority}
              </TableCell>

              {/* Delete Action */}
              <TableCell className="text-right">
                <motion.div whileHover={{ scale: 1.15 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(p.pid)}
                    className="
                      text-red-400 hover:text-red-500
                      hover:bg-red-500/10
                      transition-all
                    "
                  >
                    <Trash2 className="w-4 h-4 drop-shadow-[0_0_5px_rgba(255,0,0,0.7)]" />
                  </Button>
                </motion.div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
