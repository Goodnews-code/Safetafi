import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import AdminActions from "./AdminActions";
import Sidebar from "./Sidebar";
import TransactionTable from "./TransactionTable";

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

        {/* Transaction Table — searchable client component */}
        <TransactionTable transactions={transactions} />
      </main>
    </div>
  );
}
