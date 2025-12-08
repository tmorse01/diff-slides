"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StepsSidebar } from "./steps-sidebar";
import { StepEditor } from "./step-editor";
import { ActionsPanel } from "./actions-panel";
import { TemporaryProjectBanner } from "@/components/temporary-project-banner";
import { useStepEditor } from "@/hooks/use-step-editor";
import { useStepUrlSync } from "@/hooks/use-step-url-sync";
import { useDiffSettings } from "@/hooks/use-diff-settings";
import type { Project, Step } from "@/types/database";

interface EditorLayoutProps {
  project: Project;
  initialSteps: Step[];
}

export function EditorLayout({ project, initialSteps }: EditorLayoutProps) {
  const isTemporaryProject = project.session_id && !project.user_id;
  const searchParams = useSearchParams();

  // Get initial step from URL for useStepEditor
  const stepIdFromUrl = searchParams.get("step");

  const {
    steps,
    selectedStepId,
    selectedStep,
    previousStep,
    isSaving,
    selectStep: originalSelectStep,
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

  // URL controls step selection - use steps from useStepEditor (which may have been modified)
  const { currentStepId, setCurrentStepId } = useStepUrlSync({
    steps, // Use steps from useStepEditor so hook knows about added/deleted steps
    urlParamName: "step",
  });

  // Sync hook's currentStepId to useStepEditor when it changes (from URL navigation)
  useEffect(() => {
    if (currentStepId && currentStepId !== selectedStepId) {
      originalSelectStep(currentStepId);
    }
  }, [currentStepId, selectedStepId, originalSelectStep]);

  // Sync useStepEditor's selectedStepId to hook when it changes (from add/delete/etc)
  useEffect(() => {
    if (selectedStepId && selectedStepId !== currentStepId) {
      setCurrentStepId(selectedStepId);
    }
  }, [selectedStepId, currentStepId, setCurrentStepId]);

  // Wrapper that updates both URL and useStepEditor
  const selectStep = (stepId: string) => {
    setCurrentStepId(stepId);
    originalSelectStep(stepId);
  };

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
