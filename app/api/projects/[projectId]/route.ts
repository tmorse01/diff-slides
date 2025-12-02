import { updateProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess } from "@/lib/project-access";
import { getUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { ProjectsService } from "@/lib/services/projects.service";
import { createClient } from "@/lib/supabase/server";
import type { ProjectUpdate } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const user = await getUser();
    const isTemporary = !!(project.session_id && !project.user_id);

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const updateData: ProjectUpdate = {
      ...validatedData,
    };

    // Merge settings if provided (don't replace entire settings object)
    if (validatedData.settings && project.settings) {
      const currentSettings =
        typeof project.settings === "object" && project.settings !== null
          ? (project.settings as Record<string, unknown>)
          : {};
      updateData.settings = {
        ...currentSettings,
        ...(validatedData.settings as Record<string, unknown>),
      } as typeof validatedData.settings;
    }

    // If name is being updated, regenerate slug
    if (validatedData.name) {
      const slug = generateSlug(validatedData.name);

      if (isTemporary) {
        // For temporary projects, check uniqueness within session
        const sessionId = project.session_id!;
        const existingSlugs = await ProjectsService.getSlugsBySessionId(
          sessionId
        );

        let uniqueSlug = slug;
        if (existingSlugs.includes(slug)) {
          let counter = 1;
          while (existingSlugs.includes(`${slug}-${counter}`)) {
            counter++;
          }
          uniqueSlug = `${slug}-${counter}`;
        }
        updateData.slug = uniqueSlug;
      } else if (user) {
        // For authenticated users, use existing logic
        const supabase = await createClient();
        updateData.slug = await ensureUniqueSlug(
          slug,
          user.id,
          supabase,
          projectId
        );
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Use typed service to update
    const updatedProject = await ProjectsService.update(
      projectId,
      updateData,
      isTemporary
    );

    return Response.json(updatedProject);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const isTemporary = !!(project.session_id && !project.user_id);

    // Use typed service to delete
    await ProjectsService.delete(projectId, isTemporary);

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
