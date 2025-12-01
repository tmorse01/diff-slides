import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  TypedInsertBuilder,
  TypedUpdateBuilder,
} from "@/lib/supabase/types";
import type {
  Database,
  Project,
  ProjectInsert,
  ProjectUpdate,
} from "@/types/database";

/**
 * Project Service - Strongly typed data access layer for projects
 */
export class ProjectsService {
  /**
   * Get projects by user ID
   */
  static async getByUserId(userId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return (data ?? []) as Project[];
  }

  /**
   * Get project by ID
   */
  static async getById(projectId: string): Promise<Project> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      throw new Error(
        `Project not found: ${error?.message || "Unknown error"}`
      );
    }

    return data as Project;
  }

  /**
   * Get project by slug (returns array for cases with multiple matches)
   */
  static async getBySlug(slug: string): Promise<Project[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("projects")
      .select("*")
      .eq("slug", slug);

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return (data ?? []) as Project[];
  }

  /**
   * Get project by slug (single result)
   */
  static async getBySlugSingle(slug: string): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      throw new Error(
        `Project not found: ${error?.message || "Unknown error"}`
      );
    }

    return data as Project;
  }

  /**
   * Get project slugs by session ID (for uniqueness checks)
   */
  static async getSlugsBySessionId(sessionId: string): Promise<string[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("projects")
      .select("slug")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch project slugs: ${error.message}`);
    }

    // Type assertion for partial select
    const slugs = (data ?? []) as Pick<Project, "slug">[];
    return slugs.map((p) => p.slug);
  }

  /**
   * Get project slugs by user ID (for uniqueness checks)
   */
  static async getSlugsByUserId(userId: string): Promise<string[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch project slugs: ${error.message}`);
    }

    const slugs = (data ?? []) as Pick<Project, "slug">[];
    return slugs.map((p) => p.slug);
  }

  /**
   * Create a new project
   */
  static async create(
    projectData: ProjectInsert,
    useAdminClient = false
  ): Promise<Project> {
    if (useAdminClient) {
      return this._createWithAdmin(projectData);
    } else {
      return this._createWithClient(projectData);
    }
  }

  /**
   * Internal: Create with admin client (properly typed)
   */
  private static async _createWithAdmin(
    projectData: ProjectInsert
  ): Promise<Project> {
    const client = createAdminClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "projects"
    ) as unknown as TypedInsertBuilder<"projects">;
    const result = await queryBuilder.insert(projectData).select().single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to create project: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Project;
  }

  /**
   * Internal: Create with regular client (properly typed)
   */
  private static async _createWithClient(
    projectData: ProjectInsert
  ): Promise<Project> {
    const client = await createClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "projects"
    ) as unknown as TypedInsertBuilder<"projects">;
    const result = await queryBuilder.insert(projectData).select().single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to create project: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Project;
  }

  /**
   * Update a project
   */
  static async update(
    projectId: string,
    updateData: ProjectUpdate,
    useAdminClient = false
  ): Promise<Project> {
    if (useAdminClient) {
      return this._updateWithAdmin(projectId, updateData);
    } else {
      return this._updateWithClient(projectId, updateData);
    }
  }

  /**
   * Internal: Update with admin client (properly typed)
   */
  private static async _updateWithAdmin(
    projectId: string,
    updateData: ProjectUpdate
  ): Promise<Project> {
    const client = createAdminClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "projects"
    ) as unknown as TypedUpdateBuilder<"projects">;
    const result = await queryBuilder
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to update project: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Project;
  }

  /**
   * Internal: Update with regular client (properly typed)
   */
  private static async _updateWithClient(
    projectId: string,
    updateData: ProjectUpdate
  ): Promise<Project> {
    const client = await createClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "projects"
    ) as unknown as TypedUpdateBuilder<"projects">;
    const result = await queryBuilder
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to update project: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Project;
  }

  /**
   * Delete a project
   */
  static async delete(
    projectId: string,
    useAdminClient = false
  ): Promise<void> {
    const client = useAdminClient ? createAdminClient() : await createClient();

    const { error } = await client
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Get temporary projects by session ID
   */
  static async getTemporaryBySessionId(sessionId: string): Promise<Project[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("projects")
      .select("*")
      .eq("session_id", sessionId)
      .is("user_id", null);

    if (error) {
      throw new Error(`Failed to fetch temporary projects: ${error.message}`);
    }

    return (data ?? []) as Project[];
  }
}
