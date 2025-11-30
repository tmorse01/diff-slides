"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No steps available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStepIndex + 1} of {steps.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold mb-2">{currentStep.title}</h2>
            {currentStep.notes && (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentStep.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <DiffView
          previousCode={previousStep?.code || ""}
          currentCode={currentStep.code}
          language={currentStep.language}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? "bg-primary"
                  : "bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
          variant="outline"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
