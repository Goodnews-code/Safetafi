"use client";

import { useState, useEffect } from "react";

export default function TripControl() {
  const [tripDate, setTripDate] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load current settings on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setTripDate(data.trip_date ?? "");
        setPaymentsEnabled(data.payments_enabled ?? false);
      })
      .catch(() => showToast("error", "Could not load current settings."))
      .finally(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave() {
    if (!tripDate.trim()) {
      showToast("error", "Please enter a trip date.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_date: tripDate, payments_enabled: paymentsEnabled }),
      });
      const data = await res.json();
      if (data.status) {
        showToast("success", "Trip settings saved successfully!");
      } else {
        showToast("error", data.error || "Save failed.");
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePayments() {
    const newVal = !paymentsEnabled;
    setPaymentsEnabled(newVal);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments_enabled: newVal }),
      });
      const data = await res.json();
      if (data.status) {
        showToast("success", newVal ? "✅ Payments are now OPEN." : "🔒 Payments are now PAUSED.");
      } else {
        setPaymentsEnabled(!newVal); // revert
        showToast("error", data.error || "Toggle failed.");
      }
    } catch {
      setPaymentsEnabled(!newVal); // revert
      showToast("error", "Network error during toggle.");
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 mb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.04]">
        <span className="material-symbols-outlined text-[10rem] text-[#100287]">tune</span>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`absolute top-4 right-4 px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-lg z-10 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#100287]/10 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[#100287] text-xl">tune</span>
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">Trip Control</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Manage bookings &amp; payment access
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-[#100287] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

          {/* ── Trip Date Input ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Next Trip Date
            </label>
            <input
              type="text"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              placeholder="e.g. Thursday, 9th of April, 2026"
              className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#100287] transition-all font-bold text-slate-700 text-sm"
            />
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              This date appears in the booking form &amp; paused notice.
            </p>
          </div>

          {/* ── Payment Toggle ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Payment Access
            </label>
            <button
              onClick={handleTogglePayments}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 font-black text-sm transition-all ${
                paymentsEnabled
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-amber-50 border-amber-300 text-amber-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">
                  {paymentsEnabled ? "lock_open" : "lock"}
                </span>
                <span>{paymentsEnabled ? "Payments are OPEN" : "Payments are PAUSED"}</span>
              </div>
              {/* Pill toggle indicator */}
              <div
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  paymentsEnabled ? "bg-green-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                    paymentsEnabled ? "left-6" : "left-0.5"
                  }`}
                />
              </div>
            </button>
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              Toggle to instantly open or pause new bookings.
            </p>
          </div>

          {/* ── Save Button ── */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#100287] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-[#030301] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-xl ${saving ? "animate-spin" : ""}`}>
                {saving ? "progress_activity" : "save"}
              </span>
              {saving ? "Saving..." : "Save Trip Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
