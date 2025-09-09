// assets/sb-init.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./sb-config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// IMPORTANT: access-mode.js looks for this
window.__SB = sb;
window.$sb  = sb;

// (optional debug)
window.__SB_INFO__ = { url: SUPABASE_URL, keyStart: SUPABASE_ANON_KEY.slice(0,12) };
