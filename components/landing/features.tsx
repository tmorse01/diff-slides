import { Sparkles, FileCode2, Video, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Sparkles,
    title: "Highlight code changes automatically",
    description: "Smart diff detection identifies additions, deletions, and modifications in your codebase.",
  },
  {
    icon: FileCode2,
    title: "Generate step-by-step slides",
    description: "Transform commits into interactive tutorials that tell the story of your code evolution.",
  },
  {
    icon: Video,
    title: "Export to video/slideshow",
    description: "Create MP4 videos, animated GIFs, PDF presentations, or embeddable HTML widgets.",
  },
  {
    icon: Zap,
    title: "Cinematic playback",
    description: "Smooth transitions and professional animations make your code explanations engaging.",
  },
]

export function Features() {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Built for developers who teach</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Every feature designed to make code storytelling effortless and impactful
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 bg-card border-border hover:border-accent/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

