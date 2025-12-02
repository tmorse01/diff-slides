"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FileText, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-breakpoint";

interface NotesDrawerProps {
  notes: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotesDrawer({ notes, open, onOpenChange }: NotesDrawerProps) {
  const isMobile = useIsMobile();

  if (!notes) {
    return null;
  }

  // Mobile: Drawer overlay
  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        direction="right"
        shouldScaleBackground={true}
      >
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FileText className="h-4 w-4" />
            <span className="sr-only">Show notes</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-full sm:w-96">
          <DrawerHeader className="border-b">
            <DrawerTitle>Notes</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 py-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Toggle Button
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => onOpenChange?.(!open)}
    >
      {open ? <X className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      <span className="sr-only">{open ? "Hide notes" : "Show notes"}</span>
    </Button>
  );
}
