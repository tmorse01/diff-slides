"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { useEditor } from "@/lib/editor-context";
import { useState } from "react";

export function StepsPanel() {
  const {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    addStep,
    deleteStep,
    updateStepTitle,
  } = useEditor();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleStartEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = (id: number) => {
    if (editTitle.trim()) {
      updateStepTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getTotalChanges = () => {
    return steps.reduce((acc, step) => {
      const changes = step.code.filter(
        (line) => line.type !== "unchanged"
      ).length;
      return acc + changes;
    }, 0);
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Timeline</h2>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-2 bg-transparent"
            onClick={addStep}
          >
            <Plus className="w-4 h-4" />
            Add Step
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {steps.map((step, idx) => {
            const changes = step.code.filter(
              (line) => line.type !== "unchanged"
            ).length;
            const isActive = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`w-full p-3 rounded-lg text-left hover:bg-accent/5 transition-colors group relative ${
                  isActive ? "bg-accent/10 border border-accent/30" : ""
                }`}
              >
                <button
                  onClick={() => handleSelectStep(idx)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          Step {idx + 1}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {changes} changes
                        </span>
                      </div>
                      {editingId === step.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(step.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(step.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="text-sm font-medium bg-background border border-accent rounded px-1 w-full"
                          autoFocus
                        />
                      ) : (
                        <p
                          className="text-sm font-medium text-foreground truncate"
                          onDoubleClick={() =>
                            handleStartEdit(step.id, step.title)
                          }
                        >
                          {step.title}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
                {steps.length > 1 && (
                  <button
                    onClick={() => deleteStep(step.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Total steps</span>
            <span className="font-mono">{steps.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total changes</span>
            <span className="font-mono">{getTotalChanges()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
