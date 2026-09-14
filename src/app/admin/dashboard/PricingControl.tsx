"use client";

import { useState, useEffect } from "react";

interface ServiceOption {
    id: string;
    label: string;
    amount: number;
    icon: string;
    enabled: boolean;
}

interface PickupPoint {
    id: string;
    label: string;
    enabled: boolean;
}

export default function PricingControl() {
    // ── Trip Direction ────────────────────────────────────────────────────────
    const [tripDirection, setTripDirection] = useState<"to_campus" | "from_campus">("to_campus");
    const [directionSaving, setDirectionSaving] = useState(false);

    // ── Outgoing Trip (to_campus) ─────────────────────────────────────────────
    const [pricing, setPricing] = useState<ServiceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // Outgoing — Add Location form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    // Outgoing — Delete confirmation state
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Return Trip — Pickup Points ───────────────────────────────────────────
    const [returnPickup, setReturnPickup] = useState<PickupPoint[]>([]);
    const [showAddReturnPickup, setShowAddReturnPickup] = useState(false);
    const [newReturnPickupLabel, setNewReturnPickupLabel] = useState("");
    const [addReturnPickupLoading, setAddReturnPickupLoading] = useState(false);
    const [deletingReturnPickupId, setDeletingReturnPickupId] = useState<string | null>(null);

    // ── Return Trip — Destinations & Prices ──────────────────────────────────
    const [returnPricing, setReturnPricing] = useState<ServiceOption[]>([]);
    const [returnPricingSaving, setReturnPricingSaving] = useState(false);
    const [showAddReturnDest, setShowAddReturnDest] = useState(false);
    const [newReturnDestLabel, setNewReturnDestLabel] = useState("");
    const [newReturnDestAmount, setNewReturnDestAmount] = useState("");
    const [addReturnDestLoading, setAddReturnDestLoading] = useState(false);
    const [deletingReturnDestId, setDeletingReturnDestId] = useState<string | null>(null);

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
                if (data.trip_direction) {
                    setTripDirection(data.trip_direction);
                }
                if (data.return_pickup_points) {
                    setReturnPickup(
                        data.return_pickup_points.map((p: any) => ({
                            ...p,
                            enabled: p.enabled !== false,
                        }))
                    );
                }
                if (data.return_pricing) {
                    setReturnPricing(
                        data.return_pricing.map((p: any) => ({
                            ...p,
                            enabled: p.enabled !== false,
                        }))
                    );
                }
            })
            .catch(() => showToast("error", "Could not load settings."))
            .finally(() => setLoading(false));
    }, []);

    function showToast(type: "success" | "error", msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }

    // ─── Trip Direction Toggle ────────────────────────────────────────────────
    async function handleDirectionToggle(dir: "to_campus" | "from_campus") {
        if (dir === tripDirection) return;
        const prev = tripDirection;
        setDirectionSaving(true);
        setTripDirection(dir);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trip_direction: dir }),
            });
            const data = await res.json();
            if (data.status) {
                showToast("success", dir === "to_campus" ? "🚌 Mode: Going to Campus" : "🏠 Mode: Returning Home");
            } else {
                setTripDirection(prev);
                showToast("error", data.error || "Failed to save direction.");
            }
        } catch {
            setTripDirection(prev);
            showToast("error", "Network error saving direction.");
        } finally {
            setDirectionSaving(false);
        }
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

    /** Save all outgoing price edits at once */
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

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN TRIP — Pickup Points (no price)
    // ─────────────────────────────────────────────────────────────────────────
    async function handleReturnPickupToggle(id: string) {
        const updated = returnPickup.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p);
        setReturnPickup(updated);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pickup_points: updated }),
            });
            const data = await res.json();
            if (!data.status) { setReturnPickup(returnPickup); showToast("error", data.error || "Toggle failed."); }
        } catch {
            setReturnPickup(returnPickup);
            showToast("error", "Network error during toggle.");
        }
    }

    async function handleReturnPickupDelete(id: string) {
        const updated = returnPickup.filter((p) => p.id !== id);
        setReturnPickup(updated);
        setDeletingReturnPickupId(null);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pickup_points: updated }),
            });
            const data = await res.json();
            if (data.status) { showToast("success", "Pickup point deleted."); }
            else { setReturnPickup(returnPickup); showToast("error", data.error || "Delete failed."); }
        } catch {
            setReturnPickup(returnPickup);
            showToast("error", "Network error during delete.");
        }
    }

    async function handleAddReturnPickup(e: React.FormEvent) {
        e.preventDefault();
        if (!newReturnPickupLabel.trim()) return;
        const newEntry: PickupPoint = {
            id: newReturnPickupLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
            label: newReturnPickupLabel.trim(),
            enabled: true,
        };
        if (returnPickup.some((p) => p.id === newEntry.id)) {
            showToast("error", `"${newReturnPickupLabel}" already exists.`);
            return;
        }
        setAddReturnPickupLoading(true);
        const updated = [...returnPickup, newEntry];
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pickup_points: updated }),
            });
            const data = await res.json();
            if (data.status) {
                setReturnPickup(updated);
                setNewReturnPickupLabel("");
                setShowAddReturnPickup(false);
                showToast("success", `📍 ${newEntry.label} added as pickup point!`);
            } else {
                showToast("error", data.error || "Failed to add pickup point.");
            }
        } catch {
            showToast("error", "Network error.");
        } finally {
            setAddReturnPickupLoading(false);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN TRIP — Destinations & Prices
    // ─────────────────────────────────────────────────────────────────────────
    const handleReturnPriceChange = (id: string, val: string) => {
        const amount = parseInt(val) || 0;
        setReturnPricing((prev) => prev.map((p) => (p.id === id ? { ...p, amount } : p)));
    };

    async function handleReturnDestToggle(id: string) {
        const updated = returnPricing.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p);
        setReturnPricing(updated);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pricing: updated }),
            });
            const data = await res.json();
            if (!data.status) { setReturnPricing(returnPricing); showToast("error", data.error || "Toggle failed."); }
        } catch {
            setReturnPricing(returnPricing);
            showToast("error", "Network error during toggle.");
        }
    }

    async function handleReturnDestDelete(id: string) {
        const updated = returnPricing.filter((p) => p.id !== id);
        setReturnPricing(updated);
        setDeletingReturnDestId(null);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pricing: updated }),
            });
            const data = await res.json();
            if (data.status) { showToast("success", "Destination deleted."); }
            else { setReturnPricing(returnPricing); showToast("error", data.error || "Delete failed."); }
        } catch {
            setReturnPricing(returnPricing);
            showToast("error", "Network error during delete.");
        }
    }

    async function handleAddReturnDest(e: React.FormEvent) {
        e.preventDefault();
        if (!newReturnDestLabel.trim()) return;
        const newEntry: ServiceOption = {
            id: newReturnDestLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
            label: newReturnDestLabel.trim(),
            amount: parseInt(newReturnDestAmount) || 0,
            icon: "location_on",
            enabled: true,
        };
        if (returnPricing.some((p) => p.id === newEntry.id)) {
            showToast("error", `"${newReturnDestLabel}" already exists.`);
            return;
        }
        setAddReturnDestLoading(true);
        const updated = [...returnPricing, newEntry];
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pricing: updated }),
            });
            const data = await res.json();
            if (data.status) {
                setReturnPricing(updated);
                setNewReturnDestLabel("");
                setNewReturnDestAmount("");
                setShowAddReturnDest(false);
                showToast("success", `📍 ${newEntry.label} added as drop-off destination!`);
            } else {
                showToast("error", data.error || "Failed to add destination.");
            }
        } catch {
            showToast("error", "Network error.");
        } finally {
            setAddReturnDestLoading(false);
        }
    }

    async function handleReturnPricingSave() {
        setReturnPricingSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ return_pricing: returnPricing }),
            });
            const data = await res.json();
            if (data.status) { showToast("success", "Return prices updated successfully!"); }
            else { showToast("error", data.error || "Save failed."); }
        } catch {
            showToast("error", "Network error. Please try again.");
        } finally {
            setReturnPricingSaving(false);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Shared card helpers
    // ─────────────────────────────────────────────────────────────────────────
    const activeCount = pricing.filter((p) => p.enabled).length;
    const totalCount = pricing.length;

    function PricedLocationCard({ item, onToggle, onDelete, onPriceChange, delId, setDelId }: {
        item: ServiceOption;
        onToggle: (id: string) => void;
        onDelete: (id: string) => void;
        onPriceChange: (id: string, val: string) => void;
        delId: string | null;
        setDelId: (id: string | null) => void;
    }) {
        return (
            <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 space-y-3 ${item.enabled ? "bg-slate-50 border-slate-100" : "bg-slate-50/50 border-slate-100/50 opacity-60"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${item.enabled ? "text-[#100287]" : "text-slate-300"}`}>{item.icon}</span>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${item.enabled ? "text-slate-700" : "text-slate-400"}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => onToggle(item.id)} title={item.enabled ? "Disable" : "Enable"} className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${item.enabled ? "bg-green-500" : "bg-slate-300"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${item.enabled ? "left-5" : "left-0.5"}`} />
                        </button>
                        {delId === item.id ? (
                            <div className="flex items-center gap-1">
                                <button onClick={() => onDelete(item.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors" title="Confirm delete"><span className="material-symbols-outlined text-[11px]">check</span></button>
                                <button onClick={() => setDelId(null)} className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors" title="Cancel"><span className="material-symbols-outlined text-[11px]">close</span></button>
                            </div>
                        ) : (
                            <button onClick={() => setDelId(item.id)} title="Delete" className="w-6 h-6 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                        )}
                    </div>
                </div>
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.enabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.enabled ? "bg-green-500" : "bg-slate-400"}`} />
                    {item.enabled ? "Active" : "Disabled"}
                </div>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                    <input type="number" value={item.amount} onChange={(e) => onPriceChange(item.id, e.target.value)} onFocus={(e) => { if (e.target.value === "0") onPriceChange(item.id, ""); }} onBlur={(e) => { if (e.target.value === "" || e.target.value === "0") onPriceChange(item.id, "0"); }} disabled={!item.enabled} className="w-full bg-white border border-slate-200 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" />
                </div>
            </div>
        );
    }

    function PickupPointCard({ item, onToggle, onDelete, delId, setDelId, accent }: {
        item: PickupPoint;
        onToggle: (id: string) => void;
        onDelete: (id: string) => void;
        delId: string | null;
        setDelId: (id: string | null) => void;
        accent?: string;
    }) {
        return (
            <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${item.enabled ? "bg-slate-50 border-slate-100" : "bg-slate-50/50 border-slate-100/50 opacity-60"}`}>
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${item.enabled ? (accent || "text-[#100287]") : "text-slate-300"}`}>trip_origin</span>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${item.enabled ? "text-slate-700" : "text-slate-400"}`}>{item.label}</span>
                    <span className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.enabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.enabled ? "bg-green-500" : "bg-slate-400"}`} />
                        {item.enabled ? "Active" : "Disabled"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onToggle(item.id)} title={item.enabled ? "Disable" : "Enable"} className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${item.enabled ? "bg-green-500" : "bg-slate-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${item.enabled ? "left-5" : "left-0.5"}`} />
                    </button>
                    {delId === item.id ? (
                        <div className="flex items-center gap-1">
                            <button onClick={() => onDelete(item.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors" title="Confirm delete"><span className="material-symbols-outlined text-[11px]">check</span></button>
                            <button onClick={() => setDelId(null)} className="w-6 h-6 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-300 transition-colors" title="Cancel"><span className="material-symbols-outlined text-[11px]">close</span></button>
                        </div>
                    ) : (
                        <button onClick={() => setDelId(item.id)} title="Delete" className="w-6 h-6 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                    )}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
                <span className="material-symbols-outlined text-[10rem] text-[#100287]">location_on</span>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`absolute top-4 right-4 px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-lg z-10 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {toast.msg}
                </div>
            )}

            {/* ── Trip Direction Toggle ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#100287] text-xl">swap_horiz</span>
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">Trip Direction</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controls what customers see on checkout</p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={() => handleDirectionToggle("to_campus")} disabled={directionSaving}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-black text-sm transition-all ${tripDirection === "to_campus" ? "border-[#100287] bg-[#100287] text-white shadow-lg shadow-blue-600/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}>
                        <span className="material-symbols-outlined text-xl">directions_bus</span>
                        <div className="text-left">
                            <div className="text-sm font-black">Going to Campus</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest ${tripDirection === "to_campus" ? "text-blue-200" : "text-slate-400"}`}>Pickup from their location</div>
                        </div>
                        {tripDirection === "to_campus" && <span className="material-symbols-outlined text-sm ml-1">check_circle</span>}
                    </button>
                    <button onClick={() => handleDirectionToggle("from_campus")} disabled={directionSaving}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-black text-sm transition-all ${tripDirection === "from_campus" ? "border-[#100287] bg-[#100287] text-white shadow-lg shadow-blue-600/20" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"}`}>
                        <span className="material-symbols-outlined text-xl">home</span>
                        <div className="text-left">
                            <div className="text-sm font-black">Returning Home</div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest ${tripDirection === "from_campus" ? "text-blue-200" : "text-slate-400"}`}>Drop-off at their location</div>
                        </div>
                        {tripDirection === "from_campus" && <span className="material-symbols-outlined text-sm ml-1">check_circle</span>}
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* GOING TO CAMPUS */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {tripDirection === "to_campus" && (
                <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#100287] text-xl">location_on</span>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Pickup Locations & Prices</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage outgoing pickup points & fares</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {!loading && (
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeCount}/{totalCount} Active</span>
                                </div>
                            )}
                            <button onClick={() => { setShowAddForm(!showAddForm); }} className="flex items-center gap-2 bg-[#100287] text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-[#030301] transition-all active:scale-95 shadow-md shadow-blue-600/20">
                                <span className="material-symbols-outlined text-sm">{showAddForm ? "close" : "add"}</span>
                                {showAddForm ? "Cancel" : "Add Location"}
                            </button>
                        </div>
                    </div>

                    {/* Add Location Form */}
                    {showAddForm && (
                        <form onSubmit={handleAddLocation} className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-[10px] font-black text-[#100287] uppercase tracking-widest">New Pickup Location</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location Name *</label>
                                    <input type="text" required value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Ogba, Surulere..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                                        <input type="number" min="0" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setNewAmount(""); }} onBlur={(e) => { if (e.target.value === "") setNewAmount(""); }} placeholder="e.g. 12000" className="w-full bg-white border border-slate-200 pl-8 pr-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={addLoading} className="bg-[#100287] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#030301] transition-all active:scale-95 disabled:opacity-60">
                                    <span className={`material-symbols-outlined text-sm ${addLoading ? "animate-spin" : ""}`}>{addLoading ? "progress_activity" : "add_location_alt"}</span>
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
                                    <PricedLocationCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} onPriceChange={handlePriceChange} delId={deletingId} setDelId={setDeletingId} />
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleSave} disabled={saving} className="bg-[#100287] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-[#030301] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className={`material-symbols-outlined text-xl ${saving ? "animate-spin" : ""}`}>{saving ? "progress_activity" : "save"}</span>
                                    {saving ? "Saving..." : "Save Prices"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* RETURNING HOME */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {tripDirection === "from_campus" && (
                <div className="space-y-10">

                    {/* ── Return Pickup Points ── */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#100287] text-xl">trip_origin</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Return Pickup Points</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Where students board for the return trip</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowAddReturnPickup(!showAddReturnPickup); }} className="flex items-center gap-2 bg-[#100287] text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-[#030301] transition-all active:scale-95 shadow-md shadow-blue-600/20">
                                <span className="material-symbols-outlined text-sm">{showAddReturnPickup ? "close" : "add"}</span>
                                {showAddReturnPickup ? "Cancel" : "Add Pickup Point"}
                            </button>
                        </div>

                        {showAddReturnPickup && (
                            <form onSubmit={handleAddReturnPickup} className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] font-black text-[#100287] uppercase tracking-widest">New Return Pickup Point</p>
                                <div className="max-w-sm">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location Name *</label>
                                    <input type="text" required value={newReturnPickupLabel} onChange={(e) => setNewReturnPickupLabel(e.target.value)} placeholder="e.g. Campus Gate, Main Auditorium..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={addReturnPickupLoading} className="bg-[#100287] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#030301] transition-all active:scale-95 disabled:opacity-60">
                                        <span className={`material-symbols-outlined text-sm ${addReturnPickupLoading ? "animate-spin" : ""}`}>{addReturnPickupLoading ? "progress_activity" : "add_location_alt"}</span>
                                        {addReturnPickupLoading ? "Adding..." : "Add Pickup Point"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {returnPickup.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <span className="material-symbols-outlined text-4xl opacity-30 mb-2 block">location_off</span>
                                <p className="font-black text-sm">No pickup points configured.</p>
                                <p className="text-xs mt-1">Click &ldquo;Add Pickup Point&rdquo; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {returnPickup.map((item) => (
                                    <PickupPointCard key={item.id} item={item} onToggle={handleReturnPickupToggle} onDelete={handleReturnPickupDelete} delId={deletingReturnPickupId} setDelId={setDeletingReturnPickupId} accent="text-[#100287]" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* ── Return Destinations & Prices ── */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#100287] text-xl">location_on</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Return Destinations & Prices</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Drop-off locations & return fares</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {!loading && (
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{returnPricing.filter((p) => p.enabled).length}/{returnPricing.length} Active</span>
                                    </div>
                                )}
                                <button onClick={() => { setShowAddReturnDest(!showAddReturnDest); }} className="flex items-center gap-2 bg-[#100287] text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-[#030301] transition-all active:scale-95 shadow-md shadow-blue-600/20">
                                    <span className="material-symbols-outlined text-sm">{showAddReturnDest ? "close" : "add"}</span>
                                    {showAddReturnDest ? "Cancel" : "Add Destination"}
                                </button>
                            </div>
                        </div>

                        {showAddReturnDest && (
                            <form onSubmit={handleAddReturnDest} className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] font-black text-[#100287] uppercase tracking-widest">New Return Destination</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Destination Name *</label>
                                        <input type="text" required value={newReturnDestLabel} onChange={(e) => setNewReturnDestLabel(e.target.value)} placeholder="e.g. Berger, Oshodi..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Return Price (₦)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₦</span>
                                            <input type="number" min="0" value={newReturnDestAmount} onChange={(e) => setNewReturnDestAmount(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setNewReturnDestAmount(""); }} onBlur={(e) => { if (e.target.value === "") setNewReturnDestAmount(""); }} placeholder="e.g. 9000" className="w-full bg-white border border-slate-200 pl-8 pr-4 py-3 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={addReturnDestLoading} className="bg-[#100287] text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#030301] transition-all active:scale-95 disabled:opacity-60">
                                        <span className={`material-symbols-outlined text-sm ${addReturnDestLoading ? "animate-spin" : ""}`}>{addReturnDestLoading ? "progress_activity" : "add_location_alt"}</span>
                                        {addReturnDestLoading ? "Adding..." : "Add Destination"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {returnPricing.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <span className="material-symbols-outlined text-4xl opacity-30 mb-2 block">location_off</span>
                                <p className="font-black text-sm">No return destinations configured.</p>
                                <p className="text-xs mt-1">Click &ldquo;Add Destination&rdquo; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {returnPricing.map((item) => (
                                        <PricedLocationCard key={item.id} item={item} onToggle={handleReturnDestToggle} onDelete={handleReturnDestDelete} onPriceChange={handleReturnPriceChange} delId={deletingReturnDestId} setDelId={setDeletingReturnDestId} />
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button onClick={handleReturnPricingSave} disabled={returnPricingSaving} className="bg-[#100287] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-[#030301] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span className={`material-symbols-outlined text-xl ${returnPricingSaving ? "animate-spin" : ""}`}>{returnPricingSaving ? "progress_activity" : "save"}</span>
                                        {returnPricingSaving ? "Saving..." : "Save Return Prices"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
