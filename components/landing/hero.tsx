import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getUser } from "@/lib/auth"

export async function Hero() {
  const user = await getUser()
  const ctaHref = user ? "/dashboard" : "/auth/register"

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          DiffSlides
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explain code by highlighting how it changes.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href={ctaHref}>Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/view/demo">View demo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

