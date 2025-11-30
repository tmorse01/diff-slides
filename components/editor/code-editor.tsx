"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import type { LanguageSupport } from "@codemirror/language";

const languageMap: Record<string, () => LanguageSupport> = {
  javascript,
  typescript: javascript,
  python,
  html,
  css,
  json,
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
}: CodeEditorProps) {
  const langExtension = languageMap[language.toLowerCase()] || javascript;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[langExtension()]}
        theme={oneDark}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
        }}
      />
    </div>
  );
}
