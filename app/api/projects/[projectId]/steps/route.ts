import { createClient } from "@/lib/supabase/server";
import { createStepSchema } from "@/lib/validations";
import {
  createErrorResponse,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { Project, Step, Database } from "@/types/database";
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

export async function POST(
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
    const validatedData = createStepSchema.parse(body);

    // Get the max index for this project
    const { data: existingSteps } = await supabase
      .from("steps")
      .select("index")
      .eq("project_id", projectId)
      .order("index", { ascending: false })
      .limit(1);

    const typedSteps = (existingSteps || []) as Pick<Step, "index">[];
    const nextIndex = typedSteps.length > 0 ? typedSteps[0].index + 1 : 0;

    const stepData: Omit<Step, "id" | "created_at" | "updated_at"> = {
      project_id: projectId,
      index: nextIndex,
      title: validatedData.title,
      notes: validatedData.notes || null,
      language: validatedData.language || "typescript",
      code: validatedData.code || "", // Ensure code is always a string
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from("steps")
      .insert(stepData as any)
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
