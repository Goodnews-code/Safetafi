import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLogin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  // If already logged in, redirect to dashboard
  if (session?.value === "authenticated") {
    redirect("/admin/dashboard");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    const password = formData.get("password");
    const correctPassword = process.env.DASHBOARD_PASSCODE;

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

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-[#100287] opacity-[0.03] pattern-grid-lg" />
      
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
