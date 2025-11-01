"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cpu, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl"
      >
        {/* Icon + Title */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="w-16 h-16 text-blue-400" />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          CPU Scheduling Visualization Tool
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
          Experience how different CPU scheduling algorithms work through
          interactive simulations, Gantt charts, and performance comparisons.
        </p>

        {/* Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-6 text-lg font-semibold"
            onClick={() => router.push("/algorithms")}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Simulation
          </Button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-gray-400">
        © {new Date().getFullYear()} CPU Scheduler Visualizer · Built with Next.js, TypeScript, and Tailwind CSS
      </footer>
    </main>
  );
}
