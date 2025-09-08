// assets/sb-init.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./sb-config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

// Debug helpers (so we can verify in the console)
window.__SB = sb;
window.__SB_INFO__ = { url: SUPABASE_URL };
