import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with code storytelling",
    features: [
      "Up to 5 projects",
      "Basic diff highlighting",
      "Export to PDF & HTML",
      "Community support",
      "Public project sharing",
    ],
    cta: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals who teach and create content",
    features: [
      "Unlimited projects",
      "Advanced diff features",
      "Export to MP4 & GIF",
      "Priority support",
      "Custom branding",
      "Private projects",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    variant: "default" as const,
    popular: true,
  },
]

export function PricingSection() {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Start free, upgrade when you need more power
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`p-8 bg-card border-border relative ${
                plan.popular ? "border-accent shadow-lg shadow-accent/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button className="w-full mb-6" variant={plan.variant} size="lg">
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
