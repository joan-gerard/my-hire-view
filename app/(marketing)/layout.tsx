import MarketingHeader from "@/components/public/MarketingHeader";
import { HeroEntranceProvider } from "@/contexts/HeroEntranceContext";
import { ScrollCoverProvider } from "@/contexts/ScrollCoverContext";
import { getUser } from "@/lib/auth";

/**
 * Shared layout for public marketing pages: home (/) and Pricing.
 * Renders MarketingHeader and a full-height flex column so these routes share the same nav.
 * HeroEntranceProvider coordinates delayed entrance of header and hero content until the hero video has finished its entrance (home only).
 * ScrollCoverProvider lets the header switch to white when ScrollCoverSection has reached the top of the viewport.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <HeroEntranceProvider>
      <ScrollCoverProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <MarketingHeader user={user} />
          {children}
        </div>
      </ScrollCoverProvider>
    </HeroEntranceProvider>
  );
}
