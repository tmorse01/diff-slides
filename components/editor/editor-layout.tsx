"use client";

import { useState } from "react";
import { StepsSidebar } from "./steps-sidebar";
import { StepEditor } from "./step-editor";
import { ActionsPanel } from "./actions-panel";
import type { Project, Step } from "@/types/database";

interface EditorLayoutProps {
  project: Project;
  initialSteps: Step[];
}

export function EditorLayout({ project, initialSteps }: EditorLayoutProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps.length > 0 ? steps[0].id : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;
  const selectedStepIndex = selectedStep
    ? steps.findIndex((s) => s.id === selectedStepId)
    : -1;
  const previousStep =
    selectedStepIndex > 0 ? steps[selectedStepIndex - 1] : null;

  const handleAddStep = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/steps`, {
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
      setSteps([...steps, newStep]);
      setSelectedStepId(newStep.id);
    } catch (error) {
      console.error("Error adding step:", error);
      alert("Failed to add step");
    }
  };

  const handleDuplicateStep = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/steps`, {
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
      setSteps([...steps, newStep]);
      setSelectedStepId(newStep.id);
    } catch (error) {
      console.error("Error duplicating step:", error);
      alert("Failed to duplicate step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Are you sure you want to delete this step?")) return;

    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete step");

      setSteps(steps.filter((s) => s.id !== stepId));
      if (selectedStepId === stepId) {
        const remainingSteps = steps.filter((s) => s.id !== stepId);
        setSelectedStepId(
          remainingSteps.length > 0 ? remainingSteps[0].id : null
        );
      }
    } catch (error) {
      console.error("Error deleting step:", error);
      alert("Failed to delete step");
    }
  };

  const handleSaveStep = async (data: {
    title: string;
    notes: string | null;
    language: string;
    code: string;
  }) => {
    if (!selectedStep) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/steps/${selectedStep.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save step");

      const updatedStep = await response.json();
      setSteps(steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)));
    } catch (error) {
      console.error("Error saving step:", error);
      alert("Failed to save step");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <StepsSidebar
        steps={steps}
        selectedStepId={selectedStepId}
        onSelectStep={setSelectedStepId}
        onAddStep={handleAddStep}
        onDuplicateStep={handleDuplicateStep}
        onDeleteStep={handleDeleteStep}
      />
      <StepEditor
        step={selectedStep}
        previousStep={previousStep}
        onSave={handleSaveStep}
        isSaving={isSaving}
      />
      <ActionsPanel
        projectSlug={project.slug}
        projectId={project.id}
        steps={steps}
        selectedStepId={selectedStepId}
        onDuplicateStep={handleDuplicateStep}
      />
    </div>
  );
}
