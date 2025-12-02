"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // md breakpoint in Tailwind

/**
 * Hook to track if the current viewport is mobile or desktop
 * @returns true if mobile (below md breakpoint), false if desktop
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value
    checkMobile();

    // Listen for resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => {
      checkMobile();
    };

    mql.addEventListener("change", handleChange);
    window.addEventListener("resize", checkMobile);

    return () => {
      mql.removeEventListener("change", handleChange);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Return false during SSR to avoid hydration mismatch
  return isMobile ?? false;
}
