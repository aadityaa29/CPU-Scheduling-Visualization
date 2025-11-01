"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Play,
  Trash2,
  Cpu,
  Clock,
  Timer,
  Plus,
  BarChart2,
  PieChart,
  ListFilter,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- TYPES (Moved to top level) ---

type Process = {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
};

type GanttBlock = {
  pid: string;
  start: number;
  finish: number;
};

type ResultRow = GanttBlock & {
  waiting: number;
  turnaround: number;
};


// --- START: Algorithm logic with TypeScript types ---

// FCFS
const computeFCFS = (processes: Process[]): GanttBlock[] => {
  const timeline: GanttBlock[] = [];
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  sorted.forEach((p) => {
    const start = Math.max(time, p.arrival);
    if (start > time) {
      timeline.push({ pid: "IDLE", start: time, finish: start });
    }
    const end = start + p.burst;
    timeline.push({ pid: p.pid, start, finish: end });
    time = end;
  });
  return timeline;
};

// SJF (Non-Preemptive)
const computeSJF = (processes: Process[]): GanttBlock[] => {
  const timeline: GanttBlock[] = [];
  // Create a copy that we can mutate (specifically the burst time)
  const remaining = processes.map(p => ({...p})); 
  let completed = 0;
  let time = 0;
  
  while(completed < remaining.length) {
    // Find all processes that have arrived and still need to run
    const available = remaining.filter(p => p.arrival <= time && p.burst > 0);
    
    if (available.length === 0) {
        // No process is ready. Find the next process that will arrive.
        const nextArrivalProcs = remaining.filter(p => p.burst > 0);
        if (nextArrivalProcs.length === 0) break; // All done
        
        const nextArrivalTime = Math.min(...nextArrivalProcs.map(p => p.arrival));
        
        // If next process arrival is in the future, add IDLE time
        if (nextArrivalTime > time) {
            timeline.push({ pid: "IDLE", start: time, finish: nextArrivalTime });
            time = nextArrivalTime;
        } else {
            // This case should ideally not be hit if logic is correct, but as a safeguard
            time = nextArrivalTime;
        }
        continue;
    }
    
    // Sort available processes by burst time
    available.sort((a, b) => a.burst - b.burst);
    const p = available[0]; // Process with shortest burst
    
    // Find this process in the original 'remaining' list to mark it done
    const originalProcess = remaining.find(proc => proc.pid === p.pid);
    if (originalProcess) {
        const start = time;
        const end = start + originalProcess.burst; // Run for its full burst
        timeline.push({ pid: p.pid, start, finish: end });
        time = end;
        originalProcess.burst = 0; // Mark as completed
        completed++;
    }
  }
  return timeline;
};


// SRTF (Preemptive SJF)
const computeSRTF = (processes: Process[]): GanttBlock[] => {
  const timeline: GanttBlock[] = [];
  // We need to track remaining burst time separately
  const remaining: (Process & { remainingBurst: number })[] = processes.map((p) => ({ ...p, remainingBurst: p.burst }));
  let completed = 0;
  let time = 0;

  while (completed < processes.length) {
    // Find processes that have arrived and have burst time left
    const available = remaining.filter(
      (p) => p.arrival <= time && p.remainingBurst > 0
    );

    if (available.length === 0) {
      // No process available. Find next arrival time.
      let nextArrivalTime = Infinity;
      for (const p of remaining) {
        if (p.remainingBurst > 0) {
          nextArrivalTime = Math.min(nextArrivalTime, p.arrival);
        }
      }
      if (nextArrivalTime === Infinity) break; // All processes done
      
      // If idle, add IDLE block
      if (nextArrivalTime > time) {
         timeline.push({ pid: "IDLE", start: time, finish: nextArrivalTime });
         time = nextArrivalTime;
      }
      continue;
    }

    // Sort by *remaining* burst time
    available.sort((a, b) => a.remainingBurst - b.remainingBurst);
    const p = available[0]; // Shortest remaining time process

    // Check if the last entry in timeline is the same process to merge them
    const lastGantt = timeline.length > 0 ? timeline[timeline.length - 1] : null;
    if (lastGantt && lastGantt.pid === p.pid && lastGantt.finish === time) {
        lastGantt.finish++; // Extend the last block by 1 time unit
    } else {
        timeline.push({ pid: p.pid, start: time, finish: time + 1 });
    }
    
    p.remainingBurst--; // Decrement remaining time
    time++; // Increment global time
    
    if (p.remainingBurst === 0) {
        completed++; // This process is finished
    }
  }
  return timeline;
};

