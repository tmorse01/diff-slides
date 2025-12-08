import { Button } from "@/components/ui/button";

interface StepEditorHeaderProps {
  stepTitle: string;
  stepLanguage: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function StepEditorHeader({
  stepTitle,
  stepLanguage,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: StepEditorHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        </div>
        <span className="text-xs font-mono text-foreground">
          {stepTitle}.{stepLanguage}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {hasUnsavedChanges && (
          <span className="text-xs text-muted-foreground">Unsaved</span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-7 text-xs"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
