import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { createErrorResponse } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import { getOrCreateSessionId } from "@/lib/session";
import { NextRequest } from "next/server";
import type { ProjectInsert } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const slug = generateSlug(validatedData.name);

    // Use admin client for temporary projects (bypasses RLS)
    // We'll verify session_id in application code
    const adminClient = createAdminClient();

    if (user) {
      // Authenticated user - use regular client with RLS
      const supabase = await createClient();
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
    } else {
      // Temporary project - use session_id
      const sessionId = await getOrCreateSessionId();

      // For temporary projects, we need to check uniqueness within the session
      // Since we're using admin client, we can query directly
      const { data: existingProjects } = await adminClient
        .from("projects")
        .select("slug")
        .eq("session_id", sessionId)
        .eq("slug", slug);

      let uniqueSlug = slug;
      if (existingProjects && existingProjects.length > 0) {
        // Add a suffix to make it unique
        let counter = 1;
        while (existingProjects.some((p) => p.slug === `${slug}-${counter}`)) {
          counter++;
        }
        uniqueSlug = `${slug}-${counter}`;
      }

      const projectData: ProjectInsert = {
        session_id: sessionId,
        user_id: null,
        name: validatedData.name,
        slug: uniqueSlug,
        description: validatedData.description || null,
        visibility: validatedData.visibility || "private",
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (adminClient
        .from("projects")
        .insert(projectData as any)
        .select()
        .single() as any);

      if (error) {
        return createErrorResponse(error);
      }

      return Response.json(data, { status: 201 });
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}
