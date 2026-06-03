"use client";
import { useFormStatus } from "react-dom";

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#100287] text-white py-5 rounded-2xl font-black hover:bg-[#030301] transition-all shadow-xl shadow-blue-600/20 text-lg flex items-center justify-center gap-2 group transform active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          Authenticating...
        </>
      ) : (
        <>
          Sign into Dashboard
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </>
      )}
    </button>
  );
}
