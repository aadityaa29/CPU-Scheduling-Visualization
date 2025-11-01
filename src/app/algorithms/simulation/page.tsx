"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Play,
  Timer,
  Cpu,
  Gauge,
  BarChartHorizontal,
  Activity,
} from "lucide-react";

// --- START OF UNCHANGED LOGIC ---

interface Process {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
}

interface TimelineItem {
  pid: string;
  start: number;
  end: number;
}

// ─────────────────────────────
// Round Robin (accurate version)
// ─────────────────────────────
function simulateRoundRobin(
  processes: Process[],
  quantum: number
): TimelineItem[] {
  const gantt: TimelineItem[] = [];
  const queue: Process[] = [];
  // Sort by arrival time first, then by PID for stable order
  const sorted = [...processes].sort((a, b) => {
    if (a.arrival !== b.arrival) {
        return a.arrival - b.arrival;
    }
    return a.pid.localeCompare(b.pid);
  });
  
  const remaining = new Map(sorted.map((p) => [p.pid, p.burst]));
  let time = 0;
  let completed = 0;
  let processIndex = 0;

  // Add initial processes at time 0
  while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
    queue.push(sorted[processIndex++]);
  }

  while (completed < processes.length) {
    if (queue.length === 0) {
      // If queue is empty, fast-forward time to the next process arrival
      if (processIndex < sorted.length) {
        time = sorted[processIndex].arrival;
         // Add all processes that have arrived by this new time
        while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
            queue.push(sorted[processIndex++]);
        }
      } else {
         // Should not happen if completed < processes.length, but as a safeguard
         break;
      }
      continue;
    }

    const current = queue.shift()!;
    const remainingTime = remaining.get(current.pid)!;
    const execTime = Math.min(quantum, remainingTime);
    const start = time;
    const end = start + execTime;
    
    // Add to Gantt chart, merging if it's the same process as the last block
    const lastGantt = gantt.length > 0 ? gantt[gantt.length - 1] : null;
    if (lastGantt && lastGantt.pid === current.pid && lastGantt.end === start) {
      lastGantt.end = end;
    } else {
      gantt.push({ pid: current.pid, start, end });
    }

    time = end;
    remaining.set(current.pid, remainingTime - execTime);

    // Add new processes that arrived during this execution
    while(processIndex < sorted.length && sorted[processIndex].arrival <= time) {
        queue.push(sorted[processIndex++]);
    }

    if ((remaining.get(current.pid) ?? 0) > 0) {
      queue.push(current);
    } else {
      completed++;
    }
  }

  return gantt;
}

