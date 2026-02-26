"use client";

export const JOB_SEARCH_OPTIONS = [
  { value: "Actively searching", label: "Actively searching" },
  { value: "Casually looking", label: "Casually looking" },
  { value: "Career planning", label: "Career planning" },
  { value: "Other", label: "Other" },
] as const;

export const PRIMARY_GOAL_OPTIONS = [
  { value: "Get more interviews", label: "Get more interviews" },
  { value: "Track my applications", label: "Track my applications" },
  { value: "Stand out to recruiters", label: "Stand out to recruiters" },
  { value: "Other", label: "Other" },
] as const;

export const CAREER_STAGE_OPTIONS = [
  { value: "Entry-level", label: "Entry-level" },
  { value: "Junior", label: "Junior" },
  { value: "Mid-level", label: "Mid-level" },
  { value: "Senior", label: "Senior" },
  { value: "Other", label: "Other" },
] as const;

/** Shared styles for text inputs and select to keep appearance consistent. */
const CONTROL_CLASS =
  "w-full rounded-xl bg-[#fcfaf9] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:outline-none disabled:opacity-70";

export type WaitlistFormStatus = "idle" | "loading" | "success" | "error";

export interface WaitlistSignupFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (email: string) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  jobSearchStatus: string;
  setJobSearchStatus: (jobSearchStatus: string) => void;
  primaryGoal: string;
  setPrimaryGoal: (value: string) => void;
  careerStage: string;
  setCareerStage: (value: string) => void;
  errorMessage: string;
  status: WaitlistFormStatus;
}

export function WaitlistSignupForm({
  handleSubmit,
  email,
  setEmail,
  firstName,
  setFirstName,
  jobSearchStatus,
  setJobSearchStatus,
  primaryGoal,
  setPrimaryGoal,
  careerStage,
  setCareerStage,
  errorMessage,
  status,
}: WaitlistSignupFormProps) {
  const isDisabled = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4 max-w-[500px] lg:max-w-none">
        <p className="w-full text-base text-black/90 mb-2 text-start">
          Your details*
        </p>

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
        <FormField id="waitlist-first-name" label="First name (required)">
          <input
            id="waitlist-first-name"
            type="text"
            required
            autoComplete="given-name"
            placeholder="First name*"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isDisabled}
            className={CONTROL_CLASS}
          />
        </FormField>
      </div>
      <WaitlistRadioFieldsets
        jobSearchStatus={jobSearchStatus}
        setJobSearchStatus={setJobSearchStatus}
        primaryGoal={primaryGoal}
        setPrimaryGoal={setPrimaryGoal}
        careerStage={careerStage}
        setCareerStage={setCareerStage}
        disabled={isDisabled}
      />
      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={isDisabled}
        className="mt-4 w-full rounded-lg bg-black/90 hover:bg-black px-6 py-4 text-lg font-semibold text-[var(--brand-primary-text)] shadow-md transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--secondary-background)] disabled:opacity-70"
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

function WaitlistRadioFieldsets({
  jobSearchStatus,
  setJobSearchStatus,
  primaryGoal,
  setPrimaryGoal,
  careerStage,
  setCareerStage,
  disabled,
}: {
  jobSearchStatus: string;
  setJobSearchStatus: (value: string) => void;
  primaryGoal: string;
  setPrimaryGoal: (value: string) => void;
  careerStage: string;
  setCareerStage: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <>
      <RadioFieldset
        id="waitlist-status"
        label="Current job search status (required)"
        description="Select your status*"
        options={JOB_SEARCH_OPTIONS}
        value={jobSearchStatus}
        onSelect={setJobSearchStatus}
        disabled={disabled}
        required
      />
      <RadioFieldset
        id="waitlist-primary-goal"
        label="Primary goal (optional)"
        options={PRIMARY_GOAL_OPTIONS}
        value={primaryGoal}
        onSelect={setPrimaryGoal}
        disabled={disabled}
      />
      <RadioFieldset
        id="waitlist-career-stage"
        label="Career stage / seniority (optional)"
        options={CAREER_STAGE_OPTIONS}
        value={careerStage}
        onSelect={setCareerStage}
        disabled={disabled}
      />
    </>
  );
}

/** Reusable single-select radio group for waitlist form (status, primary goal, career stage). */
function RadioFieldset({
  id,
  label,
  description,
  options,
  value,
  onSelect,
  disabled,
  required = false,
}: {
  id: string;
  label: string;
  description?: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onSelect: (value: string) => void;
  disabled: boolean;
  required?: boolean;
}) {
  const visibleText = description ?? label;
  return (
    <FormField id={id} label={label}>
      <fieldset id={id} className="flex flex-wrap gap-2" aria-label={label}>
        <legend className="sr-only">{label}</legend>
        <p className="w-full text-base text-black/90 mb-1 text-start">
          {visibleText}
        </p>
        {options.map((opt, index) => (
          <StatusRadioOption
            key={opt.value}
            id={`${id}-${opt.value}`}
            value={opt.value}
            label={opt.label}
            checked={value === opt.value}
            disabled={disabled}
            onSelect={onSelect}
            required={required && index === 0}
          />
        ))}
      </fieldset>
    </FormField>
  );
}

function StatusRadioOption({
  id,
  value,
  label,
  checked,
  disabled,
  onSelect,
  required,
}: {
  id: string;
  value: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 transition-[background-color,box-shadow] duration-500 delay-75 ease-in-out ${
        checked ? "bg-[#fcfaf9]" : "bg-[#faf8f7] hover:bg-[#f7f7fa]"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ease-in-out ${
          checked ? "border-0 bg-[var(--brand-primary)]" : "border-0 bg-white"
        }`}
        aria-hidden
      />
      <input
        type="radio"
        id={id}
        name="waitlist-status"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        disabled={disabled}
        required={required}
        className="sr-only"
      />
      <span className="text-[var(--foreground)] text-sm">{label}</span>
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
