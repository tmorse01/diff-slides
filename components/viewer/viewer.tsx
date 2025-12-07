"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiffView } from "@/components/editor/diff-view";
import { NotesDrawer } from "./notes-drawer";
import { extractDiffSettings } from "@/lib/diff-settings";
import type { Step } from "@/types/database";
import type { Json } from "@/types/database";

interface ViewerProps {
  steps: Step[];
  initialStepIndex?: number;
  projectSettings?: Json | null;
}

export function Viewer({
  steps,
  initialStepIndex = 0,
  projectSettings,
}: ViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    Math.max(0, Math.min(initialStepIndex, steps.length - 1))
  );
  const [notesOpen, setNotesOpen] = useState(true); // Default to open on desktop

  // Extract diff settings from project settings (read-only in viewer)
  const diffSettings = extractDiffSettings(projectSettings);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("stepIndex");
    if (stepParam) {
      const index = parseInt(stepParam, 10);
      if (!isNaN(index) && index >= 0 && index < steps.length) {
        // Use a small timeout to avoid cascading renders
        const timeoutId = setTimeout(() => {
          setNotesOpen(false);
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
      setNotesOpen(false);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setNotesOpen(false);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepClick = (index: number) => {
    setNotesOpen(false);
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
    <div className="max-w-7xl mx-auto px-4 py-4 h-full flex flex-col">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl flex-1 min-h-0 flex flex-col relative">
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Main diff view */}
          <div className="flex-1 min-h-0 flex flex-col relative">
            <DiffView
              previousCode={previousStep?.code || ""}
              currentCode={currentStep.code}
              language={currentStep.language}
              stepTitle={currentStep.title}
              diffSettings={diffSettings}
              headerActions={
                currentStep.notes ? (
                  <NotesDrawer
                    notes={currentStep.notes}
                    open={notesOpen}
                    onOpenChange={setNotesOpen}
                  />
                ) : undefined
              }
            />
          </div>

          {/* Desktop: Notes panel (inline, toggleable) */}
          {currentStep.notes && notesOpen && (
            <div className="hidden md:flex flex-col w-80 border-l border-border bg-secondary/30 shrink-0">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-4 py-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentStep.notes}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Step navigation at the bottom */}
        <div className="bg-secondary border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
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
                    ? "bg-primary w-6"
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
