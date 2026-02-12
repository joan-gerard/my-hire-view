import { getUser } from '@/lib/auth';
import MarketingHeader from '@/components/public/MarketingHeader';
import MarketingHero from '@/components/public/MarketingHero';
import MarketingFeatures from '@/components/public/MarketingFeatures';

export default async function Home() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <MarketingHeader user={user} />
      <MarketingHero isAuthenticated={!!user} />
      <MarketingFeatures />
    </div>
  );
}
