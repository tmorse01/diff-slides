import { createStepSchema } from "@/lib/validations";
import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess } from "@/lib/project-access";
import { NextRequest } from "next/server";
import { StepsService } from "@/lib/services/steps.service";
import type { StepInsert } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const isTemporary = !!(project.session_id && !project.user_id);

    const body = await request.json();
    const validatedData = createStepSchema.parse(body);

    // Get the max index for this project
    const existingSteps = await StepsService.getByProjectId(projectId);
    const nextIndex =
      existingSteps.length > 0
        ? Math.max(...existingSteps.map((s) => s.index)) + 1
        : 0;

    const stepData: StepInsert = {
      project_id: projectId,
      index: nextIndex,
      title: validatedData.title,
      notes: validatedData.notes || null,
      language: validatedData.language || "typescript",
      code: validatedData.code || "", // Ensure code is always a string
    };

    // Use typed service to create
    const newStep = await StepsService.create(stepData, isTemporary);

    return Response.json(newStep, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
