"use client";
import { useState, useEffect } from "react";
import { Users, Package, ShieldCheck, AlertTriangle, Trash2, Archive } from "lucide-react";

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

interface Batch {
    _id: string;
    batchId: string;
    status: string;
    creatorId: string;
    createdAt: string;
    txHash?: string;
    deletedAt?: string;
}

interface Stats {
    totalUsers: number;
    totalBatches: number;
    secureBatches: number;
    atRiskBatches: number;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBatches: 0, secureBatches: 0, atRiskBatches: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, batchesRes] = await Promise.all([
                    fetch("/api/admin/users"),
                    fetch("/api/batches"),
                ]);

                const usersData = await usersRes.json();
                const batchesData = await batchesRes.json();

                if (usersData.success) setUsers(usersData.users);

                if (batchesData.success) {
                    const batchesList: Batch[] = batchesData.batches;
                    setBatches(batchesList);
                    setStats({
                        totalUsers: usersData.users?.length || 0,
                        totalBatches: batchesList.length,
                        secureBatches: batchesList.filter((b) => b.status === "Secure").length,
                        atRiskBatches: batchesList.filter((b) => b.status === "Risk").length,
                    });
                }
            } catch (error) {
                console.error("Admin fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteBatch = async (batchId: string) => {
        if (!confirm("WARNING: This will permanently delete the batch from the database. It cannot be undone. Continue?")) return;
        try {
            const res = await fetch(`/api/batch/${batchId}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete batch");
            }
        } catch (error) {
            console.error("Delete error", error);
            alert("Network error: could not delete batch");
        }
    }

    const handleSoftDeleteBatch = async (batchId: string) => {
        if (!confirm("This will soft delete (archive) the batch. Continue?")) return;
        try {
            const res = await fetch(`/api/batch/${batchId}?soft=true`, { method: 'DELETE' });
            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to soft delete batch");
            }
        } catch (error) {
            console.error("Soft delete error", error);
            alert("Network error: could not soft delete batch");
        }
    }

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500">System overview and user management</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Users className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Users</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Package className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Batches</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalBatches}</p>
                        </div>
                    </div>
                </div>
                <div className="medical-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <ShieldCheck className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Secure</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.secureBatches}</p>
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
                            <p className="text-2xl font-bold text-amber-600">{stats.atRiskBatches}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="medical-card overflow-hidden mb-8">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Registered Users</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Batch Table */}
            <div className="medical-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">System Batches</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No batches found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Batch ID</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Creator ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {batches.map((batch) => (
                                <tr key={batch._id} className={`hover:bg-slate-50 transition-colors ${batch.deletedAt ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="px-4 py-3 font-mono text-sm">
                                        {batch.batchId}
                                        {batch.deletedAt && <span className="ml-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">Archived</span>}
                                    </td>
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
                                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{batch.creatorId || "N/A"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        {new Date(batch.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!batch.deletedAt && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSoftDeleteBatch(batch.batchId)}
                                                    className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 border border-amber-100 transition-colors"
                                                    title="Soft Delete (Archive)"
                                                >
                                                    <Archive size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBatch(batch.batchId)}
                                                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
