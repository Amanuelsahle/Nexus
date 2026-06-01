"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    return redirect("/auth/register?error=Could not create account");
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
  redirect("/dashboard");
}
