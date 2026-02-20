import MarketingHeader from "@/components/public/MarketingHeader";
import { getUser } from "@/lib/auth";

/**
 * Shared layout for public marketing pages: home (/), How it Works, Pricing, Blog.
 * Renders MarketingHeader and a full-height flex column so all these routes share the same nav.
 */
export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader user={user} />
      {children}
    </div>
  );
}
