import { createClient } from "@/lib/supabase/server";
import { createProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { createErrorResponse } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import { getOrCreateSessionId } from "@/lib/session";
import { NextRequest } from "next/server";
import { ProjectsService } from "@/lib/services/projects.service";
import type { ProjectInsert } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const slug = generateSlug(validatedData.name);

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

      // Use typed service to create
      const newProject = await ProjectsService.create(projectData, false);

      return Response.json(newProject, { status: 201 });
    } else {
      // Temporary project - use session_id
      const sessionId = await getOrCreateSessionId();

      // For temporary projects, we need to check uniqueness within the session
      const existingSlugs = await ProjectsService.getSlugsBySessionId(
        sessionId
      );

      let uniqueSlug = slug;
      if (existingSlugs.includes(slug)) {
        // Add a suffix to make it unique
        let counter = 1;
        while (existingSlugs.includes(`${slug}-${counter}`)) {
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

      // Use typed service to create
      const newProject = await ProjectsService.create(projectData, true);

      return Response.json(newProject, { status: 201 });
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}
