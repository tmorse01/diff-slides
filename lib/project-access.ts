import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ProjectsService } from "@/lib/services/projects.service";
import type { Project, Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Verify project access for both authenticated users and temporary sessions
 * Returns the project if access is granted
 */
export async function verifyProjectAccess(projectId: string): Promise<Project> {
  const user = await getUser();
  const sessionId = await getSessionId();

  // Fetch project using typed service
  const project = await ProjectsService.getById(projectId);

  // Check access: either user owns it or session matches
  if (user && project.user_id === user.id) {
    return project;
  }

  if (sessionId && project.session_id === sessionId) {
    return project;
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
