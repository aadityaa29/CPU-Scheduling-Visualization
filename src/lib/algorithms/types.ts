// lib/algorithms/types.ts

export type Process = {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
};

export type GanttBlock = {
  pid: string;
  start: number;
  finish: number;
};
