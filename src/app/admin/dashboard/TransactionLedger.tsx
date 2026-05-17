"use client";

import { useMemo } from "react";
import TransactionTable from "./TransactionTable";

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

interface StatTransaction {
  id: string;
  amount: number;
  status: string;
  destination: string;
  date: string;
}

interface TransactionLedgerProps {
  allTransactions: StatTransaction[];
  recentTransactions: Transaction[];
  currentTripDate: string;
}

export default function TransactionLedger({
  allTransactions,
  recentTransactions,
}: TransactionLedgerProps) {
  // Calculate Global Stats
  const stats = useMemo(() => {
    const successfulOnes = allTransactions.filter(
      (t) => t.status === "success" || t.status === "test_success"
    );
    const totalRevenue = successfulOnes.reduce((acc, t) => acc + (t.amount || 0), 0);
    const successCount = successfulOnes.length;
    const totalCheckouts = allTransactions.length;
    const avgOrderValue = successCount > 0 ? totalRevenue / successCount : 0;

    return { totalRevenue, successCount, totalCheckouts, avgOrderValue };
  }, [allTransactions]);

  const formatNaira = (amt: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-600/5 transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
            <span className="material-symbols-outlined text-9xl text-[#0047BB]">payments</span>
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Revenue (All Time)
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-black text-[#0047BB]">
              {formatNaira(stats.totalRevenue)}
            </h3>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed font-medium">
            From <strong>{stats.successCount}</strong> successful bookings.
          </p>
        </div>

        {/* Volume Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-orange-600/5 transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
            <span className="material-symbols-outlined text-9xl text-orange-600">bar_chart</span>
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Checkouts (Total)
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {stats.totalCheckouts}
            </h3>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed font-medium">
            Success Rate: <strong>{stats.totalCheckouts > 0 ? Math.round((stats.successCount / stats.totalCheckouts) * 100) : 0}%</strong>
          </p>
        </div>

        {/* Average Order Value Card */}
        <div className="bg-[#001B44] p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined text-9xl text-white">analytics</span>
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Avg. Size (Overall)
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-black text-white">
              {formatNaira(stats.avgOrderValue)}
            </h3>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed">
            Per successful logistics booking.
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable transactions={recentTransactions} title="All Orders" />
    </div>
  );
}
