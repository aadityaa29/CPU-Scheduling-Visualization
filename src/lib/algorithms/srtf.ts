import { Process, GanttBlock } from "./types";

export const computeSRTF = (processes: Process[]): GanttBlock[] => {
  const remaining = processes.map(p => ({ ...p, left: p.burst }));
  const timeline: GanttBlock[] = [];

  let time = 0;
  let completed = 0;

  while (completed < remaining.length) {
    const available = remaining.filter(p => p.arrival <= time && p.left > 0);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.filter(p => p.left > 0).map(p => p.arrival));
      timeline.push({ pid: "IDLE", start: time, finish: nextArrival });
      time = nextArrival;
      continue;
    }

    available.sort((a, b) => a.left - b.left);
    const p = available[0];

    const last = timeline[timeline.length - 1];

    if (last && last.pid === p.pid && last.finish === time) {
      last.finish++;
    } else {
      timeline.push({ pid: p.pid, start: time, finish: time + 1 });
    }

    p.left--;
    if (p.left === 0) completed++;

    time++;
  }

  return timeline;
};
