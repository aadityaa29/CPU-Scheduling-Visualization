// src/lib/simulation.ts

export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  startTime?: number;
  completionTime?: number;
}

export interface SimulationState {
  time: number;
  readyQueue: Process[];
  runningProcess?: Process;
  completed: Process[];
}

export function initializeSimulation(processes: Process[]): SimulationState {
  return {
    time: 0,
    readyQueue: processes.sort((a, b) => a.arrivalTime - b.arrivalTime),
    runningProcess: undefined,
    completed: [],
  };
}

export function simulateStep(
  state: SimulationState,
  algorithm: "FCFS" | "SJF"
): SimulationState {
  const nextState = { ...state, time: state.time + 1 };

  // Move newly arrived processes to ready queue
  const newReady = nextState.readyQueue.filter(
    (p) => p.arrivalTime <= nextState.time && p.remainingTime > 0
  );

  if (!nextState.runningProcess && newReady.length > 0) {
    if (algorithm === "SJF")
      nextState.runningProcess = newReady.sort(
        (a, b) => a.burstTime - b.burstTime
      )[0];
    else nextState.runningProcess = newReady[0];
  }

  // Execute the running process
  if (nextState.runningProcess) {
    nextState.runningProcess.remainingTime--;
    if (nextState.runningProcess.remainingTime === 0) {
      nextState.runningProcess.completionTime = nextState.time;
      nextState.completed.push(nextState.runningProcess);
      nextState.readyQueue = nextState.readyQueue.filter(
        (p) => p.id !== nextState.runningProcess?.id
      );
      nextState.runningProcess = undefined;
    }
  }

  return nextState;
}
