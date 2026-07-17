"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  AudioLines,
  Check,
  ClipboardList,
  CreditCard,
  Download,
  Headphones,
  Link2,
  LineChart,
  Mail,
  MessageCircle,
  Minus,
  Search,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getApiErrorMessage,
  plansApi,
  type CurrentPlan,
  type PlanTier,
} from "@/lib/api";
import type { Invoice } from "@/lib/mock-plans";
import {
  usagePercent,
  usageRemaining,
  usageState,
  type PaymentStatus,
  type PlanFeatureValue,
  type UsageQuota,
  type UsageState,
} from "@/lib/mock-plans";
import {
  openRazorpayCheckout,
  RazorpayCheckoutDismissedError,
} from "@/lib/razorpay-checkout";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const QUOTA_ICONS: Record<string, LucideIcon> = {
  searches: Search,
  "email-reveals": Mail,
  "mobile-reveals": Smartphone,
  linkedin: Link2,
  "email-outreach": Mail,
  whatsapp: MessageCircle,
  voice: AudioLines,
  assessments: ClipboardList,
  team: Users,
};

const FEATURE_ROWS = [
  { key: "searches", label: "Candidate searches" },
  { key: "emailReveals", label: "Email reveals" },
  { key: "mobileReveals", label: "Mobile reveals" },
  { key: "peopleScout", label: "People Scout" },
  { key: "emailOutreach", label: "Email outreach" },
  { key: "whatsapp", label: "WhatsApp outreach" },
  { key: "voice", label: "AI voice calls" },
  { key: "team", label: "Team members" },
] as const;

type DialogKind =
  | "upgrade"
  | "quota"
  | "payment-failed"
  | "upgrade-success"
  | "credits"
  | "sales"
  | null;

/* ------------------------------------------------------------------ */
/* Badges                                                               */
/* ------------------------------------------------------------------ */

const USAGE_STATE_CLASSES: Record<UsageState, string> = {
  Normal: "bg-success/10 text-success",
  "75% warning": "bg-warning/10 text-warning",
  "90% critical": "bg-destructive/10 text-destructive",
  "Limit exhausted": "bg-destructive/10 text-destructive",
  Unlimited: "bg-brand-subtle text-primary",
};

