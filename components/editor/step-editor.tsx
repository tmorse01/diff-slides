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
  const [lineRangeStart, setLineRangeStart] = useState<string>("");
  const [lineRangeEnd, setLineRangeEnd] = useState<string>("");
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
      line_range_start: undefined as number | null | undefined,
      line_range_end: undefined as number | null | undefined,
    };
  }, [title, notes, language, code, step]);

  // Helper to check if data has changed
  const checkDataChanged = useCallback(() => {
    const current = JSON.stringify(getCurrentData());
    const changed = current !== lastSavedDataRef.current;
    setHasUnsavedChanges(changed);
    return changed;
  }, [getCurrentData]);

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

        // Update line range inputs from step
        if (
          step.line_range_start !== undefined &&
          step.line_range_start !== null &&
          step.line_range_end !== undefined &&
          step.line_range_end !== null
        ) {
          setLineRangeStart(step.line_range_start.toString());
          setLineRangeEnd(step.line_range_end.toString());
        } else {
          setLineRangeStart("");
          setLineRangeEnd("");
        }

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
        setLineRangeStart("");
        setLineRangeEnd("");
        lastSavedDataRef.current = "";
        currentFormStepIdRef.current = null;
        isUpdatingFormStateRef.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [step]); // Re-run when step changes

  // Track changes and notify parent (no auto-save)
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
      // Notify parent of data change immediately with step ID
      // CRITICAL: Double-check step ID matches before notifying
      if (onDataChange && step && currentFormStepIdRef.current === step.id) {
        const data = getCurrentData();
        onDataChange(data, step.id);
      }
    }
  }, [
    title,
    notes,
    language,
    code,
    step,
    checkDataChanged,
    onDataChange,
    getCurrentData,
  ]);

  const handleSave = useCallback(async () => {
    // CRITICAL: Validate step ID matches before saving
    if (!step || currentFormStepIdRef.current !== step.id) {
      toast({
        variant: "destructive",
        title: "Cannot save",
        description: "Step has changed. Please refresh and try again.",
      });
      return;
    }

    const baseData = getCurrentData();

    // Validate before saving
    if (!baseData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a title for this step.",
      });
      return;
    }

    if (!baseData.code.trim()) {
      toast({
        variant: "destructive",
        title: "Code required",
        description: "Please enter code for this step.",
      });
      return;
    }

    // Add line range to data before saving
    const start = parseInt(lineRangeStart, 10);
    const end = parseInt(lineRangeEnd, 10);
    const totalLines = baseData.code.split("\n").length;

    // Build complete data object with line ranges
    const data: {
      title: string;
      notes: string | null;
      language: string;
      code: string;
      line_range_start?: number | null;
      line_range_end?: number | null;
    } = {
      ...baseData,
    };

    // Validate and set line range
    if (
      !isNaN(start) &&
      !isNaN(end) &&
      start >= 1 &&
      end >= 1 &&
      start <= end &&
      end <= totalLines
    ) {
      data.line_range_start = start;
      data.line_range_end = end;
    } else if (!lineRangeStart && !lineRangeEnd) {
      // Clear line range if inputs are empty
      data.line_range_start = null;
      data.line_range_end = null;
    } else {
      // Invalid range - keep existing values
      data.line_range_start = step.line_range_start ?? null;
      data.line_range_end = step.line_range_end ?? null;
    }

    try {
      // Save step data (including line ranges)
      await onSave(data);
      lastSavedDataRef.current = JSON.stringify(data);
      setHasUnsavedChanges(false);
    } catch {
      // Error is already handled by onSave
    }
  }, [step, getCurrentData, onSave, lineRangeStart, lineRangeEnd]);

  // Keyboard shortcut: Ctrl+S (or Cmd+S on Mac) to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        // Don't trigger if user is typing in an input, textarea, or contenteditable
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        // Only prevent default and save if not in an input field
        // This allows normal save behavior in code editor, but prevents browser save dialog
        if (!isInputField) {
          e.preventDefault();
          if (step && !isSaving) {
            handleSave();
          }
        } else {
          // If in input field, still prevent browser save but don't trigger our save
          // This prevents the browser save dialog when typing in form fields
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, isSaving, handleSave]);

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

  // Calculate total lines in current code
  const totalLines = code.split("\n").length;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor header */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
          <span className="text-xs font-mono text-foreground">
            {step ? `${step.title}.${step.language}` : "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">Unsaved</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 text-xs"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Step info bar */}
      {step && (
        <div className="bg-secondary/30 border-b border-border px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">
              Step {step.index + 1}: {step.title}
            </span>
            {(additions > 0 || deletions > 0) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {additions > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {additions} {additions === 1 ? "add" : "adds"}
                  </span>
                )}
                {deletions > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {deletions} {deletions === 1 ? "del" : "dels"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
        <div className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="title" className="text-xs">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Step title"
                className="h-8 text-sm"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="language" className="text-xs">
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="h-8 text-sm">
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
            {/* Line Range for Export */}
            <div className="w-40">
              <Label htmlFor="line-range" className="text-xs">
                Line Range (Optional)
              </Label>
              <div className="flex items-center gap-1 mt-0.5">
                <Input
                  id="line-range-start"
                  type="number"
                  min="1"
                  max={totalLines || undefined}
                  value={lineRangeStart}
                  onChange={(e) => setLineRangeStart(e.target.value)}
                  placeholder="1"
                  className="h-8 text-sm w-16"
                />
                <span className="text-xs text-muted-foreground px-0.5">-</span>
                <Input
                  id="line-range-end"
                  type="number"
                  min="1"
                  max={totalLines || undefined}
                  value={lineRangeEnd}
                  onChange={(e) => setLineRangeEnd(e.target.value)}
                  placeholder={totalLines > 0 ? totalLines.toString() : "1"}
                  className="h-8 text-sm w-16"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className="text-xs">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this step"
              rows={2}
              className="text-sm"
            />
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
