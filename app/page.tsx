"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SupplyChainFlow from "@/components/SupplyChainFlow";
import BatchView from "@/components/BatchView";
import AdminView from "@/components/AdminView";
import BatchHistory from "@/components/BatchHistory";
import { Activity, Shield, Database } from "lucide-react";

interface Batch {
  id: string;
  timestamp: string;
  status: "Secure" | "Risk";
  hash: string;
}

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([]);

  // Fetch batches from the global store API
  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      if (data.success && data.batches) {
        // Transform to the format BatchHistory expects
        const transformed = data.batches.map((b: any) => ({
          id: b.batchId,
          timestamp: b.createdAt ? new Date(b.createdAt).toLocaleTimeString() : "—",
          status: b.status as "Secure" | "Risk",
          hash: b.txHash || "0x...",
        }));
        setBatches(transformed.slice(0, 5)); // Show only last 5
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  }, []);

  // Initial fetch and refresh every 2 seconds
  useEffect(() => {
    fetchBatches();
    const interval = setInterval(fetchBatches, 2000);
    return () => clearInterval(interval);
  }, [fetchBatches]);

  // Called when a new batch is created - triggers immediate refresh
  const handleBatchCreated = () => {
    // Small delay to allow the API to process
    setTimeout(fetchBatches, 100);
  };

  return (
    <div className="min-h-screen bg-[--medical-bg] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[--medical-border] sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[--medical-text] tracking-tight">
                MediTrace
              </h1>
              <p className="text-xs text-[--medical-text-muted] -mt-0.5">
                Supply Chain Security
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft"></span>
              <span className="text-xs font-medium text-emerald-700">
                System Online
              </span>
            </div>
            <Link
              href="/database"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors text-sm font-medium"
            >
              <Database size={16} />
              <span className="hidden sm:inline">Database</span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
              <Activity size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Blockchain + Machine Learning
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[--medical-text] tracking-tight leading-tight">
            Pharmaceutical
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Supply Chain Verification
            </span>
          </h2>
          <p className="text-lg text-[--medical-text-muted] mt-4 max-w-xl mx-auto leading-relaxed">
            Real-time risk detection and immutable audit trails for
            pharmaceutical logistics
          </p>
        </div>
      </section>

      {/* Supply Chain Visualization */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <SupplyChainFlow />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Create & History */}
          <div className="space-y-8">
            <BatchView onBatchCreated={handleBatchCreated} />
            <BatchHistory batches={batches} />
          </div>

          {/* Right: ML Insights */}
          <div>
            <AdminView />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[--medical-border] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-[--medical-text-muted]">
            <span>Next.js</span>
            <span>•</span>
            <span>Flask</span>
            <span>•</span>
            <span>Scikit-learn</span>
            <span>•</span>
            <span>Ganache</span>
          </div>
          <p className="text-sm text-[--medical-text-muted]">
            Devon Mathew
          </p>
        </div>
      </footer>
    </div>
  );
}
