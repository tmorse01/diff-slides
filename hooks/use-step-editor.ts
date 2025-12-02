import { useState, useRef, useCallback } from "react";
import React from "react";
import type { Step } from "@/types/database";
import { toast } from "@/hooks/use-toast";
import { ToastAction, type ToastActionElement } from "@/components/ui/toast";
import { StepsApiService } from "@/lib/services/steps-api.service";

interface StepData {
  title: string;
  notes: string | null;
  language: string;
  code: string;
}

interface UseStepEditorOptions {
  initialSteps: Step[];
  projectId: string;
  onStepUpdate?: (step: Step) => void;
}

export function useStepEditor({
  initialSteps,
  projectId,
  onStepUpdate,
}: UseStepEditorOptions) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialSteps.length > 0 ? initialSteps[0].id : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Store unsaved changes per step ID to prevent cross-contamination
  const unsavedChangesRef = useRef<Map<string, StepData>>(new Map());
  // Track which step's data getter is currently active
  const activeStepDataGetterRef = useRef<{
    stepId: string;
    getData: () => StepData;
  } | null>(null);
  // Track steps that failed to save in background
  const failedSavesRef = useRef<Set<string>>(new Set());

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;
  const selectedStepIndex = selectedStep
    ? steps.findIndex((s) => s.id === selectedStepId)
    : -1;
  const previousStep =
    selectedStepIndex > 0 ? steps[selectedStepIndex - 1] : null;

  // Save step with strict validation
  const saveStep = useCallback(
    async (data: StepData, stepId: string, silent = false) => {
      // CRITICAL: Prevent saves during reordering
      if (isReordering) {
        throw new Error("Cannot save while reordering steps");
      }

      // CRITICAL: stepId is required - never use selectedStep.id as fallback
      if (!stepId) {
        throw new Error("stepId is required for save operation");
      }

      // Validate that the step exists
      const targetStep = steps.find((s) => s.id === stepId);
      if (!targetStep) {
        throw new Error(`Step ${stepId} not found`);
      }

      // CRITICAL: Validate form data before saving
      const trimmedTitle = (data.title || "").trim();
      const trimmedCode = (data.code || "").trim();

      if (!trimmedTitle) {
        // Use existing title if new one is empty
        data.title = targetStep.title;
      } else {
        data.title = trimmedTitle;
      }

      if (!trimmedCode) {
        // Use existing code if new one is empty
        data.code = targetStep.code;
      } else {
        data.code = trimmedCode;
      }

      // Final validation - ensure we have valid data
      if (!data.title || !data.code) {
        throw new Error("Cannot save step with empty title or code");
      }

      if (!silent) {
        setIsSaving(true);
      }
      try {
        const updatedStep = await StepsApiService.updateStep(stepId, data);

        // Only update if IDs match
        setSteps((prevSteps) =>
          prevSteps.map((s) => (s.id === stepId ? updatedStep : s))
        );

        // Clear unsaved changes for this step
        unsavedChangesRef.current.delete(stepId);

        // Notify parent if callback provided
        if (onStepUpdate) {
          onStepUpdate(updatedStep);
        }
      } catch (error) {
        if (!silent) {
          toast({
            variant: "destructive",
            title: "Failed to save step",
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
        throw error; // Re-throw so caller knows it failed
      } finally {
        if (!silent) {
          setIsSaving(false);
        }
      }
    },
    [steps, onStepUpdate, isReordering]
  );

  // Wrapper for step selection - optimistic switching with background save
  const selectStep = useCallback(
    (newStepId: string) => {
      // CRITICAL: Prevent selection during reordering
      if (isReordering) {
        return;
      }

      const currentStepId = selectedStepId;

      // OPTIMISTIC: Switch immediately without waiting
      // CRITICAL: Clear any stale data from the Map for the step we're switching to
      unsavedChangesRef.current.delete(newStepId);
      setSelectedStepId(newStepId);

      // Save previous step in background (non-blocking)
      if (currentStepId && currentStepId !== newStepId) {
        // Get unsaved changes for the current step from our Map
        const dataToSave = unsavedChangesRef.current.get(currentStepId);

        if (dataToSave) {
          const currentStep = steps.find((s) => s.id === currentStepId);
          if (currentStep) {
            const trimmedTitle = (dataToSave.title || "").trim();
            const trimmedCode = (dataToSave.code || "").trim();

            // Only save if we have valid data and it has changed
            if (trimmedTitle && trimmedCode) {
              const hasChanges =
                trimmedTitle !== currentStep.title ||
                dataToSave.notes !== (currentStep.notes || null) ||
                dataToSave.language !== currentStep.language ||
                trimmedCode !== currentStep.code;

              if (hasChanges) {
                const validData = {
                  ...dataToSave,
                  title: trimmedTitle,
                  code: trimmedCode,
                };

                // Save in background silently - don't await
                saveStep(validData, currentStepId, true).catch(() => {
                  // Track failed save
                  failedSavesRef.current.add(currentStepId);

                  // Show error toast with option to go back
                  const actionElement = React.createElement(
                    ToastAction,
                    {
                      altText: "Go back to step",
                      onClick: () => {
                        setSelectedStepId(currentStepId);
                        failedSavesRef.current.delete(currentStepId);
                      },
                    },
                    "Go back"
                  ) as unknown as ToastActionElement;

                  toast({
                    variant: "destructive",
                    title: "Failed to save changes",
                    description: `Changes to "${currentStep.title}" could not be saved. Go back to that step to retry.`,
                    action: actionElement,
                  });
                });
              }
            }
          }
        }

        // Clear unsaved changes for the step we're leaving (optimistic)
        unsavedChangesRef.current.delete(currentStepId);
      }
    },
    [selectedStepId, saveStep, steps, isReordering]
  );

  // Handle data changes from editor
  const handleDataChange = useCallback(
    (data: StepData, stepId: string, currentSelectedStepId: string | null) => {
      // CRITICAL: Don't accept changes during reordering
      if (isReordering) {
        return;
      }

      // CRITICAL: Validate stepId matches selectedStep before storing
      if (!currentSelectedStepId || stepId !== currentSelectedStepId) {
        return;
      }

      // CRITICAL: Verify the step exists in our steps list
      const stepExists = steps.some((s) => s.id === stepId);
      if (!stepExists) {
        return;
      }

      // CRITICAL: Compare with current step data to ensure we're not storing stale data
      const currentStep = steps.find((s) => s.id === stepId);
      if (currentStep) {
        // If the data matches the current step exactly, it might be stale (form just loaded)
        const matchesCurrentStep =
          data.title === currentStep.title &&
          data.code === currentStep.code &&
          data.notes === (currentStep.notes || null) &&
          data.language === currentStep.language;

        if (matchesCurrentStep) {
          // Don't store if it matches exactly - this is likely just form initialization
          return;
        }
      }

      // Store in Map keyed by stepId for isolation
      unsavedChangesRef.current.set(stepId, data);
    },
    [steps, isReordering]
  );

  // Handle data getter registration
  const handleGetCurrentData = useCallback(
    (
      getDataFn: () => StepData,
      stepId: string,
      currentSelectedStepId: string | null
    ) => {
      // CRITICAL: Only store getter if it's for the currently selected step
      if (currentSelectedStepId && stepId === currentSelectedStepId) {
        activeStepDataGetterRef.current = {
          stepId: stepId,
          getData: getDataFn,
        };
      }
    },
    []
  );

  // Add step
  const addStep = useCallback(async () => {
    // CRITICAL: Prevent adding during reordering
    if (isReordering) {
      toast({
        variant: "destructive",
        title: "Cannot add step",
        description: "Please wait for reordering to complete.",
      });
      return;
    }

    try {
      const newStep = await StepsApiService.createStep(projectId, {
        title: "New Step",
        notes: null,
        language: "typescript",
        code: "",
      });

      setSteps((prevSteps) => [...prevSteps, newStep]);
      setSelectedStepId(newStep.id);
      // Clear unsaved changes for new step
      unsavedChangesRef.current.delete(newStep.id);
      toast({
        title: "Step added",
        description: `New step "${newStep.title}" created.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to add step",
        description: "Please try again.",
      });
    }
  }, [projectId, isReordering]);

  // Duplicate step
  const duplicateStep = useCallback(
    async (stepId: string) => {
      // CRITICAL: Prevent duplicating during reordering
      if (isReordering) {
        toast({
          variant: "destructive",
          title: "Cannot duplicate step",
          description: "Please wait for reordering to complete.",
        });
        return;
      }

      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      try {
        const newStep = await StepsApiService.createStep(projectId, {
          title: `${step.title} (Copy)`,
          notes: step.notes,
          language: step.language,
          code: step.code,
        });

        setSteps((prevSteps) => [...prevSteps, newStep]);
        setSelectedStepId(newStep.id);
        // Clear unsaved changes for new step
        unsavedChangesRef.current.delete(newStep.id);
        toast({
          title: "Step duplicated",
          description: `Step "${newStep.title}" duplicated.`,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to duplicate step",
          description: "Please try again.",
        });
      }
    },
    [steps, projectId, isReordering]
  );

  // Delete step
  const deleteStep = useCallback(
    async (stepId: string) => {
      // CRITICAL: Prevent deleting during reordering
      if (isReordering) {
        toast({
          variant: "destructive",
          title: "Cannot delete step",
          description: "Please wait for reordering to complete.",
        });
        return;
      }

      if (!confirm("Are you sure you want to delete this step?")) return;

      try {
        await StepsApiService.deleteStep(stepId);

        setSteps((prevSteps) => prevSteps.filter((s) => s.id !== stepId));
        if (selectedStepId === stepId) {
          const remainingSteps = steps.filter((s) => s.id !== stepId);
          setSelectedStepId(
            remainingSteps.length > 0 ? remainingSteps[0].id : null
          );
        }
        // Clear unsaved changes for deleted step
        unsavedChangesRef.current.delete(stepId);
        toast({
          title: "Step deleted",
          description: "The step has been successfully deleted.",
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to delete step",
          description: "Please try again.",
        });
      }
    },
    [selectedStepId, steps, isReordering]
  );

  // Reorder steps
  const reorderSteps = useCallback(
    async (draggedStepId: string, targetIndex: number) => {
      // CRITICAL: Set reordering flag to prevent saves and selections
      setIsReordering(true);

      try {
        const sortedSteps = [...steps].sort((a, b) => a.index - b.index);
        const draggedIndex = sortedSteps.findIndex(
          (s) => s.id === draggedStepId
        );

        if (draggedIndex === -1 || draggedIndex === targetIndex) {
          setIsReordering(false);
          return; // No change needed
        }

        // CRITICAL: Save current step before reordering if it has unsaved changes
        const currentStepId = selectedStepId;
        if (currentStepId) {
          const dataToSave = unsavedChangesRef.current.get(currentStepId);
          if (dataToSave) {
            const currentStep = steps.find((s) => s.id === currentStepId);
            if (currentStep) {
              const trimmedTitle = (dataToSave.title || "").trim();
              const trimmedCode = (dataToSave.code || "").trim();
              if (trimmedTitle && trimmedCode) {
                try {
                  await saveStep(
                    {
                      ...dataToSave,
                      title: trimmedTitle,
                      code: trimmedCode,
                    },
                    currentStepId,
                    true
                  );
                } catch {
                  // Continue with reorder even if save fails
                }
              }
            }
          }
        }

        // CRITICAL: Clear all unsaved changes before reordering
        // This prevents stale data from being associated with wrong steps
        unsavedChangesRef.current.clear();

        // Optimistically update UI
        const reorderedStepsLocal = [...sortedSteps];
        const [draggedStep] = reorderedStepsLocal.splice(draggedIndex, 1);
        reorderedStepsLocal.splice(targetIndex, 0, draggedStep);

        // Update indices
        const updatedSteps = reorderedStepsLocal.map((step, idx) => ({
          ...step,
          index: idx,
        }));

        setSteps(updatedSteps);

        // CRITICAL: If the selected step was moved, update selectedStepId to track it
        // The step ID doesn't change, so selectedStepId remains valid

        // Update all steps in the database using the reorder endpoint
        // This handles the unique constraint properly by updating atomically
        const stepIds = updatedSteps.map((step) => step.id);
        const reorderedStepsFromServer = await StepsApiService.reorderSteps(
          projectId,
          stepIds
        );

        // Verify all steps were updated correctly
        if (reorderedStepsFromServer.length !== updatedSteps.length) {
          throw new Error("Not all steps were updated");
        }

        // Update local state with the server response to ensure consistency
        setSteps(reorderedStepsFromServer);

        toast({
          title: "Steps reordered",
          description: "The step order has been updated.",
        });
      } catch (error) {
        console.error("Failed to reorder steps:", error);
        // Revert on error - reload steps from server
        try {
          const refreshedSteps = await StepsApiService.getSteps(projectId);
          setSteps(refreshedSteps);
        } catch (refreshError) {
          console.error(
            "Failed to refresh steps after reorder error:",
            refreshError
          );
          // If refresh fails, at least revert to previous state
          setSteps(steps);
        }
        toast({
          variant: "destructive",
          title: "Failed to reorder steps",
          description:
            error instanceof Error
              ? error.message
              : "Please try again. The order has been reverted.",
        });
      } finally {
        setIsReordering(false);
      }
    },
    [steps, selectedStepId, saveStep, projectId]
  );

  return {
    steps,
    selectedStepId,
    selectedStep,
    previousStep,
    isSaving,
    selectStep,
    saveStep,
    addStep,
    duplicateStep,
    deleteStep,
    reorderSteps,
    handleDataChange,
    handleGetCurrentData,
  };
}
