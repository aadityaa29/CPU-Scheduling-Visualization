"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import CPUVisualizer from "./components/CPUVisualizer";
import SimulationControls from "./components/SimulationControls";
import ProcessQueue from "./components/ProcessQueue";

import { simulateAlgorithm } from "@/lib/simulation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Process = {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
};

interface TimelineItem {
  pid: string;
  start: number;
  end: number;
}

export default function SimulationPageClient() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("data");

  const parsed = React.useMemo(() => {
    if (!encoded) return null;
    try {
      return JSON.parse(decodeURIComponent(encoded));
    } catch {
      return null;
    }
  }, [encoded]);

  const processes: Process[] = parsed?.processes ?? [];
  const selectedAlgorithm: string = parsed?.selectedAlgorithm ?? "fcfs";
  const timeQuantum: number = parsed?.timeQuantum ?? 4;

  // Simulation State
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --------------------------------------------------
  // BUILD TIMELINE (Single Source of Truth)
  // --------------------------------------------------
  const buildTimeline = useCallback(() => {
    try {
      const result = simulateAlgorithm(processes, selectedAlgorithm, timeQuantum);

      setTimeline(
  result.map((b) => ({
    pid: b.pid,
    start: b.start,
    end: b.finish,   // convert finish → end
  }))
);

      setCurrentTime(0);
      setIsRunning(false);

    } catch (error) {
      console.error("Error generating timeline:", error);
      setTimeline([]);
    }
  }, [processes, selectedAlgorithm, timeQuantum]);

  useEffect(() => {
    buildTimeline();
  }, [buildTimeline]);

  // --------------------------------------------------
  // PLAY CONTROLS
  // --------------------------------------------------

  const start = () => {
    if (!timeline.length) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsRunning(true);

    const totalDuration = timeline[timeline.length - 1].end;

    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;

        if (next >= totalDuration) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return totalDuration;
        }

        return next;
      });
    }, Math.max(30, 1100 - speed));
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentTime(0);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --------------------------------------------------
  // RENDER UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Card className="max-w-6xl mx-auto bg-slate-900/60 border border-slate-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-cyan-300">
            <span>CPU Scheduling Simulation</span>
            <span className="text-sm text-slate-400">
              {selectedAlgorithm.toUpperCase()}{" "}
              {selectedAlgorithm === "rr" ? `(Q=${timeQuantum})` : ""}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CPU Visual Area */}
            <CPUVisualizer
              timeline={timeline}
              currentTime={currentTime}
            />

            {/* Process Queue */}
            <ProcessQueue
              processes={processes}
              currentTime={currentTime}
            />

            {/* Controls */}
            <SimulationControls
              isRunning={isRunning}
              onStart={start}
              onPause={pause}
              onReset={reset}
              speed={speed}
              setSpeed={setSpeed}
              currentTime={currentTime}
              totalDuration={timeline.length ? timeline[timeline.length - 1].end : 0}
            />

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
