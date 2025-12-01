import { verifyProjectAccess } from "@/lib/project-access";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { EditorLayout } from "@/components/editor/editor-layout";
import { ProjectsService } from "@/lib/services/projects.service";
import { StepsService } from "@/lib/services/steps.service";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
}) {
  const resolvedParams: { projectSlug: string } =
    params instanceof Promise ? await params : params;
  const { projectSlug } = resolvedParams;

  // Fetch projects by slug using typed service
  const projects = await ProjectsService.getBySlug(projectSlug);

  if (projects.length === 0) {
    throw new NotFoundError("Project not found");
  }

  // Find the project the user has access to
  let project = null;
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

  // Fetch steps using typed service
  const steps = await StepsService.getByProjectId(project.id);

  return <EditorLayout project={project} initialSteps={steps} />;
}
