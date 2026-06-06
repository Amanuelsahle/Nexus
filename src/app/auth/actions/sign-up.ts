"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export async function signUp(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore,
  }) as any;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // 2. Handle existing email check (If identities array is empty, the email already exists)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  if (data.user) {
    // Create profile
    const profile: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: data.user.id,
      full_name: fullName,
      email,
    };

    const { error: profileError } = await (
      supabase.from("profiles") as any
    ).insert(profile);

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}
