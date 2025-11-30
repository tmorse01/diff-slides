"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiffView } from "@/components/editor/diff-view";
import type { Step } from "@/types/database";

interface ViewerProps {
  steps: Step[];
  initialStepIndex?: number;
}

export function Viewer({ steps, initialStepIndex = 0 }: ViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    Math.max(0, Math.min(initialStepIndex, steps.length - 1))
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("stepIndex");
    if (stepParam) {
      const index = parseInt(stepParam, 10);
      if (!isNaN(index) && index >= 0 && index < steps.length) {
        // Use a small timeout to avoid cascading renders
        const timeoutId = setTimeout(() => {
          setCurrentStepIndex(index);
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [steps.length]);

  const currentStep = steps[currentStepIndex];
  const previousStep =
    currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">No steps available</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl h-[800px] flex flex-col">
        <div className="flex-1 min-h-0">
          <DiffView
            previousCode={previousStep?.code || ""}
            currentCode={currentStep.code}
            language={currentStep.language}
            stepTitle={currentStep.title}
          />
        </div>

        {/* Step navigation at the bottom */}
        <div className="bg-secondary border-t border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <Button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? "bg-accent w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
