"use client"

import { SidebarNav } from "@/components/editor/sidebar-nav"
import { StepsPanel } from "@/components/editor/steps-panel"
import { CodeEditorPanel } from "@/components/editor/code-editor-panel"
import { ControlsPanel } from "@/components/editor/controls-panel"
import { EditorProvider } from "@/lib/editor-context"

export default function EditorPage() {
  return (
    <EditorProvider>
      <div className="h-screen flex overflow-hidden">
        <SidebarNav />
        <StepsPanel />
        <CodeEditorPanel />
        <ControlsPanel />
      </div>
    </EditorProvider>
  )
}
