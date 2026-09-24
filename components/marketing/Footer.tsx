import { LEGAL_LINKS } from "@/lib/marketing/constants";
import Link from "next/link";
import { ArrowButton } from "./ArrowButton";

export function Footer() {
  return (
    <footer className="ot-footer">
      <div className="ot-footer-card">
        <div className="ot-footer-inner">
          <div className="ot-footer-cta">
            <h2>Ready to transform your job search?</h2>
            <ArrowButton href="/login" label="Login" tone="lime" />
          </div>

          <div className="ot-footer-bar">
            <a className="ot-footer-brand" href="#top">
              MyHireView
            </a>
            <nav className="ot-footer-legal" aria-label="Legal links">
              {LEGAL_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="ot-copyright">© 2026 MyHireView</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
