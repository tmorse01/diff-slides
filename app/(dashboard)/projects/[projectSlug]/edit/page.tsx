import { createAdminClient } from "@/lib/supabase/admin";
import { verifyProjectAccess } from "@/lib/project-access";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
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
  let hasUnauthorizedAccess = false;
  
  for (const p of projects) {
    try {
      project = await verifyProjectAccess(p.id);
      break;
    } catch (err) {
      // If it's an UnauthorizedError, the project exists but user doesn't have access
      if (err instanceof UnauthorizedError) {
        hasUnauthorizedAccess = true;
      }
      // Continue to next project
    }
  }

  // If we found projects but none match access, throw UnauthorizedError
  if (!project && hasUnauthorizedAccess) {
    throw new UnauthorizedError(
      "You don't have permission to access this project"
    );
  }

  // If no project found at all
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
