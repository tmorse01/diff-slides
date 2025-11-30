import { updateStepSchema } from "@/lib/validations";
import { createErrorResponse, NotFoundError } from "@/lib/errors";
import { verifyProjectAccess, getProjectClient } from "@/lib/project-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import type { Step } from "@/types/database";

async function getStepAndVerifyAccess(stepId: string): Promise<{
  step: Step;
  projectId: string;
}> {
  const adminClient = createAdminClient();
  
  const { data: step, error } = await adminClient
    .from("steps")
    .select("*, projects!inner(id, user_id, session_id)")
    .eq("id", stepId)
    .single();

  if (error || !step) {
    throw new NotFoundError("Step not found");
  }

  const typedStep = step as Step & { 
    projects: { id: string; user_id: string | null; session_id: string | null } 
  };

  // Verify access to the project
  await verifyProjectAccess(typedStep.projects.id);

  return {
    step: typedStep as Step,
    projectId: typedStep.projects.id,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> | { stepId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { stepId } = resolvedParams;

    const { projectId } = await getStepAndVerifyAccess(stepId);
    const project = await verifyProjectAccess(projectId);
    const { client: supabase } = await getProjectClient(project);

    const body = await request.json();
    const validatedData = updateStepSchema.parse(body);

    const updateData: Partial<Step> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    } as Partial<Step>;

    // Type assertion needed due to Supabase TypeScript inference limitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("steps")
      .update(updateData)
      .eq("id", stepId)
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
  { params }: { params: Promise<{ stepId: string }> | { stepId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { stepId } = resolvedParams;

    const { step, projectId } = await getStepAndVerifyAccess(stepId);
    const project = await verifyProjectAccess(projectId);
    const { client: supabase } = await getProjectClient(project);

    // Delete the step
    const { error: deleteError } = await supabase
      .from("steps")
      .delete()
      .eq("id", stepId);

    if (deleteError) {
      return createErrorResponse(deleteError);
    }

    // Reorder remaining steps (decrement indices after the deleted step)
    const { data: stepsToReorder, error: fetchError } = await supabase
      .from("steps")
      .select("id, index")
      .eq("project_id", step.project_id)
      .gt("index", step.index)
      .order("index", { ascending: true });

    if (!fetchError && stepsToReorder) {
      const typedStepsToReorder = stepsToReorder as Pick<
        Step,
        "id" | "index"
      >[];
      // Update each step's index
      for (const stepToUpdate of typedStepsToReorder) {
        // Type assertion needed due to Supabase TypeScript inference limitation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("steps")
          .update({ index: stepToUpdate.index - 1 })
          .eq("id", stepToUpdate.id);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
