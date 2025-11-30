"use client";

import { useMemo, useEffect, useState } from "react";
import { computeDiff } from "@/lib/diff";
import { codeToHtml } from "shiki";

interface DiffViewProps {
  previousCode: string;
  currentCode: string;
  language: string;
}

// Map language names to shiki language IDs
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  html: "html",
  css: "css",
  json: "json",
};

export function DiffView({
  previousCode,
  currentCode,
  language,
}: DiffViewProps) {
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
    <div className="border border-border rounded-lg overflow-hidden bg-background relative">
      {/* Line numbers gutter */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r border-border z-10 flex flex-col pointer-events-none">
        {diff.lines.map((line, index) => (
          <div
            key={index}
            className="flex items-center justify-end px-2 py-0 text-xs text-muted-foreground font-mono"
            style={{ minHeight: "1.5rem", lineHeight: "1.5rem" }}
          >
            {line.lineNumber !== undefined ? line.lineNumber : " "}
          </div>
        ))}
      </div>

      {/* Code content with syntax highlighting */}
      <div className="pl-12 overflow-auto">
        <pre className="font-mono text-sm m-0 p-4">
          <code className="block">
            {highlightedLines.map((line, index) => {
              const bgColor =
                line.type === "added"
                  ? "bg-accent/10 border-l-2 border-accent"
                  : line.type === "removed"
                  ? "bg-destructive/10 border-l-2 border-destructive"
                  : "";

              return (
                <div
                  key={index}
                  className={`flex items-start py-1 px-2 -mx-2 ${bgColor} ${
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
                        line.type === "removed" ? "line-through" : "none",
                    }}
                  />
                </div>
              );
            })}
          </code>
        </pre>
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
