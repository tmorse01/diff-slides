"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const langExtension = languageMap[language.toLowerCase()] || javascript;

  return (
    <div className="border rounded-lg overflow-hidden">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[langExtension()]}
        theme={isDark ? oneDark : undefined}
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
