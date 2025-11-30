"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface CodeLine {
  num: number
  content: string
  type: "unchanged" | "added" | "removed"
}

export interface Step {
  id: number
  title: string
  fileName: string
  code: CodeLine[]
  duration: number
  transition: string
}

interface EditorContextType {
  steps: Step[]
  currentStepIndex: number
  showAdditions: boolean
  showDeletions: boolean
  showLineNumbers: boolean
  setCurrentStepIndex: (index: number) => void
  addStep: () => void
  deleteStep: (id: number) => void
  updateStepTitle: (id: number, title: string) => void
  updateCode: (stepId: number, code: CodeLine[]) => void
  duplicateStep: (id: number) => void
  setShowAdditions: (show: boolean) => void
  setShowDeletions: (show: boolean) => void
  setShowLineNumbers: (show: boolean) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

const initialSteps: Step[] = [
  {
    id: 1,
    title: "Initial setup",
    fileName: "UserProfile.tsx",
    duration: 3,
    transition: "fade",
    code: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: "", type: "unchanged" },
      { num: 3, content: "function UserProfile() {", type: "unchanged" },
      { num: 4, content: "  return (", type: "unchanged" },
      { num: 5, content: "    <div>Profile</div>", type: "unchanged" },
      { num: 6, content: "  )", type: "unchanged" },
      { num: 7, content: "}", type: "unchanged" },
    ],
  },
  {
    id: 2,
    title: "Add state management",
    fileName: "UserProfile.tsx",
    duration: 3,
    transition: "fade",
    code: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: 'import { useState } from "react"', type: "added" },
      { num: 3, content: "", type: "unchanged" },
      { num: 4, content: "function UserProfile() {", type: "unchanged" },
      { num: 5, content: '  const [name, setName] = useState("")', type: "added" },
      { num: 6, content: '  const [email, setEmail] = useState("")', type: "added" },
      { num: 7, content: "", type: "unchanged" },
      { num: 8, content: "  return (", type: "unchanged" },
      { num: 9, content: "    <div>Profile</div>", type: "removed" },
      { num: 10, content: '    <div className="profile">', type: "added" },
      { num: 11, content: "      <h1>Welcome, {name}!</h1>", type: "added" },
      { num: 12, content: "      <p>{email}</p>", type: "added" },
      { num: 13, content: "    </div>", type: "added" },
      { num: 14, content: "  )", type: "unchanged" },
      { num: 15, content: "}", type: "unchanged" },
    ],
  },
  {
    id: 3,
    title: "Update JSX structure",
    fileName: "UserProfile.tsx",
    duration: 3,
    transition: "fade",
    code: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: 'import { useState } from "react"', type: "unchanged" },
      { num: 3, content: "", type: "unchanged" },
      { num: 4, content: "function UserProfile() {", type: "unchanged" },
      { num: 5, content: '  const [name, setName] = useState("")', type: "unchanged" },
      { num: 6, content: '  const [email, setEmail] = useState("")', type: "unchanged" },
      { num: 7, content: "", type: "unchanged" },
      { num: 8, content: "  return (", type: "unchanged" },
      { num: 9, content: '    <div className="profile">', type: "unchanged" },
      { num: 10, content: "      <h1>Welcome, {name}!</h1>", type: "removed" },
      { num: 11, content: '      <h1 className="title">Welcome, {name}!</h1>', type: "added" },
      { num: 12, content: "      <p>{email}</p>", type: "removed" },
      { num: 13, content: '      <p className="email">{email}</p>', type: "added" },
      { num: 14, content: '      <button onClick={() => setName("Guest")}>Reset</button>', type: "added" },
      { num: 15, content: "    </div>", type: "unchanged" },
      { num: 16, content: "  )", type: "unchanged" },
      { num: 17, content: "}", type: "unchanged" },
    ],
  },
  {
    id: 4,
    title: "Add error handling",
    fileName: "UserProfile.tsx",
    duration: 3,
    transition: "fade",
    code: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: 'import { useState } from "react"', type: "unchanged" },
      { num: 3, content: "", type: "unchanged" },
      { num: 4, content: "function UserProfile() {", type: "unchanged" },
      { num: 5, content: '  const [name, setName] = useState("")', type: "unchanged" },
      { num: 6, content: '  const [email, setEmail] = useState("")', type: "unchanged" },
      { num: 7, content: "  const [error, setError] = useState(null)", type: "added" },
      { num: 8, content: "", type: "unchanged" },
      { num: 9, content: "  const handleReset = () => {", type: "added" },
      { num: 10, content: "    try {", type: "added" },
      { num: 11, content: '      setName("Guest")', type: "added" },
      { num: 12, content: "      setError(null)", type: "added" },
      { num: 13, content: "    } catch (e) {", type: "added" },
      { num: 14, content: "      setError(e.message)", type: "added" },
      { num: 15, content: "    }", type: "added" },
      { num: 16, content: "  }", type: "added" },
      { num: 17, content: "", type: "unchanged" },
      { num: 18, content: "  return (", type: "unchanged" },
      { num: 19, content: '    <div className="profile">', type: "unchanged" },
      { num: 20, content: "      {error && <div>{error}</div>}", type: "added" },
      { num: 21, content: '      <h1 className="title">Welcome, {name}!</h1>', type: "unchanged" },
      { num: 22, content: '      <p className="email">{email}</p>', type: "unchanged" },
      { num: 23, content: '      <button onClick={() => setName("Guest")}>Reset</button>', type: "removed" },
      { num: 24, content: "      <button onClick={handleReset}>Reset</button>", type: "added" },
      { num: 25, content: "    </div>", type: "unchanged" },
      { num: 26, content: "  )", type: "unchanged" },
      { num: 27, content: "}", type: "unchanged" },
    ],
  },
]

