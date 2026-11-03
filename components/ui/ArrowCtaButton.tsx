import type { ButtonHTMLAttributes } from "react";

/**
 * Ink arrow CTA — product fork of the marketing Login / Dashboard control
 * (`ArrowButton` + `ot-arrow-btn-dark`). Tailwind-only so admin never imports
 * `mhv-demo.css`.
 */
function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 11"
      width="11"
      height="11"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M.72 9.78a.75.75 0 0 0 1.06 0l8.5-8.5A.75.75 0 1 0 9.22.22l-8.5 8.5a.75.75 0 0 0 0 1.06"
      />
      <path
        fill="currentColor"
        d="M9.75 10.5a.75.75 0 0 0 .75-.75v-9A.75.75 0 0 0 9.75 0h-9a.75.75 0 0 0 0 1.5H9v8.25c0 .414.336.75.75.75"
      />
    </svg>
  );
}

function RollLabel({ text }: { text: string }) {
  return (
    <span className="relative block h-[1.1em] overflow-hidden">
      <span className="block transition-transform duration-[450ms] ease-out motion-safe:group-hover/arrow:-translate-y-[110%] motion-reduce:transition-none">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 block translate-y-[110%] transition-transform duration-[450ms] ease-out motion-safe:group-hover/arrow:translate-y-0 motion-reduce:transition-none"
      >
        {text}
      </span>
    </span>
  );
}

const ARROW_CTA_CLASS =
  "group/arrow relative inline-flex h-[42px] w-max shrink-0 cursor-pointer items-center rounded-full bg-[var(--ink)] py-0 pl-5 pr-[46px] text-base leading-[1.1] whitespace-nowrap text-[var(--white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50";

type ArrowCtaButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  label: string;
};

export default function ArrowCtaButton({
  label,
  className = "",
  type = "button",
  ...props
}: ArrowCtaButtonProps) {
  return (
    <button
      type={type}
      className={`${ARROW_CTA_CLASS}${className ? ` ${className}` : ""}`}
      {...props}
    >
      <RollLabel text={label} />
      <span
        className="absolute top-1/2 right-1.5 grid size-[30px] -translate-y-1/2 place-items-center rounded-full bg-[var(--white)] text-[var(--ink)]"
        aria-hidden="true"
      >
        <ArrowIcon />
      </span>
    </button>
  );
}
