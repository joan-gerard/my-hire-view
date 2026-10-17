import { AnchorHTMLAttributes, ReactNode } from "react";

const BASE_CLASSES =
  "inline-flex cursor-pointer items-center text-base font-semibold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const VARIANT_CLASSES = {
  portfolio:
    "rounded-full bg-[var(--ink)] px-5 py-2.5 text-[var(--white)] hover:opacity-90 focus-visible:outline-[var(--ink)]",
  linkedin:
    "rounded-xl bg-[#0A66C2] px-3 py-2.5 text-white hover:bg-[#004182] focus-visible:outline-[#0A66C2]",
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
