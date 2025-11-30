import { createClient } from "@/lib/supabase/server";
import { createProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { createErrorResponse } from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { ProjectInsert } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const slug = generateSlug(validatedData.name);
    const uniqueSlug = await ensureUniqueSlug(slug, user.id, supabase);

    const projectData: ProjectInsert = {
      user_id: user.id,
      name: validatedData.name,
      slug: uniqueSlug,
      description: validatedData.description || null,
      visibility: validatedData.visibility || "private",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from("projects")
      .insert(projectData as any)
      .select()
      .single() as any);

    if (error) {
      return createErrorResponse(error);
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
