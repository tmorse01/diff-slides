import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plan = {
  name: "Free",
  price: "$0",
  period: "forever",
  description: "Perfect for getting started with code storytelling",
  features: [
    "Unlimited projects",
    "Full diff highlighting",
    "Export to PDF & HTML",
    "Community support",
    "Public project sharing",
  ],
  cta: "Get Started",
};

export function Pricing() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Free forever
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Get started with all the features you need. Paid plans may be
            available in the future.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-card border-border">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <Button className="w-full mb-6" variant="default" size="lg" asChild>
              <Link href="/projects/new">{plan.cta}</Link>
            </Button>

            <div className="space-y-3">
              {plan.features.map((feature, featureIdx) => (
                <div key={featureIdx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Paid plans with additional features may be available in the future.
          </p>
        </div>
      </div>
    </section>
  );
}
