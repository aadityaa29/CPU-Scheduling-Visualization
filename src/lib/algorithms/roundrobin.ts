import { Process, GanttBlock } from "./types";

export const computeRR = (processes: Process[], quantum: number): GanttBlock[] => {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const remaining = new Map(sorted.map(p => [p.pid, p.burst]));
  const queue: Process[] = [];
  const timeline: GanttBlock[] = [];

  let time = 0;
  let i = 0;
  let done = 0;

  while (i < sorted.length && sorted[i].arrival <= time) {
    queue.push(sorted[i++]);
  }

  while (done < sorted.length) {
    if (queue.length === 0) {
      const next = sorted[i].arrival;
      if (next > time) timeline.push({ pid: "IDLE", start: time, finish: next });
      time = next;
      while (i < sorted.length && sorted[i].arrival <= time) queue.push(sorted[i++]);
      continue;
    }

    const p = queue.shift()!;
    const left = remaining.get(p.pid)!;
    const exec = Math.min(left, quantum);

    const start = time;
    const finish = time + exec;

    timeline.push({ pid: p.pid, start, finish });

    remaining.set(p.pid, left - exec);

    time = finish;

    while (i < sorted.length && sorted[i].arrival <= time) queue.push(sorted[i++]);

    if (remaining.get(p.pid)! > 0) queue.push(p);
    else done++;
  }

  return timeline;
};
