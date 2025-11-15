"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RunButtons({
  onRun,
  onClear,
  disabled,
  processes,
  algorithm,
  timeQuantum,
}: {
  onRun: () => void;
  onClear: () => void;
  disabled: boolean;
  processes: any[];
  algorithm: string;
  timeQuantum: number;
}) {

  const router = useRouter();

  const handleSimulation = () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        processes,
        selectedAlgorithm: algorithm,
        timeQuantum,
      })
    );

    router.push(`/algorithms/simulation?data=${payload}`);
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={onRun}
        disabled={disabled}
        className="bg-cyan-600 hover:bg-cyan-700"
      >
        Run Analysis
      </Button>

      <Button
        onClick={handleSimulation}
        disabled={disabled}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        Run Simulation
      </Button>

      <Button
        onClick={onClear}
        variant="destructive"
      >
        Clear
      </Button>
    </div>
  );
}
