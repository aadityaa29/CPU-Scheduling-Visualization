import { Process, GanttBlock } from "./types";

export const computeSJF = (processes: Process[]): GanttBlock[] => {
  const remaining = processes.map(p => ({ ...p }));
  const timeline: GanttBlock[] = [];

  let completed = 0;
  let time = 0;

  while (completed < remaining.length) {
    const available = remaining.filter(p => p.arrival <= time && p.burst > 0);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.filter(p => p.burst > 0).map(p => p.arrival));
      timeline.push({ pid: "IDLE", start: time, finish: nextArrival });
      time = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burst - b.burst);
    const p = available[0];

    const start = time;
    const finish = time + p.burst;

    timeline.push({ pid: p.pid, start, finish });

    time = finish;
    p.burst = 0;
    completed++;
  }

  return timeline;
};
