"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CookieCategoryRow } from "./CookieCategoryRow";

export type OptionalCookieCategories = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
};

const DEFAULT_OPTIONAL: OptionalCookieCategories = {
  preferences: false,
  analytics: false,
  marketing: false,
  thirdParty: false,
};

const ALL_ENABLED: OptionalCookieCategories = {
  preferences: true,
  analytics: true,
  marketing: true,
  thirdParty: true,
};

type CookieSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSavePreferences: () => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
};

function useIsMobileViewport(breakpointPx = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpointPx]);

  return isMobile;
}

function CategoryList({
  categories,
  onChange,
}: {
  categories: OptionalCookieCategories;
  onChange: (next: OptionalCookieCategories) => void;
}) {
  return (
    <div className="divide-y-0">
      <CookieCategoryRow
        id="cookie-necessary"
        title="Strictly Necessary"
        description="Required for authentication, security and core platform functionality."
        checked
        disabled
        alwaysActive
      />
      <CookieCategoryRow
        id="cookie-preferences"
        title="Preferences"
        description="Used to remember interface and personalisation choices."
        checked={categories.preferences}
        onCheckedChange={(checked) =>
          onChange({ ...categories, preferences: checked })
        }
      />
      <CookieCategoryRow
        id="cookie-analytics"
        title="Analytics"
        description="Used to understand how visitors use Huntlo and improve the product."
        checked={categories.analytics}
        onCheckedChange={(checked) =>
          onChange({ ...categories, analytics: checked })
        }
      />
      <CookieCategoryRow
        id="cookie-marketing"
        title="Marketing"
        description="Used for advertising, campaign measurement and relevant promotions."
        checked={categories.marketing}
        onCheckedChange={(checked) =>
          onChange({ ...categories, marketing: checked })
        }
      />
      <CookieCategoryRow
        id="cookie-third-party"
        title="Third-Party Features"
        description="Used by optional embedded services and external widgets."
        checked={categories.thirdParty}
        onCheckedChange={(checked) =>
          onChange({ ...categories, thirdParty: checked })
        }
      />
    </div>
  );
}

function ActionButtons({
  onCancel,
  onRejectNonEssential,
  onAcceptAll,
  onSavePreferences,
  stacked,
}: {
  onCancel: () => void;
  onRejectNonEssential: () => void;
  onAcceptAll: () => void;
  onSavePreferences: () => void;
  stacked?: boolean;
}) {
  return (
    <div
      className={
        stacked
          ? "flex w-full flex-col gap-2"
          : "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
      }
    >
      <Button
        type="button"
        variant="ghost"
        className="min-h-10 sm:min-h-8"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-10 sm:min-h-8"
        onClick={onRejectNonEssential}
      >
        Reject Non-Essential
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-10 sm:min-h-8"
        onClick={onAcceptAll}
      >
        Accept All
      </Button>
      <Button
        type="button"
        className="min-h-10 sm:min-h-8"
        onClick={onSavePreferences}
      >
        Save Preferences
      </Button>
    </div>
  );
}

export function CookieSettingsDialog({
  open,
  onOpenChange,
  onSavePreferences,
  onAcceptAll,
  onRejectNonEssential,
}: CookieSettingsDialogProps) {
  const isMobile = useIsMobileViewport();
  const [categories, setCategories] =
    useState<OptionalCookieCategories>(DEFAULT_OPTIONAL);

  useEffect(() => {
    if (open) {
      setCategories(DEFAULT_OPTIONAL);
    }
  }, [open]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    onSavePreferences();
  };

  const handleAcceptAll = () => {
    setCategories(ALL_ENABLED);
    onAcceptAll();
  };

  const handleReject = () => {
    setCategories(DEFAULT_OPTIONAL);
    onRejectNonEssential();
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 rounded-t-xl p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle>Cookie settings</SheetTitle>
            <SheetDescription>
              Choose which optional cookies Huntlo may use. Essential cookies
              are always active because they are required for security and core
              platform functionality.
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 py-2">
            <CategoryList categories={categories} onChange={setCategories} />
          </div>
          <SheetFooter className="border-t border-border bg-muted/50 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ActionButtons
              stacked
              onCancel={handleCancel}
              onRejectNonEssential={handleReject}
              onAcceptAll={handleAcceptAll}
              onSavePreferences={handleSave}
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="border-b border-border px-4 py-4 text-left sm:px-5">
          <DialogTitle>Cookie settings</DialogTitle>
          <DialogDescription>
            Choose which optional cookies Huntlo may use. Essential cookies are
            always active because they are required for security and core
            platform functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-4 py-2 sm:px-5">
          <CategoryList categories={categories} onChange={setCategories} />
        </div>
        <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t bg-muted/50 p-4 sm:justify-end">
          <ActionButtons
            onCancel={handleCancel}
            onRejectNonEssential={handleReject}
            onAcceptAll={handleAcceptAll}
            onSavePreferences={handleSave}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
