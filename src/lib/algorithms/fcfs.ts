export function computeFCFS(processes: any[]) {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  const results = [];

  for (const p of sorted) {
    if (time < p.arrival) time = p.arrival;
    const start = time;
    const finish = time + p.burst;
    const turnaround = finish - p.arrival;
    const waiting = turnaround - p.burst;
    results.push({ pid: p.pid, start, finish, waiting, turnaround });
    time = finish;
  }

  return results;
}
