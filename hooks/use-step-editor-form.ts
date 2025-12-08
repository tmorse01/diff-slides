import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Step } from "@/types/database";
import { validateLineRange } from "@/lib/line-range-helpers";

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

  // Line range state (null by default)
  lineRangeStart: number | null;
  lineRangeEnd: number | null;
  setLineRangeStart: (value: number | null) => void;
  setLineRangeEnd: (value: number | null) => void;
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
  // Single step object in state
  const [formData, setFormData] = useState<StepFormData>(() => {
    if (step) {
      return {
        title: step.title || "",
        notes: step.notes || null,
        language: step.language || "typescript",
        code: step.code || "",
        line_range_start: step.line_range_start ?? null,
        line_range_end: step.line_range_end ?? null,
      };
    }
    return {
      title: "",
      notes: null,
      language: "typescript",
      code: "",
      line_range_start: null,
      line_range_end: null,
    };
  });

  const lastSavedDataRef = useRef<string>("");
  const currentFormStepIdRef = useRef<string | null>(null);
  const isUpdatingFormStateRef = useRef<boolean>(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate total lines for line range validation
  const totalLines = formData.code.split("\n").length;

  // Initialize form state when step changes
  useEffect(() => {
    if (step) {
      isUpdatingFormStateRef.current = true;
      const timeoutId = setTimeout(() => {
        setFormData({
          title: step.title || "",
          notes: step.notes || null,
          language: step.language || "typescript",
          code: step.code || "",
          line_range_start: step.line_range_start ?? null,
          line_range_end: step.line_range_end ?? null,
        });

        // Update last saved data when step changes
        lastSavedDataRef.current = JSON.stringify({
          title: step.title || "",
          notes: step.notes || null,
          language: step.language || "typescript",
          code: step.code || "",
        });

        currentFormStepIdRef.current = step.id;
        setHasAttemptedSave(false);
        setHasUnsavedChanges(false);
        isUpdatingFormStateRef.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      isUpdatingFormStateRef.current = true;
      const timeoutId = setTimeout(() => {
        setFormData({
          title: "",
          notes: null,
          language: "typescript",
          code: "",
          line_range_start: null,
          line_range_end: null,
        });
        lastSavedDataRef.current = "";
        currentFormStepIdRef.current = null;
        setHasAttemptedSave(false);
        setHasUnsavedChanges(false);
        isUpdatingFormStateRef.current = false;
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [step, setHasUnsavedChanges]);

  // Validate line range
  const lineRangeValidation = useMemo(() => {
    const start = formData.line_range_start;
    const end = formData.line_range_end;

    // Both null is valid (no range specified)
    if (start === null && end === null) {
      return { valid: true };
    }

    // If one is set but not the other, that's invalid
    if ((start !== null && end === null) || (start === null && end !== null)) {
      return {
        valid: false,
        error: "Both start and end are required if specifying a range",
      };
    }

    // Both are set, validate the range
    if (
      start !== null &&
      end !== null &&
      start !== undefined &&
      end !== undefined
    ) {
      const validation = validateLineRange(start, end, totalLines);
      return validation;
    }

    return { valid: true };
  }, [formData.line_range_start, formData.line_range_end, totalLines]);

  const isLineRangeValid = lineRangeValidation.valid;
  // Only show validation errors if user has attempted to save
  const lineRangeValidationError = hasAttemptedSave
    ? lineRangeValidation.error
    : undefined;

  // Helper to get current data (without line ranges for onDataChange)
  const getCurrentData = useCallback((): Omit<
    StepFormData,
    "line_range_start" | "line_range_end"
  > => {
    return {
      title: formData.title.trim() || "",
      notes: formData.notes?.trim() || null,
      language: formData.language || "typescript",
      code: formData.code.trim() || "",
    };
  }, [formData]);

  // Helper to check if data has changed
  const checkDataChanged = useCallback(() => {
    const current = JSON.stringify(getCurrentData());
    const changed = current !== lastSavedDataRef.current;
    return changed;
  }, [getCurrentData]);

  // Expose getCurrentData function to parent with step ID
  useEffect(() => {
    if (onGetCurrentData && step) {
      onGetCurrentData(getCurrentData, step.id);
    }
  }, [onGetCurrentData, getCurrentData, step]);

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
    formData.title,
    formData.notes,
    formData.language,
    formData.code,
    step,
    checkDataChanged,
    onDataChange,
    getCurrentData,
  ]);

  // Setters
  const setTitle = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
  }, []);

  const setNotes = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, notes: value || null }));
  }, []);

  const setLanguage = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, language: value }));
  }, []);

  const setCode = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, code: value }));
  }, []);

  const setLineRangeStart = useCallback((value: number | null) => {
    setFormData((prev) => ({ ...prev, line_range_start: value }));
  }, []);

  const setLineRangeEnd = useCallback((value: number | null) => {
    setFormData((prev) => ({ ...prev, line_range_end: value }));
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const updateHasUnsavedChanges = () => {
      if (!step) {
        setHasUnsavedChanges(false);
        return;
      }
      const current = JSON.stringify(getCurrentData());
      const hasChanges = current !== lastSavedDataRef.current;
      setHasUnsavedChanges(hasChanges);
    };

    // Defer state update to avoid cascading renders
    const timeoutId = setTimeout(updateHasUnsavedChanges, 0);
    return () => clearTimeout(timeoutId);
  }, [
    step,
    formData.title,
    formData.notes,
    formData.language,
    formData.code,
    getCurrentData,
    setHasUnsavedChanges,
  ]);

  const handleSave = useCallback(async () => {
    if (!step || currentFormStepIdRef.current !== step.id) {
      return;
    }

    setHasAttemptedSave(true);

    // Validate line range
    if (!isLineRangeValid) {
      // Validation error will be shown via lineRangeValidationError
      return;
    }

    const baseData = getCurrentData();

    // Build complete data object with line ranges
    const data: StepFormData = {
      ...baseData,
      line_range_start: formData.line_range_start ?? null,
      line_range_end: formData.line_range_end ?? null,
    };

    try {
      await onSave(data);
      lastSavedDataRef.current = JSON.stringify(baseData);
      setHasAttemptedSave(false);
      setHasUnsavedChanges(false);
    } catch {
      // Error is already handled by onSave
    }
  }, [
    step,
    getCurrentData,
    onSave,
    isLineRangeValid,
    formData.line_range_start,
    formData.line_range_end,
    setHasUnsavedChanges,
  ]);

  return {
    title: formData.title,
    notes: formData.notes || "",
    language: formData.language,
    code: formData.code,
    hasUnsavedChanges,
    setTitle,
    setNotes,
    setLanguage,
    setCode,
    lineRangeStart: formData.line_range_start ?? null,
    lineRangeEnd: formData.line_range_end ?? null,
    setLineRangeStart,
    setLineRangeEnd,
    lineRangeValidationError,
    isLineRangeValid,
    handleSave,
    totalLines,
  } as UseStepEditorFormReturn;
}
