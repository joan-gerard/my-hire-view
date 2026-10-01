import Link from "next/link";
import type { LegalDocumentCopy } from "@/lib/marketing/legal-copy";
import { LEGAL_LINKS } from "@/lib/marketing/constants";
import { MarketingShell } from "./MarketingShell";

export function LegalDocument({ doc }: { doc: LegalDocumentCopy }) {
  const activeHref = `/${doc.slug}` as (typeof LEGAL_LINKS)[number]["href"];

  return (
    <MarketingShell activeLegalHref={activeHref}>
      <article className="ot-legal" aria-labelledby="legal-title">
        <div className="ot-wrap ot-legal-inner">
          <header className="ot-legal-header">
            <p className="ot-eyebrow">
              <i />
              {doc.eyebrow}
              <i />
            </p>
            <h1 id="legal-title">{doc.title}</h1>
            <p className="ot-legal-summary">{doc.summary}</p>
            <p className="ot-legal-updated">{doc.lastUpdatedLabel}</p>
          </header>

          <nav className="ot-legal-toc" aria-label="On this page">
            <p className="ot-legal-toc-label">On this page</p>
            <ul>
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ot-legal-body">
            {doc.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="ot-legal-section"
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

          <aside className="ot-legal-aside" aria-label="Related legal pages">
            <p>Also see</p>
            <div className="ot-legal-aside-links">
              {LEGAL_LINKS.filter((item) => item.href !== activeHref).map(
                (item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </aside>
        </div>
      </article>
    </MarketingShell>
  );
}
