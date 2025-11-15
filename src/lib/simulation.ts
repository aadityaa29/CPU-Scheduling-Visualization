import {
  computeFCFS,
  computeSJF,
  computeSRTF,
  computePriority,
  computeRR,
  Process,
  GanttBlock,
} from "./algorithms";

// ------------------------------------------------------------
// NORMALIZE GANTT FOR METRICS
// ------------------------------------------------------------
export function normalizeGantt(
  gantt: GanttBlock[],
  processes: Process[]
) {
  const map = new Map<
    string,
    { arrival: number; burst: number; start: number; finish: number }
  >();

  for (const b of gantt) {
    if (b.pid === "IDLE") continue;

    const original = processes.find((p) => p.pid === b.pid)!;

    if (!map.has(b.pid)) {
      map.set(b.pid, {
        arrival: original.arrival,
        burst: original.burst,
        start: b.start,
        finish: b.finish,
      });
    } else {
      const ex = map.get(b.pid)!;
      ex.finish = Math.max(ex.finish, b.finish);
    }
  }

  return [...map.entries()].map(([pid, info]) => ({
    pid,
    start: info.start,
    finish: info.finish,
    turnaround: info.finish - info.arrival,
    waiting: info.finish - info.arrival - info.burst,
  }));
}

// ------------------------------------------------------------
// CENTRALIZED SIMULATE FUNCTION (USED BY SIMULATION PAGE)
// ------------------------------------------------------------
export function simulateAlgorithm(
  processes: Process[],
  alg: string,
  quantum: number = 4
): GanttBlock[] {
  const algoKey = alg.toLowerCase();

  switch (algoKey) {
    case "fcfs":
      return computeFCFS(processes);

    case "sjf":
      return computeSJF(processes);

    case "srtf":
      return computeSRTF(processes);

    case "priority":
      return computePriority(processes);

    case "rr":
    case "round robin":
      return computeRR(processes, quantum);

    default:
      console.warn("Unknown algorithm:", algoKey);
      return [];
  }
}
