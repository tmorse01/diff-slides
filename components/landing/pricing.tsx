import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const features = [
  "Unlimited projects",
  "Full diff highlighting",
  "Export to PDF & HTML",
  "Community support",
  "Public project sharing",
];

export function Pricing() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Free forever
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Get started with all the features you need to create beautiful code
            storytelling presentations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-4 h-4 text-accent shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button className="mt-8" variant="default" size="lg" asChild>
            <Link href="/projects/new">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
