"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiffCodeIcon } from "@/components/diff-code-icon";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border mx-auto mb-4">
            <DiffCodeIcon size={16} />
            <span className="text-sm font-mono text-muted-foreground">
              DiffSlides
            </span>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a confirmation email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please check your inbox and click the confirmation link to verify
            your email address and complete your registration.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Didn&apos;t receive the email?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
