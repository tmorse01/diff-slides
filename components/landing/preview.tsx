"use client"

import { Card } from "@/components/ui/card"

export function Preview() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">See it in action</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="space-y-1">
                <div className="text-muted-foreground">1</div>
                <div className="text-green-600 dark:text-green-400">+ function greet(name) {'{'}</div>
                <div className="text-green-600 dark:text-green-400">+   return `Hello, ${'{'}name{'}'}!`;</div>
                <div className="text-green-600 dark:text-green-400">+ {'}'}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full ${
                    step === 1 ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

