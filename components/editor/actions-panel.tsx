"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExternalLink,
  Copy,
  Video,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ProjectVisibilitySelector } from "@/components/project-visibility-selector";
import {
  exportProject,
  downloadBlob,
  type ExportFormat,
} from "@/lib/services/export.service";
import type { DiffSettings } from "@/lib/diff-settings";
import type { Project, Step } from "@/types/database";

interface ActionsPanelProps {
  project: Project;
  projectSlug: string;
  projectId: string;
  steps: Step[];
  diffSettings: DiffSettings;
  onDiffSettingsChange: (settings: Partial<DiffSettings>) => void;
}

export function ActionsPanel({
  project,
  projectSlug,
  projectId,
  steps,
  diffSettings,
  onDiffSettingsChange,
}: ActionsPanelProps) {
  const [duration, setDuration] = useState(3);
  const [exportFormat, setExportFormat] = useState("gif");
  const [isExporting, setIsExporting] = useState(false);

  const handleCopyJSON = async () => {
    const data = {
      projectId,
      steps: steps.sort((a, b) => a.index - b.index),
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "JSON data has been copied to your clipboard.",
    });
  };

  const handleExport = async () => {
    if (steps.length === 0) {
      toast({
        title: "No steps to export",
        description: "Add at least one step to export the project.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const format = (exportFormat === "mp4" ? "mp4" : "gif") as ExportFormat;
      const result = await exportProject({
        projectId,
        format,
        duration,
        projectSlug,
      });

      downloadBlob(result.blob, result.filename);

      toast({
        title: "Export successful",
        description: `Your ${format.toUpperCase()} has been downloaded.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description:
          error instanceof Error
            ? error.message
            : `An error occurred while exporting the ${exportFormat.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col overflow-hidden relative">
      {/* Loading Bar */}
      {isExporting && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden z-10">
          <div className="h-full bg-primary animate-progress" />
        </div>
      )}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground mb-4">Controls</h2>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="default"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  window.open(`/view/${projectSlug}`, "_blank");
                }}
              >
                Preview
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Preview Playback</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-full"
                  onClick={handleExport}
                  disabled={isExporting || steps.length === 0}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : exportFormat === "mp4" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {isExporting ? "Exporting" : "Export"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {steps.length === 0
                  ? "Add at least one step to export"
                  : isExporting
                  ? "Exporting..."
                  : `Export as ${
                      exportFormat === "mp4" ? "MP4 video" : "animated GIF"
                    }`}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                Coming soon: Auto-generate steps from code snippets. AI will
                analyze your code and create incremental steps showing the
                progression of changes.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Export Format */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">
              Export Format
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="format"
                  className="text-xs text-muted-foreground"
                >
                  Format
                </Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
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
              <Button
                variant="outline"
                className="w-full gap-2 justify-start bg-transparent"
                size="sm"
                onClick={handleCopyJSON}
              >
                <Copy className="w-4 h-4" />
                Copy JSON
              </Button>
            </div>
          </Card>

          {/* Project Settings */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">
              Project Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Visibility
                </Label>
                <ProjectVisibilitySelector project={project} />
                <p className="text-xs text-muted-foreground mt-2">
                  Control who can view this project
                </p>
              </div>
            </div>
          </Card>

          {/* Step Settings */}
          <Card className="p-4 bg-secondary/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-4">
              Step Settings
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className="text-xs text-muted-foreground"
                >
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
                <div className="text-xs text-muted-foreground text-right">
                  {duration}s
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="transition"
                  className="text-xs text-muted-foreground"
                >
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
            <h3 className="text-xs font-semibold text-foreground mb-4">
              Diff Highlighting
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-additions"
                  className="text-xs text-muted-foreground"
                >
                  Show additions
                </Label>
                <Switch
                  id="show-additions"
                  checked={diffSettings.showAdditions}
                  onCheckedChange={(checked) =>
                    onDiffSettingsChange({ showAdditions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="show-deletions"
                  className="text-xs text-muted-foreground"
                >
                  Show deletions
                </Label>
                <Switch
                  id="show-deletions"
                  checked={diffSettings.showDeletions}
                  onCheckedChange={(checked) =>
                    onDiffSettingsChange({ showDeletions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="line-numbers"
                  className="text-xs text-muted-foreground"
                >
                  Line numbers
                </Label>
                <Switch
                  id="line-numbers"
                  checked={diffSettings.showLineNumbers}
                  onCheckedChange={(checked) =>
                    onDiffSettingsChange({ showLineNumbers: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