const PAYMENT_CLASSES: Record<PaymentStatus, string> = {
  Paid: "bg-success/10 text-success",
  Failed: "bg-destructive/10 text-destructive",
  Pending: "bg-warning/10 text-warning",
  Refunded: "bg-muted text-muted-foreground",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Usage quota card                                                     */
/* ------------------------------------------------------------------ */

function QuotaCard({
  quota,
  onExhausted,
}: {
  quota: UsageQuota;
  onExhausted: () => void;
}) {
  const state = usageState(quota);
  const percent = usagePercent(quota);
  const remaining = usageRemaining(quota);
  const unit = quota.unit ? ` ${quota.unit}` : "";
  const Icon = quota.icon ?? Search;
  const barTone =
    state === "Limit exhausted" || state === "90% critical"
      ? "[&_[data-slot=progress-indicator]]:bg-destructive"
      : state === "75% warning"
        ? "[&_[data-slot=progress-indicator]]:bg-warning"
        : "";

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-4",
        state === "Limit exhausted" && "border-destructive/40",
        state === "90% critical" && "border-destructive/25",
        state === "75% warning" && "border-warning/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon aria-hidden className="size-4 text-muted-foreground" />
        </span>
        <Badge text={state} className={USAGE_STATE_CLASSES[state]} />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground">
        {quota.label}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{quota.description}</p>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {quota.used.toLocaleString("en-IN")}
          <span className="text-sm font-normal text-muted-foreground">
            {quota.limit === null
              ? " used"
              : ` / ${quota.limit.toLocaleString("en-IN")}${unit}`}
          </span>
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {quota.limit === null
            ? "Unlimited"
            : `${remaining?.toLocaleString("en-IN")}${unit} left`}
        </p>
      </div>

      {quota.limit !== null ? (
        <Progress
          value={percent}
          aria-label={`${quota.label}: ${percent}% used`}
          className={cn("mt-2", barTone)}
        />
      ) : (
        <div
          aria-hidden
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full w-1/3 rounded-full bg-primary/40" />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{percent}% used</span>
        <span>Resets {quota.resetDate}</span>
      </div>

      {state === "Limit exhausted" ? (
        <Button
          size="xs"
          variant="outline"
          className="mt-3 self-start"
          onClick={onExhausted}
        >
          Request more credits
        </Button>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Usage trend                                                          */
/* ------------------------------------------------------------------ */

function UsageTrendChart() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Usage trend</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Daily searches, reveals, outreach sends and voice calls this week
      </p>
      <EmptyState
        className="mt-4"
        icon={LineChart}
        title="Usage trend unavailable"
        description="Daily usage trend charts are not available for this workspace yet."
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Plan comparison                                                      */
/* ------------------------------------------------------------------ */

function FeatureCell({ value }: { value: PlanFeatureValue }) {
  if (value === true) {
    return <Check aria-label="Included" className="size-4 text-success" />;
  }
  if (value === false) {
    return <Minus aria-label="Not included" className="size-4 text-muted-foreground" />;
  }
  return (
    <span className="text-sm text-foreground">
      {value === "Unlimited" ? (
        <span className="font-medium text-primary">Unlimited</span>
      ) : (
        value
      )}
    </span>
  );
}

function PlanComparison({
  tiers,
  onUpgrade,
  onSales,
}: {
  tiers: PlanTier[];
  onUpgrade: () => void;
  onSales: () => void;
}) {
  if (tiers.length === 0) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Plan comparison
          </h2>
        </div>
        <EmptyState
          icon={CreditCard}
          title="Plans unavailable"
          description="Plan tiers could not be loaded right now. Try again shortly."
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Plan comparison
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Compare limits across available plans
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {tiers.map((tier) => (
          <article
            key={tier.id}
            className={cn(
              "flex flex-col rounded-xl border border-border bg-card p-4",
              tier.highlighted && "border-primary/50 ring-1 ring-primary/20"
            )}
          >
            {tier.highlighted ? (
              <span className="mb-2 self-start rounded-md bg-brand-subtle px-2 py-0.5 text-[11px] font-medium text-primary">
                Current plan
              </span>
            ) : (
              <span className="mb-2 h-5" aria-hidden />
            )}
            <h3 className="text-base font-semibold text-foreground">
              {tier.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {tier.description}
            </p>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
              {tier.price}
              <span className="text-sm font-normal text-muted-foreground">
                {tier.priceNote}
              </span>
            </p>
            <ul className="mt-4 flex-1 space-y-2 border-t border-border pt-3">
              {FEATURE_ROWS.map((row) => (
                <li
                  key={row.key}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <FeatureCell value={tier.features[row.key] ?? false} />
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              className="mt-4 w-full"
              variant={tier.highlighted ? "outline" : "default"}
              disabled={tier.highlighted}
              onClick={() => {
                if (tier.cta === "Contact Sales") onSales();
                else onUpgrade();
              }}
            >
              {tier.cta}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Billing & usage history                                              */
/* ------------------------------------------------------------------ */

function BillingHistory({ onFailed }: { onFailed: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await plansApi.listInvoices();
        if (!cancelled) setInvoices(rows);
      } catch {
        // Keep empty when API unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Billing history
        </h2>
        <p className="text-xs text-muted-foreground">
          Invoices from Razorpay (INR) and Dodo Payments (USD)
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">Billing invoices</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Invoice</TableHead>
              <TableHead className={HEAD}>Plan</TableHead>
              <TableHead className={HEAD}>Billing period</TableHead>
              <TableHead className={`${HEAD} text-right`}>Amount</TableHead>
              <TableHead className={HEAD}>Payment provider</TableHead>
              <TableHead className={HEAD}>Payment status</TableHead>
              <TableHead className={HEAD}>Payment date</TableHead>
              <TableHead className={`${HEAD} w-10 text-right`}>
                <span className="sr-only">Download</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No invoices yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="py-2.5 font-mono text-xs text-foreground">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-foreground">
                  {invoice.plan}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {invoice.billingPeriod}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums text-foreground">
                  {invoice.amount}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {invoice.provider}
                </TableCell>
                <TableCell className="py-2.5">
                  <button
                    type="button"
                    className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    onClick={() => {
                      if (invoice.status === "Failed") onFailed();
                    }}
                  >
                    <Badge
                      text={invoice.status}
                      className={PAYMENT_CLASSES[invoice.status]}
                    />
                  </button>
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {invoice.paymentDate}
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Download ${invoice.invoiceNumber}`}
                    disabled={invoice.status === "Failed"}
                  >
                    <Download aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function UsageHistoryTable() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Usage history</h2>
        <p className="text-xs text-muted-foreground">
          Recent credit consumption across the workspace
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">Usage history log</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Date and time</TableHead>
              <TableHead className={HEAD}>User</TableHead>
              <TableHead className={HEAD}>Action</TableHead>
              <TableHead className={HEAD}>Module</TableHead>
              <TableHead className={HEAD}>Quantity</TableHead>
              <TableHead className={HEAD}>Related entity</TableHead>
              <TableHead className={HEAD}>Remaining balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No usage history yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                              */
/* ------------------------------------------------------------------ */

function PlansDialogs({
  kind,
  onClose,
  onConfirmUpgrade,
  upgrading,
}: {
  kind: DialogKind;
  onClose: () => void;
  onConfirmUpgrade: () => void;
  upgrading?: boolean;
}) {
  return (
    <>
      <AlertDialog
        open={kind === "upgrade"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Checkout opens Razorpay for INR or Dodo Payments for USD. Your
              plan activates only after the server verifies payment — the
              browser alone cannot mark you as paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={upgrading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={upgrading} onClick={onConfirmUpgrade}>
              <ArrowUpRight aria-hidden />
              {upgrading ? "Starting checkout…" : "Continue to payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kind === "upgrade-success"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-success/10">
                <Check aria-hidden className="size-4 text-success" />
              </span>
              Upgrade successful
            </AlertDialogTitle>
            <AlertDialogDescription>
              Payment verified on the server. New plan limits apply
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onClose}>Done</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kind === "quota"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle aria-hidden className="size-5 text-destructive" />
              Quota exhausted
            </AlertDialogTitle>
            <AlertDialogDescription>
              One or more usage limits are exhausted for the current cycle. Top
              up credits or upgrade your plan to continue. Unaffected modules
              continue normally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClose();
              }}
            >
              Request more credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kind === "payment-failed"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard aria-hidden className="size-5 text-destructive" />
              Payment failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              Invoice INV-2026-05-001 for ₹24,999 could not be collected via Dodo
              Payments. Update your payment method or retry — no live charge is
              attempted in this preview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>
              Retry payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kind === "credits"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request more credits</AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ll notify your account owner to approve a credit top-up or
              plan upgrade. Nothing is billed until they confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>
              Send request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={kind === "sales"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact sales</AlertDialogTitle>
            <AlertDialogDescription>
              An Enterprise specialist will reach out about SSO, custom limits
              and dedicated support. This is a UI preview — no ticket is filed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>
              <Headphones aria-hidden />
              Request callback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function PlansWorkspace() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [quotas, setQuotas] = useState<UsageQuota[]>([]);
  const [tiers, setTiers] = useState<PlanTier[]>([]);
  const [upgrading, setUpgrading] = useState(false);

  const planName = currentPlan?.name ?? "";

  async function refreshPlan() {
    const [plan, usage, planTiers] = await Promise.all([
      plansApi.getCurrentPlan(),
      plansApi.getUsage(),
      plansApi.listTiers(),
    ]);
    setCurrentPlan(plan);
    setTiers(planTiers);
    setQuotas(
      usage.map((row) => ({
        ...row,
        icon: QUOTA_ICONS[row.id] ?? row.icon ?? Search,
        description: row.description ?? row.label,
      }))
    );
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refreshPlan();
      } catch (err) {
        if (!cancelled) setMessage(getApiErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useRealtimeRefresh("usage.updated", () => {
    void refreshPlan().catch(() => undefined);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing_return") === "dodo") {
      const orderId = params.get("order");
      void (async () => {
        try {
          if (orderId) {
            const order = await (
              await import("@/lib/api")
            ).billingApi.getOrder(orderId);
            if (String(order.status) === "paid") {
              await refreshPlan();
              setDialog("upgrade-success");
            }
          }
        } catch {
          setDialog("payment-failed");
        } finally {
          window.history.replaceState({}, "", "/dashboard/plans");
        }
      })();
    }
    if (params.get("billing_cancel") === "dodo") {
      setDialog("payment-failed");
      window.history.replaceState({}, "", "/dashboard/plans");
    }
  }, []);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  const exhaustedQuota = quotas.find(
    (quota) => usageState(quota) === "Limit exhausted"
  );

  async function handleUpgradeCheckout() {
    setUpgrading(true);
    try {
      const tiers = await plansApi.listTiers();
      const target =
        tiers.find((tier) => tier.name.toLowerCase() === "scale") ||
        tiers.find((tier) => tier.name.toLowerCase() === "growth") ||
        tiers[0];
      const planId = target?.id;
      if (!planId) throw new Error("No upgrade plan available");

      const result = await plansApi.upgrade({
        planId,
        billingCycle: "monthly",
        currency: "INR",
        provider: "razorpay",
      });

      if ("_mockPaid" in result && result._mockPaid) {
        await refreshPlan();
        setDialog("upgrade-success");
        flash("Mock upgrade complete.");
        return;
      }

      if (result.checkout.provider === "dodo") {
        window.location.href = result.checkout.checkoutUrl;
        return;
      }

      try {
        const payment = await openRazorpayCheckout({
          checkout: result.checkout,
          prefill: result.prefill,
        });
        const { billingApi } = await import("@/lib/api");
        await billingApi.verifyRazorpay({
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          orderId: result.order.id,
        });
        await refreshPlan();
        setDialog("upgrade-success");
        flash("Payment verified. Plan upgraded.");
      } catch (err) {
        if (err instanceof RazorpayCheckoutDismissedError) {
          setDialog(null);
          return;
        }
        setDialog("payment-failed");
        setMessage(getApiErrorMessage(err));
      }
    } catch (err) {
      setDialog("payment-failed");
      setMessage(getApiErrorMessage(err));
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => setDialog("upgrade")}
        >
          <ArrowUpRight aria-hidden />
          Upgrade
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog("credits")}
        >
          Request More Credits
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => flash("Usage export downloaded. (UI preview)")}
        >
          <Download aria-hidden />
          Export Usage
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog("sales")}
        >
          <Headphones aria-hidden />
          Contact Sales
        </Button>
      </div>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {/* Exhausted banner */}
      {exhaustedQuota ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <AlertTriangle
            aria-hidden
            className="size-4 shrink-0 text-destructive"
          />
          <p className="min-w-0 flex-1 text-sm text-foreground">
            <span className="font-medium">
              {exhaustedQuota.label} exhausted
            </span>{" "}
            — top up credits or upgrade to continue.
          </p>
          <Button size="xs" onClick={() => setDialog("quota")}>
            View details
          </Button>
        </div>
      ) : null}

      {/* Current plan */}
      {currentPlan ? (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-semibold text-foreground">
                  {planName} plan
                </h2>
                <Badge
                  text={currentPlan.status}
                  className="bg-success/10 text-success"
                />
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["Billing cycle", currentPlan.billingCycle],
                    ["Renewal date", currentPlan.renewalDate],
                    [
                      "Workspace owner",
                      `${currentPlan.owner} · ${currentPlan.ownerEmail}`,
                    ],
                    ["Seats", currentPlan.seats],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">
                  {currentPlan.price}
                </span>
                {currentPlan.pricePeriod} · next invoice on{" "}
                {currentPlan.renewalDate}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button size="sm" onClick={() => setDialog("upgrade")}>
                <ArrowUpRight aria-hidden />
                Upgrade Plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  flash("Billing portal opened. (UI preview — no provider)")
                }
              >
                <CreditCard aria-hidden />
                Manage Billing
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Usage overview */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Usage overview
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Current-cycle balances with warning states at 75%, 90% and exhausted
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quotas.map((quota) => (
            <QuotaCard
              key={quota.id}
              quota={quota}
              onExhausted={() => setDialog("quota")}
            />
          ))}
        </div>
      </section>

      <UsageTrendChart />

      <PlanComparison
        tiers={tiers}
        onUpgrade={() => setDialog("upgrade")}
        onSales={() => setDialog("sales")}
      />

      <Tabs defaultValue="billing">
        <TabsList>
          <TabsTrigger value="billing">Billing history</TabsTrigger>
          <TabsTrigger value="usage">Usage history</TabsTrigger>
        </TabsList>
        <TabsContent value="billing" className="pt-3">
          <BillingHistory onFailed={() => setDialog("payment-failed")} />
        </TabsContent>
        <TabsContent value="usage" className="pt-3">
          <UsageHistoryTable />
        </TabsContent>
      </Tabs>

      <PlansDialogs
        kind={dialog}
        upgrading={upgrading}
        onClose={() => setDialog(null)}
        onConfirmUpgrade={() => {
          void handleUpgradeCheckout();
        }}
      />
    </div>
  );
}
