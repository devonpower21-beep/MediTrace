"use client";
import { useState } from "react";
import { Thermometer, Vibrate, ArrowRight } from "lucide-react";

interface BatchViewProps {
    onBatchCreated?: (batch: any) => void;
}

export default function BatchView({ onBatchCreated }: BatchViewProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [temperature, setTemperature] = useState(4.2);
    const [vibration, setVibration] = useState(0.5);

    const createBatch = async () => {
        setLoading(true);
        setResult(null);

        try {
            const batchId = `BATCH-${Math.floor(Math.random() * 9000) + 1000}`;

            const res = await fetch("/api/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    batchId,
                    data: {
                        route_efficiency: 90 - vibration * 10,
                        temperature_avg: temperature,
                        vibration_shock: vibration,
                    },
                }),
            });

            const data = await res.json();
            setResult(data);

            if (onBatchCreated) {
                onBatchCreated({
                    id: batchId,
                    timestamp: new Date().toLocaleTimeString(),
                    status: data.ml_status === "Risk" ? "Risk" : "Secure",
                    hash: data.tx_hash || "0x...",
                });
            }
        } catch (err) {
            setResult({ error: "Connection failed" });
        } finally {
            setLoading(false);
        }
    };

    const isTempSafe = temperature >= 2 && temperature <= 8;
    const isVibrationSafe = vibration <= 2;

    return (
        <div className="medical-card p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[--medical-text]">
                    Create New Batch
                </h2>
                <p className="text-[--medical-text-muted] text-sm mt-1">
                    Simulate IoT sensor readings and verify with ML model
                </p>
            </div>

            {/* IoT Controls */}
            <div className="space-y-6 mb-8">
                {/* Temperature */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Thermometer size={18} className="text-teal-600" />
                            <span className="text-sm font-semibold text-[--medical-text]">
                                Temperature
                            </span>
                        </div>
                        <span
                            className={`text-sm font-mono font-bold ${isTempSafe ? "text-emerald-600" : "text-red-500"
                                }`}
                        >
                            {temperature.toFixed(1)}°C
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-10"
                        max="30"
                        step="0.5"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[--medical-text-muted] mt-2">
                        <span>-10°C</span>
                        <span className={isTempSafe ? "text-emerald-600 font-medium" : ""}>
                            Safe: 2-8°C
                        </span>
                        <span>30°C</span>
                    </div>
                </div>

                {/* Vibration */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Vibrate size={18} className="text-teal-600" />
                            <span className="text-sm font-semibold text-[--medical-text]">
                                Vibration Shock
                            </span>
                        </div>
                        <span
                            className={`text-sm font-mono font-bold ${isVibrationSafe ? "text-emerald-600" : "text-red-500"
                                }`}
                        >
                            {vibration.toFixed(1)} G
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={vibration}
                        onChange={(e) => setVibration(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[--medical-text-muted] mt-2">
                        <span>0 G</span>
                        <span
                            className={!isVibrationSafe ? "text-red-500 font-medium" : ""}
                        >
                            Threshold: 2G
                        </span>
                        <span>5 G</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button onClick={createBatch} disabled={loading} className="btn-medical w-full flex items-center justify-center gap-2">
                {loading ? (
                    "Verifying..."
                ) : (
                    <>
                        Verify & Store on Blockchain
                        <ArrowRight size={18} />
                    </>
                )}
            </button>

            {/* Result */}
            {result && (
                <div className="mt-6 animate-fade-in-up">
                    {result.error ? (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm">
                            {result.error}
                        </div>
                    ) : (
                        <div
                            className={`p-5 rounded-xl border ${result.ml_status === "Risk"
                                ? "bg-red-50 border-red-100"
                                : "bg-emerald-50 border-emerald-100"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-[--medical-text-muted]">
                                    ML Verification Result
                                </span>
                                <span
                                    className={`font-bold ${result.ml_status === "Risk"
                                        ? "text-red-600"
                                        : "text-emerald-600"
                                        }`}
                                >
                                    {result.ml_status === "Risk"
                                        ? "⚠️ Risk Detected"
                                        : "✓ Verified Safe"}
                                </span>
                            </div>
                            <div className="p-3 bg-white rounded-lg font-mono text-xs text-[--medical-text-muted] border border-slate-100 flex items-center justify-between">
                                <span>
                                    {result.tx_hash
                                        ? `${result.tx_hash.substring(0, 10)}...${result.tx_hash.substring(result.tx_hash.length - 8)}`
                                        : "Blockchain hash pending..."}
                                </span>
                                {result.tx_hash && (
                                    <button
                                        onClick={() => navigator.clipboard.writeText(result.tx_hash)}
                                        className="text-teal-600 hover:text-teal-700 font-medium text-[10px] uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
