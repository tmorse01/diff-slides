import { updateProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess, getProjectClient } from "@/lib/project-access";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import type { ProjectUpdate } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const { client: supabase, isTemporary } = await getProjectClient(project);
    const user = await getUser();

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const updateData: ProjectUpdate = {
      ...validatedData,
    };

    // If name is being updated, regenerate slug
    if (validatedData.name) {
      const slug = generateSlug(validatedData.name);
      
      if (isTemporary) {
        // For temporary projects, check uniqueness within session
        const sessionId = project.session_id!;
        const adminClient = createAdminClient();
        const { data: existingProjects } = await adminClient
          .from("projects")
          .select("slug")
          .eq("session_id", sessionId)
          .eq("slug", slug)
          .neq("id", projectId);

        let uniqueSlug = slug;
        if (existingProjects && existingProjects.length > 0) {
          let counter = 1;
          while (existingProjects.some(p => p.slug === `${slug}-${counter}`)) {
            counter++;
          }
          uniqueSlug = `${slug}-${counter}`;
        }
        updateData.slug = uniqueSlug;
      } else if (user) {
        // For authenticated users, use existing logic
        updateData.slug = await ensureUniqueSlug(
          slug,
          user.id,
          supabase,
          projectId
        );
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Type assertion needed due to Supabase TypeScript inference limitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      return createErrorResponse(error);
    }

    return Response.json(data);
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
    const { client: supabase } = await getProjectClient(project);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      return createErrorResponse(error);
    }

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
