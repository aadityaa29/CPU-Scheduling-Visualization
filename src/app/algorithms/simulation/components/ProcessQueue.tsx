"use client";

import { SimulationState } from "@/lib/simulation";

export default function ProcessQueue({ state }: { state: SimulationState }) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <h3 className="font-semibold">Ready Queue</h3>
        <ul className="mt-2">
          {state.readyQueue.map((p) => (
            <li key={p.id} className="text-blue-600">P{p.id}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Running</h3>
        <p className="mt-2">{state.runningProcess ? `P${state.runningProcess.id}` : "—"}</p>
      </div>
      <div>
        <h3 className="font-semibold">Completed</h3>
        <ul className="mt-2">
          {state.completed.map((p) => (
            <li key={p.id} className="text-green-600">P{p.id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
