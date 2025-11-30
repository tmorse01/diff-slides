import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { Project, Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Verify project access for both authenticated users and temporary sessions
 * Returns the project if access is granted
 */
export async function verifyProjectAccess(
  projectId: string
): Promise<Project> {
  const user = await getUser();
  const sessionId = await getSessionId();
  const adminClient = createAdminClient();

  // Fetch project using admin client (bypasses RLS)
  const { data: project, error } = await adminClient
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new NotFoundError("Project not found");
  }

  const typedProject = project as Project;

  // Check access: either user owns it or session matches
  if (user && typedProject.user_id === user.id) {
    return typedProject;
  }

  if (sessionId && typedProject.session_id === sessionId) {
    return typedProject;
  }

  throw new UnauthorizedError(
    "You don't have permission to access this project"
  );
}

/**
 * Get the appropriate Supabase client based on project type
 * Returns admin client for temporary projects, regular client for user projects
 */
export async function getProjectClient(project: Project): Promise<{
  client: SupabaseClient<Database>;
  isTemporary: boolean;
}> {
  if (project.session_id && !project.user_id) {
    return {
      client: createAdminClient(),
      isTemporary: true,
    };
  }

  return {
    client: await createClient(),
    isTemporary: false,
  };
}

