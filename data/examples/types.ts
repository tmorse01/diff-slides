export interface CodeStep {
  title: string;
  previousCode: string;
  currentCode: string;
  language: string;
  fileName?: string;
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  steps: CodeStep[];
}

