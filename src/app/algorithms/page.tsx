// app/algorithms/page.tsx
"use client";

import React, { useState, useMemo } from "react";

import AddProcessForm from "./components/AddProcessForm";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessTable from "./components/ProcessTable";
import RunButtons from "./components/RunButtons";
import MetricsCard from "./components/MetricsCard";
import ResultsTable from "./components/ResultsTable";
import GanttChartView from "./components/GanttChartView";
import BestAlgorithmCard from "./components/BestAlgorithmCard";
import ComparisonChart from "./components/ComparisonChart";

import { Process as ProcType } from "@/lib/algorithms/types";
import {
  computeFCFS,
  computeSJF,
  computeSRTF,
  computePriority,
  computeRR,
} from "@/lib/algorithms";
import { normalizeGantt } from "@/lib/simulation";
import { clone } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AlgorithmsPage() {
  // -----------------------------
  // State
  // -----------------------------
  const [processes, setProcesses] = useState<ProcType[]>([]);
  const [form, setForm] = useState<ProcType>({
    pid: "P1",
    arrival: 0,
    burst: 1,
    priority: 0,
  });

  const [algorithm, setAlgorithm] = useState("fcfs");
  const [timeQuantum, setTimeQuantum] = useState(2);

  const [results, setResults] = useState<any[]>([]);
  const [gantt, setGantt] = useState<any[]>([]);
  const [avgMetrics, setAvgMetrics] = useState({ waiting: 0, turnaround: 0 });
  const [bestSuggestion, setBestSuggestion] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // -----------------------------
  // Sorted Processes
  // -----------------------------
  const sortedProcesses = useMemo(() => {
    return [...processes].sort((a, b) => {
      const na = Number(a.pid.replace(/\D/g, ""));
      const nb = Number(b.pid.replace(/\D/g, ""));
      return (na || 0) - (nb || 0);
    });
  }, [processes]);

  // -----------------------------
  // Algorithm Runner
  // -----------------------------
  const runSelectedAlgorithm = (
    algo: string,
    procs: ProcType[],
    q: number
  ) => {
    const data = clone(procs);

    switch (algo) {
      case "fcfs":
        return computeFCFS(data);
      case "sjf":
        return computeSJF(data);
      case "srtf":
        return computeSRTF(data);
      case "priority":
        return computePriority(data);
      case "rr":
        return computeRR(data, q);
      default:
        return [];
    }
  };

  // -----------------------------
  // Add Process
  // -----------------------------
  const handleAddProcess = (p: ProcType) => {
    if (processes.some((x) => x.pid === p.pid)) {
      alert(`PID ${p.pid} already exists.`);
      return;
    }

    setProcesses((prev) => [...prev, p]);

    const maxNum = Math.max(
      0,
      ...processes.map((q) => Number(q.pid.replace(/\D/g, "")) || 0)
    );

    setForm({ pid: `P${maxNum + 2}`, arrival: 0, burst: 1, priority: 0 });
  };

  // -----------------------------
  // Delete Process
  // -----------------------------
  const handleDeleteProcess = (pid: string) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
  };

  // -----------------------------
  // Clear All
  // -----------------------------
  const handleClear = () => {
    setProcesses([]);
    setResults([]);
    setGantt([]);
    setAvgMetrics({ waiting: 0, turnaround: 0 });
    setBestSuggestion(null);
    setComparisonData([]);
    setForm({ pid: "P1", arrival: 0, burst: 1, priority: 0 });
  };

  // -----------------------------
  // Run Analysis
  // -----------------------------
  const handleRun = () => {
    if (processes.length === 0) {
      alert("Add at least one process before running.");
      return;
    }

    // Main algorithm result
    const raw = runSelectedAlgorithm(algorithm, processes, timeQuantum);
    const normalized = normalizeGantt(raw, processes);

    const sortedNorm = [...normalized].sort((a, b) => {
      const na = Number(a.pid.replace(/\D/g, ""));
      const nb = Number(b.pid.replace(/\D/g, ""));
      return (na || 0) - (nb || 0);
    });

    setResults(sortedNorm);
    setGantt(raw);

    // Metrics
    if (sortedNorm.length > 0) {
      const totalW = sortedNorm.reduce((s, r) => s + r.waiting, 0);
      const totalT = sortedNorm.reduce((s, r) => s + r.turnaround, 0);

      setAvgMetrics({
        waiting: totalW / sortedNorm.length,
        turnaround: totalT / sortedNorm.length,
      });
    }

    // Comparison for all algorithms
    const all = ["fcfs", "sjf", "srtf", "priority", "rr"] as const;
    const comp: any[] = [];

    for (const a of all) {
      const rawA = runSelectedAlgorithm(a, processes, timeQuantum);
      const resA = normalizeGantt(rawA, processes);
      if (!resA.length) continue;

      const avgWait =
        resA.reduce((s, r) => s + r.waiting, 0) / resA.length;
      const avgTurn =
        resA.reduce((s, r) => s + r.turnaround, 0) / resA.length;

      comp.push({
        algo: a.toUpperCase(),
        waiting: avgWait,
        turnaround: avgTurn,
      });
    }

    comp.sort((a, b) => {
      if (a.waiting === b.waiting) return a.turnaround - b.turnaround;
      return a.waiting - b.waiting;
    });

    setComparisonData(comp);
    setBestSuggestion(comp[0] || null);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left: Controls */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-6"
        >
          <AddProcessForm
            form={form}
            setForm={setForm}
            onAdd={handleAddProcess}
            algorithm={algorithm}
          />

          <AlgorithmSelector
            algorithm={algorithm}
            onChange={setAlgorithm}
            timeQuantum={timeQuantum}
            setTimeQuantum={setTimeQuantum}
          />

          <RunButtons
            onRun={handleRun}
            onClear={handleClear}
            disabled={processes.length === 0}
            processes={processes}
            algorithm={algorithm}
            timeQuantum={timeQuantum}
          />

          {processes.length > 0 && (
            <ProcessTable
              processes={sortedProcesses}
              onDelete={handleDeleteProcess}
            />
          )}
        </motion.div>

        {/* Right: Results */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-6"
        >
          <MetricsCard algorithm={algorithm} metrics={avgMetrics} />

          {gantt.length > 0 ? (
            <>
              <GanttChartView
                gantt={gantt}
                processes={processes}
              />

              <ResultsTable results={results} />

              <BestAlgorithmCard best={bestSuggestion} />

              <ComparisonChart data={comparisonData} />
            </>
          ) : (
            <div className="bg-slate-900/60 p-10 rounded-2xl border border-slate-700/60 text-center shadow-inner shadow-black/20">
              <p className="text-slate-400 text-lg">
                Add processes & run an algorithm to see results.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
