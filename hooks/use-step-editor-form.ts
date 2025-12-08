import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Step } from "@/types/database";
import {
  hasLineRange,
  getLineRangeFromStep,
  validateLineRange,
  type LineRange,
} from "@/lib/line-range-helpers";

interface StepFormData {
  title: string;
  notes: string | null;
  language: string;
  code: string;
  line_range_start?: number | null;
  line_range_end?: number | null;
}

interface UseStepEditorFormOptions {
  step: Step | null;
  onSave: (data: StepFormData) => Promise<void>;
  onDataChange?: (
    data: Omit<StepFormData, "line_range_start" | "line_range_end">,
    stepId: string
  ) => void;
  onGetCurrentData?: (
    getDataFn: () => Omit<StepFormData, "line_range_start" | "line_range_end">,
    stepId: string
  ) => void;
}

interface UseStepEditorFormReturn {
  // Form state
  title: string;
  notes: string;
  language: string;
  code: string;
  hasUnsavedChanges: boolean;

  // Setters
  setTitle: (value: string) => void;
  setNotes: (value: string) => void;
  setLanguage: (value: string) => void;
  setCode: (value: string) => void;

  // Line range state
  lineRangeStart: string;
  lineRangeEnd: string;
  setLineRangeStart: (value: string) => void;
  setLineRangeEnd: (value: string) => void;
  lineRangeValidationError?: string;
  isLineRangeValid: boolean;

  // Actions
  handleSave: () => Promise<void>;

  // Computed
  totalLines: number;
}

/**
 * Hook to manage step editor form state and logic
 */
export function useStepEditorForm({
  step,
  onSave,
  onDataChange,
  onGetCurrentData,
}: UseStepEditorFormOptions): UseStepEditorFormReturn {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedDataRef = useRef<string>("");
  const currentFormStepIdRef = useRef<string | null>(null);
  const isUpdatingFormStateRef = useRef<boolean>(false);
  const previousStepIdRef = useRef<string | null>(null);

  // Calculate total lines for line range validation
  const totalLines = code.split("\n").length;

  // Compute target line range values from step
  const targetLineRangeValues = useMemo(() => {
    if (step && hasLineRange(step)) {
      const range = getLineRangeFromStep(step);
      if (range) {
        return {
          start: range.startLine.toString(),
          end: range.endLine.toString(),
        };
      }
    }
    return { start: "", end: "" };
  }, [step]);

  // Initialize line range state with computed values
  const [lineRangeStartState, setLineRangeStartState] = useState<string>(
    () => targetLineRangeValues.start
  );
  const [lineRangeEndState, setLineRangeEndState] = useState<string>(
    () => targetLineRangeValues.end
  );

  // Sync line range state when step changes
  useEffect(() => {
    const currentStepId = step?.id ?? null;
    const previousStepId = previousStepIdRef.current;

    if (currentStepId !== previousStepId) {
      previousStepIdRef.current = currentStepId;
      requestAnimationFrame(() => {
        setLineRangeStartState(targetLineRangeValues.start);
        setLineRangeEndState(targetLineRangeValues.end);
      });
    }
  }, [step?.id, targetLineRangeValues.start, targetLineRangeValues.end]);

  // Get parsed line range values
  const getLineRange = useCallback((): LineRange | null => {
    const startNum = parseInt(lineRangeStartState, 10);
    const endNum = parseInt(lineRangeEndState, 10);

    if (
      isNaN(startNum) ||
      isNaN(endNum) ||
      !lineRangeStartState ||
      !lineRangeEndState
    ) {
      return null;
    }

    return {
      startLine: startNum,
      endLine: endNum,
    };
  }, [lineRangeStartState, lineRangeEndState]);

  // Validate the current line range
  const lineRangeValidation = useCallback(() => {
    if (!lineRangeStartState || !lineRangeEndState) {
      return { valid: true }; // Empty is valid (means no range)
    }

    const startNum = parseInt(lineRangeStartState, 10);
    const endNum = parseInt(lineRangeEndState, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
      return { valid: false, error: "Please enter valid line numbers" };
    }

    return validateLineRange(startNum, endNum, totalLines);
  }, [lineRangeStartState, lineRangeEndState, totalLines]);

  const lineRangeValidationResult = lineRangeValidation();
  const isLineRangeValid = lineRangeValidationResult.valid;
  const lineRangeValidationError = lineRangeValidationResult.error;

  // Helper to get current data with validation
  const getCurrentData = useCallback((): Omit<
    StepFormData,
    "line_range_start" | "line_range_end"
  > => {
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

  // Expose getCurrentData function to parent with step ID
  useEffect(() => {
    if (onGetCurrentData && step) {
      onGetCurrentData(getCurrentData, step.id);
    }
  }, [onGetCurrentData, getCurrentData, step]);

  // Initialize form state when step changes
  useEffect(() => {
    if (step) {
      isUpdatingFormStateRef.current = true;

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

        currentFormStepIdRef.current = step.id;
        setHasUnsavedChanges(false);
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
  }, [step]);

  // Expose line range setters that update both state and sync with form
  const setLineRangeStart = useCallback((value: string) => {
    setLineRangeStartState(value);
  }, []);

  const setLineRangeEnd = useCallback((value: string) => {
    setLineRangeEndState(value);
  }, []);

  // Track changes and notify parent (no auto-save)
  useEffect(() => {
    if (
      !step ||
      isUpdatingFormStateRef.current ||
      currentFormStepIdRef.current !== step.id
    ) {
      return;
    }

    if (checkDataChanged()) {
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
    if (!step || currentFormStepIdRef.current !== step.id) {
      return;
    }

    const baseData = getCurrentData();

    // Build complete data object with line ranges
    const data: StepFormData = {
      ...baseData,
    };

    // Get and validate line range
    const range = getLineRange();
    if (range && isLineRangeValid) {
      data.line_range_start = range.startLine;
      data.line_range_end = range.endLine;
    } else if (!lineRangeStartState && !lineRangeEndState) {
      // Clear line range if inputs are empty
      data.line_range_start = null;
      data.line_range_end = null;
    } else {
      // Invalid range - keep existing values
      data.line_range_start = step.line_range_start ?? null;
      data.line_range_end = step.line_range_end ?? null;
    }

    try {
      await onSave(data);
      lastSavedDataRef.current = JSON.stringify(baseData);
      setHasUnsavedChanges(false);
    } catch {
      // Error is already handled by onSave
    }
  }, [
    step,
    getCurrentData,
    onSave,
    getLineRange,
    isLineRangeValid,
    lineRangeStartState,
    lineRangeEndState,
  ]);

  return {
    title,
    notes,
    language,
    code,
    hasUnsavedChanges,
    setTitle,
    setNotes,
    setLanguage,
    setCode,
    lineRangeStart: lineRangeStartState,
    lineRangeEnd: lineRangeEndState,
    setLineRangeStart,
    setLineRangeEnd,
    lineRangeValidationError,
    isLineRangeValid,
    handleSave,
    totalLines,
  };
}
