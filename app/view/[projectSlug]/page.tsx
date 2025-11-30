import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Viewer } from "@/components/viewer/viewer";
import { Navbar } from "@/components/navbar";
import type { Project, Step } from "@/types/database";

export default async function ViewProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectSlug: string }> | { projectSlug: string };
  searchParams: Promise<{ stepIndex?: string }> | { stepIndex?: string };
}) {
  const user = await getUser();
  const sessionId = await getSessionId();
  const adminClient = createAdminClient();
  const resolvedParams = params instanceof Promise ? await params : params;
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams;
  const { projectSlug } = resolvedParams;
  const { stepIndex } = resolvedSearchParams;

  // Use admin client to fetch project (bypasses RLS)
  // This allows us to access temporary projects
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
    const typedP = p as Project;
    
    // Check if user owns it
    if (user && typedP.user_id === user.id) {
      project = typedP;
      break;
    }
    
    // Check if session matches (for temporary projects)
    if (sessionId && typedP.session_id === sessionId) {
      project = typedP;
      break;
    }
    
    // Check if it's public/unlisted (anyone can view)
    if (
      typedP.visibility === "public" ||
      typedP.visibility === "unlisted"
    ) {
      project = typedP;
      break;
    }
  }

  if (!project) {
    throw new UnauthorizedError(
      "You don't have permission to view this project"
    );
  }

  const { data: steps } = await adminClient
    .from("steps")
    .select("*")
    .eq("project_id", project.id)
    .order("index", { ascending: true });

  const typedSteps = (steps || []) as Step[];

  const initialStepIndex = stepIndex ? parseInt(stepIndex, 10) : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 min-h-0">
        <Viewer steps={typedSteps} initialStepIndex={initialStepIndex} />
      </div>
    </div>
  );
}
