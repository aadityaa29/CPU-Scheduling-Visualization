import type { Process } from "./types";

export const computePriority = (processes: Process[]) => {
  const ready: Process[] = [];
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const result: any[] = [];
  let currentTime = 0;

  while (ready.length > 0 || sorted.length > 0) {
    while (sorted.length > 0 && sorted[0].arrival <= currentTime) {
      ready.push(sorted.shift()!);
    }
    if (ready.length === 0) {
      currentTime = sorted[0].arrival;
      continue;
    }
    ready.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    const p = ready.shift()!;
    const start = currentTime;
    const finish = start + p.burst;
    const turnaround = finish - p.arrival;
    const waiting = start - p.arrival;
    result.push({ ...p, start, finish, waiting, turnaround });
    currentTime = finish;
  }

  return result;
};
