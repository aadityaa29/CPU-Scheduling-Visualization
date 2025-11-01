"use client";

interface Props {
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  speed: number;
  setSpeed: (val: number) => void;
  algorithm: "FCFS" | "SJF";
  setAlgorithm: (val: "FCFS" | "SJF") => void;
}

export default function SimulationControls({
  isRunning,
  setIsRunning,
  speed,
  setSpeed,
  algorithm,
  setAlgorithm,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {isRunning ? "Pause" : "Play"}
      </button>

      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Reset
      </button>

      <label className="flex items-center gap-2">
        Speed:
        <input
          type="range"
          min={100}
          max={1500}
          step={100}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </label>

      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value as "FCFS" | "SJF")}
        className="px-3 py-2 border rounded-lg"
      >
        <option value="FCFS">FCFS</option>
        <option value="SJF">SJF</option>
      </select>
    </div>
  );
}
