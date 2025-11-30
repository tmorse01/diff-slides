import { createStepSchema } from "@/lib/validations";
import { createErrorResponse } from "@/lib/errors";
import { verifyProjectAccess, getProjectClient } from "@/lib/project-access";
import { NextRequest } from "next/server";
import type { Step } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> | { projectId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { projectId } = resolvedParams;

    const project = await verifyProjectAccess(projectId);
    const { client: supabase } = await getProjectClient(project);

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
