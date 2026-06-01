"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export async function signOut() {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore,
  });

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
