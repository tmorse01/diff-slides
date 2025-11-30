"use client";

import { useMemo } from "react";
import { computeDiff } from "@/lib/diff";

interface DiffViewProps {
  previousCode: string;
  currentCode: string;
  language: string;
}

export function DiffView({
  previousCode,
  currentCode,
  language: _language,
}: DiffViewProps) {
  const diff = useMemo(
    () => computeDiff(previousCode || "", currentCode || ""),
    [previousCode, currentCode]
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="font-mono text-sm">
        {diff.lines.map((line, index) => {
          const bgColor =
            line.type === "added"
              ? "bg-accent/10 border-l-2 border-accent"
              : line.type === "removed"
              ? "bg-destructive/10 border-l-2 border-destructive"
              : "";

          const textColor =
            line.type === "added"
              ? "text-accent"
              : line.type === "removed"
              ? "text-destructive line-through"
              : "text-foreground";

          const prefix =
            line.type === "added"
              ? "+ "
              : line.type === "removed"
              ? "- "
              : "  ";

          return (
            <div
              key={index}
              className={`flex items-start py-1 -mx-4 px-4 ${bgColor}`}
            >
              <span className="select-none mr-4 text-muted-foreground w-8 text-right">
                {line.lineNumber || " "}
              </span>
              <span className="select-none mr-2 text-muted-foreground">
                {prefix}
              </span>
              <span className={`flex-1 ${textColor}`}>{line.value || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