// ─────────────────────────────
// Other Algorithms
// ─────────────────────────────
function simulateAlgorithm(
  processes: Process[],
  algo: string,
  quantum = 4
): TimelineItem[] {
  const timeline: TimelineItem[] = [];
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;

  switch (algo.toLowerCase()) {
    case "fcfs": {
      sorted.forEach((p) => {
        const start = Math.max(time, p.arrival);
         if (start > time) {
          timeline.push({ pid: "Idle", start: time, end: start });
        }
        const end = start + p.burst;
        timeline.push({ pid: p.pid, start, end });
        time = end;
      });
      break;
    }

    case "sjf": {
      const remaining = [...sorted].map(p => ({...p}));
      let completed = 0;
      
      while(completed < remaining.length) {
        const available = remaining.filter(p => p.arrival <= time && p.burst > 0);
        
        if (available.length === 0) {
            // Find next arrival
            const nextArrival = remaining.find(p => p.burst > 0);
            if (nextArrival) {
                 const newTime = nextArrival.arrival;
                 if (newTime > time) {
                    timeline.push({ pid: "Idle", start: time, end: newTime });
                    time = newTime;
                 }
            } else {
                 break; // All done
            }
            continue;
        }
        
        available.sort((a, b) => a.burst - b.burst);
        const p = available[0];
        
        const start = time;
        const end = start + p.burst;
        timeline.push({ pid: p.pid, start, end });
        time = end;
        p.burst = 0; // Mark as completed
        completed++;
      }
      break;
    }

    case "srtf": {
      const remaining = sorted.map((p) => ({ ...p, remainingBurst: p.burst }));
      let completed = 0;

      while (completed < processes.length) {
        const available = remaining.filter(
          (p) => p.arrival <= time && p.remainingBurst > 0
        );

        if (available.length === 0) {
          // No process available, find next arriving process
          let nextArrivalTime = Infinity;
          for (const p of remaining) {
            if (p.remainingBurst > 0) {
              nextArrivalTime = Math.min(nextArrivalTime, p.arrival);
            }
          }
          
          if (nextArrivalTime === Infinity) break; // All processes done

          if (nextArrivalTime > time) {
             timeline.push({ pid: "Idle", start: time, end: nextArrivalTime });
             time = nextArrivalTime;
          }
          continue;
        }

        available.sort((a, b) => a.remainingBurst - b.remainingBurst);
        const p = available[0];

        // Check if the last entry in timeline is the same process
        const lastGantt = timeline.length > 0 ? timeline[timeline.length - 1] : null;
        if (lastGantt && lastGantt.pid === p.pid && lastGantt.end === time) {
            lastGantt.end++;
        } else {
            timeline.push({ pid: p.pid, start: time, end: time + 1 });
        }
        
        p.remainingBurst--;
        time++;
        
        if (p.remainingBurst === 0) {
            completed++;
        }
      }
      break;
    }

    case "priority": {
      const remaining = [...sorted].map(p => ({...p}));
      let completed = 0;
      
      while(completed < remaining.length) {
        const available = remaining.filter(p => p.arrival <= time && p.burst > 0);
        
        if (available.length === 0) {
            const nextArrival = remaining.find(p => p.burst > 0);
             if (nextArrival) {
                 const newTime = nextArrival.arrival;
                 if (newTime > time) {
                    timeline.push({ pid: "Idle", start: time, end: newTime });
                    time = newTime;
                 }
            } else {
                 break; 
            }
            continue;
        }
        
        available.sort((a, b) => a.priority - b.priority);
        const p = available[0];
        
        const start = time;
        const end = start + p.burst;
        timeline.push({ pid: p.pid, start, end });
        time = end;
        p.burst = 0; // Mark as completed
        completed++;
      }
      break;
    }

    case "rr": // "round robin" was renamed to "rr" in previous file
      return simulateRoundRobin(processes, quantum);
  }

  return timeline;
}

