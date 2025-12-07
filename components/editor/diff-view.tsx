"use client";

import { useMemo, useEffect, useState } from "react";
import { computeDiff } from "@/lib/diff";
import { codeToHtml } from "shiki";

import type { DiffSettings } from "@/lib/diff-settings";

interface DiffViewProps {
  previousCode: string;
  currentCode: string;
  language: string;
  stepTitle?: string;
  fileName?: string;
  diffSettings?: DiffSettings;
  headerActions?: React.ReactNode;
}

// Map language names to shiki language IDs
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  tsx: "tsx",
  jsx: "tsx",
  python: "python",
  html: "html",
  css: "css",
  json: "json",
};

export function DiffView({
  previousCode,
  currentCode,
  language,
  stepTitle,
  fileName,
  diffSettings,
  headerActions,
}: DiffViewProps) {
  // Use provided settings or defaults
  const settings = diffSettings || {
    showAdditions: true,
    showDeletions: true,
    showLineNumbers: true,
  };
  const diff = useMemo(
    () => computeDiff(previousCode || "", currentCode || ""),
    [previousCode, currentCode]
  );

  const [highlightedLines, setHighlightedLines] = useState<
    Array<{ html: string; type: "added" | "removed" | "unchanged" }>
  >([]);

  const shikiLang = languageMap[language.toLowerCase()] || "typescript";

  useEffect(() => {
    async function highlightCode() {
      try {
        // Get the full code text for highlighting context
        const fullCode = diff.lines.map((line) => line.value || " ").join("\n");

        // Highlight the entire code block
        const html = await codeToHtml(fullCode, {
          lang: shikiLang,
          theme: "one-dark-pro",
        });

        // Parse the HTML to extract line-by-line highlighting
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const pre = doc.querySelector("pre");
        const code = pre?.querySelector("code");

        if (code) {
          // Shiki outputs HTML - extract the inner content
          const innerHTML = code.innerHTML;

          // Split by newlines, but preserve HTML spans
          // Shiki wraps the entire code, so we need to split intelligently
          const lines: Array<{
            html: string;
            type: "added" | "removed" | "unchanged";
          }> = [];

          // Simple approach: split by literal \n in the HTML
          // This works because shiki preserves newlines in the output
          const htmlLines = innerHTML.split(/\n/);

          diff.lines.forEach((diffLine, index) => {
            // Get the corresponding HTML line, or fallback to escaped text
            const lineHtml =
              htmlLines[index] || escapeHtml(diffLine.value || " ");
            lines.push({
              html: lineHtml || " ",
              type: diffLine.type,
            });
          });

          setHighlightedLines(lines);
        } else {
          // Fallback: no syntax highlighting
          setHighlightedLines(
            diff.lines.map((line) => ({
              html: escapeHtml(line.value || " "),
              type: line.type,
            }))
          );
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback: no syntax highlighting
        setHighlightedLines(
          diff.lines.map((line) => ({
            html: escapeHtml(line.value || " "),
            type: line.type,
          }))
        );
      }
    }

    highlightCode();
  }, [diff.lines, shikiLang]);

  return (
    <div className="bg-card flex flex-col h-full">
      {/* Code editor header with window controls */}
      <div className="bg-secondary border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <div className="w-3 h-3 rounded-full bg-chart-3" />
          <div className="w-3 h-3 rounded-full bg-primary" />
        </div>
        <div className="text-sm font-mono text-muted-foreground">
          {fileName ||
            (() => {
              const ext =
                language === "tsx" || language === "typescript"
                  ? "tsx"
                  : language === "jsx" || language === "javascript"
                  ? "jsx"
                  : language;
              return `component.${ext}`;
            })()}
        </div>
        <div className="flex items-center gap-2">{headerActions}</div>
      </div>

      {/* Step indicator */}
      {stepTitle && (
        <div className="bg-secondary/50 border-b border-border px-6 py-3">
          <p className="text-sm font-semibold text-foreground">{stepTitle}</p>
        </div>
      )}

      {/* Code content with syntax highlighting */}
      <div className="bg-background relative flex-1 overflow-hidden flex flex-col">
        {/* Filter lines based on settings */}
        {(() => {
          const filteredLines = highlightedLines
            .map((line, index) => {
              const diffLine = diff.lines[index];
              return {
                ...line,
                originalIndex: index,
                diffLine: diffLine || {
                  type: line.type,
                  value: "",
                  lineNumber: undefined,
                },
              };
            })
            .filter((line) => {
              if (line.type === "added" && !settings.showAdditions)
                return false;
              if (line.type === "removed" && !settings.showDeletions)
                return false;
              return true;
            });

          return (
            <>
              {/* Line numbers gutter */}
              {settings.showLineNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r border-border z-10 flex flex-col pointer-events-none">
                  {filteredLines.map((line, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-end px-2 py-0 text-xs text-muted-foreground font-mono"
                      style={{ minHeight: "1.5rem", lineHeight: "1.5rem" }}
                    >
                      {line.diffLine.lineNumber !== undefined
                        ? line.diffLine.lineNumber
                        : " "}
                    </div>
                  ))}
                </div>
              )}

              {/* Code content */}
              <div
                className={settings.showLineNumbers ? "pl-12" : ""}
                style={{ overflow: "auto", flex: 1 }}
              >
                <pre className="font-mono text-sm m-0 p-6">
                  <code className="block">
                    {filteredLines.map((line, index) => {
                      const bgColor =
                        line.type === "added"
                          ? "bg-primary/10 border-l-2 border-primary"
                          : line.type === "removed"
                          ? "bg-destructive/10 border-l-2 border-destructive"
                          : "";

                      return (
                        <div
                          key={index}
                          className={`flex items-start py-1 px-2 -mx-6 ${bgColor} ${
                            line.type === "removed" ? "opacity-70" : ""
                          }`}
                        >
                          <span
                            className="flex-1"
                            dangerouslySetInnerHTML={{ __html: line.html }}
                            style={{
                              whiteSpace: "pre",
                              tabSize: 2,
                              fontFamily:
                                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                              textDecoration:
                                line.type === "removed"
                                  ? "line-through"
                                  : "none",
                            }}
                          />
                        </div>
                      );
                    })}
                  </code>
                </pre>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  if (typeof document === "undefined") {
    // SSR fallback
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
