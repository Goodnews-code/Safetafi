import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import TripControl from "../TripControl";
import PricingControl from "../PricingControl";

export default async function TripControlPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (session?.value !== "authenticated") {
    redirect("/admin");
  }

  async function handleLogout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex font-sans overflow-x-hidden">
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 md:p-10 max-w-4xl w-full">
        {/* Header */}
        <header className="mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Trip Control
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base mt-1">
              Manage the active trip date and open or pause payment access.
            </p>
          </div>
        </header>

        {/* Trip Control Panel */}
        <TripControl />

        {/* Pricing Management Panel */}
        <PricingControl />

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
              </div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">When to Open</p>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Set the next trip date, then toggle payments <strong className="text-green-600">ON</strong> to allow customers to book and pay.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-500 text-lg">lock</span>
              </div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">When to Pause</p>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Toggle payments <strong className="text-amber-600">OFF</strong> after a trip closes. Customers will see a friendly notice to check back later.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
