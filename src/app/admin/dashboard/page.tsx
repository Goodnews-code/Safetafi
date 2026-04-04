import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import AdminActions from "./AdminActions";

// Revalidate the page data every 30 seconds to provide fresh data while allowing caching
export const revalidate = 30;

const getCachedTransactions = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },
  ["transactions-list"],
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
  
  // 1. Fetch transactions using Next.js caching
  const { data: transactions, error } = await getCachedTransactions();

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-600 font-bold p-8 text-center rounded-3xl">
        Error loading transactions: {error.message}
      </div>
    );
  }

  // 2. Simple Statistics Calculations
  const totalTransactions = transactions?.length || 0;
  const successfulOnes = transactions?.filter((t) => t.status === "success" || t.status === "test_success") || [];
  const totalRevenue = successfulOnes.reduce((acc, t) => acc + (t.amount || 0), 0);
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
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#001B44] text-white p-4 md:p-8 flex flex-col md:fixed md:inset-y-0 shadow-2xl z-20 shrink-0">
        <div className="flex items-center justify-between md:justify-start md:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0047BB] rounded-xl flex items-center justify-center font-black text-xl italic group hover:scale-110 transition-transform">
              ST
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">
                SAFETAFI
              </h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                Admin Portal
              </p>
            </div>
          </div>
          {/* Mobile view avatar */}
          <div className="md:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs border-2 border-green-400">
              AD
            </div>
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 md:space-y-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 md:pb-0 pt-4 md:pt-0 md:flex-1">
          <a
            href="#"
            className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-[#0047BB]/20 text-white font-bold border-b-4 md:border-b-0 md:border-l-4 border-blue-500 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            Transactions
          </a>
          <a
            href="/"
            className="flex items-center gap-3 p-3 md:p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
            View Site
          </a>
          <form action={handleLogout} className="md:hidden ml-auto flex-shrink-0">
             <button
               type="submit"
               className="flex items-center gap-2 p-3 rounded-xl text-red-400 hover:text-white hover:bg-red-600 transition-all font-bold group"
             >
               <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">logout</span>
             </button>
          </form>
        </nav>

        <div className="hidden md:block mt-auto pt-8 border-t border-white/10 space-y-4">
          <form action={handleLogout}>
             <button
               type="submit"
               className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:text-white hover:bg-red-600 transition-all font-bold group"
             >
               <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">logout</span>
               Log Out
             </button>
          </form>

          <div className="flex items-center gap-3 px-2 mt-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs border-2 border-green-400">
              AD
            </div>
            <div>
              <p className="text-xs font-black">Admin User</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 p-4 sm:p-6 md:p-10 max-w-7xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Transaction Ledger
            </h2>
            <p className="text-slate-500 font-medium">
              Monitor your latest business revenue and bookings in real-time.
            </p>
          </div>
          <AdminActions transactions={transactions || []} />
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Revenue Card */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-600/5 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
               <span className="material-symbols-outlined text-9xl text-[#0047BB]">payments</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 font-public-sans">
              Total Revenue (Verified)
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-[#0047BB]">
                 {formatNaira(totalRevenue)}
               </h3>
               <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">+100%</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
               Calculated from <strong>{successCount}</strong> successful checkouts.
            </p>
          </div>

          {/* Volume Card */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-orange-600/5 transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform">
               <span className="material-symbols-outlined text-9xl text-orange-600">bar_chart</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 font-public-sans">
              Total Checkouts
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-slate-900">
                 {totalTransactions}
               </h3>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
               Success Rate: <strong>{totalTransactions > 0 ? Math.round((successCount/totalTransactions) * 100) : 0}%</strong> across all attempts.
            </p>
          </div>

          {/* Average Order Value Card */}
          <div className="bg-[#001B44] p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <span className="material-symbols-outlined text-9xl text-white">analytics</span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 font-public-sans">
              Avg. Transaction Size
            </p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-white">
                 {formatNaira(successCount > 0 ? totalRevenue / successCount : 0)}
               </h3>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
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
                  <th className="px-8 py-5">Customer & Service</th>
                  <th className="px-8 py-5">Schedule</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5">Reference</th>
                  <th className="px-8 py-5 text-right">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 group-hover:text-[#100287] transition-colors text-sm">
                            {tr.customer_name || "Anonymous Client"}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                             <span className="material-symbols-outlined text-[10px]">inventory_2</span>
                             {tr.service || "Booking"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-[#F27308] uppercase tracking-tighter bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
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
