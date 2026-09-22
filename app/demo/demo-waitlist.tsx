"use client";

import { AUTH_EMAIL_MAX_LENGTH } from "@/lib/validation/auth";
import { PROFILE_NAME_MAX_LENGTH } from "@/lib/validation/profile";
import {
  WAITLIST_HONEYPOT_FIELD,
  WAITLIST_JOB_SEARCH_STATUSES,
} from "@/lib/validation/waitlist";
import { useState, type FormEvent, type ReactNode } from "react";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button className="fbtn fbtn--primary fbtn--full" type="submit">
      <span className="fbtn__chip">
        <span className="fbtn__arrows">
          <Chevron />
          <Chevron />
        </span>
      </span>
      <span className="fbtn__label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </button>
  );
}

export function DemoWaitlist() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [jobSearchStatus, setJobSearchStatus] = useState<string>(
    WAITLIST_JOB_SEARCH_STATUSES[0],
  );
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatus("loading");

    const form = event.currentTarget;
    const honeypotInput = form.elements.namedItem(
      WAITLIST_HONEYPOT_FIELD,
    ) as HTMLInputElement | null;
    const honeypotValue = honeypotInput?.value ?? website;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          job_search_status: jobSearchStatus,
          [WAITLIST_HONEYPOT_FIELD]: honeypotValue,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setWebsite("");
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data.error ?? "Something went wrong. Please try again.",
        );
        return;
      }
      setStatus("success");
      setEmail("");
      setFirstName("");
      setJobSearchStatus(WAITLIST_JOB_SEARCH_STATUSES[0]);
    } catch {
      setWebsite("");
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="waitlist waitlist--success" role="status">
        <h3 className="waitlist__title">You&apos;re on the list!</h3>
        <p>
          Check your email for exclusive updates and be among the first to try
          MyHireView when we launch.
        </p>
      </div>
    );
  }

  return (
    <form className="waitlist" onSubmit={handleSubmit}>
      <div className="waitlist__honeypot" aria-hidden="true">
        <label htmlFor="demo-waitlist-website">Website</label>
        <input
          id="demo-waitlist-website"
          type="text"
          name={WAITLIST_HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          disabled={status === "loading"}
        />
      </div>
      <label className="waitlist__field">
        <span className="sr-only">Email address (required)</span>
        <input
          type="email"
          required
          placeholder="Email address*"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "loading"}
          maxLength={AUTH_EMAIL_MAX_LENGTH}
        />
      </label>
      <label className="waitlist__field">
        <span className="sr-only">First name (required)</span>
        <input
          type="text"
          required
          autoComplete="given-name"
          placeholder="First name*"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          disabled={status === "loading"}
          maxLength={PROFILE_NAME_MAX_LENGTH}
        />
      </label>
      <label className="waitlist__field">
        <span className="sr-only">Current job search status (required)</span>
        <select
          required
          value={jobSearchStatus}
          onChange={(event) => setJobSearchStatus(event.target.value)}
          disabled={status === "loading"}
        >
          {WAITLIST_JOB_SEARCH_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {errorMessage ? (
        <p className="waitlist__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <SubmitButton>
        {status === "loading" ? "Joining…" : "Get Early Access"}
      </SubmitButton>
      <p className="waitlist__legal">
        By signing up, you agree to our{" "}
        <a href="/terms">Terms of Service</a>.
      </p>
    </form>
  );
}
