"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Copy, Video, Image as ImageIcon } from "lucide-react";
import type { Step } from "@/types/database";

interface ActionsPanelProps {
  projectSlug: string;
  projectId: string;
  steps: Step[];
}

export function ActionsPanel({
  projectSlug,
  projectId,
  steps,
}: ActionsPanelProps) {
  const handleCopyJSON = async () => {
    const data = {
      projectId,
      steps: steps.sort((a, b) => a.index - b.index),
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("JSON copied to clipboard!");
  };

  return (
    <div className="w-64 border-l p-4">
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Project actions and exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full"
            variant="default"
            onClick={() => {
              window.open(`/view/${projectSlug}`, "_blank");
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview Playback
          </Button>
          <Button className="w-full" variant="outline" onClick={handleCopyJSON}>
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled
            title="Coming soon"
          >
            <Video className="mr-2 h-4 w-4" />
            Export MP4
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled
            title="Coming soon"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Export GIF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
