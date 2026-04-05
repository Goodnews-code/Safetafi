"use client";

import { useState } from "react";

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  email: string;
  phone: string;
  customer_name: string;
  service: string;
  destination: string;
  date: string;
  description: string;
  status: string;
  paid_at: string;
  created_at: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

function formatNaira(amt: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amt);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter((tr) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      tr.customer_name?.toLowerCase().includes(q) ||
      tr.phone?.toLowerCase().includes(q) ||
      tr.email?.toLowerCase().includes(q) ||
      tr.reference?.toLowerCase().includes(q) ||
      tr.service?.toLowerCase().includes(q) ||
      tr.destination?.toLowerCase().includes(q) ||
      tr.date?.toLowerCase().includes(q) ||
      tr.status?.toLowerCase().includes(q) ||
      tr.description?.toLowerCase().includes(q) ||
      String(tr.amount)?.includes(q)
    );
  });

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
      {/* Table Header with Search */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">
          All Orders
          {searchTerm && (
            <span className="ml-3 text-[10px] font-bold text-[#0047BB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </h4>
        <div className="relative group">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-[#0047BB] transition-colors">
            <span className="material-symbols-outlined text-lg">search</span>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, ref, destination..."
            className="bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-10 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] transition-all w-72"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
              <th className="px-8 py-5">Client & Details</th>
              <th className="px-8 py-5">Meeting Point</th>
              <th className="px-8 py-5">Destination</th>
              <th className="px-8 py-5">Schedule</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5">Reference</th>
              <th className="px-8 py-5 text-right">Transaction Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? (
              filtered.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 group-hover:text-[#100287] transition-colors text-sm">
                        {tr.customer_name || "Anonymous Client"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {tr.phone || "No Phone"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-[#100287]">location_on</span>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                        {tr.service || "Booking"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-orange-500">near_me</span>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                        {tr.destination || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-[#E7B036] uppercase tracking-tighter bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                      {tr.date || "Not Set"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">{formatNaira(tr.amount)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      {tr.status === "success" || tr.status === "test_success" ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50/50 text-green-700 text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-green-100 shadow-sm shadow-green-600/5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-50/50 text-red-700 text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-red-100">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          FAILED
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-xs bg-slate-50 text-slate-400 px-2.5 py-1.5 rounded-lg font-mono border border-slate-100">
                      {tr.reference}
                    </code>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xs font-bold text-slate-600">
                      {formatDate(tr.created_at || tr.paid_at)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-8 py-32 text-center text-slate-400 font-bold bg-slate-50/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-200">
                        {searchTerm ? "search_off" : "folder_open"}
                      </span>
                    </div>
                    <p className="text-slate-400 tracking-tight">
                      {searchTerm
                        ? `No results found for "${searchTerm}"`
                        : "No transactions recorded in the ledger yet."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-[11px] font-black text-[#0047BB] hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-slate-50/30 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Live Database Sync Active
          </p>
        </div>
        <p className="text-[9px] text-slate-300 font-bold tracking-tighter italic">
          SECURE OPERATIONS PORTAL — ENCRYPTED JWT ACCESS
        </p>
      </div>
    </div>
  );
}
