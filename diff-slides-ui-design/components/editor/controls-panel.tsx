"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Copy, Wand2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditor } from "@/lib/editor-context"
import { ExportModal } from "@/components/editor/export-modal"
import { useState } from "react"

export function ControlsPanel() {
  const {
    steps,
    currentStepIndex,
    showAdditions,
    showDeletions,
    showLineNumbers,
    setShowAdditions,
    setShowDeletions,
    setShowLineNumbers,
    duplicateStep,
  } = useEditor()

  const [duration, setDuration] = useState(3)

  const handleDuplicate = () => {
    const currentStep = steps[currentStepIndex]
    if (currentStep) {
      duplicateStep(currentStep.id)
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-4">Controls</h2>

        <div className="space-y-2">
          <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Wand2 className="w-4 h-4" />
            Generate Slides
          </Button>
          <ExportModal />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Step Settings */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">Step Settings</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs text-muted-foreground">
                  Duration (seconds)
                </Label>
                <Slider
                  id="duration"
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-right">{duration}s</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transition" className="text-xs text-muted-foreground">
                  Transition
                </Label>
                <Select defaultValue="fade">
                  <SelectTrigger id="transition" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="wipe">Wipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Diff Highlighting */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">Diff Highlighting</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-additions" className="text-xs text-muted-foreground">
                  Show additions
                </Label>
                <Switch id="show-additions" checked={showAdditions} onCheckedChange={setShowAdditions} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-deletions" className="text-xs text-muted-foreground">
                  Show deletions
                </Label>
                <Switch id="show-deletions" checked={showDeletions} onCheckedChange={setShowDeletions} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="line-numbers" className="text-xs text-muted-foreground">
                  Line numbers
                </Label>
                <Switch id="line-numbers" checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
              </div>
            </div>
          </Card>

          {/* Export Format */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">Export Format</h3>

            <div className="space-y-2">
              <Label htmlFor="format" className="text-xs text-muted-foreground">
                Format
              </Label>
              <Select defaultValue="mp4">
                <SelectTrigger id="format" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4 Video</SelectItem>
                  <SelectItem value="gif">Animated GIF</SelectItem>
                  <SelectItem value="pdf">PDF Slides</SelectItem>
                  <SelectItem value="html">HTML Embed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2 justify-start bg-transparent"
              size="sm"
              onClick={handleDuplicate}
            >
              <Copy className="w-4 h-4" />
              Duplicate Step
            </Button>
            <Button variant="outline" className="w-full gap-2 justify-start bg-transparent" size="sm">
              <FileDown className="w-4 h-4" />
              Export Project
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
