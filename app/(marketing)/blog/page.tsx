import Footer from "@/components/public/Footer";

export const metadata = {
  title: "Blog | MyHireView",
  description: "MyHireView blog and job search tips.",
};

export default function BlogPage() {
  return (
    <>
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Blog
          </h1>
          <p className="mt-4 text-foreground/80">
            Content coming soon.
          </p>
        </div>
      </main>
      <div className="mt-auto bg-background">
        <Footer />
      </div>
    </>
  );
}
