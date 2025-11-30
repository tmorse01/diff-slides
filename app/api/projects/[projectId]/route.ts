import { createClient } from "@/lib/supabase/server";
import { updateProjectSchema } from "@/lib/validations";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import {
  createErrorResponse,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { Project, Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getProjectAndVerifyOwnership(
  projectId: string,
  userId: string,
  supabase: SupabaseClient<Database>
) {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new NotFoundError("Project not found");
  }

  const typedProject = project as Project;

  if (typedProject.user_id !== userId) {
    throw new UnauthorizedError(
      "You don't have permission to access this project"
    );
  }

  return typedProject;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    await getProjectAndVerifyOwnership(projectId, user.id, supabase);

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const updateData: Partial<Project> = {
      ...validatedData,
    } as Partial<Project>;

    // If name is being updated, regenerate slug
    if (validatedData.name) {
      const slug = generateSlug(validatedData.name);
      updateData.slug = await ensureUniqueSlug(
        slug,
        user.id,
        supabase,
        projectId
      );
    }

    updateData.updated_at = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from("projects")
      .update(updateData as any)
      .eq("id", projectId)
      .select()
      .single() as any);

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
    const user = await requireAuth();
    const supabase = await createClient();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    await getProjectAndVerifyOwnership(projectId, user.id, supabase);

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
