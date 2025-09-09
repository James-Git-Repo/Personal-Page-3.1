// assets/sb-init.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./sb-config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,          // keep session after reload (recommended)
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

window.__SB = sb;
window.$sb  = sb;                  // <-- IMPORTANT: access-mode.js needs this
window.__SB_INFO__ = { url: SUPABASE_URL, keyStart: SUPABASE_ANON_KEY.slice(0,12) };
