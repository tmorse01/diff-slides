"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "./code-editor";
import { DiffView } from "./diff-view";
import type { Step } from "@/types/database";

interface StepEditorProps {
  step: Step | null;
  previousStep: Step | null;
  onSave: (data: {
    title: string;
    notes: string | null;
    language: string;
    code: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

const languages = ["typescript", "javascript", "python", "html", "css", "json"];

export function StepEditor({
  step,
  previousStep,
  onSave,
  isSaving = false,
}: StepEditorProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (step) {
      // Use a small timeout to avoid cascading renders
      const timeoutId = setTimeout(() => {
        setTitle(step.title);
        setNotes(step.notes || "");
        setLanguage(step.language);
        setCode(step.code);
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      const timeoutId = setTimeout(() => {
        setTitle("");
        setNotes("");
        setLanguage("typescript");
        setCode("");
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [step]);

  const handleSave = async () => {
    await onSave({
      title,
      notes: notes || null,
      language,
      code,
    });
  };

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a step to edit or create a new step
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-semibold">Edit Step</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Step"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Step title"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for this step"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="diff">Diff View</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 min-h-0 mt-4">
            <CodeEditor value={code} onChange={setCode} language={language} />
          </TabsContent>
          <TabsContent
            value="diff"
            className="flex-1 min-h-0 mt-4 overflow-auto"
          >
            <DiffView
              previousCode={previousStep?.code || ""}
              currentCode={code}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
