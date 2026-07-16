"use client";

import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PLATFORM_SETTINGS,
  type PlatformProviderSetting,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<PlatformProviderSetting["status"], string> = {
  Connected: "bg-success/10 text-success",
  "Not configured": "bg-muted text-muted-foreground",
  "Needs attention": "bg-warning/10 text-warning",
};

export function AdminSettingsWorkspace() {
  const [providers, setProviders] = useState(PLATFORM_SETTINGS);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function updateField(
    providerId: string,
    fieldLabel: string,
    value: string
  ) {
    setProviders((previous) =>
      previous.map((provider) =>
        provider.id !== providerId
          ? provider
          : {
              ...provider,
              fields: provider.fields.map((field) =>
                field.label === fieldLabel ? { ...field, value } : field
              ),
            }
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Provider configuration for Huntlo. Credentials are always masked placeholders — never real secrets."
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="space-y-4">
        {providers.map((provider) => {
          const showMasked = revealed[provider.id] ?? false;
          return (
            <FormSection
              key={provider.id}
              title={provider.name}
              description={provider.description}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                    STATUS_CLASS[provider.status]
                  )}
                >
                  {provider.status}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setRevealed((previous) => ({
                        ...previous,
                        [provider.id]: !showMasked,
                      }))
                    }
                  >
                    {showMasked ? (
                      <>
                        <EyeOff aria-hidden />
                        Hide masked
                      </>
                    ) : (
                      <>
                        <Eye aria-hidden />
                        Show masked
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    onClick={() =>
                      setToast(
                        `Saved ${provider.name} settings. (UI preview — no credentials stored)`
                      )
                    }
                  >
                    <Save aria-hidden />
                    Save
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {provider.fields.map((field) => (
                  <Field
                    key={field.label}
                    label={field.label}
                    htmlFor={`${provider.id}-${field.label}`}
                    hint={
                      field.masked
                        ? "Masked placeholder — not a real credential"
                        : undefined
                    }
                  >
                    <Input
                      id={`${provider.id}-${field.label}`}
                      type={
                        field.masked && !showMasked ? "password" : "text"
                      }
                      value={field.value}
                      readOnly={field.masked}
                      onChange={(event) =>
                        updateField(
                          provider.id,
                          field.label,
                          event.target.value
                        )
                      }
                      className={cn(field.masked && "font-mono text-xs")}
                    />
                  </Field>
                ))}
              </div>
            </FormSection>
          );
        })}
      </div>
    </div>
  );
}
