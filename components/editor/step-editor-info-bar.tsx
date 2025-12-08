interface StepEditorInfoBarProps {
  stepIndex: number;
  stepTitle: string;
  additions: number;
  deletions: number;
}

export function StepEditorInfoBar({
  stepIndex,
  stepTitle,
  additions,
  deletions,
}: StepEditorInfoBarProps) {
  return (
    <div className="bg-secondary/30 border-b border-border px-4 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-foreground">
          Step {stepIndex + 1}: {stepTitle}
        </span>
        {(additions > 0 || deletions > 0) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {additions > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {additions} {additions === 1 ? "add" : "adds"}
              </span>
            )}
            {deletions > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {deletions} {deletions === 1 ? "del" : "dels"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
