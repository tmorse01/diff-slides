import { createAdminClient } from "@/lib/supabase/admin";
import { verifyProjectAccess } from "@/lib/project-access";
import { NotFoundError } from "@/lib/errors";
import { EditorLayout } from "@/components/editor/editor-layout";
import type { Project, Step } from "@/types/database";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
}) {
  const resolvedParams: { projectSlug: string } =
    params instanceof Promise ? await params : params;
  const { projectSlug } = resolvedParams;

  // Use admin client to fetch project (bypasses RLS)
  // We'll verify access using verifyProjectAccess
  const adminClient = createAdminClient();
  const { data: projects, error } = await adminClient
    .from("projects")
    .select("*")
    .eq("slug", projectSlug);

  if (error || !projects || projects.length === 0) {
    throw new NotFoundError("Project not found");
  }

  // Find the project the user has access to
  let project: Project | null = null;
  for (const p of projects) {
    try {
      project = await verifyProjectAccess(p.id);
      break;
    } catch {
      // Continue to next project
    }
  }

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const { data: steps } = await adminClient
    .from("steps")
    .select("*")
    .eq("project_id", project.id)
    .order("index", { ascending: true });

  const typedSteps = (steps || []) as Step[];

  return <EditorLayout project={project} initialSteps={typedSteps} />;
}
