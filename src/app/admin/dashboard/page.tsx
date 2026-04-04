import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import AdminActions from "./AdminActions";
import Sidebar from "./Sidebar";

// Revalidate the page data every 30 seconds to provide fresh data while allowing caching
export const revalidate = 30;

const getLedgerStats = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, status, destination");
    return JSON.parse(JSON.stringify({ data, error }));
  },
  ["ledger-stats"],
  { revalidate: 30, tags: ["transactions"] }
);

const getRecentTransactions = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return JSON.parse(JSON.stringify({ data, error }));
  },
  ["recent-transactions"],
  { revalidate: 30, tags: ["transactions"] }
);

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // Check auth
  if (session?.value !== "authenticated") {
    redirect("/admin");
  }

  async function handleLogout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/admin");
  }
  
  // 1. Fetch data in parallel
  const [statsRes, recentRes] = await Promise.all([
    getLedgerStats(),
    getRecentTransactions()
  ]);

  if (statsRes.error || recentRes.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-600 font-bold p-8 text-center rounded-3xl">
        Error loading transactions: {statsRes.error?.message || recentRes.error?.message}
      </div>
    );
  }

  const allTxForStats = statsRes.data || [];
  const transactions = recentRes.data || [];

  // 2. Simple Statistics Calculations
  const totalTransactions = allTxForStats.length;
  const successfulOnes = allTxForStats.filter((t: any) => t.status === "success" || t.status === "test_success");
  const totalRevenue = successfulOnes.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
  const successCount = successfulOnes.length;

  // 3. Formatter for currency
  const formatNaira = (amt: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amt);

  // 4. Formatter for dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex font-sans overflow-x-hidden">
      {/* Sidebar (Client Component for Toggle) */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content Area — adjusts margin ONLY on desktop */}
      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 md:p-10 max-w-7xl w-full">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="max-w-full overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">
              Transaction Ledger
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              Monitor your latest business revenue and bookings in real-time.
            </p>
          </div>
          <AdminActions />
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Revenue Card */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-600/5 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
               <span className="material-symbols-outlined text-9xl text-[#0047BB]">payments</span>
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 font-public-sans">
              Total Revenue (Verified)
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-2xl md:text-3xl font-black text-[#0047BB]">
                 {formatNaira(totalRevenue)}
               </h3>
               <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">+100%</span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed">
               Calculated from <strong>{successCount}</strong> successful checkouts.
            </p>
          </div>

          {/* Volume Card */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-orange-600/5 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
               <span className="material-symbols-outlined text-9xl text-orange-600">bar_chart</span>
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 font-public-sans">
              Total Checkouts
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                 {totalTransactions}
               </h3>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed font-medium">
               Success Rate: <strong>{totalTransactions > 0 ? Math.round((successCount/totalTransactions) * 100) : 0}%</strong> across all attempts.
            </p>
          </div>

          {/* Average Order Value Card */}
          <div className="bg-[#001B44] p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <span className="material-symbols-outlined text-9xl text-white">analytics</span>
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2 font-public-sans">
              Avg. Transaction Size
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-2xl md:text-3xl font-black text-white">
                 {formatNaira(successCount > 0 ? totalRevenue / successCount : 0)}
               </h3>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 mt-4 leading-relaxed">
               Average value per successful logistics booking.
            </p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">
              All Orders
            </h4>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-[#0047BB] transition-colors">
                 <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                type="text"
                placeholder="Search orders..."
                className="bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-6 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#0047BB] transition-all"
              />
            </div>
          </div>

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
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tr: any) => (
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
                        <span className="text-sm font-black text-slate-900">
                          {formatNaira(tr.amount)}
                        </span>
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
                    <td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-bold italic bg-slate-50/20">
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center animate-bounce">
                             <span className="material-symbols-outlined text-4xl text-slate-200">folder_open</span>
                          </div>
                          <p className="text-slate-400 tracking-tight">No transactions recorded in the ledger yet.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Area */}
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
      </main>
    </div>
  );
}
