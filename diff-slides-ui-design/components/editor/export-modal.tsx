"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Video, FileImage, FileText, Code } from "lucide-react"
import { useState } from "react"

const exportFormats = [
  {
    icon: Video,
    title: "MP4 Video",
    description: "High-quality video export for presentations",
    format: "mp4",
  },
  {
    icon: FileImage,
    title: "Animated GIF",
    description: "Lightweight animation for web sharing",
    format: "gif",
  },
  {
    icon: FileText,
    title: "PDF Slides",
    description: "Static slides for printing or sharing",
    format: "pdf",
  },
  {
    icon: Code,
    title: "HTML Embed",
    description: "Interactive widget for your website",
    format: "html",
  },
]

export function ExportModal() {
  const [open, setOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  const handleExport = () => {
    if (selectedFormat) {
      console.log("[v0] Exporting as:", selectedFormat)
      // Simulate export
      setOpen(false)
      setSelectedFormat(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 bg-transparent">
          <Video className="w-4 h-4" />
          Export Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Your Slides</DialogTitle>
          <DialogDescription>Choose your preferred export format</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {exportFormats.map((format, idx) => (
            <Card
              key={idx}
              onClick={() => setSelectedFormat(format.format)}
              className={`p-4 bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group ${
                selectedFormat === format.format ? "border-accent bg-accent/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors shrink-0">
                  <format.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{format.title}</h4>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleExport}
            disabled={!selectedFormat}
          >
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
