import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeEditor } from "./code-editor";
import { DiffView } from "./diff-view";
import type { DiffSettings } from "@/lib/diff-settings";

interface StepEditorTabsProps {
  code: string;
  language: string;
  previousCode: string;
  diffSettings: DiffSettings;
  onCodeChange: (value: string) => void;
}

export function StepEditorTabs({
  code,
  language,
  previousCode,
  diffSettings,
  onCodeChange,
}: StepEditorTabsProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs
        defaultValue="editor"
        className="flex-1 flex flex-col min-h-0 gap-0"
      >
        <TabsList className="h-8 p-0.5 mx-4 mt-2 mb-2">
          <TabsTrigger value="editor" className="h-7 px-3 text-xs">
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="diff" className="h-7 px-3 text-xs">
            Diff View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 min-h-0 mt-0 mx-4">
          <CodeEditor
            value={code}
            onChange={onCodeChange}
            language={language}
          />
        </TabsContent>
        <TabsContent
          value="diff"
          className="flex-1 min-h-0 mt-0 mx-4 overflow-auto rounded-md"
        >
          <DiffView
            previousCode={previousCode}
            currentCode={code}
            language={language}
            diffSettings={diffSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