// ─────────────────────────────
// Simulation Component
// ─────────────────────────────
export default function SimulationPage() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  // Handle data parsing and provide defaults
  const {
    processes = [],
    selectedAlgorithm = "fcfs",
    timeQuantum = 4,
  } = React.useMemo(() => {
    if (!data) return {};
    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      return {
        processes: parsed.processes || [],
        selectedAlgorithm: parsed.selectedAlgorithm || "fcfs",
        timeQuantum: parsed.timeQuantum || 4,
      };
    } catch (e) {
      console.error("Failed to parse simulation data:", e);
      return {};
    }
  }, [data]);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState<string>("Idle");
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(500); // Default speed
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  const startSimulation = useCallback(() => {
    if (processes.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Use the correct algorithm name ("rr" for Round Robin)
    const algoKey = selectedAlgorithm.toLowerCase() === "round robin" ? "rr" : selectedAlgorithm.toLowerCase();
    
    const result = simulateAlgorithm(processes, algoKey, timeQuantum);
    
    if (result.length === 0) {
        console.warn("Simulation produced no timeline.");
        return;
    }

    const duration = result[result.length - 1]?.end ?? 0;
    setTimeline(result);
    setTotalDuration(duration);
    setProgress(0);
    setCurrentProcess("Idle");
    setTime(0);

    let currentTime = 0;
    setIsRunning(true);

    const tick = () => {
      currentTime++;
      setTime(currentTime);

      const running = result.find(
        (r) => currentTime > r.start && currentTime <= r.end
      );
      setCurrentProcess(running ? running.pid : "Idle");
      setProgress((currentTime / duration) * 100);

      if (currentTime >= duration) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        setCurrentProcess("Done");
        setProgress(100);
      }
    };
    
    // Invert speed logic: 1000ms is slow, 100ms is fast
    const intervalSpeed = 1100 - speed; // 1100 - 100 = 1000ms; 1100 - 1000 = 100ms
    intervalRef.current = setInterval(tick, intervalSpeed);

  }, [processes, selectedAlgorithm, timeQuantum, speed]);

  useEffect(() => {
    // Automatically start simulation on load
    startSimulation();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startSimulation]); // Re-run if startSimulation function changes

  // --- END OF UNCHANGED LOGIC ---

  // ─────────── NEW UI ───────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-10">
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 shadow-2xl shadow-cyan-900/20 rounded-2xl max-w-6xl mx-auto">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-2xl font-bold flex flex-col md:flex-row justify-between items-center text-cyan-300">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8" />
              CPU Scheduling Simulation
            </div>
            <span className="text-lg font-medium text-slate-300 mt-2 md:mt-0 px-4 py-1 bg-slate-800 rounded-full border border-slate-700">
              {selectedAlgorithm.toUpperCase()}
              {selectedAlgorithm.toLowerCase() === 'rr' && ` (Q=${timeQuantum})`}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 p-6 md:p-8">
          {/* Section 1: Readouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
              <Timer className="w-7 h-7 mx-auto mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-400">Time</p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {time}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
              <Cpu className="w-7 h-7 mx-auto mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-400">
                Current Process
              </p>
              <p className="text-3xl font-bold text-emerald-400 truncate">
                {currentProcess}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
              <Gauge className="w-7 h-7 mx-auto mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-400">Speed</p>
              <p className="text-3xl font-bold text-white">
                {((1100 - speed) / 100).toFixed(1)}x
              </p>
            </div>
          </div>

          {/* Section 2: Progress Bar */}
          <div className="w-full pt-2">
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 shadow-inner overflow-hidden">
              <motion.div
                className="bg-cyan-400 h-full rounded-full shadow-lg shadow-cyan-400/50"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>0s</span>
              <span>{totalDuration}s</span>
            </div>
          </div>

          {/* Section 3: Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-800/30 p-5 rounded-xl border border-slate-700">
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-cyan-300">
                <Gauge className="w-4 h-4 inline-block mr-2" />
                Adjust Simulation Speed
              </label>
              <Slider
                defaultValue={[1100 - speed]} // Invert value for UI
                min={100} // Fast
                max={1000} // Slow
                step={100}
                onValueCommit={(val) => setSpeed(1100 - val[0])} // Re-invert on commit
                className="
                  [&_[data-orientation='horizontal']_span]:bg-slate-700
                  [&_[data-orientation='horizontal']_span_span]:bg-cyan-400
                  [&_[role='slider']]:bg-white
                  [&_[role='slider']]:border-cyan-400
                  [&_[role='slider']]:border-2
                  [&_[role='slider']_]:shadow-lg
                  [&_[role='slider']_]:shadow-cyan-400/50
                  [&_[role='slider']:hover]:bg-cyan-100
                  [&_[role='slider']:focus-visible]:ring-cyan-300
                "
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
            <Button
              onClick={startSimulation}
              disabled={isRunning}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md shadow-cyan-500/30 rounded-lg transition-all text-base py-6 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:shadow-none"
            >
              {isRunning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Cpu className="w-5 h-5" />
                </motion.div>
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isRunning ? "Running Simulation..." : "Restart Simulation"}
            </Button>
          </div>

          {/* Section 4: Gantt Chart */}
          <div className="mt-10">
            <h3 className="font-semibold text-lg mb-4 text-cyan-300 flex items-center gap-2">
              <BarChartHorizontal className="w-5 h-5" />
              Gantt Chart
            </h3>
            <div className="w-full overflow-x-auto pb-8">
              <div className="flex flex-row items-stretch min-h-[120px] bg-slate-900/50 shadow-inner border border-slate-700 rounded-xl p-4 space-x-1">
                {timeline.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: `${(item.end - item.start) * 60}px`,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={`relative text-white text-sm font-medium rounded-md py-3 flex flex-col items-center justify-center transition-all duration-200 group ${
                      currentProcess === item.pid
                        ? "bg-cyan-500 shadow-cyan-400/50 shadow-lg animate-pulse"
                        : item.pid === "Idle"
                        ? "bg-slate-800/70"
                        : "bg-slate-700/80 hover:bg-slate-700"
                    }`}
                    style={{ minWidth: "60px" }}
                  >
                    <span className="text-lg font-bold">{item.pid}</span>
                    <span className="text-xs text-slate-200/80">
                      {item.end - item.start}s
                    </span>
                    <span className="absolute -bottom-6 text-xs text-slate-400 w-max group-hover:text-cyan-300">
                      {item.start} - {item.end}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
