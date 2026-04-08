import { getSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import AdminActions from "./AdminActions";
import Sidebar from "./Sidebar";
import TransactionLedger from "./TransactionLedger";


// Revalidate the page data every 30 seconds to provide fresh data while allowing caching
export const revalidate = 30;

const getLedgerStats = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, status, destination, date");
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
      .limit(1000);
    return JSON.parse(JSON.stringify({ data, error }));
  },
  ["recent-transactions"],
  { revalidate: 30, tags: ["transactions"] }
);

const getTripSettings = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("app_settings")
      .select("key, value")
      .eq("key", "trip_date")
      .maybeSingle();
    return data?.value || "";
  },
  ["trip-settings"],
  { revalidate: 30, tags: ["settings"] }
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
  const [statsRes, recentRes, currentTripDate] = await Promise.all([
    getLedgerStats(),
    getRecentTransactions(),
    getTripSettings()
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

        {/* Unified Transaction Ledger — Handles stats, filtering, and table */}
        <TransactionLedger 
          allTransactions={allTxForStats} 
          recentTransactions={transactions}
          currentTripDate={currentTripDate}
        />
      </main>
    </div>
  );
}
