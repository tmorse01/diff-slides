"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Smartphone, Monitor } from "lucide-react";
import Link from "next/link";

// Email template with sample data
const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your email - DiffSlides</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a1a; color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #1a1a1a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #262626; border-radius: 12px; border: 1px solid #3d3d3d; overflow: hidden;">
          <!-- Header with logo -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%);">
              <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9999px; background-color: #1a1a1a; border: 1px solid #3d3d3d;">
                <!-- Logo SVG inline -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                  <path d="m18 16 4-4-4-4" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="m6 8-4 4 4 4" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="m14.5 4-5 16" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                </svg>
                <span style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 14px; color: #a3a3a3; font-weight: 500;">DiffSlides</span>
              </div>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; line-height: 1.2; color: #fafafa;">
                Confirm your email address
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a3a3a3;">
                Thanks for signing up! Please confirm your email address by clicking the button below to complete your registration.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="https://yourdomain.com/auth/callback?token=sample_token" style="display: inline-block; padding: 14px 32px; background-color: #fafafa; color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; line-height: 1.5; transition: background-color 0.2s;">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #737373;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: #22c55e; word-break: break-all; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;">
                https://yourdomain.com/auth/callback?token=sample_token
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; border-top: 1px solid #3d3d3d; background-color: #1a1a1a;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #737373;">
                This email was sent to <strong style="color: #fafafa;">user@example.com</strong>
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #525252;">
                If you didn't create an account with DiffSlides, you can safely ignore this email.
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #525252;">
                © 2025 DiffSlides. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function PreviewEmailPage() {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Confirmation Template Preview</CardTitle>
            <CardDescription>
              This is how the confirmation email will look to users. The
              template uses sample data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/register">Back to Register</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newWindow = window.open("", "_blank");
                    if (newWindow) {
                      newWindow.document.write(emailTemplate);
                      newWindow.document.close();
                    }
                  }}
                >
                  Open in New Tab
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <Label
                    htmlFor="view-toggle"
                    className="text-sm cursor-pointer"
                  >
                    Desktop
                  </Label>
                </div>
                <Switch
                  id="view-toggle"
                  checked={isMobile}
                  onCheckedChange={setIsMobile}
                />
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Label
                    htmlFor="view-toggle"
                    className="text-sm cursor-pointer"
                  >
                    Mobile
                  </Label>
                </div>
              </div>
            </div>

            {/* Email Preview Container */}
            <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <div className="bg-card p-2 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {isMobile ? "Mobile View (375px)" : "Desktop View (600px)"}
                </div>
              </div>
              <div className="bg-background p-4">
                <div
                  className="border border-border rounded transition-all duration-200 overflow-hidden bg-background mx-auto"
                  style={{
                    width: isMobile ? "375px" : "600px",
                  }}
                >
                  <iframe
                    srcDoc={emailTemplate}
                    className="border-0"
                    style={{
                      width: "100%",
                      height: "600px",
                      display: "block",
                      border: "none",
                    }}
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-2">
                Testing Instructions:
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Copy the HTML from{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    emails/confirmation.html
                  </code>
                </li>
                <li>
                  Go to Supabase Dashboard → Authentication → Email Templates
                </li>
                <li>Paste into the Confirmation template</li>
                <li>Register a new account to receive the actual email</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
