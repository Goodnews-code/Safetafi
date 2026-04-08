"use client";

import { useState, useEffect } from "react";

interface ServiceOption {
    id: string;
    label: string;
    amount: number;
    icon: string;
}

export default function PricingControl() {
    const [pricing, setPricing] = useState<ServiceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // Load current settings on mount
    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((data) => {
                if (data.service_pricing) {
                    setPricing(data.service_pricing);
                }
            })
            .catch(() => showToast("error", "Could not load pricing."))
            .finally(() => setLoading(false));
    }, []);

    function showToast(type: "success" | "error", msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }

    const handlePriceChange = (id: string, newAmount: string) => {
        const val = parseInt(newAmount) || 0;
        setPricing((prev) =>
            prev.map((p) => (p.id === id ? { ...p, amount: val } : p))
        );
    };

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_pricing: pricing }),
            });
            const data = await res.json();
            if (data.status) {
                showToast("success", "Prices updated successfully!");
            } else {
                showToast("error", data.error || "Save failed.");
            }
        } catch {
            showToast("error", "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
                <span className="material-symbols-outlined text-[10rem] text-[#100287]">payments</span>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`absolute top-4 right-4 px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-lg z-10 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === "success"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#100287] text-xl">payments</span>
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Service Pricing</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Manage checkout rates per location
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-[#100287] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading prices...</span>
                </div>
            ) : (
                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pricing.map((item) => (
                            <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">{item.icon}</span>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {item.label}
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                                    <input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                        className="w-full bg-white border border-slate-200 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#100287] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-[#030301] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className={`material-symbols-outlined text-xl ${saving ? "animate-spin" : ""}`}>
                                {saving ? "progress_activity" : "save"}
                            </span>
                            {saving ? "Saving..." : "Save Prices"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
