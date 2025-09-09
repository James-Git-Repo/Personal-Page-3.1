// assets/sb-init.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./sb-config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

window.__SB = sb;
window.$sb  = sb;           // <-- add this line so access-mode.js can find it
window.__SB_INFO__ = { url: SUPABASE_URL, keyStart: SUPABASE_ANON_KEY.slice(0,12) };
