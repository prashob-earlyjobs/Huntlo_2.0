"use client";

import { Eye, EyeOff, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type PlatformProviderSetting,
} from "@/lib/mock-admin";
import { adminApi } from "@/lib/api";
import type { AdminRoshniPromptSettings } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  ROSHNI_AGENT_PROMPT_TEMPLATE,
  ROSHNI_INTRODUCTION,
} from "@/lib/roshni-agent-prompt";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<PlatformProviderSetting["status"], string> = {
  Connected: "bg-success/10 text-success",
  "Not configured": "bg-muted text-muted-foreground",
  "Needs attention": "bg-warning/10 text-warning",
};

const REQUIRED_AGENT_PLACEHOLDERS = [
  "{callee_name}",
  "{jd_role_screening_label}",
  "{jd_screening_questions_list}",
] as const;

export function AdminSettingsWorkspace() {
  const [providers, setProviders] = useState<PlatformProviderSetting[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [promptMeta, setPromptMeta] = useState<AdminRoshniPromptSettings | null>(
    null
  );
  const [introduction, setIntroduction] = useState(ROSHNI_INTRODUCTION);
  const [agentPrompt, setAgentPrompt] = useState(ROSHNI_AGENT_PROMPT_TEMPLATE);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [metricCosts, setMetricCosts] = useState<Record<string, string>>({});
  const [metricCostLabels, setMetricCostLabels] = useState<Record<string, string>>(
    {}
  );
  const [metricCostDefaults, setMetricCostDefaults] = useState<
    Record<string, number>
  >({});
  const [costsSaving, setCostsSaving] = useState(false);
  const [costsError, setCostsError] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .getPlatformSettings()
      .then((data) => {
        setProviders(
          data.providers.map((provider) => ({
            id: provider.id,
            name: provider.name,
            description: provider.errorSummary || `${provider.name} integration`,
            status:
              provider.status === "connected"
                ? ("Connected" as const)
                : provider.status === "error" || provider.status === "degraded"
                  ? ("Needs attention" as const)
                  : ("Not configured" as const),
            fields: [
              {
                label: "Identifier",
                value: provider.maskedIdentifier || "—",
                masked: true,
              },
              {
                label: "Last tested",
                value: provider.lastTested
                  ? new Date(provider.lastTested).toLocaleString("en-IN")
                  : "Never",
                masked: false,
              },
            ],
          }))
        );
        if (data.roshniPrompt) {
          setPromptMeta(data.roshniPrompt);
          setIntroduction(data.roshniPrompt.effectiveIntroduction);
          setAgentPrompt(data.roshniPrompt.effectiveAgentPrompt);
        }
        const costs = data.metricCosts ?? data.metricCostDefaults ?? {};
        setMetricCosts(
          Object.fromEntries(
            Object.entries(costs).map(([key, value]) => [key, String(value)])
          )
        );
        setMetricCostLabels(data.metricCostLabels ?? {});
        setMetricCostDefaults(data.metricCostDefaults ?? {});
      })
      .catch((error) => {
        setProviders([]);
        setToast(getApiErrorMessage(error, "Unable to load platform settings."));
      });
  }, []);

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

  function validatePromptDraft(): string | null {
    if (!introduction.trim()) {
      return "Introduction is required (or reset to the bundled default).";
    }
    if (!introduction.includes("{callee_name}")) {
      return "Introduction must include {callee_name}.";
    }
    if (!agentPrompt.trim()) {
      return "Agent prompt is required (or reset to the bundled default).";
    }
    const missing = REQUIRED_AGENT_PLACEHOLDERS.filter(
      (token) => !agentPrompt.includes(token)
    );
    if (missing.length > 0) {
      return `Agent prompt is missing: ${missing.join(", ")}`;
    }
    return null;
  }

  async function saveRoshniPrompt() {
    const validationError = validatePromptDraft();
    if (validationError) {
      setPromptError(validationError);
      return;
    }
    setPromptSaving(true);
    setPromptError(null);
    try {
      const data = await adminApi.updatePlatformSettings({
        roshniPrompt: {
          introduction: introduction.trim(),
          agentPrompt: agentPrompt.trim(),
        },
      });
      if (data.roshniPrompt) {
        setPromptMeta(data.roshniPrompt);
        setIntroduction(data.roshniPrompt.effectiveIntroduction);
        setAgentPrompt(data.roshniPrompt.effectiveAgentPrompt);
      }
      setToast("Saved Roshni voice defaults.");
    } catch (error) {
      setPromptError(
        getApiErrorMessage(error, "Unable to save Roshni voice defaults.")
      );
    } finally {
      setPromptSaving(false);
    }
  }

  async function resetRoshniPromptToBundled() {
    setPromptSaving(true);
    setPromptError(null);
    try {
      const data = await adminApi.updatePlatformSettings({
        roshniPrompt: {
          introduction: null,
          agentPrompt: null,
        },
      });
      if (data.roshniPrompt) {
        setPromptMeta(data.roshniPrompt);
        setIntroduction(data.roshniPrompt.effectiveIntroduction);
        setAgentPrompt(data.roshniPrompt.effectiveAgentPrompt);
      } else {
        setIntroduction(ROSHNI_INTRODUCTION);
        setAgentPrompt(ROSHNI_AGENT_PROMPT_TEMPLATE);
      }
      setToast("Reset Roshni voice defaults to the bundled template.");
    } catch (error) {
      setPromptError(
        getApiErrorMessage(error, "Unable to reset Roshni voice defaults.")
      );
    } finally {
      setPromptSaving(false);
    }
  }

  async function saveMetricCosts() {
    const parsed: Record<string, number> = {};
    for (const [metric, raw] of Object.entries(metricCosts)) {
      const value = Number(raw);
      if (!Number.isInteger(value) || value < 1 || value > 1000) {
        setCostsError(
          `${metricCostLabels[metric] ?? metric} must be a whole number between 1 and 1000.`
        );
        return;
      }
      parsed[metric] = value;
    }
    setCostsSaving(true);
    setCostsError(null);
    try {
      const data = await adminApi.updatePlatformSettings({ metricCosts: parsed });
      const costs = data.metricCosts ?? parsed;
      setMetricCosts(
        Object.fromEntries(
          Object.entries(costs).map(([key, value]) => [key, String(value)])
        )
      );
      if (data.metricCostLabels) setMetricCostLabels(data.metricCostLabels);
      if (data.metricCostDefaults) setMetricCostDefaults(data.metricCostDefaults);
      setToast("Saved credit costs.");
    } catch (error) {
      setCostsError(getApiErrorMessage(error, "Unable to save credit costs."));
    } finally {
      setCostsSaving(false);
    }
  }

  function resetMetricCostsToDefaults() {
    setCostsError(null);
    setMetricCosts(
      Object.fromEntries(
        Object.entries(metricCostDefaults).map(([key, value]) => [
          key,
          String(value),
        ])
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

      <FormSection
        title="Credit costs"
        description="Credits charged per action against each usage metric. These are platform-wide and apply to every workspace."
      >
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={costsSaving || Object.keys(metricCostDefaults).length === 0}
            onClick={resetMetricCostsToDefaults}
          >
            <RotateCcw aria-hidden />
            Reset to defaults
          </Button>
          <Button
            type="button"
            size="xs"
            disabled={costsSaving || Object.keys(metricCosts).length === 0}
            onClick={() => void saveMetricCosts()}
          >
            <Save aria-hidden />
            Save costs
          </Button>
        </div>

        {costsError ? (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {costsError}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(metricCosts).map((metric) => (
            <Field
              key={metric}
              label={metricCostLabels[metric] ?? metric}
              htmlFor={`metric-cost-${metric}`}
              hint={`Default ${metricCostDefaults[metric] ?? "—"}`}
            >
              <Input
                id={`metric-cost-${metric}`}
                inputMode="numeric"
                value={metricCosts[metric] ?? ""}
                onChange={(event) =>
                  setMetricCosts((previous) => ({
                    ...previous,
                    [metric]: event.target.value,
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Roshni voice defaults"
        description="Global introduction and agent prompt used for new screening and outreach voice configurations. Existing custom drafts are not overwritten."
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Version {promptMeta?.version ?? 0}
            {promptMeta
              ? ` · intro ${promptMeta.introductionSource}, prompt ${promptMeta.agentPromptSource}`
              : " · loading…"}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={promptSaving}
              onClick={() => void resetRoshniPromptToBundled()}
            >
              <RotateCcw aria-hidden />
              Reset to bundled
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={promptSaving}
              onClick={() => void saveRoshniPrompt()}
            >
              <Save aria-hidden />
              Save prompt
            </Button>
          </div>
        </div>

        {promptError ? (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {promptError}
          </p>
        ) : null}

        <div className="space-y-4">
          <Field
            label="Introduction"
            htmlFor="admin-roshni-intro"
            hint="Must include {callee_name}. Used as the opening line for Roshni voice calls."
          >
            <Textarea
              id="admin-roshni-intro"
              value={introduction}
              onChange={(event) => setIntroduction(event.target.value)}
              className="min-h-20 font-mono text-xs"
            />
          </Field>
          <Field
            label="Agent prompt"
            htmlFor="admin-roshni-agent"
            hint="Must keep {callee_name}, {jd_role_screening_label}, and {jd_screening_questions_list}."
          >
            <Textarea
              id="admin-roshni-agent"
              value={agentPrompt}
              onChange={(event) => setAgentPrompt(event.target.value)}
              className="h-80 max-h-128 min-h-64 resize-y overflow-y-auto font-mono text-xs leading-relaxed field-sizing-fixed"
              style={{ fieldSizing: "fixed" }}
            />
          </Field>
        </div>
      </FormSection>

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
                    onClick={() => {
                      const secretField = provider.fields.find((f) => f.masked);
                      void adminApi
                        .updatePlatformSettings({
                          providers: [
                            {
                              provider: provider.id,
                              ...(secretField &&
                              secretField.value &&
                              !secretField.value.includes("•")
                                ? { secretValue: secretField.value }
                                : { configured: provider.status === "Connected" }),
                            },
                          ],
                        })
                        .then(() => setToast(`Saved ${provider.name} settings.`))
                        .catch((error) =>
                          setToast(
                            getApiErrorMessage(error, `Unable to save ${provider.name}.`)
                          )
                        );
                    }}
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
