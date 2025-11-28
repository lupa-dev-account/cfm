import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/database";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n\n` +
      `Please add these to your .env.local file:\n` +
      `${missingVars.map(v => `${v}=your_value_here`).join('\n')}\n\n` +
      `You can find these values in your Supabase project settings:\n` +
      `https://supabase.com/dashboard/project/_/settings/api`
    );
  }

  const client = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  // Handle invalid refresh token errors gracefully
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      // If token refresh fails, clear the session
      client.auth.signOut();
    }
  });

  return client;
}

