import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { EditorLayout } from "@/components/editor/editor-layout";
import type { Project, Step } from "@/types/database";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
}) {
  const user = await requireAuth();
  const supabase = await createClient();
  const resolvedParams: { projectSlug: string } =
    params instanceof Promise ? await params : params;
  const { projectSlug } = resolvedParams;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", projectSlug)
    .single();

  if (error || !project) {
    throw new NotFoundError("Project not found");
  }

  const typedProject = project as Project;

  if (typedProject.user_id !== user.id) {
    throw new UnauthorizedError(
      "You don't have permission to edit this project"
    );
  }

  const { data: steps } = await supabase
    .from("steps")
    .select("*")
    .eq("project_id", typedProject.id)
    .order("index", { ascending: true });

  const typedSteps = (steps || []) as Step[];

  return <EditorLayout project={typedProject} initialSteps={typedSteps} />;
}
