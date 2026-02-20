"use client";

import { fadeUp, transition, viewport } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useState } from "react";
import { SectionBadge } from "../ui/SectionBadge";

const JOB_SEARCH_OPTIONS = [
  { value: "Actively searching", label: "Actively searching" },
  { value: "Casually looking", label: "Casually looking" },
  { value: "Career planning", label: "Career planning" },
  { value: "Other", label: "Other" },
] as const;

const backgroundImage = "/images/diego-ph-@jdiegoph-1920-2400.jpg";

/** Shared styles for text inputs and select to keep appearance consistent. */
const CONTROL_CLASS =
  "w-full rounded-xl bg-[var(--brand-accent)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:outline-none disabled:opacity-70";

/**
 * Email capture form for the pre-launch landing page.
 * Submits to /api/waitlist; shows success message and early bird incentive per LANDING_PAGE_BRIEF.
 */
export default function EmailCaptureForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [jobSearchStatus, setJobSearchStatus] = useState("Actively searching");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim() || undefined,
          job_search_status: jobSearchStatus || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setStatus("success");
      setEmail("");
      setFirstName("");
      setJobSearchStatus("Actively searching");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  const sectionClassName =
    "px-4 py-16 sm:px-6 sm:py-20 lg:px-8 min-h-[520px] flex flex-col justify-center items-center";

  return (
    <motion.section
      id="early-access"
      className={sectionClassName}
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={transition}
    >
      <div className="w-full max-w-5xl text-center flex flex-col items-center gap-4">
        <SectionBadge label="Early Sign" />
        <h2 className="text-6xl font-light tracking-wide text-[var(--brand-primary)]">
          Be the first to stand out
        </h2>
        <p className="text-xl sm:text-2xl font-light text-[#94877c] text-balance">
          Early signups get 3 months of Pro free when we launch!
        </p>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div
            className="rounded-3xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          ></div>
          <div className="bg-(--brand-surface) w-full h-full min-h-[440px] p-8 rounded-3xl flex flex-col">
            {status === "success" ? (
              <SuccessMessage />
            ) : (
              <SignupForm
                handleSubmit={handleSubmit}
                email={email}
                setEmail={setEmail}
                firstName={firstName}
                setFirstName={setFirstName}
                jobSearchStatus={jobSearchStatus}
                setJobSearchStatus={setJobSearchStatus}
                errorMessage={errorMessage}
                status={status}
              />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SignupForm({
  handleSubmit,
  email,
  setEmail,
  firstName,
  setFirstName,
  jobSearchStatus,
  setJobSearchStatus,
  errorMessage,
  status,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (email: string) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  jobSearchStatus: string;
  setJobSearchStatus: (jobSearchStatus: string) => void;
  errorMessage: string;
  status: "idle" | "loading" | "success" | "error";
}) {
  const isDisabled = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <FormField id="waitlist-email" label="Email address (required)">
          <input
            id="waitlist-email"
            type="email"
            required
            placeholder="Email address*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isDisabled}
            className={CONTROL_CLASS}
          />
        </FormField>
        <FormField id="waitlist-first-name" label="First name (optional)">
          <input
            id="waitlist-first-name"
            type="text"
            autoComplete="given-name"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isDisabled}
            className={CONTROL_CLASS}
          />
        </FormField>
      </div>
      <FormField
        id="waitlist-status"
        label="Current job search status (optional)"
      >
        <fieldset
          id="waitlist-status"
          className="flex flex-wrap gap-2"
          aria-label="Current job search status (optional)"
        >
          <legend className="sr-only">Select your status (optional)</legend>
          <p className="w-full text-base text-[var(--foreground)]/80 mb-2 text-start">
            Select your status (optional)
          </p>
          {JOB_SEARCH_OPTIONS.map((opt) => (
            <StatusRadioOption
              key={opt.value}
              id={`waitlist-status-${opt.value}`}
              value={opt.value}
              label={opt.label}
              checked={jobSearchStatus === opt.value}
              disabled={isDisabled}
              onSelect={setJobSearchStatus}
            />
          ))}
        </fieldset>
      </FormField>
      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-lg bg-[var(--brand-primary)] px-6 py-4 text-lg font-semibold text-[var(--brand-primary-text)] shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--secondary-background)] disabled:opacity-70"
      >
        {status === "loading" ? "Joining…" : "Get Early Access"}
      </button>
      <p className="text-sm text-foreground/80 text-center">
        By signing up, you agree to our{" "}
        <a
          href="/terms"
          className="text-foreground/80 hover:text-foreground underline"
        >
          Terms of Service
        </a>
        .
      </p>
    </form>
  );
}

function StatusRadioOption({
  id,
  value,
  label,
  checked,
  disabled,
  onSelect,
}: {
  id: string;
  value: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 transition-[background-color,box-shadow] duration-500 delay-75 ease-in-out ${
        checked
          ? "bg-[var(--brand-accent)]"
          : "bg-[var(--brand-accent)]/60 hover:bg-[var(--brand-accent)]"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ease-in-out ${
          checked ? "border-0 bg-[var(--brand-primary)]" : "border-0 bg-white"
        }`}
        aria-hidden
      >
        {/* {checked && <span className="h-2 w-2 rounded-full bg-white" />} */}
      </span>
      <input
        type="radio"
        id={id}
        name="waitlist-status"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        disabled={disabled}
        className="sr-only"
      />
      <span className="text-[var(--foreground)]">{label}</span>
    </label>
  );
}

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Fills the same height as the form column and centers the message to avoid layout shift. */
function SuccessMessage() {
  return (
    <div className="min-h-full flex flex-col justify-center">
      <motion.div
        className="mx-auto w-full max-w-md rounded-3xl border border-[var(--foreground)]/10 bg-[var(--brand-accent)]/30 p-8 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-primary-text)]"
          aria-hidden
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-light tracking-wide text-[var(--brand-primary)]">
          You&apos;re on the list!
        </h3>
        <p className="mt-2 text-[var(--foreground)]/90">
          Check your email for exclusive updates and be among the first to try
          MyHireView when we launch.
        </p>
      </motion.div>
    </div>
  );
}
