"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  Headphones,
  Minus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
  CURRENT_PLAN,
  INVOICES,
  PLAN_FEATURE_ROWS,
  PLAN_TIERS,
  USAGE_HISTORY,
  USAGE_QUOTAS,
  USAGE_TREND,
  usagePercent,
  usageRemaining,
  usageState,
  type PaymentStatus,
  type PlanFeatureValue,
  type UsageQuota,
  type UsageState,
} from "@/lib/mock-plans";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

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
          <quota.icon aria-hidden className="size-4 text-muted-foreground" />
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

const TREND_CONFIG: ChartConfig = {
  searches: { label: "Searches", color: "var(--chart-1)" },
  reveals: { label: "Reveals", color: "var(--chart-2)" },
  outreach: { label: "Outreach", color: "var(--chart-3)" },
  voice: { label: "Voice calls", color: "var(--chart-4)" },
};

function UsageTrendChart() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Usage trend</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Daily searches, reveals, outreach sends and voice calls this week
      </p>
      <ChartContainer config={TREND_CONFIG} className="mt-4 h-72 w-full">
        <AreaChart data={USAGE_TREND} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="searches"
            type="monotone"
            fill="var(--color-searches)"
            fillOpacity={0.1}
            stroke="var(--color-searches)"
            strokeWidth={2}
          />
          <Area
            dataKey="reveals"
            type="monotone"
            fill="var(--color-reveals)"
            fillOpacity={0.1}
            stroke="var(--color-reveals)"
            strokeWidth={2}
          />
          <Area
            dataKey="outreach"
            type="monotone"
            fill="var(--color-outreach)"
            fillOpacity={0.1}
            stroke="var(--color-outreach)"
            strokeWidth={2}
          />
          <Area
            dataKey="voice"
            type="monotone"
            fill="var(--color-voice)"
            fillOpacity={0.1}
            stroke="var(--color-voice)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
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
  onUpgrade,
  onSales,
}: {
  onUpgrade: () => void;
  onSales: () => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Plan comparison
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Compare limits across Starter, Growth, Scale and Enterprise
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {PLAN_TIERS.map((tier) => (
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
              {PLAN_FEATURE_ROWS.map((row) => (
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
                if (tier.id === "enterprise") onSales();
                else if (tier.id === "scale" || tier.id === "starter")
                  onUpgrade();
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
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Billing history
        </h2>
        <p className="text-xs text-muted-foreground">
          Invoices from Razorpay and Dodo Payments — download only, no live
          charge
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
            {INVOICES.map((invoice) => (
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
            ))}
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
            {USAGE_HISTORY.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.datetime}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-foreground">
                  {entry.user}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-foreground">
                  {entry.action}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.module}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap tabular-nums text-muted-foreground">
                  {entry.quantity}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  <span className="line-clamp-1 max-w-48">
                    {entry.relatedEntity}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.remaining}
                </TableCell>
              </TableRow>
            ))}
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
}: {
  kind: DialogKind;
  onClose: () => void;
  onConfirmUpgrade: () => void;
}) {
  return (
    <>
      <AlertDialog
        open={kind === "upgrade"}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Scale?</AlertDialogTitle>
            <AlertDialogDescription>
              Scale unlocks 40,000 searches, 2,500 voice minutes and 50 team
              seats for ₹59,999 / month. No payment is charged in this preview —
              confirming only simulates a successful upgrade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Growth</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmUpgrade}>
              <ArrowUpRight aria-hidden />
              Confirm upgrade
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
              Your workspace is now on the Scale plan. New limits apply
              immediately. This is a UI preview — Razorpay / Dodo were not
              charged.
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
              AI voice minutes are exhausted on the Growth plan (600 / 600).
              Screening calls are paused until you top up credits or upgrade.
              Outreach and scheduling continue normally.
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
  const [planName, setPlanName] = useState(CURRENT_PLAN.name);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
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
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
      >
        <AlertTriangle
          aria-hidden
          className="size-4 shrink-0 text-destructive"
        />
        <p className="min-w-0 flex-1 text-sm text-foreground">
          <span className="font-medium">AI voice minutes exhausted</span> —
          screening calls are paused until you top up or upgrade.
        </p>
        <Button size="xs" onClick={() => setDialog("quota")}>
          View details
        </Button>
      </div>

      {/* Current plan */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle">
                <Sparkles aria-hidden className="size-4 text-primary" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {planName} plan
              </h2>
              <Badge
                text={CURRENT_PLAN.status}
                className="bg-success/10 text-success"
              />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Billing cycle", CURRENT_PLAN.billingCycle],
                  ["Renewal date", CURRENT_PLAN.renewalDate],
                  [
                    "Workspace owner",
                    `${CURRENT_PLAN.owner} · ${CURRENT_PLAN.ownerEmail}`,
                  ],
                  ["Seats", CURRENT_PLAN.seats],
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
                {CURRENT_PLAN.price}
              </span>
              {CURRENT_PLAN.pricePeriod} · next invoice on{" "}
              {CURRENT_PLAN.renewalDate}
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
          {USAGE_QUOTAS.map((quota) => (
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
        onClose={() => setDialog(null)}
        onConfirmUpgrade={() => {
          setPlanName("Scale");
          setDialog("upgrade-success");
          flash("Upgraded to Scale. (UI preview)");
        }}
      />
    </div>
  );
}
