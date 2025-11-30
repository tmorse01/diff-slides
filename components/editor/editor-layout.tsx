"use client";

import { StepsSidebar } from "./steps-sidebar";
import { StepEditor } from "./step-editor";
import { ActionsPanel } from "./actions-panel";
import { TemporaryProjectBanner } from "@/components/temporary-project-banner";
import { useStepEditor } from "@/hooks/use-step-editor";
import type { Project, Step } from "@/types/database";

interface EditorLayoutProps {
  project: Project;
  initialSteps: Step[];
}

export function EditorLayout({ project, initialSteps }: EditorLayoutProps) {
  const isTemporaryProject = project.session_id && !project.user_id;

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
    handleDataChange,
    handleGetCurrentData,
  } = useStepEditor({
    initialSteps,
    projectId: project.id,
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
        />
        <StepEditor
          step={selectedStep}
          previousStep={previousStep}
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
          projectSlug={project.slug}
          projectId={project.id}
          steps={steps}
          selectedStepId={selectedStepId}
          onDuplicateStep={duplicateStep}
        />
      </div>
    </div>
  );
}
