"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiffView } from "@/components/editor/diff-view";
import { previewExamples } from "@/data/examples";

export function Preview() {
  const [selectedExampleId, setSelectedExampleId] = useState(
    previewExamples[0].id
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const selectedExample =
    previewExamples.find((ex) => ex.id === selectedExampleId) ||
    previewExamples[0];
  const codeSteps = selectedExample.steps;

  const nextStep = () => {
    setCurrentStepIndex((prev) => (prev + 1) % codeSteps.length);
  };

  const prevStep = () => {
    setCurrentStepIndex(
      (prev) => (prev - 1 + codeSteps.length) % codeSteps.length
    );
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  const currentStep = codeSteps[currentStepIndex];
  const previousStep =
    currentStepIndex > 0 ? codeSteps[currentStepIndex - 1] : null;

  // Reset to first step when example changes
  const handleExampleChange = (exampleId: string) => {
    setSelectedExampleId(exampleId);
    setCurrentStepIndex(0);
  };

  return (
    <section className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Watch how code changes come to life with highlighted diffs and
            smooth transitions
          </p>
        </div>

        {/* Example selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {previewExamples.map((example) => (
            <Button
              key={example.id}
              onClick={() => handleExampleChange(example.id)}
              variant={selectedExampleId === example.id ? "default" : "outline"}
              size="sm"
              className="text-sm"
            >
              {example.title}
            </Button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl h-[600px] flex flex-col">
            <div className="flex-1 min-h-0">
              <DiffView
                previousCode={previousStep?.currentCode || ""}
                currentCode={currentStep.currentCode}
                language={currentStep.language}
                stepTitle={currentStep.title}
                fileName={currentStep.fileName || "example.tsx"}
              />
            </div>

            {/* Step navigation at the bottom */}
            <div className="bg-secondary border-t border-border px-6 py-4 flex items-center justify-between shrink-0">
              <Button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {codeSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentStepIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={nextStep}
                disabled={currentStepIndex === codeSteps.length - 1}
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
      </div>
    </section>
  );
}
