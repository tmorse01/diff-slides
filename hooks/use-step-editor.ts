import { useState, useRef, useCallback } from "react";
import type { Step } from "@/types/database";
import { toast } from "@/hooks/use-toast";

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

  // Store unsaved changes per step ID to prevent cross-contamination
  const unsavedChangesRef = useRef<Map<string, StepData>>(new Map());
  // Track which step's data getter is currently active
  const activeStepDataGetterRef = useRef<{
    stepId: string;
    getData: () => StepData;
  } | null>(null);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;
  const selectedStepIndex = selectedStep
    ? steps.findIndex((s) => s.id === selectedStepId)
    : -1;
  const previousStep =
    selectedStepIndex > 0 ? steps[selectedStepIndex - 1] : null;

  // Save step with strict validation
  const saveStep = useCallback(
    async (data: StepData, stepId: string, silent = false) => {
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

        // CRITICAL: Validate that we saved the correct step
        if (updatedStep.id !== stepId) {
          throw new Error(
            `CRITICAL: Step ID mismatch - tried to save to ${stepId} but got ${updatedStep.id}`
          );
        }

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
    [steps, onStepUpdate]
  );

  // Wrapper for step selection that saves before switching
  const selectStep = useCallback(
    async (newStepId: string) => {
      const currentStepId = selectedStepId;

      // If we're switching from a step, save it first
      if (currentStepId && currentStepId !== newStepId) {
        // Get unsaved changes for the current step from our Map
        // CRITICAL: Only use Map data - it's the source of truth
        // Do NOT use getter as it may capture stale form state
        const dataToSave = unsavedChangesRef.current.get(currentStepId);

        // Only save if we have data for the CURRENT step
        if (dataToSave) {
          // Double-check: verify the step exists and get its current state
          const currentStep = steps.find((s) => s.id === currentStepId);
          if (currentStep) {
            // Validate data before saving - ensure title and code are not empty
            const trimmedTitle = (dataToSave.title || "").trim();
            const trimmedCode = (dataToSave.code || "").trim();

            // If form data is empty, don't save - just switch
            if (trimmedTitle && trimmedCode) {
              // Check if data has actually changed
              const hasChanges =
                trimmedTitle !== currentStep.title ||
                dataToSave.notes !== (currentStep.notes || null) ||
                dataToSave.language !== currentStep.language ||
                trimmedCode !== currentStep.code;

              if (hasChanges) {
                // Ensure we're saving valid data
                const validData = {
                  ...dataToSave,
                  title: trimmedTitle,
                  code: trimmedCode,
                };

                try {
                  // CRITICAL: Always pass the explicit stepId
                  await saveStep(validData, currentStepId, true);
                } catch {
                  // Don't switch if save fails - user should know
                  toast({
                    variant: "destructive",
                    title: "Failed to save changes",
                    description:
                      "Please try saving manually before switching steps.",
                  });
                  return; // Abort the switch
                }
              }
            }
          }
        }

        // Clear unsaved changes for the step we're leaving
        unsavedChangesRef.current.delete(currentStepId);
      }

      // CRITICAL: Clear any stale data from the Map for the step we're switching to
      // This prevents old data from being used if the user switches back quickly
      unsavedChangesRef.current.delete(newStepId);

      // Now switch to the new step
      setSelectedStepId(newStepId);
    },
    [selectedStepId, saveStep, steps]
  );

  // Handle data changes from editor
  const handleDataChange = useCallback(
    (data: StepData, stepId: string, currentSelectedStepId: string | null) => {
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
    [steps]
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
    try {
      const response = await fetch(`/api/projects/${projectId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Step",
          notes: null,
          language: "typescript",
          code: "",
        }),
      });

      if (!response.ok) throw new Error("Failed to create step");

      const newStep = await response.json();
      setSteps((prevSteps) => [...prevSteps, newStep]);
      setSelectedStepId(newStep.id);
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
  }, [projectId]);

  // Duplicate step
  const duplicateStep = useCallback(
    async (stepId: string) => {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      try {
        const response = await fetch(`/api/projects/${projectId}/steps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${step.title} (Copy)`,
            notes: step.notes,
            language: step.language,
            code: step.code,
          }),
        });

        if (!response.ok) throw new Error("Failed to duplicate step");

        const newStep = await response.json();
        setSteps((prevSteps) => [...prevSteps, newStep]);
        setSelectedStepId(newStep.id);
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
    [steps, projectId]
  );

  // Delete step
  const deleteStep = useCallback(
    async (stepId: string) => {
      if (!confirm("Are you sure you want to delete this step?")) return;

      try {
        const response = await fetch(`/api/steps/${stepId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete step");

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
    [selectedStepId, steps]
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
    handleDataChange,
    handleGetCurrentData,
  };
}
