import {
  Faq,
  Footer,
  Header,
  Hero,
  HowItWorks,
  Pricing,
  Principles,
  Story,
} from "@/components/marketing";

export function MhvLanding() {
  return (
    <div className="mhv-landing" id="top">
      <Header />
      <main>
        <Hero />
        <Story />
        <Principles />
        <HowItWorks />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
