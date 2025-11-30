"use client"

import { useMemo } from "react"
import { computeDiff } from "@/lib/diff"

interface DiffViewProps {
  previousCode: string
  currentCode: string
  language: string
}

export function DiffView({
  previousCode,
  currentCode,
  language: _language,
}: DiffViewProps) {
  const diff = useMemo(
    () => computeDiff(previousCode || "", currentCode || ""),
    [previousCode, currentCode]
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="font-mono text-sm">
        {diff.lines.map((line, index) => {
          const bgColor =
            line.type === "added"
              ? "bg-green-500/20 dark:bg-green-500/10"
              : line.type === "removed"
              ? "bg-red-500/20 dark:bg-red-500/10"
              : "bg-transparent"

          const textColor =
            line.type === "added"
              ? "text-green-600 dark:text-green-400"
              : line.type === "removed"
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"

          const prefix =
            line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "

          return (
            <div
              key={index}
              className={`flex ${bgColor} ${textColor} px-4 py-1`}
            >
              <span className="select-none mr-4 text-muted-foreground">
                {line.lineNumber || " "}
              </span>
              <span className="select-none mr-2">{prefix}</span>
              <span className="flex-1">{line.value || " "}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

