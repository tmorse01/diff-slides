import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface FrostedGlassCardProps {
  children: ReactNode;
  glowColor?: "destructive" | "warning" | "primary";
  className?: string;
}

const glowColorClasses = {
  destructive: {
    glow: "bg-destructive/30",
    icon: "text-destructive",
  },
  warning: {
    glow: "bg-warning/30",
    icon: "text-warning",
  },
  primary: {
    glow: "bg-primary/30",
    icon: "text-primary",
  },
};

export function FrostedGlassCard({
  children,
  glowColor = "primary",
  className,
}: FrostedGlassCardProps) {
  const colors = glowColorClasses[glowColor];

  return (
    <Card
      className={cn(
        "p-6 bg-black/80 backdrop-blur-md border-border/50 hover:border-border transition-all group relative overflow-hidden",
        className
      )}
    >
      {/* Small color glow in top right */}
      <div
        className={cn(
          "absolute -top-8 -right-8 w-36 h-36 rounded-full blur-2xl opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none",
          colors.glow
        )}
        style={{ zIndex: 1 }}
      />

      {/* Frosted glass effect overlay */}
      <div
        className="absolute inset-0 bg-linear-to-br from-black/40 to-transparent pointer-events-none"
        style={{ zIndex: 2 }}
      />

      <div className="relative z-10">{children}</div>
    </Card>
  );
}

// Export the icon color class helper for use in children
export function getGlowIconColor(
  glowColor: "destructive" | "warning" | "primary"
) {
  return glowColorClasses[glowColor].icon;
}
