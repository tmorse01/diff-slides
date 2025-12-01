import { getSessionId, clearSessionId } from "@/lib/session";
import { ProjectsService } from "@/lib/services/projects.service";
import type { ProjectUpdate } from "@/types/database";

/**
 * Migrate temporary projects (session-based) to a user account
 * This is called when a user registers or logs in
 */
export async function migrateTemporaryProjectsToUser(
  userId: string
): Promise<number> {
  const sessionId = await getSessionId();

  if (!sessionId) {
    return 0; // No temporary projects to migrate
  }

  // Find all temporary projects for this session using typed service
  const temporaryProjects = await ProjectsService.getTemporaryBySessionId(
    sessionId
  );

  if (temporaryProjects.length === 0) {
    return 0;
  }

  // Update each project to associate with the user
  // We need to handle slug conflicts - if a slug already exists for the user,
  // we'll append a suffix
  let migratedCount = 0;

  for (const project of temporaryProjects) {
    // Check if slug already exists for this user
    const userSlugs = await ProjectsService.getSlugsByUserId(userId);

    let finalSlug = project.slug;
    if (userSlugs.includes(project.slug)) {
      // Slug conflict - append a suffix
      let counter = 1;
      while (userSlugs.includes(`${project.slug}-${counter}`)) {
        counter++;
      }
      finalSlug = `${project.slug}-${counter}`;
    }

    // Update the project using typed service
    const updateData: ProjectUpdate = {
      user_id: userId,
      session_id: null,
      slug: finalSlug,
      updated_at: new Date().toISOString(),
    };

    try {
      await ProjectsService.update(project.id, updateData, true);
      migratedCount++;
    } catch (error) {
      // Log error but continue with other projects
      console.error(`Failed to migrate project ${project.id}:`, error);
    }
  }

  // Clear the session ID after migration
  if (migratedCount > 0) {
    await clearSessionId();
  }

  return migratedCount;
}