export function EditorProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps)
  const [currentStepIndex, setCurrentStepIndex] = useState(1)
  const [showAdditions, setShowAdditions] = useState(true)
  const [showDeletions, setShowDeletions] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const addStep = () => {
    const newId = Math.max(...steps.map((s) => s.id)) + 1
    const lastStep = steps[steps.length - 1]
    const newStep: Step = {
      id: newId,
      title: `New step ${newId}`,
      fileName: lastStep?.fileName || "file.tsx",
      code: lastStep?.code || [],
      duration: 3,
      transition: "fade",
    }
    setSteps([...steps, newStep])
  }

  const deleteStep = (id: number) => {
    if (steps.length <= 1) return
    const newSteps = steps.filter((s) => s.id !== id)
    setSteps(newSteps)
    if (currentStepIndex >= newSteps.length) {
      setCurrentStepIndex(newSteps.length - 1)
    }
  }

  const updateStepTitle = (id: number, title: string) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, title } : step)))
  }

  const updateCode = (stepId: number, code: CodeLine[]) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, code } : step)))
  }

  const duplicateStep = (id: number) => {
    const stepToDuplicate = steps.find((s) => s.id === id)
    if (!stepToDuplicate) return

    const newId = Math.max(...steps.map((s) => s.id)) + 1
    const duplicatedStep: Step = {
      ...stepToDuplicate,
      id: newId,
      title: `${stepToDuplicate.title} (copy)`,
    }

    const stepIndex = steps.findIndex((s) => s.id === id)
    const newSteps = [...steps.slice(0, stepIndex + 1), duplicatedStep, ...steps.slice(stepIndex + 1)]
    setSteps(newSteps)
  }

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  return (
    <EditorContext.Provider
      value={{
        steps,
        currentStepIndex,
        showAdditions,
        showDeletions,
        showLineNumbers,
        setCurrentStepIndex,
        addStep,
        deleteStep,
        updateStepTitle,
        updateCode,
        duplicateStep,
        setShowAdditions,
        setShowDeletions,
        setShowLineNumbers,
        goToNextStep,
        goToPreviousStep,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}
