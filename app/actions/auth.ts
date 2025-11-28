'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Verify user password without creating a new session
 * This is safer than using signInWithPassword on the client
 */
export async function verifyPassword(password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return {
        success: false,
        error: 'Unable to verify password. Please try again.',
      };
    }

    // Verify password by attempting to sign in
    // This will refresh the session if password is correct, which is acceptable
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInError) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Password verification failed. Please try again.',
    };
  }
}

