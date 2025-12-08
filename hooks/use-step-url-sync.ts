"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Step } from "@/types/database";

interface UseStepUrlSyncOptions {
  steps: Step[];
  defaultStepId?: string | null; // Default step if URL has no step param
  urlParamName?: string; // Default: "step"
}

interface UseStepUrlSyncReturn {
  currentStepId: string | null;
  setCurrentStepId: (stepId: string | null) => void;
  currentStep: Step | null;
  currentStepIndex: number;
}

/**
 * Hook to sync step selection with URL state.
 * URL is the source of truth - it controls which step is selected.
 * Prevents infinite loops by tracking URL updates we make ourselves.
 */
export function useStepUrlSync({
  steps,
  defaultStepId,
  urlParamName = "step",
}: UseStepUrlSyncOptions): UseStepUrlSyncReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastUrlStepRef = useRef<string | null>(null);
  const isUpdatingRef = useRef(false);

  // Get step ID from URL, or use default, or first step
  const getStepIdFromUrl = useCallback((): string | null => {
    const stepIdFromUrl = searchParams.get(urlParamName);

    if (stepIdFromUrl) {
      // Verify the step exists
      const stepExists = steps.some((s) => s.id === stepIdFromUrl);
      if (stepExists) {
        return stepIdFromUrl;
      }
    }

    // URL has no valid step, use default or first step
    if (defaultStepId) {
      const defaultExists = steps.some((s) => s.id === defaultStepId);
      if (defaultExists) {
        return defaultStepId;
      }
    }

    return steps.length > 0 ? steps[0].id : null;
  }, [searchParams, urlParamName, steps, defaultStepId]);

  // Initialize state from URL (URL is source of truth)
  const [currentStepId, setCurrentStepIdState] = useState<string | null>(() => {
    return getStepIdFromUrl();
  });

  // Initialize ref on mount
  useEffect(() => {
    lastUrlStepRef.current = searchParams.get(urlParamName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync URL -> state when URL changes (browser navigation)
  useEffect(() => {
    const stepIdFromUrl = searchParams.get(urlParamName);

    // Only handle if URL changed externally (not from our setCurrentStepId)
    if (stepIdFromUrl !== lastUrlStepRef.current && !isUpdatingRef.current) {
      lastUrlStepRef.current = stepIdFromUrl;

      if (stepIdFromUrl) {
        // Verify the step exists
        const stepExists = steps.some((s) => s.id === stepIdFromUrl);
        if (stepExists && stepIdFromUrl !== currentStepId) {
          setTimeout(() => {
            setCurrentStepIdState(stepIdFromUrl);
          }, 0);
        } else if (!stepExists) {
          // Step doesn't exist, clear from URL and use default/first
          const params = new URLSearchParams(searchParams.toString());
          params.delete(urlParamName);
          router.replace(`?${params.toString()}`, { scroll: false });

          const fallbackId =
            defaultStepId && steps.some((s) => s.id === defaultStepId)
              ? defaultStepId
              : steps.length > 0
              ? steps[0].id
              : null;

          if (fallbackId && fallbackId !== currentStepId) {
            setTimeout(() => {
              setCurrentStepIdState(fallbackId);
            }, 0);
          }
        }
      } else {
        // URL has no step param - use default or first step
        const fallbackId =
          defaultStepId && steps.some((s) => s.id === defaultStepId)
            ? defaultStepId
            : steps.length > 0
            ? steps[0].id
            : null;

        if (fallbackId && fallbackId !== currentStepId) {
          setTimeout(() => {
            setCurrentStepIdState(fallbackId);
          }, 0);
        }
      }
    }
  }, [searchParams, currentStepId, steps, router, urlParamName, defaultStepId]);

  // Ensure currentStepId is valid when steps change
  useEffect(() => {
    if (steps.length > 0) {
      if (!currentStepId || !steps.some((s) => s.id === currentStepId)) {
        // Current step ID is invalid, use default or first step
        const fallbackId =
          defaultStepId && steps.some((s) => s.id === defaultStepId)
            ? defaultStepId
            : steps[0].id;

        if (currentStepId !== fallbackId) {
          setTimeout(() => {
            setCurrentStepIdState(fallbackId);
          }, 0);
        }
      }
    } else if (currentStepId) {
      // No steps available, clear selection
      setTimeout(() => {
        setCurrentStepIdState(null);
      }, 0);
    }
  }, [steps, currentStepId, defaultStepId]);

  // Wrapper that updates both URL and state
  const setCurrentStepId = useCallback(
    (stepId: string | null) => {
      isUpdatingRef.current = true;

      // Update URL immediately
      const params = new URLSearchParams(searchParams.toString());
      if (stepId) {
        params.set(urlParamName, stepId);
        lastUrlStepRef.current = stepId;
      } else {
        params.delete(urlParamName);
        lastUrlStepRef.current = null;
      }
      router.replace(`?${params.toString()}`, { scroll: false });

      // Update state
      setCurrentStepIdState(stepId);

      // Reset flag after a brief delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    },
    [router, searchParams, urlParamName]
  );

  // Find current step by ID
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
  const currentStep =
    currentStepIndex >= 0 ? steps[currentStepIndex] : steps[0] || null;

  return {
    currentStepId,
    setCurrentStepId,
    currentStep,
    currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : 0,
  };
}
