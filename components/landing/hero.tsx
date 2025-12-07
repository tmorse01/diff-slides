"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Play, Github } from "lucide-react";
import { DiffCodeIcon } from "@/components/diff-code-icon";
import { DiffView } from "@/components/editor/diff-view";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Hero() {
  const [user, setUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(!!user);
    });
  }, [supabase]);

  const ctaHref = user ? "/dashboard" : "/projects/new";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.22_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0_0)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container relative z-10 px-4 py-32">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border">
            <DiffCodeIcon size={16} />
            <span className="text-sm font-mono text-muted-foreground">
              DiffSlides
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Explain code by{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-chart-3">
              highlighting how it changes
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Automatically generate slideshow-style tutorial steps from code
            diffs. Highlight changes over time and teach concepts visually.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" variant="default" className="group">
              <Link href={ctaHref}>
                {user ? "Go to Dashboard" : "Create Project"}
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            {!user && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group bg-transparent"
              >
                <Link href="/view/demo">
                  <Play className="mr-2 w-4 h-4" />
                  Try Demo
                </Link>
              </Button>
            )}
          </div>
          {!user && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              No account required to get started.{" "}
              <Link
                href="/projects/new"
                className="text-primary hover:underline"
              >
                Create your first project
              </Link>{" "}
              or{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:underline"
              >
                sign up
              </Link>{" "}
              to save permanently.
            </p>
          )}

          {/* Secondary links */}
          <div className="flex items-center justify-center gap-6 pb-8">
            <Link
              href="https://github.com/tmorse01/diff-slides"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/documentation"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </div>

          {/* Code preview */}
          <div className="w-full max-w-3xl mx-auto mt-16 opacity-40 pointer-events-none text-left">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden shadow-2xl">
              <DiffView
                previousCode={`function calculateTotal() {
  return price * quantity
}`}
                currentCode={`function calculateTotal() {
  return price * quantity + tax
}`}
                language="javascript"
                fileName="calculate.js"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
