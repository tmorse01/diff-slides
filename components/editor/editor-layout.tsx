"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StepsSidebar } from "./steps-sidebar";
import { StepEditor } from "./step-editor";
import { ActionsPanel } from "./actions-panel";
import { TemporaryProjectBanner } from "@/components/temporary-project-banner";
import { useStepEditor } from "@/hooks/use-step-editor";
import { useDiffSettings } from "@/hooks/use-diff-settings";
import type { Project, Step } from "@/types/database";

interface EditorLayoutProps {
  project: Project;
  initialSteps: Step[];
}

export function EditorLayout({ project, initialSteps }: EditorLayoutProps) {
  const isTemporaryProject = project.session_id && !project.user_id;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial step ID from URL
  const stepIdFromUrl = searchParams.get("step");

  const {
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
  } = useStepEditor({
    initialSteps,
    projectId: project.id,
    initialStepId: stepIdFromUrl,
  });

  // Sync URL when step changes (one-way: state -> URL)
  useEffect(() => {
    const currentStepId = searchParams.get("step");
    
    if (selectedStepId) {
      // Update URL if step changed
      if (currentStepId !== selectedStepId) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", selectedStepId);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    } else if (currentStepId) {
      // Clear step from URL if no step is selected
      const params = new URLSearchParams(searchParams.toString());
      params.delete("step");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [selectedStepId, router, searchParams]);

  // Sync selected step when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    const stepIdFromUrl = searchParams.get("step");
    
    // Only sync if URL step differs from current selection
    if (stepIdFromUrl && stepIdFromUrl !== selectedStepId) {
      // Verify the step exists before selecting it
      const stepExists = steps.some((s) => s.id === stepIdFromUrl);
      if (stepExists) {
        selectStep(stepIdFromUrl);
      } else {
        // Step doesn't exist, clear from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete("step");
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [searchParams, selectedStepId, steps, selectStep, router]);

  // Manage diff settings with hook
  const { settings: diffSettings, updateSettings: updateDiffSettings } =
    useDiffSettings({
      projectId: project.id,
      projectSettings: project.settings,
    });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isTemporaryProject && <TemporaryProjectBanner />}
      <div className="flex flex-1 overflow-hidden">
        <StepsSidebar
          steps={steps}
          selectedStepId={selectedStepId}
          onSelectStep={selectStep}
          onAddStep={addStep}
          onDuplicateStep={duplicateStep}
          onDeleteStep={deleteStep}
          onReorderSteps={reorderSteps}
          projectSlug={project.slug}
        />
        <StepEditor
          step={selectedStep}
          previousStep={previousStep}
          diffSettings={diffSettings}
          onSave={async (data) => {
            // CRITICAL: Always require step ID from selectedStep
            if (!selectedStep) {
              console.error("[onSave] No selected step!");
              return;
            }
            await saveStep(data, selectedStep.id, false);
          }}
          onDataChange={(data, stepId) => {
            handleDataChange(data, stepId, selectedStepId);
          }}
          onGetCurrentData={(getDataFn, stepId) => {
            handleGetCurrentData(getDataFn, stepId, selectedStepId);
          }}
          isSaving={isSaving}
        />
        <ActionsPanel
          project={project}
          projectSlug={project.slug}
          projectId={project.id}
          steps={steps}
          diffSettings={diffSettings}
          onDiffSettingsChange={updateDiffSettings}
        />
      </div>
    </div>
  );
}
