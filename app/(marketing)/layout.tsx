import { HeroEntranceProvider } from "@/contexts/HeroEntranceContext";
import MarketingHeader from "@/components/public/MarketingHeader";
import { getUser } from "@/lib/auth";

/**
 * Shared layout for public marketing pages: home (/), How it Works, Pricing, Blog.
 * Renders MarketingHeader and a full-height flex column so all these routes share the same nav.
 * HeroEntranceProvider coordinates delayed entrance of header and hero content until the hero video has finished its entrance (home only).
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <HeroEntranceProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <MarketingHeader user={user} />
        {children}
      </div>
    </HeroEntranceProvider>
  );
}
