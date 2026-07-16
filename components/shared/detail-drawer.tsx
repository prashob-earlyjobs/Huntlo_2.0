"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Right-hand detail drawer on desktop; becomes a full-screen sheet on mobile.
 */
export function DetailDrawer({
  trigger,
  title,
  description,
  children,
  className,
}: {
  trigger: React.ReactElement;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent
        side="right"
        className={cn(
          "w-full gap-0 bg-card p-0 max-sm:max-w-full sm:max-w-md",
          className
        )}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
