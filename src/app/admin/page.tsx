import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HERO_IMAGE } from "@/lib/constants";

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
    const password = formData.get("password") as string;
    const correctPassword = process.env.DASHBOARD_PASSCODE;

    // Critical check for Netlify deployment
    if (!correctPassword) {
      redirect("/admin?error=server_config_missing");
    }

    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      redirect("/admin/dashboard");
    } else {
       redirect("/admin?error=invalid_passcode");
    }
  }

  const errorMessage = 
    error === "invalid_passcode" ? "Access Denied: Incorrect passcode." :
    error === "server_config_missing" ? "Server Error: DASHBOARD_PASSCODE is not set in environment." :
    null;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 font-sans overflow-hidden bg-[#0B0E14]">

      {/* ── Animated Wallpaper Background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(135deg, rgba(11,14,20,0.93) 0%, rgba(16,2,135,0.55) 100%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover animate-float opacity-40"
        />
      </div>

      {/* Animated glow orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#100287] rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#E7B036] rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-10 group cursor-default">
           <img src="/logo.svg" alt="Safetafi" className="h-10 w-auto mb-4" />
           <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
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
                Security Passcode
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
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-[#100287] transition-all font-mono tracking-widest"
                />
              </div>
            </div>

            <button
               type="submit"
               className="w-full bg-[#100287] text-white py-5 rounded-2xl font-black hover:bg-[#030301] transition-all shadow-xl shadow-blue-600/20 text-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
              Sign into Dashboard
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
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
        <div className="mt-8 text-center text-white/50 text-sm">
           <a href="/" className="font-bold hover:text-white transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">west</span>
              Return to Public Portal
           </a>
        </div>
      </div>
    </div>
  );
}
