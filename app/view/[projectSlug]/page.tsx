import { getUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Viewer } from "@/components/viewer/viewer";
import { Navbar } from "@/components/navbar";
import { ProjectsService } from "@/lib/services/projects.service";
import { StepsService } from "@/lib/services/steps.service";

export default async function ViewProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
  searchParams: Promise<{ step?: string }> | { step?: string };
}) {
  const user = await getUser();
  const sessionId = await getSessionId();
  const resolvedParams = params instanceof Promise ? await params : params;
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const { projectSlug } = resolvedParams;
  const { step: stepId } = resolvedSearchParams;

  // Fetch projects by slug using typed service
  const projects = await ProjectsService.getBySlug(projectSlug);

  if (projects.length === 0) {
    throw new NotFoundError("Project not found");
  }

  // Find the project the user has access to
  let project = null;
  for (const p of projects) {
    // Check if user owns it
    if (user && p.user_id === user.id) {
      project = p;
      break;
    }

    // Check if session matches (for temporary projects)
    if (sessionId && p.session_id === sessionId) {
      project = p;
      break;
    }

    // Check if it's public/unlisted (anyone can view)
    if (p.visibility === "public" || p.visibility === "unlisted") {
      project = p;
      break;
    }
  }

  if (!project) {
    throw new UnauthorizedError(
      "You don't have permission to view this project"
    );
  }

  // Fetch steps using typed service
  const steps = await StepsService.getByProjectId(project.id);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 min-h-0">
        <Viewer
          steps={steps}
          initialStepId={stepId}
          projectSettings={project.settings}
        />
      </div>
    </div>
  );
}
