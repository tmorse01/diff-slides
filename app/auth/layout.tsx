"use client";

import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPreviewEmail = pathname?.includes("/auth/preview-email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className={`w-full p-6 ${
          isPreviewEmail ? "max-w-6xl" : "max-w-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
