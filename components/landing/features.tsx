import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, GitBranch, Share2 } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Code,
      title: "Turn code changes into slides",
      description: "Transform your code diffs into step-by-step tutorials that are easy to follow.",
    },
    {
      icon: GitBranch,
      title: "Highlight diffs automatically",
      description: "Automatically detect and highlight added, removed, and modified lines in your code.",
    },
    {
      icon: Share2,
      title: "Share a live playback link",
      description: "Share your tutorials with a simple link. Viewers can step through changes at their own pace.",
    },
  ]

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="h-10 w-10 mb-4 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

