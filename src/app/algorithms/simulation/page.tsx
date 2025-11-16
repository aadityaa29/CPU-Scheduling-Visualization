import { Suspense } from "react";
import SimulationPageClient from "./SimulationPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading simulation...</div>}>
      <SimulationPageClient />
    </Suspense>
  );
}
