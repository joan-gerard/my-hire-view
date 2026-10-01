import type { ReactNode } from "react";
import type { LEGAL_LINKS } from "@/lib/marketing/constants";
import { Footer } from "./Footer";
import { Header } from "./Header";

type LegalHref = (typeof LEGAL_LINKS)[number]["href"];

/**
 * Shared chrome for marketing surfaces: token root, sticky header, footer.
 */
export function MarketingShell({
  children,
  activeLegalHref,
}: {
  children: ReactNode;
  activeLegalHref?: LegalHref;
}) {
  return (
    <div className="mhv-landing" id="top">
      <Header />
      <main>{children}</main>
      <Footer activeLegalHref={activeLegalHref} />
    </div>
  );
}
