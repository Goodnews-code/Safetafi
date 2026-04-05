"use client";

import { useState } from "react";

interface AdminActionsProps {}

export default function AdminActions({}: AdminActionsProps) {
  const [exporting, setExporting] = useState(false);
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

  // 3. CSV Export Function
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Could not fetch data");
      
      const { transactions } = await res.json();

      if (!transactions || transactions.length === 0) {
        alert("No data to export.");
        return;
      }

      // Define CSV headers
      const headers = ["Customer", "Meeting Point", "Destination", "Schedule", "Amount (NGN)", "Status", "Reference", "Paid At"];
      
      // Map transaction data to rows
      const rows = transactions.map((tr: any) => [
        `"${tr.customer_name || 'Anonymous'}"`,
        `"${tr.service || 'Logistics'}"`,
        `"${tr.destination || 'N/A'}"`,
        `"${tr.date || 'N/A'}"`,
        tr.amount || 0,
        tr.status?.toUpperCase() || 'UNKNOWN',
        `"${tr.reference}"`,
        `"${new Date(tr.created_at || tr.paid_at).toLocaleString()}"`
      ]);

      // Combine into one string
      const csvContent = [
        headers.join(","),
        ...rows.map((row: any) => row.join(","))
      ].join("\n");

      // Create a Blob and trigger a download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `safetafi_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
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
      <button 
        onClick={handleExport}
        disabled={exporting}
        className="bg-[#0047BB] text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-600/20 hover:bg-[#001B44] transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto"
      >
        <span className={`material-symbols-outlined text-xl ${exporting ? 'animate-spin' : ''}`}>
          {exporting ? 'progress_activity' : 'download'}
        </span>
        {exporting ? 'Preparing...' : 'Export CSV'}
      </button>
    </div>
  );
}
