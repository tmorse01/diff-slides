"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { migrateTemporaryProjectsToUser } from "@/lib/migrate-temporary-projects";
import type { ProfileInsert } from "@/types/database";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Migrate temporary projects to user account
  if (data.user) {
    await migrateTemporaryProjectsToUser(data.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  // Get the origin URL for email confirmation redirect
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const redirectTo = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create profile
    const profileData: ProfileInsert = {
      id: data.user.id,
      display_name: email.split("@")[0],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles").insert(profileData as any) as any);

    // Migrate temporary projects to user account
    await migrateTemporaryProjectsToUser(data.user.id);
  }

  revalidatePath("/", "layout");
  
  // If email confirmation is required, redirect to a confirmation page
  // Otherwise, redirect to dashboard
  if (data.user && !data.session) {
    redirect("/auth/confirm-email");
  } else {
    redirect("/dashboard");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
