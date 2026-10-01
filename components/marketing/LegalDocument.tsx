import Link from "next/link";
import type { LegalDocumentCopy } from "@/lib/marketing/legal-copy";
import { LEGAL_LINKS } from "@/lib/marketing/constants";

/**
 * Legal document surface — same family as the 404 void stage:
 * dark field, minimal top chrome, no landing MarketingShell.
 * Each slug has its own deep/accent pair (see `.mhv-legal-*` in mhv-demo.css).
 */
export function LegalDocument({ doc }: { doc: LegalDocumentCopy }) {
  const activeHref = `/${doc.slug}` as (typeof LEGAL_LINKS)[number]["href"];

  return (
    <div className={`mhv-legal mhv-legal-${doc.slug}`}>
      <a className="mhv-legal-skip" href="#legal-content">
        Skip to content
      </a>

      <header className="mhv-legal-top">
        <Link className="mhv-legal-logo" href="/">
          MyHireView
          <span className="mhv-legal-logo-dot" aria-hidden="true" />
        </Link>
        <nav className="mhv-legal-top-nav" aria-label="Legal pages">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="mhv-legal-top-link" href="/login">
          Sign in
        </Link>
      </header>

      <main className="mhv-legal-main" id="legal-content" tabIndex={-1}>
        <article className="mhv-legal-article" aria-labelledby="legal-title">
          <header className="mhv-legal-header">
            <p className="mhv-legal-stamp">{doc.eyebrow}</p>
            <h1 id="legal-title">{doc.title}</h1>
            <p className="mhv-legal-summary">{doc.summary}</p>
            <p className="mhv-legal-updated">
              <time dateTime="2026-10">{doc.lastUpdatedLabel}</time>
            </p>
          </header>

          <nav className="mhv-legal-toc" aria-label="On this page">
            <p className="mhv-legal-toc-label" id="legal-toc-label">
              On this page
            </p>
            <ul aria-labelledby="legal-toc-label">
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mhv-legal-body">
            {doc.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="mhv-legal-section"
                aria-labelledby={`${section.id}-heading`}
              >
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul>
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <aside className="mhv-legal-aside" aria-label="Related legal pages">
            <p id="legal-related-label">Also see</p>
            <ul
              className="mhv-legal-aside-links"
              aria-labelledby="legal-related-label"
            >
              {LEGAL_LINKS.filter((item) => item.href !== activeHref).map(
                (item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ),
              )}
            </ul>
          </aside>
        </article>
      </main>

      <footer className="mhv-legal-bottom">
        <Link href="/">Back to home</Link>
        <p>© 2026 MyHireView</p>
      </footer>
    </div>
  );
}
