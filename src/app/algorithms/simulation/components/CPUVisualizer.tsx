"use client";

import { SimulationState } from "@/lib/simulation";

export default function CPUVisualizer({ state }: { state: SimulationState }) {
  return (
    <div className="text-center">
      <div className="border p-6 rounded-xl shadow-md inline-block min-w-[200px]">
        <h2 className="text-lg font-semibold">CPU (t = {state.time})</h2>
        {state.runningProcess ? (
          <p className="mt-2 text-green-600 font-bold">
            Running: P{state.runningProcess.id}
          </p>
        ) : (
          <p className="mt-2 text-gray-500">Idle</p>
        )}
      </div>
    </div>
  );
}
