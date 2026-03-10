"use client";
import { useState, useEffect } from "react";
import { Package, AlertTriangle, CheckCircle, Plus, RefreshCw, Trash2, Edit2, UploadCloud, Loader2 } from "lucide-react";

interface Batch {
    _id: string;
    batchId: string;
    drugName?: string;
    quantity?: number;
    data: {
        temperature_avg: number;
        vibration_shock: number;
        route_efficiency: number;
    };
    mlResult: { status: string; risk_score: number };
    txHash: string;
    status: string;
    createdAt: string;
}

import CreateBatchModal from "@/components/CreateBatchModal";
import EditBatchModal from "@/components/EditBatchModal";

export default function ManufacturerDashboard() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit & Sync State
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const fetchBatches = async () => {
        try {
            const res = await fetch("/api/batches");
            const data = await res.json();
            if (data.success) setBatches(data.batches);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleSync = async (batchId: string) => {
        setSyncingId(batchId);
        try {
            const res = await fetch(`/api/batch/${batchId}/sync`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                // Refresh to show updated status/hash
                await fetchBatches();
            } else {
                alert(`Sync Failed: ${data.error}`);
            }
        } catch {
            alert("Sync failed: Network error");
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async (batchId: string) => {
        if (!confirm("Are you sure you want to delete this draft?")) return;
        try {
            const res = await fetch(`/api/batch/${batchId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBatches();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch {
            // Silently fail or log generic error
        }
    }

    const stats = {
        total: batches.length,
        secure: batches.filter((b) => b.status === "Secure").length,
        atRisk: batches.filter((b) => b.status === "Risk").length,
        drafts: batches.filter((b) => b.status === "Draft").length,
    };

    return (
        <div className="p-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manufacturer Dashboard</h1>
                    <p className="text-slate-500">Create, verify, and sync pharmaceutical batches</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchBatches}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus size={18} />
                        New Batch
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Package className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Edit2 className="text-slate-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Drafts</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.drafts}</p>
                        </div>
                    </div>
                </div>
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Secure (Synced)</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.secure}</p>
                        </div>
                    </div>
                </div>
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">At Risk</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.atRisk}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Table */}
            <div className="medical-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Your Batches</h2>
                    <span className="text-xs text-slate-400">Only showing batches created by you</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No batches yet. Create a draft!</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Batch ID</th>
                                <th className="px-4 py-3">Drug Name</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Sync Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {batches.map((batch) => (
                                <tr key={batch._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-sm">{batch.batchId}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{batch.drugName || "N/A"}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${batch.status === "Secure" ? "bg-emerald-100 text-emerald-700" :
                                                batch.status === "Risk" ? "bg-amber-100 text-amber-700" :
                                                    "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {batch.txHash === "DRAFT" || !batch.txHash ? (
                                            <span className="text-xs text-slate-500 italic">Not Synced</span>
                                        ) : (
                                            <span className="font-mono text-xs text-emerald-600 truncate max-w-[100px] block" title={batch.txHash}>
                                                Synced
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {batch.status === 'Draft' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSync(batch.batchId)}
                                                        disabled={syncingId === batch.batchId}
                                                        className="p-1.5 rounded-md text-teal-600 hover:bg-teal-50 border border-teal-100"
                                                        title="Sync to Blockchain"
                                                    >
                                                        {syncingId === batch.batchId ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingBatch(batch)}
                                                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 border border-blue-100"
                                                        title="Edit Draft"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(batch.batchId)}
                                                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 border border-red-100"
                                                        title="Delete Draft"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <CheckCircle size={14} /> Immutable
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CreateBatchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchBatches}
            />

            <EditBatchModal
                isOpen={!!editingBatch}
                onClose={() => setEditingBatch(null)}
                batch={editingBatch}
                onSuccess={fetchBatches}
            />
        </div>
    );
}
