import { createClient } from "./server";
import { Database } from "@/types/supabase";

/**
 * Modern Next.js 16 Client for Server Components
 */
export const createServerSupabaseClient = async () => {
  return await createClient();
};

/**
 * Modern Next.js 16 Client for Server Actions
 */
export const createServerActionSupabaseClient = async () => {
  return await createClient();
};

/**
 * Helper to get the authenticated server user safely
 */
export async function getServerUser() {
  // Await the modern async client instance
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
