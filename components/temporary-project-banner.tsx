"use client";

import Link from "next/link";
import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TemporaryProjectBanner() {
  return (
    <div className="m-4 p-2.5 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div className="flex-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
              Temporary Project
            </span>
            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              Register to save permanently
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
            >
              <Link href="/auth/register">
                <UserPlus className="mr-1.5 h-3 w-3" />
                Create Account
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
