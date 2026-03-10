"use client";
import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

interface Batch {
    id: string;
    timestamp: string;
    status: "Secure" | "Risk";
    hash: string;
}

export default function BatchHistory({ batches }: { batches: Batch[] }) {
    const demoBatches: Batch[] = [
        { id: "BATCH-9923", timestamp: "11:10:48", status: "Secure", hash: "0x5982...6e84" },
        { id: "BATCH-8401", timestamp: "11:08:15", status: "Secure", hash: "0xa3d1...9f21" },
        { id: "BATCH-7732", timestamp: "10:55:02", status: "Risk", hash: "0x1b4c...2d90" },
    ];

    const data = batches.length > 0 ? batches : demoBatches;

    return (
        <div className="medical-card p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[--medical-text]">
                    Recent Batches
                </h3>
                <span className="text-xs text-[--medical-text-muted] bg-slate-100 px-2 py-1 rounded-md">
                    {data.length} records
                </span>
            </div>

            <div className="space-y-3">
                {data.map((batch, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${batch.status === "Secure"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {batch.status === "Secure" ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <AlertTriangle size={18} />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-[--medical-text] text-sm">
                                    {batch.id}
                                </p>
                                <p className="text-xs text-[--medical-text-muted]">
                                    {batch.timestamp}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div>
                                <span
                                    className={`text-xs font-semibold ${batch.status === "Secure"
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                        }`}
                                >
                                    {batch.status}
                                </span>
                                <p className="text-xs text-[--medical-text-muted] font-mono mt-0.5" title={batch.hash}>
                                    {batch.hash.length > 20
                                        ? `${batch.hash.substring(0, 6)}...${batch.hash.substring(batch.hash.length - 4)}`
                                        : batch.hash}
                                </p>
                            </div>
                            <ExternalLink
                                size={14}
                                className="text-slate-300 group-hover:text-teal-500 transition-colors"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && (
                <p className="text-center text-[--medical-text-muted] py-8 text-sm">
                    No batches created yet
                </p>
            )}
        </div>
    );
}
