"use client";
import { useState } from "react";
import { BarChart3, GitBranch, Sparkles } from "lucide-react";

const ML_API = "http://localhost:5000";

export default function AdminView() {
    const [activeTab, setActiveTab] = useState("confusion");
    const [imageError, setImageError] = useState(false);

    const tabs = [
        { id: "confusion", label: "Confusion Matrix", icon: BarChart3 },
        { id: "feature", label: "Features", icon: GitBranch },
        { id: "shap", label: "SHAP", icon: Sparkles },
    ];

    const getImageUrl = () => {
        const map: Record<string, string> = {
            confusion: "confusion_matrix.png",
            feature: "feature_importance.png",
            shap: "shap_summary.png",
        };
        // Add timestamp to prevent caching issues if images are regenerated
        return `${ML_API}/metrics/${map[activeTab]}?t=${new Date().getTime()}`;
    };

    return (
        <div className="medical-card p-8 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[--medical-text]">
                    Model Insights
                </h2>
                <p className="text-[--medical-text-muted] text-sm mt-1">
                    Machine learning performance metrics
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setImageError(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Image Display */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center min-h-[300px] overflow-hidden">
                {imageError ? (
                    <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <BarChart3 size={28} className="text-slate-400" />
                        </div>
                        <p className="font-semibold text-[--medical-text]">
                            Artifact not found
                        </p>
                        <p className="text-sm text-[--medical-text-muted] mt-1">
                            Run lab_setup.py to generate
                        </p>
                    </div>
                ) : (
                    <img
                        key={activeTab}
                        src={getImageUrl()}
                        alt={`${activeTab} visualization`}
                        className="max-h-full max-w-full object-contain p-4"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>

            {/* Info */}
            <p className="text-xs text-[--medical-text-muted] mt-4 text-center">
                Trained on synthetic pharmaceutical supply chain data
            </p>
        </div>
    );
}
