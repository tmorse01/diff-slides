"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { computeDiff } from "@/lib/diff";
import type { DiffSettings } from "@/lib/diff-settings";
import type { Step } from "@/types/database";
import { useStepEditorForm } from "@/hooks/use-step-editor-form";
import { StepEditorHeader } from "./step-editor-header";
import { StepEditorInfoBar } from "./step-editor-info-bar";
import { StepEditorFormFields } from "./step-editor-form-fields";
import { StepEditorTabs } from "./step-editor-tabs";

interface StepEditorProps {
  step: Step | null;
  previousStep: Step | null;
  diffSettings: DiffSettings;
  onSave: (data: {
    title: string;
    notes: string | null;
    language: string;
    code: string;
    line_range_start?: number | null;
    line_range_end?: number | null;
  }) => Promise<void>;
  onDataChange?: (
    data: {
      title: string;
      notes: string | null;
      language: string;
      code: string;
    },
    stepId: string
  ) => void;
  onGetCurrentData?: (
    getDataFn: () => {
      title: string;
      notes: string | null;
      language: string;
      code: string;
    },
    stepId: string
  ) => void;
  isSaving?: boolean;
}

export function StepEditor({
  step,
  previousStep,
  diffSettings,
  onSave,
  onDataChange,
  onGetCurrentData,
  isSaving = false,
}: StepEditorProps) {
  const form = useStepEditorForm({
    step,
    onSave: async (data) => {
      // Validate before saving
      if (!data.title.trim()) {
        toast({
          variant: "destructive",
          title: "Title required",
          description: "Please enter a title for this step.",
        });
        return;
      }

      if (!data.code.trim()) {
        toast({
          variant: "destructive",
          title: "Code required",
          description: "Please enter code for this step.",
        });
        return;
      }

      await onSave(data);
    },
    onDataChange,
    onGetCurrentData,
  });

  // Keyboard shortcut: Ctrl+S (or Cmd+S on Mac) to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (!isInputField) {
          e.preventDefault();
          if (step && !isSaving) {
            form.handleSave();
          }
        } else {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, isSaving, form]);

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a step to edit or create a new step
      </div>
    );
  }

  const diff = previousStep ? computeDiff(previousStep.code, form.code) : null;
  const additions = diff?.addedCount || 0;
  const deletions = diff?.removedCount || 0;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <StepEditorHeader
        stepTitle={form.title || step.title || "Untitled"}
        stepLanguage={form.language || step.language || "typescript"}
        hasUnsavedChanges={form.hasUnsavedChanges}
        isSaving={isSaving}
        onSave={form.handleSave}
      />

      {step && (
        <StepEditorInfoBar
          stepIndex={step.index}
          stepTitle={step.title}
          additions={additions}
          deletions={deletions}
        />
      )}

      <StepEditorFormFields
        title={form.title}
        notes={form.notes}
        language={form.language}
        lineRangeStart={form.lineRangeStart}
        lineRangeEnd={form.lineRangeEnd}
        totalLines={form.totalLines}
        validationError={form.lineRangeValidationError}
        onTitleChange={form.setTitle}
        onNotesChange={form.setNotes}
        onLanguageChange={form.setLanguage}
        onLineRangeStartChange={form.setLineRangeStart}
        onLineRangeEndChange={form.setLineRangeEnd}
      />

      <StepEditorTabs
        code={form.code}
        language={form.language}
        previousCode={previousStep?.code || ""}
        diffSettings={diffSettings}
        onCodeChange={form.setCode}
      />
    </div>
  );
}
