import { cn } from "@/lib/utils";

interface DiffCodeIconProps {
  className?: string;
  size?: number;
}

// Diff icon with plus (green/added) and minus (red/removed) signs
export function DiffCodeIcon({ className, size = 20 }: DiffCodeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block", className)}
    >
      {/* Central vertical line */}
      <path d="M12 3v14" stroke="currentColor" opacity="0.3" />

      {/* Top plus sign (added - green) */}
      <g stroke="#22c55e">
        <path d="M5 10h14" />
        <path d="M12 3v14" />
      </g>

      {/* Bottom minus sign (removed - red) */}
      <path d="M5 21h14" stroke="#ef4444" />
    </svg>
  );
}
