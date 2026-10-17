"use client";

import {
  ADMIN_DISABLED_CLASS,
  ADMIN_PANEL_CLASS,
  ADMIN_TIP_CLASS,
} from "@/components/admin/admin-chrome";
import Input from "@/components/ui/Input";
import { FormEvent, useState } from "react";

/**
 * Password change UI stub until auth wiring (see Backlog L4-098 / Security tab).
 * Fields are interactive for layout review; submit stays disabled.
 */
export default function AccountPasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <section
      className={`${ADMIN_PANEL_CLASS} p-5 sm:p-6`}
      aria-labelledby="account-password-heading"
    >
      <h2
        id="account-password-heading"
        className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--ink)]"
      >
        Password
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Change the password you use to sign in to MyHireView.
      </p>

      <p className={`mt-4 ${ADMIN_TIP_CLASS}`} role="status">
        Password changes are not available yet. This form is a preview of the
        upcoming flow — saving will be enabled when authentication wiring
        ships.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <Input
          id="account-current-password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter your current password"
        />
        <Input
          id="account-new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Choose a new password"
        />
        <Input
          id="account-confirm-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
        />

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className={ADMIN_DISABLED_CLASS} disabled>
            Update password
          </button>
          <p className="text-sm text-[var(--muted)]">
            Forgot password flow will live here too (coming soon).
          </p>
        </div>
      </form>
    </section>
  );
}
