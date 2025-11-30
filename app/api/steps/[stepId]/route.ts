import { createClient } from "@/lib/supabase/server";
import { updateStepSchema } from "@/lib/validations";
import {
  createErrorResponse,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { Step, Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getStepAndVerifyOwnership(
  stepId: string,
  userId: string,
  supabase: SupabaseClient<Database>
) {
  const { data: step, error } = await supabase
    .from("steps")
    .select(
      `
      *,
      projects!inner(user_id)
    `
    )
    .eq("id", stepId)
    .single();

  if (error || !step) {
    throw new NotFoundError("Step not found");
  }

  const typedStep = step as Step & { projects: { user_id: string } };

  if (typedStep.projects.user_id !== userId) {
    throw new UnauthorizedError(
      "You don't have permission to access this step"
    );
  }

  return typedStep;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> | { stepId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { stepId } = resolvedParams;

    await getStepAndVerifyOwnership(stepId, user.id, supabase);

    const body = await request.json();
    const validatedData = updateStepSchema.parse(body);

    const updateData: Partial<Step> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    } as Partial<Step>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from("steps")
      .update(updateData as any)
      .eq("id", stepId)
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
  { params }: { params: Promise<{ stepId: string }> | { stepId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { stepId } = resolvedParams;

    const step = await getStepAndVerifyOwnership(stepId, user.id, supabase);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase
          .from("steps")
          .update({ index: stepToUpdate.index - 1 } as any)
          .eq("id", stepToUpdate.id) as any);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
