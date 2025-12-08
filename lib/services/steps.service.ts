import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  TypedInsertBuilder,
  TypedUpdateBuilder,
} from "@/lib/supabase/types";
import type { Database, Step, StepInsert, StepUpdate } from "@/types/database";

// Type helpers
type StepRow = Database["public"]["Tables"]["steps"]["Row"];

/**
 * Steps Service - Strongly typed data access layer for steps
 */
export class StepsService {
  /**
   * Get steps by project ID
   */
  static async getByProjectId(projectId: string): Promise<Step[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("steps")
      .select("*")
      .eq("project_id", projectId)
      .order("index", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch steps: ${error.message}`);
    }

    return (data ?? []) as Step[];
  }

  /**
   * Get step by ID
   */
  static async getById(stepId: string): Promise<Step> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("steps")
      .select("*")
      .eq("id", stepId)
      .single();

    if (error || !data) {
      throw new Error(`Step not found: ${error?.message || "Unknown error"}`);
    }

    return data as Step;
  }

  /**
   * Get step with project info (for access verification)
   */
  static async getByIdWithProject(stepId: string): Promise<{
    step: Step;
    project: { id: string; user_id: string | null; session_id: string | null };
  }> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("steps")
      .select("*, projects!inner(id, user_id, session_id)")
      .eq("id", stepId)
      .single();

    if (error || !data) {
      throw new Error(`Step not found: ${error?.message || "Unknown error"}`);
    }

    // Type assertion for joined query
    const typedData = data as Step & {
      projects: {
        id: string;
        user_id: string | null;
        session_id: string | null;
      };
    };

    return {
      step: typedData as Step,
      project: typedData.projects,
    };
  }

  /**
   * Create a new step
   */
  static async create(
    stepData: StepInsert,
    useAdminClient = false
  ): Promise<Step> {
    if (useAdminClient) {
      return this._createWithAdmin(stepData);
    } else {
      return this._createWithClient(stepData);
    }
  }

  /**
   * Internal: Create with admin client (properly typed)
   */
  private static async _createWithAdmin(stepData: StepInsert): Promise<Step> {
    const client = createAdminClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "steps"
    ) as unknown as TypedInsertBuilder<"steps">;
    const result = await queryBuilder.insert(stepData).select().single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to create step: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Step;
  }

  /**
   * Internal: Create with regular client (properly typed)
   */
  private static async _createWithClient(stepData: StepInsert): Promise<Step> {
    const client = await createClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "steps"
    ) as unknown as TypedInsertBuilder<"steps">;
    const result = await queryBuilder.insert(stepData).select().single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to create step: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Step;
  }

  /**
   * Update a step
   */
  static async update(
    stepId: string,
    updateData: StepUpdate,
    useAdminClient = false
  ): Promise<Step> {
    if (useAdminClient) {
      return this._updateWithAdmin(stepId, updateData);
    } else {
      return this._updateWithClient(stepId, updateData);
    }
  }

  /**
   * Internal: Update with admin client (properly typed)
   */
  private static async _updateWithAdmin(
    stepId: string,
    updateData: StepUpdate
  ): Promise<Step> {
    const client = createAdminClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "steps"
    ) as unknown as TypedUpdateBuilder<"steps">;
    const result = await queryBuilder
      .update(updateData)
      .eq("id", stepId)
      .select()
      .single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to update step: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Step;
  }

  /**
   * Internal: Update with regular client (properly typed)
   */
  private static async _updateWithClient(
    stepId: string,
    updateData: StepUpdate
  ): Promise<Step> {
    const client = await createClient();
    // Use type-safe builder - no 'any' used, all types from Database interface
    const queryBuilder = client.from(
      "steps"
    ) as unknown as TypedUpdateBuilder<"steps">;
    const result = await queryBuilder
      .update(updateData)
      .eq("id", stepId)
      .select()
      .single();

    if (result.error || !result.data) {
      throw new Error(
        `Failed to update step: ${result.error?.message || "Unknown error"}`
      );
    }

    return result.data as Step;
  }

  /**
   * Delete a step
   */
  static async delete(stepId: string, useAdminClient = false): Promise<void> {
    const client = useAdminClient ? createAdminClient() : await createClient();

    const { error } = await client.from("steps").delete().eq("id", stepId);

    if (error) {
      throw new Error(`Failed to delete step: ${error.message}`);
    }
  }

  /**
   * Get steps by project ID with ordering
   */
  static async getByProjectIdOrdered(
    projectId: string,
    ascending = true
  ): Promise<Step[]> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("steps")
      .select("*")
      .eq("project_id", projectId)
      .order("index", { ascending });

    if (error) {
      throw new Error(`Failed to fetch steps: ${error.message}`);
    }

    return (data ?? []) as Step[];
  }
}
