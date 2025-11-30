import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionId, clearSessionId } from "@/lib/session";
import type { Project } from "@/types/database";

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

  const adminClient = createAdminClient();

  // Find all temporary projects for this session
  const { data: temporaryProjects, error } = await adminClient
    .from("projects")
    .select("*")
    .eq("session_id", sessionId)
    .is("user_id", null);

  if (error || !temporaryProjects || temporaryProjects.length === 0) {
    return 0;
  }

  const typedProjects = temporaryProjects as Project[];

  // Update each project to associate with the user
  // We need to handle slug conflicts - if a slug already exists for the user,
  // we'll append a suffix
  let migratedCount = 0;

  for (const project of typedProjects) {
    // Check if slug already exists for this user
    const { data: existingProject } = await adminClient
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", project.slug)
      .single();

    let finalSlug = project.slug;
    if (existingProject) {
      // Slug conflict - append a suffix
      let counter = 1;
      let conflictExists = true;
      while (conflictExists) {
        const testSlug = `${project.slug}-${counter}`;
        const { data: testProject } = await adminClient
          .from("projects")
          .select("id")
          .eq("user_id", userId)
          .eq("slug", testSlug)
          .single();
        
        if (!testProject) {
          finalSlug = testSlug;
          conflictExists = false;
        } else {
          counter++;
        }
      }
    }

    // Update the project
    const { error: updateError } = await adminClient
      .from("projects")
      .update({
        user_id: userId,
        session_id: null,
        slug: finalSlug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (!updateError) {
      migratedCount++;
    }
  }

  // Clear the session ID after migration
  if (migratedCount > 0) {
    await clearSessionId();
  }

  return migratedCount;
}

