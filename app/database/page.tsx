"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Database,
    RefreshCw,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Hash,
    Thermometer,
    Activity,
} from "lucide-react";

interface BatchRecord {
    _id: string;
    batchId: string;
    data: {
        temperature_avg: number;
        vibration_shock: number;
        route_efficiency: number;
    };
    mlResult: {
        status: string;
        risk_score: number;
    };
    txHash: string;
    status: string;
    createdAt: string;
}

export default function DatabasePage() {
    const [batches, setBatches] = useState<BatchRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchBatches = async () => {
        try {
            const res = await fetch("/api/batches");
            const data = await res.json();
            if (data.success) {
                setBatches(data.batches);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();

        if (autoRefresh) {
            const interval = setInterval(fetchBatches, 3000); // Refresh every 3 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return (
        <div className="min-h-screen bg-[--medical-bg]">
            {/* Header */}
            <header className="bg-white border-b border-[--medical-border] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-[--medical-text-muted] hover:text-[--medical-text] transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-sm font-medium">Back to Dashboard</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${autoRefresh
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            <RefreshCw
                                size={14}
                                className={autoRefresh ? "animate-spin" : ""}
                            />
                            {autoRefresh ? "Live" : "Paused"}
                        </button>
                        <button
                            onClick={fetchBatches}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-medium transition-colors"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white">
                            <Database size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[--medical-text]">
                                Database Viewer
                            </h1>
                            <p className="text-sm text-[--medical-text-muted]">
                                Real-time view of all batch records
                            </p>
                        </div>
                    </div>
                    {lastUpdated && (
                        <p className="text-xs text-[--medical-text-muted] flex items-center gap-1 mt-2">
                            <Clock size={12} />
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="medical-card p-4">
                        <p className="text-sm text-[--medical-text-muted]">Total Records</p>
                        <p className="text-2xl font-bold text-[--medical-text]">
                            {batches.length}
                        </p>
                    </div>
                    <div className="medical-card p-4">
                        <p className="text-sm text-[--medical-text-muted]">Verified</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {batches.filter((b) => b.status === "Secure").length}
                        </p>
                    </div>
                    <div className="medical-card p-4">
                        <p className="text-sm text-[--medical-text-muted]">At Risk</p>
                        <p className="text-2xl font-bold text-red-600">
                            {batches.filter((b) => b.status === "Risk").length}
                        </p>
                    </div>
                    <div className="medical-card p-4">
                        <p className="text-sm text-[--medical-text-muted]">
                            Avg Temperature
                        </p>
                        <p className="text-2xl font-bold text-teal-600">
                            {batches.length > 0
                                ? (
                                    batches.reduce(
                                        (acc, b) => acc + (b.data?.temperature_avg || 0),
                                        0
                                    ) / batches.length
                                ).toFixed(1)
                                : "—"}
                            °C
                        </p>
                    </div>
                </div>

                {/* Data Table */}
                <div className="medical-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[--medical-border] bg-slate-50">
                        <h2 className="font-semibold text-[--medical-text]">
                            Batch Records
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-[--medical-text-muted]">
                            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                            Loading records...
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="p-12 text-center text-[--medical-text-muted]">
                            <Database size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No records yet</p>
                            <p className="text-sm mt-1">
                                Create a batch from the dashboard to see data here
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-xs font-semibold text-[--medical-text-muted] uppercase tracking-wider">
                                        <th className="px-6 py-3">Batch ID</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Temperature</th>
                                        <th className="px-6 py-3">Vibration</th>
                                        <th className="px-6 py-3">Risk Score</th>
                                        <th className="px-6 py-3">Blockchain Hash</th>
                                        <th className="px-6 py-3">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[--medical-border]">
                                    {batches.map((batch) => (
                                        <tr
                                            key={batch._id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-[--medical-text]">
                                                    {batch.batchId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${batch.status === "Secure"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                        }`}
                                                >
                                                    {batch.status === "Secure" ? (
                                                        <CheckCircle2 size={12} />
                                                    ) : (
                                                        <AlertTriangle size={12} />
                                                    )}
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Thermometer size={14} className="text-teal-500" />
                                                    {batch.data?.temperature_avg?.toFixed(1) || "—"}°C
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Activity size={14} className="text-teal-500" />
                                                    {batch.data?.vibration_shock?.toFixed(1) || "—"} G
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${(batch.mlResult?.risk_score || 0) > 0.5
                                                                ? "bg-red-500"
                                                                : "bg-emerald-500"
                                                            }`}
                                                        style={{
                                                            width: `${(batch.mlResult?.risk_score || 0) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[--medical-text-muted]">
                                                    {((batch.mlResult?.risk_score || 0) * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Hash size={12} className="text-slate-400" />
                                                    <span
                                                        className="font-mono text-xs text-[--medical-text-muted]"
                                                        title={batch.txHash}
                                                    >
                                                        {batch.txHash
                                                            ? `${batch.txHash.substring(0, 8)}...${batch.txHash.substring(batch.txHash.length - 6)}`
                                                            : "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[--medical-text-muted]">
                                                {batch.createdAt
                                                    ? new Date(batch.createdAt).toLocaleTimeString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
