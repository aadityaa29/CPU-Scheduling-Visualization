import { Process, GanttBlock } from "./types";

export const computeFCFS = (processes: Process[]): GanttBlock[] => {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const timeline: GanttBlock[] = [];

  let time = 0;

  for (const p of sorted) {
    const start = Math.max(time, p.arrival);

    if (start > time) {
      timeline.push({ pid: "IDLE", start: time, finish: start });
    }

    const finish = start + p.burst;
    timeline.push({ pid: p.pid, start, finish });

    time = finish;
  }

  return timeline;
};
