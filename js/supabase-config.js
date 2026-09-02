// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// These come from: Supabase Dashboard > Project Settings > API
//
//  * PUBLISHABLE KEY (sb_publishable_...) — safe to put in the
//    browser. It replaces the old "anon" key. Data is still
//    protected by the Row Level Security rules in
//    supabase-schema.sql.
//
//  * NEVER put a SECRET key (sb_secret_...) in this file —
//    that key bypasses all security and must stay private.
// ============================================================

const SUPABASE_URL = "https://qutosikuhxabuujxgnnp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_DDSGfsBuO3lKIJM1w-8Log_YcKHwpf_";

// Create the Supabase client
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);