// Priority (Non-Preemptive)
const computePriority = (processes: Process[]): GanttBlock[] => {
  const timeline: GanttBlock[] = [];
  const remaining = processes.map(p => ({...p})); // Mutable copy
  let completed = 0;
  let time = 0;
  
  while(completed < remaining.length) {
    const available = remaining.filter(p => p.arrival <= time && p.burst > 0);
    
    if (available.length === 0) {
        const nextArrivalProcs = remaining.filter(p => p.burst > 0);
        if (nextArrivalProcs.length === 0) break;
        
        const nextArrivalTime = Math.min(...nextArrivalProcs.map(p => p.arrival));
        if (nextArrivalTime > time) {
            timeline.push({ pid: "IDLE", start: time, finish: nextArrivalTime });
            time = nextArrivalTime;
        } else {
             time = nextArrivalTime;
        }
        continue;
    }
    
    // Sort by priority (lower number = higher priority)
    available.sort((a, b) => a.priority - b.priority); 
    const p = available[0];
    
    const originalProcess = remaining.find(proc => proc.pid === p.pid);
     if (originalProcess) {
        const start = time;
        const end = start + originalProcess.burst; // Run for full burst
        timeline.push({ pid: p.pid, start, finish: end });
        time = end;
        originalProcess.burst = 0; // Mark as completed
        completed++;
     }
  }
  return timeline;
};

// Round Robin
const computeRR = (processes: Process[], quantum: number): GanttBlock[] => {
  const gantt: GanttBlock[] = [];
  const queue: Process[] = [];
  // Sort by arrival time first
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  // Map to track remaining burst time
  const remaining = new Map(sorted.map((p) => [p.pid, p.burst]));
  let time = 0;
  let completed = 0;
  let processIndex = 0; // To track new arrivals

  // Add initial processes at time 0
  while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
    queue.push(sorted[processIndex++]);
  }

  while (completed < processes.length) {
    if (queue.length === 0) {
      // If queue is empty, fast-forward time to the next process arrival
      if (processIndex < sorted.length) {
        const nextArrivalTime = sorted[processIndex].arrival;
        if (time < nextArrivalTime) {
            // Add IDLE block if there's a gap
            gantt.push({ pid: "IDLE", start: time, finish: nextArrivalTime });
            time = nextArrivalTime;
        }
        // Add all processes that have arrived by this new time
        while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
            queue.push(sorted[processIndex++]);
        }
      } else {
         // All processes have arrived, but queue is empty and not all are complete
         // This implies an error or all processes are done
         break;
      }
      continue;
    }

    const current = queue.shift();
    if (!current) break; // Should not happen, but good for type safety
    
    const remainingTime = remaining.get(current.pid);
    if (remainingTime === undefined) continue; // Process not in map, skip

    const execTime = Math.min(quantum, remainingTime); // Run for quantum or remaining time
    const start = time;
    const end = start + execTime;
    
    gantt.push({ pid: current.pid, start, finish: end });

    time = end; // Advance time
    remaining.set(current.pid, remainingTime - execTime); // Update remaining burst

    // Add new processes that arrived *during* this execution
    while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
        queue.push(sorted[processIndex++]);
    }

    // If process still has time left, add it to the *end* of the queue
    if (remaining.get(current.pid)! > 0) {
      queue.push(current);
    } else {
      completed++; // This process is finished
    }
  }
  return gantt;
};

// --- END: Algorithm logic ---


// ### CONSTANTS ###
const ALGORITHMS = ["fcfs", "sjf", "srtf", "priority", "rr"] as const;

const GANTT_COLORS = [
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
];

// ### HELPERS (from File 1) ###
const getProcessColorClass = (pid: string) => {
  if (pid === "IDLE") return "bg-slate-700/80";
  const pidNum = parseInt(String(pid).replace(/\D/g, ""), 10);
  if (isNaN(pidNum)) return GANTT_COLORS[0];
  return GANTT_COLORS[(pidNum - 1) % GANTT_COLORS.length];
};

