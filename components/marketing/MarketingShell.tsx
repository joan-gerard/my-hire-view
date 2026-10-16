import type { ReactNode } from "react";
import { getUser } from "@/lib/auth";
import type { LEGAL_LINKS } from "@/lib/marketing/constants";
import { Footer } from "./Footer";
import { Header } from "./Header";

type LegalHref = (typeof LEGAL_LINKS)[number]["href"];

/**
 * Shared chrome for marketing surfaces: token root, sticky header, footer.
 * Soft-checks session so the header can show Dashboard when signed in.
 */
export async function MarketingShell({
  children,
  activeLegalHref,
}: {
  children: ReactNode;
  activeLegalHref?: LegalHref;
}) {
  const user = await getUser();

  return (
    <div className="mhv-landing" id="top">
      <Header signedIn={Boolean(user)} />
      <main>{children}</main>
      <Footer activeLegalHref={activeLegalHref} />
    </div>
  );
}
