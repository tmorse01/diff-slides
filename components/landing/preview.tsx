"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const codeSteps = [
  {
    title: "Step 1: Initial setup",
    lines: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: "", type: "unchanged" },
      { num: 3, content: "function UserProfile() {", type: "unchanged" },
      { num: 4, content: "  return <div>Profile</div>", type: "unchanged" },
      { num: 5, content: "}", type: "unchanged" },
    ],
  },
  {
    title: "Step 2: Add state management",
    lines: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: 'import { useState } from "react"', type: "added" },
      { num: 3, content: "", type: "unchanged" },
      { num: 4, content: "function UserProfile() {", type: "unchanged" },
      { num: 5, content: '  const [name, setName] = useState("")', type: "added" },
      { num: 6, content: "  return <div>Profile</div>", type: "unchanged" },
      { num: 7, content: "}", type: "unchanged" },
    ],
  },
  {
    title: "Step 3: Update JSX",
    lines: [
      { num: 1, content: 'import React from "react"', type: "unchanged" },
      { num: 2, content: 'import { useState } from "react"', type: "unchanged" },
      { num: 3, content: "", type: "unchanged" },
      { num: 4, content: "function UserProfile() {", type: "unchanged" },
      { num: 5, content: '  const [name, setName] = useState("")', type: "unchanged" },
      { num: 6, content: "  return <div>Profile</div>", type: "removed" },
      { num: 7, content: "  return <div>Welcome, {name}!</div>", type: "added" },
      { num: 8, content: "}", type: "unchanged" },
    ],
  },
]

export function Preview() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % codeSteps.length)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + codeSteps.length) % codeSteps.length)
  }

  const step = codeSteps[currentStep]

  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">See it in action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Watch how code changes come to life with highlighted diffs and smooth transitions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
            {/* Code editor header */}
            <div className="bg-secondary border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <div className="w-3 h-3 rounded-full bg-accent" />
              </div>
              <div className="text-sm font-mono text-muted-foreground">UserProfile.tsx</div>
              <div className="w-20" /> {/* Spacer for balance */}
            </div>

            {/* Step indicator */}
            <div className="bg-secondary/50 border-b border-border px-6 py-3">
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
            </div>

            {/* Code content */}
            <div className="bg-background p-6 font-mono text-sm min-h-[300px]">
              {step.lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start py-1 -mx-6 px-6 ${
                    line.type === "added"
                      ? "bg-accent/10 border-l-2 border-accent"
                      : line.type === "removed"
                        ? "bg-destructive/10 border-l-2 border-destructive"
                        : ""
                  }`}
                >
                  <span className="text-muted-foreground mr-6 select-none w-8 text-right">{line.num}</span>
                  <span
                    className={`flex-1 ${
                      line.type === "added"
                        ? "text-accent"
                        : line.type === "removed"
                          ? "text-destructive line-through"
                          : "text-foreground"
                    }`}
                  >
                    {line.content || " "}
                  </span>
                </div>
              ))}
            </div>

            {/* Step navigation */}
            <div className="bg-secondary border-t border-border px-6 py-4 flex items-center justify-between">
              <Button onClick={prevStep} variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {codeSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentStep ? "bg-accent w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              <Button onClick={nextStep} variant="ghost" size="sm" className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

