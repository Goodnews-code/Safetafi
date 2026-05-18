"use client";

import { useState, useEffect } from "react";

interface ServiceOption {
    id: string;
    label: string;
    amount: number;
    icon: string;
    enabled: boolean;
}

export default function PricingControl() {
    const [pricing, setPricing] = useState<ServiceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // "Add Location" form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    // Delete confirmation state
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((data) => {
                if (data.service_pricing) {
                    // Backfill enabled=true for any legacy entries missing it
                    setPricing(
                        data.service_pricing.map((p: any) => ({
                            ...p,
                            enabled: p.enabled !== false,
                        }))
                    );
                }
            })
            .catch(() => showToast("error", "Could not load pricing."))
            .finally(() => setLoading(false));
    }, []);

    function showToast(type: "success" | "error", msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }

    const handlePriceChange = (id: string, newAmountVal: string) => {
        const val = parseInt(newAmountVal) || 0;
        setPricing((prev) => prev.map((p) => (p.id === id ? { ...p, amount: val } : p)));
    };

    /** Toggle a location's enabled state immediately */
    async function handleToggle(id: string) {
        const updated = pricing.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
        );
        setPricing(updated);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_pricing: updated }),
            });
            const data = await res.json();
            const toggled = updated.find((p) => p.id === id);
            if (data.status) {
                showToast(
                    "success",
                    toggled?.enabled
                        ? `✅ ${toggled.label} is now ACTIVE.`
                        : `🔒 ${toggled?.label} has been DISABLED.`
                );
            } else {
                // Revert on failure
                setPricing(pricing);
                showToast("error", data.error || "Toggle failed.");
            }
        } catch {
            setPricing(pricing);
            showToast("error", "Network error during toggle.");
        }
    }

    /** Delete a location with confirmation */
    async function handleDelete(id: string) {
        const updated = pricing.filter((p) => p.id !== id);
        setPricing(updated);
        setDeletingId(null);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_pricing: updated }),
            });
            const data = await res.json();
            if (data.status) {
                showToast("success", "Location deleted.");
            } else {
                setPricing(pricing); // revert
                showToast("error", data.error || "Delete failed.");
            }
        } catch {
            setPricing(pricing);
            showToast("error", "Network error during delete.");
        }
    }

    /** Add a new location */
    async function handleAddLocation(e: React.FormEvent) {
        e.preventDefault();
        if (!newLabel.trim()) return;

        const newEntry: ServiceOption = {
            id: newLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
            label: newLabel.trim(),
            amount: parseInt(newAmount) || 0,
            icon: "location_on",
            enabled: true,
        };

        // Prevent duplicate IDs
        if (pricing.some((p) => p.id === newEntry.id)) {
            showToast("error", `A location named "${newLabel}" already exists.`);
            return;
        }

        setAddLoading(true);
        const updated = [...pricing, newEntry];

        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_pricing: updated }),
            });
            const data = await res.json();
            if (data.status) {
                setPricing(updated);
                setNewLabel("");
                setNewAmount("");
                setShowAddForm(false);
                showToast("success", `📍 ${newEntry.label} added successfully!`);
            } else {
                showToast("error", data.error || "Failed to add location.");
            }
        } catch {
            showToast("error", "Network error while adding location.");
        } finally {
            setAddLoading(false);
        }
    }

    /** Save all price edits at once */
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

    const activeCount = pricing.filter((p) => p.enabled).length;
    const totalCount = pricing.length;

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
                <span className="material-symbols-outlined text-[10rem] text-[#100287]">location_on</span>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`absolute top-4 right-4 px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-lg z-10 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                        toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#100287] text-xl">location_on</span>
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">Location & Pricing</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Manage pickup points & rates
                        </p>
                    </div>
                </div>

                {/* Status badge + Add button */}
                <div className="flex items-center gap-3 flex-wrap">
                    {!loading && (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {activeCount}/{totalCount} Active
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); }}
                        className="flex items-center gap-2 bg-[#100287] text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-[#030301] transition-all active:scale-95 shadow-md shadow-blue-600/20"
                    >
                        <span className="material-symbols-outlined text-sm">{showAddForm ? "close" : "add"}</span>
                        {showAddForm ? "Cancel" : "Add Location"}
                    </button>
                </div>
            </div>

            {/* Add Location Form */}
            {showAddForm && (
                <form
                    onSubmit={handleAddLocation}
                    className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <p className="text-[10px] font-black text-[#100287] uppercase tracking-widest">New Pickup Location</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Location Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="e.g. Ogba, Surulere..."
                                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Price (₦)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    onFocus={(e) => { if (e.target.value === "0") setNewAmount(""); }}
                                    onBlur={(e) => { if (e.target.value === "") setNewAmount(""); }}
                                    placeholder="e.g. 12000"
                                    className="w-full bg-white border border-slate-200 pl-8 pr-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={addLoading}
                            className="bg-[#100287] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#030301] transition-all active:scale-95 disabled:opacity-60"
                        >
                            <span className={`material-symbols-outlined text-sm ${addLoading ? "animate-spin" : ""}`}>
                                {addLoading ? "progress_activity" : "add_location_alt"}
                            </span>
                            {addLoading ? "Adding..." : "Add Location"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-[#100287] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading locations...</span>
                </div>
            ) : pricing.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl opacity-30 mb-3 block">location_off</span>
                    <p className="font-black text-sm">No locations configured.</p>
                    <p className="text-xs mt-1">Click &ldquo;Add Location&rdquo; to get started.</p>
                </div>
            ) : (
                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pricing.map((item) => (
                            <div
                                key={item.id}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 space-y-3 ${
                                    item.enabled
                                        ? "bg-slate-50 border-slate-100"
                                        : "bg-slate-50/50 border-slate-100/50 opacity-60"
                                }`}
                            >
                                {/* Location header row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`material-symbols-outlined text-sm ${
                                                item.enabled ? "text-[#E7B036]" : "text-slate-300"
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        <span
                                            className={`text-[11px] font-black uppercase tracking-tight ${
                                                item.enabled ? "text-slate-700" : "text-slate-400"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5">
                                        {/* Toggle */}
                                        <button
                                            onClick={() => handleToggle(item.id)}
                                            title={item.enabled ? "Disable location" : "Enable location"}
                                            className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                                                item.enabled ? "bg-green-500" : "bg-slate-300"
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                                                    item.enabled ? "left-5" : "left-0.5"
                                                }`}
                                            />
                                        </button>

                                        {/* Delete — shows confirm state */}
                                        {deletingId === item.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    title="Confirm delete"
                                                >
                                                    <span className="material-symbols-outlined text-[11px]">check</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(null)}
                                                    className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <span className="material-symbols-outlined text-[11px]">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeletingId(item.id)}
                                                title="Delete location"
                                                className="w-6 h-6 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status pill */}
                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    item.enabled
                                        ? "bg-green-100 text-green-600"
                                        : "bg-slate-100 text-slate-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.enabled ? "bg-green-500" : "bg-slate-400"}`} />
                                    {item.enabled ? "Active" : "Disabled"}
                                </div>

                                {/* Price input */}
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                                    <input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                        onFocus={(e) => { if (e.target.value === "0") handlePriceChange(item.id, ""); }}
                                        onBlur={(e) => { if (e.target.value === "" || e.target.value === "0") handlePriceChange(item.id, "0"); }}
                                        disabled={!item.enabled}
                                        className="w-full bg-white border border-slate-200 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
