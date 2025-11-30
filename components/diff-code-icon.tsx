import { cn } from "@/lib/utils";

interface DiffCodeIconProps {
  className?: string;
  size?: number;
}

// Using the exact same SVG structure as lucide-react's Code2 icon
export function DiffCodeIcon({ className, size = 20 }: DiffCodeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block", className)}
    >
      {/* Right bracket - green (added/new) */}
      <path d="m18 16 4-4-4-4" stroke="#22c55e" />
      {/* Left bracket - red (removed/deleted) */}
      <path d="m6 8-4 4 4 4" stroke="#ef4444" />
      {/* Middle line - neutral gray */}
      <path d="m14.5 4-5 16" stroke="#6b7280" opacity="0.6" />
    </svg>
  );
}
