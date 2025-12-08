import type { Step } from "@/types/database";

interface StepData {
  title: string;
  notes: string | null;
  language: string;
  code: string;
  line_range_start?: number | null;
  line_range_end?: number | null;
}

interface CreateStepData {
  title: string;
  notes: string | null;
  language: string;
  code: string;
}

/**
 * Client-side API service for step operations
 * Handles all fetch requests for steps
 */
export class StepsApiService {
  /**
   * Update a step
   */
  static async updateStep(stepId: string, data: StepData): Promise<Step> {
    const response = await fetch(`/api/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save step: ${errorText}`);
    }

    const updatedStep = await response.json();

    // Validate that we saved the correct step
    if (updatedStep.id !== stepId) {
      throw new Error(
        `CRITICAL: Step ID mismatch - tried to save to ${stepId} but got ${updatedStep.id}`
      );
    }

    return updatedStep;
  }

  /**
   * Create a new step
   */
  static async createStep(
    projectId: string,
    data: CreateStepData
  ): Promise<Step> {
    const response = await fetch(`/api/projects/${projectId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create step: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Delete a step
   */
  static async deleteStep(stepId: string): Promise<void> {
    const response = await fetch(`/api/steps/${stepId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete step: ${errorText}`);
    }
  }

  /**
   * Reorder steps
   */
  static async reorderSteps(
    projectId: string,
    stepIds: string[]
  ): Promise<Step[]> {
    const response = await fetch(`/api/projects/${projectId}/steps/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reorder steps: ${errorText}`);
    }

    const result = await response.json();

    if (!result.steps || !Array.isArray(result.steps)) {
      throw new Error("Invalid response from reorder endpoint");
    }

    return result.steps;
  }

  /**
   * Get all steps for a project
   */
  static async getSteps(projectId: string): Promise<Step[]> {
    const response = await fetch(`/api/projects/${projectId}/steps`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch steps: ${errorText}`);
    }

    return await response.json();
  }
}
