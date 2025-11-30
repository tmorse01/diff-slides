"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Copy, Trash2 } from "lucide-react";
import type { Step } from "@/types/database";

interface StepsSidebarProps {
  steps: Step[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onAddStep: () => void;
  onDuplicateStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
}

export function StepsSidebar({
  steps,
  selectedStepId,
  onSelectStep,
  onAddStep,
  onDuplicateStep,
  onDeleteStep,
}: StepsSidebarProps) {
  const sortedSteps = [...steps].sort((a, b) => a.index - b.index);

  return (
    <div className="w-64 border-r p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Steps</h2>
        <Button size="sm" onClick={onAddStep}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {sortedSteps.map((step) => (
          <Card
            key={step.id}
            className={`p-3 cursor-pointer transition-colors ${
              selectedStepId === step.id
                ? "bg-secondary border-primary"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelectStep(step.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Step {step.index + 1}
                </div>
                <div className="font-medium text-sm">{step.title}</div>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDuplicateStep(step.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onDeleteStep(step.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

