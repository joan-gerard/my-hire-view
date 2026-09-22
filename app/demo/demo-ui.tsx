import type { ReactNode } from "react";

export function Chevron() {
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

export function Fbtn({
  href,
  variant = "primary",
  full,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`fbtn fbtn--${variant}${full ? " fbtn--full" : ""}`}
    >
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
    </a>
  );
}

export function FaqPlus() {
  return (
    <svg className="faq__plus" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.5v13M1.5 8h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.1 1.7"
      />
    </svg>
  );
}

export function Wordmark({
  href = "#hero",
  className = "nav__wordmark",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a href={href} className={className} aria-label="MyHireView">
      MyHireView
    </a>
  );
}
