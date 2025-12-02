"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "./code-editor";
import { DiffView } from "./diff-view";
import { computeDiff } from "@/lib/diff";
import type { DiffSettings } from "@/lib/diff-settings";
import type { Step } from "@/types/database";

interface StepEditorProps {
  step: Step | null;
  previousStep: Step | null;
  diffSettings: DiffSettings;
  onSave: (data: {
    title: string;
    notes: string | null;
    language: string;
    code: string;
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

const languages = ["typescript", "javascript", "python", "html", "css", "json"];

export function StepEditor({
  step,
  previousStep,
  diffSettings,
  onSave,
  onDataChange,
  onGetCurrentData,
  isSaving = false,
}: StepEditorProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");
  // Track which step ID the form state is currently displaying
  const currentFormStepIdRef = useRef<string | null>(null);
  // Track if we're currently updating form state (to prevent stale data changes)
  const isUpdatingFormStateRef = useRef<boolean>(false);

  // Helper to get current data with validation
  const getCurrentData = useCallback(() => {
    // Ensure we always return valid data - use step's data as fallback if form is empty
    const safeTitle = title.trim() || step?.title || "";
    const safeCode = code.trim() || step?.code || "";

    return {
      title: safeTitle,
      notes: notes.trim() || null,
      language: language || step?.language || "typescript",
      code: safeCode,
    };
  }, [title, notes, language, code, step]);

  // Helper to check if data has changed
  const checkDataChanged = useCallback(() => {
    const current = JSON.stringify(getCurrentData());
    const changed = current !== lastSavedDataRef.current;
    setHasUnsavedChanges(changed);
    return changed;
  }, [getCurrentData]);

  // Auto-save function (debounced)
  const triggerAutoSave = useCallback(() => {
    if (!step || !checkDataChanged()) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (3 seconds after last change)
    autoSaveTimerRef.current = setTimeout(async () => {
      // Capture step ID at the time of save to prevent saving wrong step
      const currentStepId = step?.id;
      if (!currentStepId) {
        return;
      }

      const data = getCurrentData();

      // Validate data before saving
      if (!data.title.trim() || !data.code.trim()) {
        return;
      }

      // Validate step ID before saving
      if (step.id !== currentStepId) {
        return;
      }

      try {
        await onSave(data);
        lastSavedDataRef.current = JSON.stringify(data);
        setHasUnsavedChanges(false);

        // Notify parent of data change with step ID for validation
        if (onDataChange && step) {
          onDataChange(data, step.id);
        }
      } catch {
        // Don't clear unsaved changes flag if save failed
      }
    }, 3000);
  }, [step, checkDataChanged, getCurrentData, onSave, onDataChange]);

  // Expose getCurrentData function to parent with step ID
  useEffect(() => {
    if (onGetCurrentData && step) {
      onGetCurrentData(getCurrentData, step.id);
    }
  }, [onGetCurrentData, getCurrentData, step]);

  useEffect(() => {
    if (step) {
      // Mark that we're updating form state to prevent stale data changes
      isUpdatingFormStateRef.current = true;

      // Use a small timeout to batch state updates and avoid cascading renders
      const timeoutId = setTimeout(() => {
        setTitle(step.title || "");
        setNotes(step.notes || "");
        setLanguage(step.language || "typescript");
        setCode(step.code || "");

        // Update last saved data when step changes
        lastSavedDataRef.current = JSON.stringify({
          title: step.title || "",
          notes: step.notes || null,
          language: step.language || "typescript",
          code: step.code || "",
        });

        // Update the ref to track which step this form state is for
        currentFormStepIdRef.current = step.id;
        setHasUnsavedChanges(false);

        // Allow data changes after form state is updated
        isUpdatingFormStateRef.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      isUpdatingFormStateRef.current = true;
      const timeoutId = setTimeout(() => {
        setTitle("");
        setNotes("");
        setLanguage("typescript");
        setCode("");
        lastSavedDataRef.current = "";
        currentFormStepIdRef.current = null;
        isUpdatingFormStateRef.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [step]); // Re-run when step changes

  // Trigger auto-save when any field changes
  useEffect(() => {
    // CRITICAL: Don't process changes if we're updating form state or if form state doesn't match current step
    if (
      !step ||
      isUpdatingFormStateRef.current ||
      currentFormStepIdRef.current !== step.id
    ) {
      return;
    }

    if (checkDataChanged()) {
      triggerAutoSave();

      // Notify parent of data change immediately with step ID
      // CRITICAL: Double-check step ID matches before notifying
      if (onDataChange && step && currentFormStepIdRef.current === step.id) {
        const data = getCurrentData();
        onDataChange(data, step.id);
      }
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    title,
    notes,
    language,
    code,
    step,
    checkDataChanged,
    triggerAutoSave,
    onDataChange,
    getCurrentData,
  ]);

  const handleSave = async () => {
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const data = getCurrentData();

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

    try {
      await onSave(data);
      lastSavedDataRef.current = JSON.stringify(data);
      setHasUnsavedChanges(false);
    } catch {
      // Error is already handled by onSave
    }
  };

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a step to edit or create a new step
      </div>
    );
  }

  const diff = previousStep ? computeDiff(previousStep.code, code) : null;
  const additions = diff?.addedCount || 0;
  const deletions = diff?.removedCount || 0;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
          <span className="text-sm font-mono text-foreground">
            {step ? `${step.title}.${step.language}` : "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Step info bar */}
      {step && (
        <div className="bg-secondary/30 border-b border-border px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-foreground">
              Step {step.index + 1}: {step.title}
            </span>
            {(additions > 0 || deletions > 0) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {additions > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {additions} {additions === 1 ? "addition" : "additions"}
                  </span>
                )}
                {deletions > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    {deletions} {deletions === 1 ? "deletion" : "deletions"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Step title"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this step"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
            <TabsList>
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
              <TabsTrigger value="diff">Diff View</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="flex-1 min-h-0 mt-4">
              <CodeEditor value={code} onChange={setCode} language={language} />
            </TabsContent>
            <TabsContent
              value="diff"
              className="flex-1 min-h-0 mt-4 overflow-auto"
            >
              <DiffView
                previousCode={previousStep?.code || ""}
                currentCode={code}
                language={language}
                diffSettings={diffSettings}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
