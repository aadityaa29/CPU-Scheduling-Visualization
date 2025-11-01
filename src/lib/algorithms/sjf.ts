export function computeSJF(processes: any[]) {
  const remaining = [...processes];
  const results = [];
  let time = 0;

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrival <= time);
    if (available.length === 0) {
      time = Math.min(...remaining.map(p => p.arrival));
      continue;
    }
    const next = available.reduce((a, b) => (a.burst < b.burst ? a : b));
    const start = time;
    const finish = time + next.burst;
    const turnaround = finish - next.arrival;
    const waiting = turnaround - next.burst;

    results.push({ pid: next.pid, start, finish, waiting, turnaround });
    time = finish;
    remaining.splice(remaining.indexOf(next), 1);
  }

  return results;
}
