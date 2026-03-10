"use client";
import { useState, useEffect } from "react";
import { Users, Search, Shield, Calendar } from "lucide-react";

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
    Admin: "bg-purple-100 text-purple-700",
    Manufacturer: "bg-blue-100 text-blue-700",
    Supplier: "bg-amber-100 text-amber-700",
    Pharmacist: "bg-teal-100 text-teal-700",
    Consumer: "bg-slate-100 text-slate-600",
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/admin/users");
                const data = await res.json();
                if (data.success) {
                    setUsers(data.users);
                } else {
                    setError(data.error || "Failed to load users");
                }
            } catch {
                setError("Network error: could not load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Users className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                        <p className="text-slate-500 text-sm">All registered system users</p>
                    </div>
                </div>
            </header>

            {/* Role summary cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                {["Admin", "Manufacturer", "Supplier", "Pharmacist", "Consumer"].map((role) => (
                    <div key={role} className="medical-card p-4 text-center">
                        <p className="text-2xl font-bold text-slate-800">
                            {users.filter((u) => u.role === role).length}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{role}s</p>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="medical-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-slate-800">
                        Registered Users ({filtered.length})
                    </h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name, email or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none w-72"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading users...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 font-medium">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No users found.</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">
                                    <div className="flex items-center gap-1"><Shield size={12} /> Role</div>
                                </th>
                                <th className="px-4 py-3">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> Joined</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                {user.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-600"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })
                                            : "—"}
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
