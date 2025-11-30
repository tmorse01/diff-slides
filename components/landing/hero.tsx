"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, Code2, Play, Github } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function Hero() {
  const router = useRouter()
  const [user, setUser] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(!!user)
    })
  }, [supabase])

  const ctaHref = user ? "/dashboard" : "/auth/register"

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.22_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0_0)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container relative z-10 px-4 py-32">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Code2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-mono text-muted-foreground">DiffSlides</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Explain code by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-chart-3">
              highlighting how it changes
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Automatically generate slideshow-style tutorial steps from code diffs. Highlight changes over time and teach
            concepts visually.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              <Link href={ctaHref}>
                {user ? "Go to Dashboard" : "Get Started"}
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group bg-transparent">
              <Link href="/view/demo">
                <Play className="mr-2 w-4 h-4" />
                Try Demo
              </Link>
            </Button>
          </div>

          {/* Secondary links */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <Link
              href="https://github.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Floating code preview */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 opacity-40 pointer-events-none">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex">
              <span className="text-muted-foreground mr-4">1</span>
              <span className="text-foreground">
                {"function"} calculateTotal() {"{"}
              </span>
            </div>
            <div className="flex bg-destructive/20 -mx-4 px-4">
              <span className="text-muted-foreground mr-4">2</span>
              <span className="text-destructive">{"  return price * quantity"}</span>
            </div>
            <div className="flex bg-accent/20 -mx-4 px-4">
              <span className="text-muted-foreground mr-4">3</span>
              <span className="text-accent">{"  return price * quantity + tax"}</span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground mr-4">4</span>
              <span className="text-foreground">{"}"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

