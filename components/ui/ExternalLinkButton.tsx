import { AnchorHTMLAttributes, ReactNode } from "react";

const BASE_CLASSES =
  "inline-flex items-center rounded-lg text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2";

const VARIANT_CLASSES = {
  portfolio: "bg-[var(--brand-primary)] hover:opacity-90 focus:ring-[var(--brand-primary)] px-5 py-2.5 text-[var(--brand-primary-text)]",
  linkedin: "px-3 py-2.5 bg-[#0A66C2] hover:bg-[#004182] focus:ring-[#0A66C2] text-white",
} as const;

export type ExternalLinkButtonVariant = keyof typeof VARIANT_CLASSES;

interface ExternalLinkButtonProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
> {
  href: string;
  variant: ExternalLinkButtonVariant;
  children: ReactNode;
}

/**
 * Button-styled external link (opens in new tab). Use for consistent
 * Portfolio / LinkedIn or similar profile links.
 */
export default function ExternalLinkButton({
  href,
  variant,
  children,
  className = "",
  ...props
}: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
}
