export type Process = {
  pid: string;
  arrival: number;
  burst: number;
  priority?: number;
  quantum?: number;
};
