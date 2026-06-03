-- Enable Row Level Security (RLS) on public.app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) on public.transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- NOTE: By enabling RLS without creating any policies, all public (anonymous) 
-- and authenticated non-superuser operations on these tables via the Supabase REST API
-- will be denied. 
--
-- This is the desired secure state because all operations in the Safetafi application
-- are routed through secure Next.js Server Components and Route Handlers using the 
-- SUPABASE_SERVICE_ROLE_KEY, which automatically bypasses RLS rules.
