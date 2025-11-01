import type { Process } from "./types";

export interface GanttBlock {
  pid: string;
  start: number;
  finish: number;
}

export const computeRR = (processes: Process[], quantum: number) => {
  const gantt: GanttBlock[] = [];
  const results: any[] = [];

  // Sort by arrival
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);

  const queue: Process[] = [];
  const remaining = new Map<string, number>();
  sorted.forEach((p) => remaining.set(p.pid, p.burst));

  let time = 0;
  let completed = 0;
  const n = processes.length;

  while (completed < n) {
    // Enqueue all processes that have arrived till current time
    for (const p of sorted) {
      if (p.arrival <= time && !queue.find((q) => q.pid === p.pid) && (remaining.get(p.pid) ?? 0) > 0) {
        queue.push(p);
      }
    }

    if (queue.length === 0) {
      time++;
      continue;
    }

    const current = queue.shift()!;
    const remainingTime = remaining.get(current.pid)!;
    const execTime = Math.min(quantum, remainingTime);
    const start = time;
    const finish = start + execTime;

    gantt.push({ pid: current.pid, start, finish });

    time = finish;
    remaining.set(current.pid, remainingTime - execTime);

    // Enqueue new arrivals that appeared during execution
    for (const p of sorted) {
      if (p.arrival > start && p.arrival <= finish && (remaining.get(p.pid) ?? 0) > 0 && !queue.find((q) => q.pid === p.pid)) {
        queue.push(p);
      }
    }

    // If current still has time left, push it back
    if (remaining.get(current.pid)! > 0) {
      queue.push(current);
    } else {
      completed++;
      results.push({
        pid: current.pid,
        arrival: current.arrival,
        burst: current.burst,
        finish,
        turnaround: finish - current.arrival,
        waiting: finish - current.arrival - current.burst,
      });
    }
  }

  return { results, gantt };
};
