"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, Trash2, ArrowLeft, Copy } from "lucide-react";
import { computeDiff } from "@/lib/diff";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { Step } from "@/types/database";

interface StepsSidebarProps {
  steps: Step[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onAddStep: () => void;
  onDuplicateStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onReorderSteps: (draggedStepId: string, targetIndex: number) => void;
  projectSlug: string;
}

export function StepsSidebar({
  steps,
  selectedStepId,
  onSelectStep,
  onAddStep,
  onDuplicateStep,
  onDeleteStep,
  onReorderSteps,
  projectSlug,
}: StepsSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const hasDraggedRef = useRef(false);

  const sortedSteps = [...steps].sort((a, b) => a.index - b.index);

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      // TODO: Update step title via API
      setEditingId(null);
    }
  };

  const getChangeCount = (step: Step, prevStep: Step | null): number => {
    if (!prevStep) return 0;
    const diff = computeDiff(prevStep.code, step.code);
    return diff.addedCount + diff.removedCount;
  };

  const getTotalChanges = () => {
    return sortedSteps.reduce((acc, step, idx) => {
      const prevStep = idx > 0 ? sortedSteps[idx - 1] : null;
      return acc + getChangeCount(step, prevStep);
    }, 0);
  };

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    setDraggedStepId(stepId);
    hasDraggedRef.current = false;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", stepId);
    // Add a slight delay to allow drag image to be set
    setTimeout(() => {
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
    hasDraggedRef.current = true;
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedStepId) return;

    const draggedIndex = sortedSteps.findIndex((s) => s.id === draggedStepId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedStepId(null);
      return;
    }

    onReorderSteps(draggedStepId, targetIndex);
    setDraggedStepId(null);
  };

  const handleDragEnd = () => {
    setDraggedStepId(null);
    setDragOverIndex(null);
    // Reset hasDragged after a short delay to allow click handler to check it
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/projects/${projectSlug}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to project</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-sm font-semibold text-foreground flex-1">
            Project
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-2 bg-transparent"
            onClick={onAddStep}
          >
            <Plus className="w-4 h-4" />
            Add Step
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedSteps.map((step, idx) => {
            const prevStep = idx > 0 ? sortedSteps[idx - 1] : null;
            const changes = getChangeCount(step, prevStep);
            const isActive = step.id === selectedStepId;
            const isDragging = draggedStepId === step.id;
            const isDragOver = dragOverIndex === idx;

            return (
              <div
                key={step.id}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                className={`w-full p-3 rounded-lg text-left hover:bg-primary/5 transition-colors group relative ${
                  isActive ? "bg-primary/10 border border-primary/30" : ""
                } ${isDragging ? "opacity-50" : ""} ${
                  isDragOver && !isDragging
                    ? "bg-primary/20 border-2 border-primary border-dashed"
                    : ""
                }`}
              >
                <button
                  onClick={() => {
                    // Don't select if we just finished dragging
                    if (!hasDraggedRef.current) {
                      onSelectStep(step.id);
                    }
                  }}
                  className="w-full text-left min-w-0"
                  type="button"
                >
                  <div className="flex items-start gap-2 min-w-0 w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="shrink-0 cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => handleDragStart(e, step.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-1 opacity-100 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Drag to reorder</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          Step {step.index + 1}
                        </span>
                        {changes > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {changes} {changes === 1 ? "change" : "changes"}
                          </span>
                        )}
                      </div>
                      {editingId === step.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="text-sm font-medium bg-background border border-primary rounded px-1 w-full"
                          autoFocus
                        />
                      ) : (
                        <p
                          className="text-sm font-medium text-foreground truncate max-w-[240px]"
                          title={step.title}
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
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateStep(step.id);
                        }}
                        className="p-1 hover:bg-primary/10 rounded"
                        type="button"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Duplicate step</p>
                    </TooltipContent>
                  </Tooltip>
                  {steps.length > 1 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteStep(step.id);
                          }}
                          className="p-1 hover:bg-destructive/10 rounded"
                          type="button"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Delete step</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
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
