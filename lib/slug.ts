import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function ensureUniqueSlug(
  slug: string,
  userId: string,
  supabase: SupabaseClient<Database>,
  excludeId?: string
): Promise<string> {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", finalSlug)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return finalSlug;
    }

    finalSlug = `${slug}-${counter}`;
    counter++;
  }
}
