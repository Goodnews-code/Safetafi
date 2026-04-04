"use client";

import { useState } from "react";

interface SidebarProps {
  handleLogout: any;
}

export default function Sidebar({ handleLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Burger Menu Button (Mobile Only) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-50 w-12 h-12 bg-[#001B44] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-in fade-in transition-all"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 bg-[#001B44] text-white flex flex-col shadow-2xl z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0047BB] rounded-xl flex items-center justify-center font-black text-xl italic group hover:scale-110 transition-transform flex-shrink-0">
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

        <nav className="flex-1 px-4 space-y-4 pt-6">
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl bg-[#0047BB]/20 text-white font-bold border-l-4 border-blue-500 transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">dashboard</span>
            <span>Transactions</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-3 p-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">open_in_new</span>
            <span>View Site</span>
          </a>
        </nav>

        <div className="mt-auto p-8 border-t border-white/10 space-y-6">
          <form action={handleLogout}>
             <button
               type="submit"
               className="w-full flex items-center gap-3 p-4 rounded-xl text-red-400 hover:text-white hover:bg-red-600 transition-all font-bold group"
             >
               <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
               <span className="text-sm uppercase tracking-widest">Logout</span>
             </button>
          </form>

          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs border-2 border-green-400 shrink-0">
              AD
            </div>
            <div>
              <p className="text-xs font-black">Admin User</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
