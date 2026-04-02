import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy singleton pattern to prevent build-time crashes on CI/CD platforms like Netlify.
 */
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During build, providing a placeholder prevents the build from stopping.
    // If this error happens at runtime, the API calls will correctly error out.
    return createClient("https://placeholder.supabase.co", "placeholder-key");
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
};
