"use client";

import {
  ADMIN_DISABLED_CLASS,
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
  ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import {
  ANNUAL_SAVINGS_LABEL,
  getTierPrice,
  PRICING_DRAFT_NOTE,
  PRICING_TIERS,
  type BillingInterval,
} from "@/components/public/pricing/constants";
import { useId, useState } from "react";

/** Working Free-tier caps from PRICING_AND_MEMBERSHIP (until E2 enforces). */
const FREE_APP_CAP = 3;
const FREE_PRIMARY_CV_CAP = 5;

type AccountBillingPanelProps = {
  applicationCount: number;
  primaryCvCount: number;
};

/**
 * Billing / plan overview UI before Stripe (E2). Shows Free as current plan
 * and draft tier cards from shared pricing constants.
 */
export default function AccountBillingPanel({
  applicationCount,
  primaryCvCount,
}: AccountBillingPanelProps) {
  const intervalGroupId = useId();
  const [interval, setInterval] = useState<BillingInterval>("annual");

  const appUsageLabel = `${applicationCount} / ${FREE_APP_CAP}`;
  const cvUsageLabel = `${primaryCvCount} / ${FREE_PRIMARY_CV_CAP}`;
  const appOver = applicationCount > FREE_APP_CAP;
  const cvOver = primaryCvCount > FREE_PRIMARY_CV_CAP;

  return (
    <div className="space-y-6">
      <section
        className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}
        aria-labelledby="account-billing-current-heading"
      >
        <h2
          id="account-billing-current-heading"
          className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]"
        >
          Current plan
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          You are on the Free plan while paid checkout is still in progress.
        </p>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Free
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Build and share your first application pages — no card required.
            </p>
          </div>
          <span className="inline-flex rounded-full bg-[var(--lime)]/35 px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            Active
          </span>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[var(--ink)]/[0.03] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--muted)]">
              Applications
            </dt>
            <dd
              className={`mt-1 font-heading text-xl font-semibold tabular-nums tracking-[-0.02em] ${
                appOver
                  ? "text-[var(--status-danger-fg)]"
                  : "text-[var(--ink)]"
              }`}
            >
              {appUsageLabel}
            </dd>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Active and archived both count toward the Free cap.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--ink)]/[0.03] px-4 py-3">
            <dt className="text-sm font-medium text-[var(--muted)]">
              Primary CVs
            </dt>
            <dd
              className={`mt-1 font-heading text-xl font-semibold tabular-nums tracking-[-0.02em] ${
                cvOver
                  ? "text-[var(--status-danger-fg)]"
                  : "text-[var(--ink)]"
              }`}
            >
              {cvUsageLabel}
            </dd>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Résumés in your reusable library.
            </p>
          </div>
        </dl>

        <p className={`mt-5 ${ADMIN_TIP_CLASS}`} role="status">
          Upgrades and billing management ship with membership checkout. Prices
          below are a working draft and may change before launch.
        </p>
      </section>

      <section
        className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}
        aria-labelledby="account-billing-plans-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              id="account-billing-plans-heading"
              className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]"
            >
              Plans
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Compare Free, Pro, and Premium. Checkout is not live yet.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-labelledby={intervalGroupId}
            className="inline-flex rounded-full border border-[var(--ink)]/12 bg-[var(--white)] p-1"
          >
            <span id={intervalGroupId} className="sr-only">
              Billing interval
            </span>
            {(
              [
                { id: "monthly", label: "Monthly" },
                { id: "annual", label: `Annual · ${ANNUAL_SAVINGS_LABEL}` },
              ] as const
            ).map((option) => {
              const selected = interval === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setInterval(option.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${
                    selected
                      ? "bg-[var(--ink)] text-[var(--white)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="mt-5 grid gap-3 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const price = getTierPrice(tier, interval);
            const isCurrent = tier.id === "free";
            return (
              <li
                key={tier.id}
                className={`flex flex-col rounded-2xl border px-4 py-4 ${
                  tier.highlighted
                    ? "border-[var(--ink)] bg-[var(--ink)]/[0.02]"
                    : "border-[var(--ink)]/10 bg-[var(--white)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--ink)]">
                      {tier.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {tier.tagline}
                    </p>
                  </div>
                  {tier.highlighted ? (
                    <span className="shrink-0 rounded-full bg-[var(--lime)]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink)]">
                      Popular
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
                  {price.priceLabel}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {price.priceNote}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="text-sm text-[var(--ink)]"
                      title={feature.tooltip}
                    >
                      <span className="mr-1.5 text-[var(--muted)]" aria-hidden>
                        ·
                      </span>
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <span className={ADMIN_SECONDARY_CLASS}>Current plan</span>
                  ) : (
                    <button
                      type="button"
                      className={ADMIN_DISABLED_CLASS}
                      disabled
                    >
                      Upgrade — coming soon
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-sm text-[var(--muted)]">{PRICING_DRAFT_NOTE}</p>
      </section>
    </div>
  );
}
