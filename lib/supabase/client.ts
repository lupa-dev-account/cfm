import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/database";

export function createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

