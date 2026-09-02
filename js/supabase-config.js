// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// HOW TO GET YOUR KEYS:
// 1. Go to https://supabase.com and sign up (free)
// 2. Create a new project (name it e.g. "beauty-store", set a password)
// 3. Wait for the project to finish building (~2 min)
// 4. Go to Project Settings > API
// 5. Copy the "Project URL" and the "anon public" key
// 6. Paste them below
// ============================================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";        // e.g. https://xyzcompany.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // the "anon public" key

// Create the Supabase client
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