export default function AlgorithmsPage() {
  // ### STATE (from File 1) ###
  const [processes, setProcesses] = useState<Process[]>([]);
  const [form, setForm] = useState<Process>({
    pid: "P1",
    arrival: 0,
    burst: 1,
    priority: 0,
  });
  const [algorithm, setAlgorithm] = useState<string>("fcfs");
  const [timeQuantum, setTimeQuantum] = useState<number>(2);

  const [results, setResults] = useState<ResultRow[]>([]);
  const [gantt, setGantt] = useState<GanttBlock[]>([]);
  const [avgMetrics, setAvgMetrics] = useState({ waiting: 0, turnaround: 0 });
  const [viewMode, setViewMode] = useState<"proportional" | "stacked">(
    "proportional"
  );

  // ### NEW STATE (from File 2) ###
  const [bestSuggestion, setBestSuggestion] = useState<{
    algo: string;
    waiting: number;
    turnaround: number;
  } | null>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Removed: const router = useRouter();

  // ### HANDLERS (Moved inside component) ###
  const handleSimulate = () => {
    if (processes.length === 0) {
      // Use a custom modal/alert if available, falling back to browser alert
      if (typeof alert !== 'undefined') {
        alert("Please add at least one process before simulation.");
      } else {
        console.warn("Please add at least one process before simulation.");
      }
      return;
    }

    const payload = {
      processes,
      selectedAlgorithm: algorithm,
      ...(algorithm === "rr" && { timeQuantum }),
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    // Replaced router.push with window.location.href
    if (typeof window !== 'undefined') {
      window.location.href = `/algorithms/simulation?data=${encoded}`;
    }
  };

  // ### NORMALIZER (from File 1 - More Robust) ###
  const normalizeAlgorithmOutput = (
    raw: any
  ): { results: ResultRow[]; gantt: GanttBlock[] } => {
    if (!raw) return { results: [], gantt: [] };

    // Handle object with { results: [], gantt: [] }
    if (
      typeof raw === "object" &&
      !Array.isArray(raw) &&
      (raw.results || raw.gantt)
    ) {
      const resultsArr: ResultRow[] = Array.isArray(raw.results)
        ? raw.results
        : [];
      const ganttArr: GanttBlock[] = Array.isArray(raw.gantt)
        ? raw.gantt
        : resultsArr.map((r) => ({
            pid: r.pid,
            start: r.start,
            finish: r.finish,
          }));
      return { results: resultsArr, gantt: ganttArr };
    }

    // Handle array (which our new compute functions return)
    if (Array.isArray(raw)) {
      if (raw.length === 0) return { results: [], gantt: [] };
      const first = raw[0];
      
      // Check if it's a GanttBlock array
      if ("pid" in first && "start" in first && "finish" in first) {
        const ganttArr: GanttBlock[] = raw as GanttBlock[];
        const map: Record<
          string,
          {
            arrival: number;
            burstSum: number;
            start: number;
            finish: number;
          }
        > = {};

        for (const b of ganttArr) {
          if (b.pid === "IDLE") continue; // Skip IDLE blocks for calculations

          // Find original arrival time from processes list
          const originalProcess = processes.find(p => p.pid === b.pid);

          const ex = map[b.pid] || {
            // Use original arrival time if available, otherwise estimate from start
            arrival: originalProcess ? originalProcess.arrival : Infinity,
            burstSum: 0,
            start: Infinity,
            finish: 0,
          };

          // Don't update arrival if we already have the correct one
          if (!originalProcess) {
             ex.arrival = Math.min(ex.arrival, b.start);
          }
          
          ex.start = Math.min(ex.start, b.start);
          ex.finish = Math.max(ex.finish, b.finish);
          ex.burstSum += b.finish - b.start;
          map[b.pid] = ex;
        }

        const resultsArr: ResultRow[] = Object.keys(map)
          .map((pid) => {
            const ex = map[pid];
            const originalProcess = processes.find(p => p.pid === pid);
            const originalBurst = originalProcess ? originalProcess.burst : ex.burstSum;
            
            const turnaround = ex.finish - ex.arrival;
            // Waiting time = Turnaround time - Burst time
            const waiting = turnaround - originalBurst; 
            
            return {
              pid,
              start: ex.start,
              finish: ex.finish,
              waiting: Math.max(0, waiting), // Waiting time can't be negative
              turnaround: Math.max(0, turnaround),
            };
          });
        return { results: resultsArr, gantt: ganttArr };
      }
    }

    return { results: [], gantt: [] };
  };

  // ### MEMOIZED VALUES (from File 1) ###
  const processedGantt = useMemo(() => {
    if (!gantt || gantt.length === 0) return [];
    const sorted = [...gantt].sort((a, b) => a.start - b.start);
    const final: GanttBlock[] = [];
    let last = 0;
    
    // Ensure first block starts at 0 if needed
    if (sorted.length > 0 && sorted[0].start > 0) {
      final.push({ pid: "IDLE", start: 0, finish: sorted[0].start });
      last = sorted[0].start;
    }
    
    for (const b of sorted) {
      if (b.start > last) {
        final.push({ pid: "IDLE", start: last, finish: b.start });
      }
      // Merge consecutive blocks of the same PID
      const lastFinalBlock = final.length > 0 ? final[final.length - 1] : null;
      if (lastFinalBlock && lastFinalBlock.pid === b.pid && lastFinalBlock.finish === b.start) {
          lastFinalBlock.finish = b.finish;
      } else {
          final.push({ ...b }); // Push a copy
      }
      last = Math.max(last, b.finish);
    }
    return final;
  }, [gantt, processes]); // Added processes dependency

  const stackedRows = useMemo(() => {
    const map = new Map<string, GanttBlock[]>();
    for (const b of gantt) {
       if (b.pid === "IDLE") continue; // Don't show IDLE in stacked view
      if (!map.has(b.pid)) map.set(b.pid, []);
      map.get(b.pid)!.push(b);
    }
    // Sort rows by PID number
    return Array.from(map.entries())
      .sort((a, b) => {
          const pidA = parseInt(a[0].replace('P', ''));
          const pidB = parseInt(b[0].replace('P', ''));
          if (!isNaN(pidA) && !isNaN(pidB)) {
            return pidA - pidB;
          }
          return a[0].localeCompare(b[0]); // Fallback for non-numeric PIDs
      })
      .map(([pid, blocks]) => ({
      pid,
      blocks: blocks.sort((a, b) => a.start - b.start),
    }));
  }, [gantt]);

  // ### HANDLERS (from File 1) ###
  
  // ########## FIXED handleAddProcess ##########
  const handleAddProcess = () => {
    // --- Validation ---
    if (!form.pid || form.burst <= 0 || form.arrival < 0) {
      if (typeof alert !== 'undefined') {
        alert("Please enter valid process details (PID is required, burst >= 1, arrival >= 0).");
      } else {
        console.warn("Please enter valid process details (PID is required, burst >= 1, arrival >= 0).");
      }
      return;
    }
    // Check for duplicate PID
    if (processes.find(p => p.pid === form.pid)) {
         if (typeof alert !== 'undefined') {
            alert(`Process with PID "${form.pid}" already exists. Please use a unique PID.`);
         } else {
            console.warn(`Process with PID "${form.pid}" already exists. Please use a unique PID.`);
         }
        return;
    }
    
    // --- State Update Logic ---
    
    // 1. Create the new process and the new array
    const newProcess = { ...form };
    const newProcesses = [...processes, newProcess];
    
    // 2. Set the new processes state
    setProcesses(newProcesses);
    
    // 3. Calculate next PID based on the *newProcesses* array
    const maxPidNum = newProcesses.reduce((max, p) => {
        const num = parseInt(p.pid.replace('P', ''));
        return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    
    // 4. Find the next available numeric PID
    let nextNum = maxPidNum + 1;
    while (newProcesses.find(p => p.pid === `P${nextNum}`)) {
        nextNum++;
    }
    
    // 5. Set the form to the next available PID
    setForm({ pid: `P${nextNum}`, arrival: 0, burst: 1, priority: 0 });
  };
  // #############################################


  const handleDeleteProcess = (pidToDelete: string) => {
    setProcesses((prev) =>
      prev.filter((p) => p.pid !== pidToDelete)
      // Note: Not re-indexing PIDs on delete to avoid confusion
    );
  };

  // ### MERGED `handleRun` (File 1 + File 2 Logic) ###
  const handleRun = () => {
    if (processes.length === 0) {
       if (typeof alert !== 'undefined') {
            alert("Add at least one process before running the simulation.");
       } else {
            console.warn("Add at least one process before running the simulation.");
       }
      return;
    }

    // --- 1. Run Selected Algorithm (from File 1) ---
    let raw: any = null;
    const processesCopy = JSON.parse(JSON.stringify(processes)); // Deep copy
    try {
      switch (algorithm) {
        case "fcfs":
          raw = computeFCFS(processesCopy);
          break;
        case "sjf":
          raw = computeSJF(processesCopy);
          break;
        case "srtf":
          raw = computeSRTF(processesCopy);
          break;
        case "priority":
          raw = computePriority(processesCopy);
          break;
        case "rr":
          raw = computeRR(processesCopy, timeQuantum);
          break;
      }
    } catch (err) {
      console.error(err);
      if (typeof alert !== 'undefined') {
        alert("Error running algorithm. Check console for details.");
      }
      return;
    }

    const { results: algoResults, gantt: algoGantt } =
      normalizeAlgorithmOutput(raw);
    
    // Sort results by PID number
    algoResults.sort((a, b) => {
        const pidA = parseInt(a.pid.replace('P', ''));
        const pidB = parseInt(b.pid.replace('P', ''));
        if (!isNaN(pidA) && !isNaN(pidB)) {
            return pidA - pidB;
        }
        return a.pid.localeCompare(b.pid);
    });

    setResults(algoResults);
    setGantt(algoGantt);

    if (algoResults.length > 0) {
      const totalWaiting = algoResults.reduce((a, r) => a + r.waiting, 0);
      const totalTurn = algoResults.reduce((a, r) => a + r.turnaround, 0);
      setAvgMetrics({
        waiting: totalWaiting / algoResults.length,
        turnaround: totalTurn / algoResults.length,
      });
    } else {
      setAvgMetrics({ waiting: 0, turnaround: 0 });
    }

    // --- 2. Auto-Suggestion Logic (from File 2) ---
    const comparison: { algo: string; waiting: number; turnaround: number }[] =
      [];

    for (const algo of ALGORITHMS) {
      try {
        const processesForComparison = JSON.parse(JSON.stringify(processes)); // Fresh deep copy
        let data: GanttBlock[];
        switch (algo) {
            case "fcfs":
              data = computeFCFS(processesForComparison);
              break;
            case "sjf":
              data = computeSJF(processesForComparison);
              break;
            case "srtf":
              data = computeSRTF(processesForComparison);
              break;
            case "priority":
              data = computePriority(processesForComparison);
              break;
            case "rr":
              data = computeRR(processesForComparison, timeQuantum);
              break;
            default:
              data = [];
        }

        // Use the robust normalizer from File 1
        const { results } = normalizeAlgorithmOutput(data);

        if (results.length) {
          const totalW = results.reduce((a, r) => a + r.waiting, 0);
          const totalT = results.reduce((a, r) => a + r.turnaround, 0);
          comparison.push({
            algo: algo.toUpperCase(),
            waiting: totalW / results.length,
            turnaround: totalT / results.length,
          });
        }
      } catch (err) {
        console.error(`Error running comparison for ${algo}:`, err);
      }
    }

    if (comparison.length > 0) {
      comparison.sort((a, b) =>
        a.waiting === b.waiting
          ? a.turnaround - b.turnaround
          : a.waiting - b.waiting
      );
      setBestSuggestion(comparison[0]);
      setComparisonData(comparison);
    }
  };

  // ### MERGED `handleClear` (File 1 + File 2 State) ###
  const handleClear = () => {
    setProcesses([]);
    setResults([]);
    setGantt([]);
    setAvgMetrics({ waiting: 0, turnaround: 0 });
    setForm({ pid: "P1", arrival: 0, burst: 1, priority: 0 });
    // Clear new state as well
    setBestSuggestion(null);
    setComparisonData([]);
  };

  // ### MEMOIZED VALUE (from File 1) ###
  const timelineLength = useMemo(() => {
    if (!processedGantt.length) return 0;
    return processedGantt[processedGantt.length - 1].finish;
  }, [processedGantt]);

  // --- END OF UNCHANGED LOGIC ---


  // ### STYLING (from File 1) ###
  const cardClass =
    "bg-slate-900/70 backdrop-blur-md border border-slate-700/50 shadow-xl shadow-black/20 rounded-xl";
  const inputClass =
    "bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all";
  const labelClass = "block mb-1.5 text-sm font-medium text-slate-300";


  // ### JSX LAYOUT (from File 1) ###
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 md:px-8">
      {/* Title */}
      <Button
        onClick={handleSimulate}
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold fixed top-4 right-4 z-50 rounded-lg shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105"
      >
        <Play className="w-4 h-4 mr-2" />
        Simulate in Real-Time
      </Button>

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="bg-cyan-900/50 p-3 rounded-full mb-4 border border-cyan-700/50"
        >
          <Cpu className="w-12 h-12 text-cyan-300" />
        </motion.div>
        <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          CPU Scheduling Simulator
        </h1>
        <p className="text-slate-300 mt-3 text-sm md:text-base max-w-2xl">
          Input process details, choose an algorithm, and visualize the
          results instantly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* LEFT SIDE (from File 1) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          {/* Add Process */}
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-cyan-300">
                Add Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <label className={labelClass}>Process ID</label>
                  <Input
                    value={form.pid}
                    onChange={(e) => setForm({ ...form, pid: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Arrival Time</label>
                  <Input
                    type="number"
                    value={form.arrival}
                    min={0}
                    onChange={(e) =>
                      setForm({ ...form, arrival: Math.max(0, Number(e.target.value)) })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Burst Time</label>
                  <Input
                    type="number"
                    value={form.burst}
                    min={1}
                    onChange={(e) =>
                      setForm({ ...form, burst: Math.max(1, Number(e.target.value)) })
                    }
                    className={inputClass}
                  />
                </div>
                {algorithm === "priority" && (
                  <div>
                    <label className={labelClass}>
                      Priority (lower = higher)
                    </label>
                    <Input
                      type="number"
                      value={form.priority}
                      min={0}
                      onChange={(e) =>
                        setForm({ ...form, priority: Math.max(0, Number(e.target.value)) })
                      }
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={handleAddProcess}
                className="bg-cyan-500 hover:bg-cyan-600 transition-all font-semibold w-full mt-6 rounded-md py-3 text-base"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Process
              </Button>
            </CardContent>
          </Card>

          {/* Run Section */}
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-cyan-300">
                Run Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Select Algorithm</label>
                <Select
                  onValueChange={(v: string) => setAlgorithm(v)}
                  defaultValue="fcfs"
                >
                  <SelectTrigger className={`${inputClass} h-11 text-base`}>
                    <SelectValue placeholder="Select Algorithm" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white border-slate-700 rounded-md">
                    <SelectItem value="fcfs" className="cursor-pointer h-10">FCFS</SelectItem>
                    <SelectItem value="sjf" className="cursor-pointer h-10">SJF (Non-Preemptive)</SelectItem>
                    <SelectItem value="srtf" className="cursor-pointer h-10">SJF (Preemptive)</SelectItem>
                    <SelectItem value="rr" className="cursor-pointer h-10">Round Robin</SelectItem>
                    <SelectItem value="priority" className="cursor-pointer h-10">
                      Priority (Non-Preemptive)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {algorithm === "rr" && (
                <div>
                  <label className={labelClass}>Time Quantum</label>
                  <Input
                    type="number"
                    value={timeQuantum}
                    min={1}
                    onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value)))}
                    className={`${inputClass} h-11 text-base`}
                  />
                </div>
              )}

              <Button
                onClick={handleRun}
                disabled={processes.length === 0}
                className="bg-green-600 hover:bg-green-700 transition-all flex items-center gap-2 font-semibold w-full disabled:opacity-50 rounded-md py-3 text-base"
              >
                <Play className="w-5 h-5" /> Run Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Process Queue */}
          {processes.length > 0 && (
            <Card className={cardClass}>
              <CardHeader className="flex flex-row justify-between items-center pb-4">
                <CardTitle className="text-xl font-semibold text-cyan-300">
                  Process Queue ({processes.length})
                </CardTitle>
                <Button variant="destructive" size="sm" onClick={handleClear} className="rounded-md">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Clear All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 bg-slate-800/60">
                        <TableHead className="text-slate-300">PID</TableHead>
                        <TableHead className="text-slate-300">Arrival</TableHead>
                        <TableHead className="text-slate-300">Burst</TableHead>
                        <TableHead className="text-slate-300">Priority</TableHead>
                        <TableHead className="text-slate-300 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Sort processes by PID number for display */}
                      {[...processes].sort((a, b) => {
                          const pidA = parseInt(a.pid.replace('P', ''));
                          const pidB = parseInt(b.pid.replace('P', ''));
                          if (!isNaN(pidA) && !isNaN(pidB)) {
                            return pidA - pidB;
                          }
                          return a.pid.localeCompare(b.pid);
                      }).map((p) => (
                        <TableRow
                          key={p.pid}
                          className="border-slate-800 hover:bg-slate-800/60"
                        >
                          <TableCell className="font-semibold text-white">
                            {p.pid}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {p.arrival}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {p.burst}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {p.priority}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-900/30 hover:text-red-400 rounded-md"
                              onClick={() => handleDeleteProcess(p.pid)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* RIGHT SIDE (from File 1) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-8"
        >
          {results.length > 0 ? (
            <>
              {/* Metrics (from File 1) */}
              <Card className={cardClass}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-cyan-300">
                    Performance Metrics ({algorithm.toUpperCase()})
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-800/70 rounded-lg border border-slate-700/50">
                    <Clock className="w-6 h-6 text-cyan-400 mb-2" />
                    <span className="text-slate-300 text-sm">
                      Avg Waiting Time
                    </span>
                    <span className="text-2xl font-bold text-white mt-1">
                      {avgMetrics.waiting.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-800/70 rounded-lg border border-slate-700/50">
                    <Timer className="w-6 h-6 text-cyan-400 mb-2" />
                    <span className="text-slate-300 text-sm">
                      Avg Turnaround Time
                    </span>
                    <span className="text-2xl font-bold text-white mt-1">
                      {avgMetrics.turnaround.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Gantt Chart (from File 1) */}
              <Card className={cardClass}>
                <CardHeader className="flex flex-row justify-between items-center pb-4">
                  <CardTitle className="text-xl font-semibold text-cyan-300 flex items-center gap-2.5">
                    <BarChart2 className="w-5 h-5 text-cyan-300" /> Gantt Chart
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white rounded-md"
                    onClick={() =>
                      setViewMode(
                        viewMode === "proportional" ? "stacked" : "proportional"
                      )
                    }
                  >
                    {viewMode === "proportional" ? (
                      <>
                        <PieChart className="w-4 h-4 mr-2" /> Stacked View
                      </>
                    ) : (
                      <>
                        <BarChart2 className="w-4 h-4 mr-2" /> Proportional View
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {viewMode === "proportional" ? (
                    <div className="w-full overflow-x-auto relative pt-8 pb-4">
                      <div
                        className="relative flex h-16 items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30"
                        style={{
                          minWidth: `${Math.max(timelineLength * 20, 300)}px`,
                        }}
                      >
                        {processedGantt.map((block, index) => (
                          <div
                            key={index}
                            className={`${getProcessColorClass(
                              block.pid
                            )} text-center text-sm font-semibold flex items-center justify-center border-r border-slate-900/50 text-white h-full transition-all duration-300`}
                            style={{
                              flexGrow: block.finish - block.start,
                            }}
                            title={`PID: ${block.pid} (Start: ${block.start}, Finish: ${block.finish})`}
                          >
                            {block.pid !== "IDLE" ? block.pid : ""}
                          </div>
                        ))}
                      </div>

                      <div
                        className="absolute top-2 text-xs text-slate-400 mt-1 flex justify-between"
                        style={{
                          minWidth: `${Math.max(timelineLength * 20, 300)}px`,
                        }}
                      >
                        {processedGantt.map((block, index) => (
                          <div
                            key={index}
                            className="absolute"
                            style={{
                              left: `${(block.start / timelineLength) * 100}%`,
                            }}
                          >
                            <span className="absolute -top-1 left-0.5 h-1.5 w-px bg-slate-600"></span>
                            {block.start}
                          </div>
                        ))}
                        <div
                          className="absolute"
                          style={{
                            left: "100%",
                          }}
                        >
                          <span className="absolute -top-1 left-0.5 h-1.5 w-px bg-slate-600"></span>
                          {timelineLength}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto relative pb-6">
                      <div
                        className="flex flex-col gap-2"
                        style={{
                          minWidth: `${Math.max(timelineLength * 20, 300)}px`,
                        }}
                      >
                        {stackedRows.map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="flex items-center h-8"
                          >
                            <span className="w-12 text-right text-sm text-slate-400 font-medium pr-2">
                              {row.pid}
                            </span>
                            <div
                              className="flex-1 h-full relative bg-slate-800/50 rounded-sm"
                            >
                              {row.blocks.map((b, idx) => (
                                <div
                                  key={idx}
                                  className={`${getProcessColorClass(
                                    row.pid
                                  )} h-full flex items-center justify-center text-xs font-semibold text-white border-r border-slate-900 absolute rounded-sm`}
                                  style={{
                                    left: `${(b.start / timelineLength) * 100}%`,
                                    width: `${((b.finish - b.start) / timelineLength) * 100}%`,
                                  }}
                                  title={`Start: ${b.start} End: ${b.finish}`}
                                >
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {/* Timeline for stacked */}
                        <div
                          className="flex text-xs text-slate-400 mt-2 relative h-4 ml-12"
                        >
                          {Array.from(
                            { length: timelineLength + 1 },
                            (_, i) => i
                          )
                            .filter(
                              (i) =>
                                i === 0 ||
                                i === timelineLength ||
                                (timelineLength > 20 && i % 5 === 0) ||
                                (timelineLength <= 20 && (i % 2 === 0 || timelineLength < 5))
                            )
                            .map((i) => (
                              <div
                                key={i}
                                className="absolute"
                                style={{
                                  left: `calc(${(i / timelineLength) * 100}% - 4px)`,
                                }}
                              >
                                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-px bg-slate-600"></span>
                                {i}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Table (from File 1) */}
              <Card className={cardClass}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-cyan-300 flex items-center gap-2.5">
                    <ListFilter className="w-5 h-5 text-cyan-300" /> Results
                    Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 bg-slate-800/60">
                          <TableHead className="text-slate-300">PID</TableHead>
                          <TableHead className="text-slate-300">Start</TableHead>
                          <TableHead className="text-slate-300">Finish</TableHead>
                          <TableHead className="text-slate-300">
                            Waiting
                          </TableHead>
                          <TableHead className="text-slate-300">
                            Turnaround
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((r, idx) => (
                          <TableRow
                            key={idx}
                            className="border-slate-800 hover:bg-slate-800/50 transition"
                          >
                            <TableCell className="text-white font-semibold">
                              {r.pid}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {r.start}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {r.finish}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {r.waiting}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {r.turnaround}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* ### NEW CARD: Best Algorithm (from File 2) ### */}
              {bestSuggestion && (
                <Card className={`${cardClass} border-cyan-700/60`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-cyan-300 flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-cyan-300" />
                      Suggested Best Algorithm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-4xl font-bold text-white uppercase">
                      {bestSuggestion.algo}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Based on minimum average waiting & turnaround times.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mt-4 text-slate-300">
                      <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/50">
                        <Clock className="w-5 h-5 inline-block mr-2 text-cyan-400" /> 
                        Avg Waiting:{" "}
                        <span className="font-semibold text-white text-lg">
                          {bestSuggestion.waiting.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/50">
                        <Timer className="w-5 h-5 inline-block mr-2 text-cyan-400" /> 
                        Avg Turnaround:{" "}
                        <span className="font-semibold text-white text-lg">
                          {bestSuggestion.turnaround.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ### NEW CARD: Comparison Chart (from File 2) ### */}
              {comparisonData.length > 0 && (
                <Card className={cardClass}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-cyan-300 flex items-center gap-2.5">
                      <PieChart className="w-5 h-5 text-cyan-300" />
                      Algorithm Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={comparisonData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                      >
                        <XAxis 
                            dataKey="algo" 
                            stroke="#9ca3af" 
                            fontSize={12} 
                        />
                        <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b", // bg-slate-800
                            borderColor: "#334155", // border-slate-700
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          }}
                          itemStyle={{ color: "#e2e8f0" }} // text-slate-200
                          labelStyle={{ color: "#fff", fontWeight: "bold" }}
                          cursor={{ fill: "#334155", fillOpacity: 0.5 }}
                        />
                        <Legend wrapperStyle={{ color: "#e2e8f0" }} />
                        <Bar
                          dataKey="waiting"
                          fill="#22d3ee" // cyan-400
                          name="Avg Waiting Time"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="turnaround"
                          fill="#22c55e" // green-500
                          name="Avg Turnaround Time"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${cardClass} p-8 flex flex-col items-center justify-center text-center`}
            >
                <div className="p-4 bg-slate-800/60 rounded-full border border-slate-700">
                    <ArrowRight className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                    Results will appear here
                </h3>
                <p className="mt-2 text-slate-400 max-w-xs">
                    Add processes and click "Run Analysis" to see the
                    performance metrics and Gantt chart.
                </p>
             </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

