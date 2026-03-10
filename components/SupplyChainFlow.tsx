"use client";
import { useState } from "react";
import { Package, Truck, Store, User, CheckCircle2 } from "lucide-react";

export default function SupplyChainFlow() {
    const [activeStageId, setActiveStageId] = useState(3); // Default to Pharmacy active

    const stages = [
        { id: 1, name: "Manufacturer", Icon: Package },
        { id: 2, name: "Distributor", Icon: Truck },
        { id: 3, name: "Pharmacy", Icon: Store },
        { id: 4, name: "Patient", Icon: User },
    ];

    const getStatus = (id: number) => {
        if (id < activeStageId) return "completed";
        if (id === activeStageId) return "active";
        return "pending";
    };

    return (
        <div className="medical-card p-8">
            <div className="flex items-center justify-between gap-4">
                {stages.map((stage, idx) => {
                    const status = getStatus(stage.id);
                    return (
                        <div key={stage.id} className="flex items-center flex-1">
                            {/* Stage Node */}
                            <div
                                className="flex flex-col items-center min-w-[90px] cursor-pointer group"
                                onClick={() => setActiveStageId(stage.id)}
                            >
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${status === "completed"
                                            ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
                                            : status === "active"
                                                ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                                                : "bg-slate-100 text-slate-400 border-2 border-slate-200 group-hover:border-teal-200 group-hover:text-teal-400"
                                        }`}
                                >
                                    <stage.Icon size={24} strokeWidth={1.8} />
                                </div>

                                <div className="text-center mt-3">
                                    <p
                                        className={`text-sm font-semibold transition-colors ${status === "pending"
                                                ? "text-slate-400 group-hover:text-teal-600"
                                                : "text-[--medical-text]"
                                            }`}
                                    >
                                        {stage.name}
                                    </p>
                                    <div
                                        className={`text-xs font-medium mt-1 flex items-center justify-center gap-1 ${status === "completed"
                                                ? "text-emerald-600"
                                                : status === "active"
                                                    ? "text-teal-600"
                                                    : "text-slate-400"
                                            }`}
                                    >
                                        {status === "completed" && (
                                            <>
                                                <CheckCircle2 size={12} /> Verified
                                            </>
                                        )}
                                        {status === "active" && "In Progress"}
                                        {status === "pending" && "Pending"}
                                    </div>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {idx < stages.length - 1 && (
                                <div className="flex-1 h-[3px] mx-3 bg-slate-100 rounded-full relative overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${status === "completed"
                                                ? "w-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                                : "w-0"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
