import type { Process } from "./types";

export const computeSRTF = (processes: Process[]) => {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const n = sorted.length;
  const remaining = sorted.map((p) => p.burst);
  const finishTime: number[] = new Array(n).fill(0);
  const waiting: number[] = new Array(n).fill(0);
  const turnaround: number[] = new Array(n).fill(0);

  let complete = 0;
  let t = 0;
  let minm = Infinity;
  let shortest = 0;
  let check = false;

  while (complete !== n) {
    for (let j = 0; j < n; j++) {
      if (sorted[j].arrival <= t && remaining[j] < minm && remaining[j] > 0) {
        minm = remaining[j];
        shortest = j;
        check = true;
      }
    }

    if (!check) {
      t++;
      continue;
    }

    remaining[shortest]--;
    minm = remaining[shortest] === 0 ? Infinity : remaining[shortest];

    if (remaining[shortest] === 0) {
      complete++;
      check = false;
      finishTime[shortest] = t + 1;
      const wt = finishTime[shortest] - sorted[shortest].burst - sorted[shortest].arrival;
      waiting[shortest] = wt < 0 ? 0 : wt;
    }

    t++;
  }

  for (let i = 0; i < n; i++) {
    turnaround[i] = sorted[i].burst + waiting[i];
  }

  return sorted.map((p, i) => ({
    ...p,
    start: p.arrival,
    finish: finishTime[i],
    waiting: waiting[i],
    turnaround: turnaround[i],
  }));
};
