import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Use implicit flow for better compatibility with email links
      // opened in different browsers/apps (e.g., Gmail app's webview)
      flowType: 'implicit',
    },
  });
}


