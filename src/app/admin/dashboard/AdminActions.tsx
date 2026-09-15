"use client";

import { useState } from "react";

interface AdminActionsProps {}

export default function AdminActions({}: AdminActionsProps) {
  const [syncing, setSyncing] = useState(false);

  // 1. Refresh Function
  const handleRefresh = () => {
    window.location.reload();
  };

  // 2. Paystack Sync Function
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (data.status) {
        alert(data.message || "Sync completed successfully!");
        window.location.reload();
      } else {
        alert(data.message || "Sync failed. Check console for details.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Network error during synchronization.");
    } finally {
      setSyncing(false);
    }
  };



  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-amber-600/20 hover:bg-amber-600 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto"
      >
        <span className={`material-symbols-outlined text-xl ${syncing ? 'animate-spin' : ''}`}>
          {syncing ? 'progress_activity' : 'published_with_changes'}
        </span>
        {syncing ? 'Syncing...' : 'Sync Paystack'}
      </button>
      <button
        onClick={handleRefresh}
        className="bg-white text-slate-600 px-6 py-3 rounded-xl font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-all flex justify-center items-center gap-2 active:scale-95 w-full sm:w-auto"
      >
        <span className="material-symbols-outlined text-xl">sync</span>
        Refresh
      </button>
    </div>
  );
}
