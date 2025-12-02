import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess } from "@/lib/project-access";
import { NextRequest } from "next/server";
import { StepsService } from "@/lib/services/steps.service";
import { z } from "zod";

const reorderStepsSchema = z.object({
  stepIds: z.array(z.string().uuid()).min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const isTemporary = !!(project.session_id && !project.user_id);

    const body = await request.json();
    const { stepIds } = reorderStepsSchema.parse(body);

    // Verify all steps belong to this project
    const allSteps = await StepsService.getByProjectId(projectId);
    const stepIdsSet = new Set(stepIds);
    const validSteps = allSteps.filter((s) => stepIdsSet.has(s.id));

    if (validSteps.length !== stepIds.length) {
      return createErrorResponse(
        new Error("Some step IDs do not belong to this project")
      );
    }

    // Strategy to avoid unique constraint violation:
    // 1. First, set all indices to negative values (temporarily)
    // 2. Then, update to the correct positive indices
    // This ensures no duplicate indices during the update

    // Step 1: Set all to negative indices (using a large offset to avoid conflicts)
    // Use a large negative number to ensure we don't conflict with any existing indices
    const tempOffset = -1000000;
    for (let i = 0; i < validSteps.length; i++) {
      await StepsService.update(
        validSteps[i].id,
        { index: tempOffset - i },
        isTemporary
      );
    }

    // Step 2: Update to correct indices based on the order in stepIds array
    const updatedSteps = [];
    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i];
      const updatedStep = await StepsService.update(
        stepId,
        { index: i },
        isTemporary
      );
      updatedSteps.push(updatedStep);
    }

    return Response.json({ steps: updatedSteps });
  } catch (error) {
    return createErrorResponse(error);
  }
}
