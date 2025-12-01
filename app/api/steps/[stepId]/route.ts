import { updateStepSchema } from "@/lib/validations";
import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess } from "@/lib/project-access";
import { NextRequest } from "next/server";
import { StepsService } from "@/lib/services/steps.service";
import type { StepUpdate } from "@/types/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> | { stepId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { stepId } = resolvedParams;

    const { step, project } = await StepsService.getByIdWithProject(stepId);

    // Verify access to the project
    await verifyProjectAccess(project.id);

    const isTemporary = !!(project.session_id && !project.user_id);

    const body = await request.json();
    const validatedData = updateStepSchema.parse(body);

    const updateData: StepUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Use typed service to update
    const updatedStep = await StepsService.update(
      stepId,
      updateData,
      isTemporary
    );

    return Response.json(updatedStep);
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

    const { step, project } = await StepsService.getByIdWithProject(stepId);

    // Verify access to the project
    await verifyProjectAccess(project.id);

    const isTemporary = !!(project.session_id && !project.user_id);

    // Delete the step using typed service
    await StepsService.delete(stepId, isTemporary);

    // Reorder remaining steps (decrement indices after the deleted step)
    const remainingSteps = await StepsService.getByProjectId(step.project_id);
    const stepsToReorder = remainingSteps.filter((s) => s.index > step.index);

    // Update each step's index
    for (const stepToUpdate of stepsToReorder) {
      await StepsService.update(
        stepToUpdate.id,
        { index: stepToUpdate.index - 1 },
        isTemporary
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}
