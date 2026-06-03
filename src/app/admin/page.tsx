import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import LoginSubmitButton from "./LoginSubmitButton";

export default async function AdminLogin(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // If already logged in, redirect to dashboard
  if (session?.value === "authenticated") {
    redirect("/admin/dashboard");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect(`/admin?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.user) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      redirect("/admin/dashboard");
    } else {
      redirect("/admin?error=Unauthorized");
    }
  }

  const errorMessage = error ? decodeURIComponent(error) : null;

  return (
    <div className="min-h-screen bg-[#F4F7FA] relative overflow-hidden flex items-center justify-center p-6 font-sans">
      
      {/* Background Decor Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* ANIMATED GLOBS */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#100287] opacity-[0.12] rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E7B036] opacity-[0.12] rounded-full blur-[120px] animate-pulse duration-[5s]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pattern-grid-lg" />

        {/* Trifecta Brand Watermarks */}
        <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 opacity-[0.05] z-0 whitespace-nowrap leading-none transition-opacity duration-1000">
          <h2 className="text-[10rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">SAFETAFI</h2>
        </div>
        <div className="hidden md:block absolute -left-24 top-1/2 -translate-y-1/2 opacity-[0.05] z-0 transform -rotate-90 origin-center whitespace-nowrap leading-none transition-opacity duration-1000">
          <h2 className="text-[8rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">SAFETAFI</h2>
        </div>
        <div className="hidden md:block absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.05] z-0 transform rotate-90 origin-center whitespace-nowrap leading-none transition-opacity duration-1000">
          <h2 className="text-[8rem] font-black tracking-tighter text-slate-900 leading-none uppercase italic">SAFETAFI</h2>
        </div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-10 group cursor-default">
           <img src="/logo.svg" alt="Safetafi" className="h-10 w-auto mb-4" />
           <p className="text-[10px] font-bold text-[#100287] uppercase tracking-[0.2em] mt-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             Secure Operations Gateway
           </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Admin Authentication</h2>
            <p className="text-slate-500 text-sm mt-1">Please enter your specialized passcode to proceed to the command center.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-red-600 text-xs font-black uppercase tracking-widest">{errorMessage}</p>
            </div>
          )}

          <form action={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Admin Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-[#100287] transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <input
                   required
                   name="email"
                   type="email"
                   placeholder="admin@safetafi.com"
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#100287] transition-all placeholder:opacity-30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Security Password
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-[#100287] transition-colors">
                  <span className="material-symbols-outlined">lock</span>
                </span>
                <input
                   required
                   name="password"
                   type="password"
                   placeholder="••••••••••••••••"
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#100287] transition-all font-mono tracking-widest placeholder:opacity-30"
                />
              </div>
            </div>

            <LoginSubmitButton />
          </form>

          {/* Footer of Card */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-sm">shield_lock</span>
              <span className="text-[10px] font-bold uppercase tracking-widest italic font-public-sans opacity-60">
                End-to-End Encrypted Session
              </span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center text-slate-400 text-sm">
           <a href="/" className="font-bold hover:text-[#100287] transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">west</span>
              Return to Public Portal
           </a>
        </div>
      </div>
    </div>
  );
}
