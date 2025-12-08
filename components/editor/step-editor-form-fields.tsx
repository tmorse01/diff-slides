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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const languages = ["typescript", "javascript", "python", "html", "css", "json"];

interface StepEditorFormFieldsProps {
  title: string;
  notes: string;
  language: string;
  lineRangeStart: string;
  lineRangeEnd: string;
  totalLines: number;
  validationError?: string;
  onTitleChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onLineRangeStartChange: (value: string) => void;
  onLineRangeEndChange: (value: string) => void;
}

export function StepEditorFormFields({
  title,
  notes,
  language,
  lineRangeStart,
  lineRangeEnd,
  totalLines,
  validationError,
  onTitleChange,
  onNotesChange,
  onLanguageChange,
  onLineRangeStartChange,
  onLineRangeEndChange,
}: StepEditorFormFieldsProps) {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="title" className="text-xs">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Step title"
              className="h-8 text-sm"
            />
          </div>
          <div className="w-32">
            <Label htmlFor="language" className="text-xs">
              Language
            </Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger id="language" className="h-8 text-sm">
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
          {/* Line Range for Export */}
          <div className="w-40">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="line-range" className="text-xs">
                Line Range (Optional)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Line range information"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    Specify which lines to show in exported videos. Only the
                    selected range will be visible, helping you focus on the key
                    changes you want to highlight.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Input
                id="line-range-start"
                type="number"
                min="1"
                max={totalLines || undefined}
                value={lineRangeStart}
                onChange={(e) => onLineRangeStartChange(e.target.value)}
                placeholder="1"
                className="h-8 text-sm w-16"
              />
              <span className="text-xs text-muted-foreground px-0.5">-</span>
              <Input
                id="line-range-end"
                type="number"
                min="1"
                max={totalLines || undefined}
                value={lineRangeEnd}
                onChange={(e) => onLineRangeEndChange(e.target.value)}
                placeholder={totalLines > 0 ? totalLines.toString() : "1"}
                className="h-8 text-sm w-16"
              />
            </div>
            {validationError && (
              <p className="text-xs text-destructive mt-0.5">
                {validationError}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="notes" className="text-xs">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Optional notes for this step"
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
