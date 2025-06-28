const { createClient } = require("@supabase/supabase-js");

// Check if environment variables are properly configured
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("placeholder") ||
  supabaseAnonKey.includes("placeholder")
) {
  console.warn(
    "⚠️  Warning: Supabase environment variables are not properly configured."
  );
  console.warn(
    "Please set up your Supabase project and update the .env file with real values."
  );
  console.warn(
    "For now, using dummy clients that will fail on actual database operations."
  );
}

// Create Supabase client for general use
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder_key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
);

// Create Supabase admin client for administrative operations
const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || supabaseAnonKey || "placeholder_key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = {
  supabase,
  supabaseAdmin,
};
