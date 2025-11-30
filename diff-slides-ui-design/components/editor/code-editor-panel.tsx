"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { useEditor, type CodeLine } from "@/lib/editor-context"
import { useState } from "react"

export function CodeEditorPanel() {
  const {
    steps,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    showAdditions,
    showDeletions,
    showLineNumbers,
    updateCode,
  } = useEditor()

  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  const currentStep = steps[currentStepIndex]
  if (!currentStep) return null

  const additions = currentStep.code.filter((line) => line.type === "added").length
  const deletions = currentStep.code.filter((line) => line.type === "removed").length

  const handleStartEdit = () => {
    const content = currentStep.code.map((line) => line.content).join("\n")
    setEditedContent(content)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const lines = editedContent.split("\n")
    const newCode: CodeLine[] = lines.map((content, idx) => ({
      num: idx + 1,
      content,
      type: "unchanged" as const,
    }))
    updateCode(currentStep.id, newCode)
    setIsEditing(false)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Editor header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
          <span className="text-sm font-mono text-foreground">{currentStep.fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              Edit Code
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Step info bar */}
      <div className="bg-secondary/30 border-b border-border px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-foreground">
            Step {currentStepIndex + 1}: {currentStep.title}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {additions > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent" />
                {additions} {additions === 1 ? "addition" : "additions"}
              </span>
            )}
            {deletions > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                {deletions} {deletions === 1 ? "deletion" : "deletions"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {currentStepIndex + 1} / {steps.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={goToNextStep}
            disabled={currentStepIndex === steps.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm bg-background text-foreground resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-6 font-mono text-sm">
            {currentStep.code.map((line, idx) => {
              if (line.type === "added" && !showAdditions) return null
              if (line.type === "removed" && !showDeletions) return null

              return (
                <div
                  key={idx}
                  className={`flex items-start py-1 -mx-6 px-6 transition-colors ${
                    line.type === "added"
                      ? "bg-accent/10 border-l-2 border-accent"
                      : line.type === "removed"
                        ? "bg-destructive/10 border-l-2 border-destructive"
                        : ""
                  }`}
                >
                  {showLineNumbers && (
                    <span className="text-muted-foreground mr-6 select-none w-8 text-right">{line.num}</span>
                  )}
                  <span
                    className={`flex-1 ${
                      line.type === "added"
                        ? "text-accent"
                        : line.type === "removed"
                          ? "text-destructive line-through"
                          : "text-foreground"
                    }`}
                  >
                    {line.content || " "}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
