import Link from "next/link";

/**
 * Sitewide 404 — standalone full-viewport composition.
 * Not MarketingShell, not landing section patterns: one overlapping “broken app” stage.
 */
export function MarketingNotFound() {
  return (
    <div className="mhv-404">
      <header className="mhv-404-top">
        <Link className="mhv-404-logo" href="/">
          MyHireView
          <span className="mhv-404-logo-dot" aria-hidden="true" />
        </Link>
        <Link className="mhv-404-top-link" href="/login">
          Sign in
        </Link>
      </header>

      <main className="mhv-404-main">
        <div className="mhv-404-board" aria-hidden="true">
          <div className="mhv-404-window">
            <div className="mhv-404-window-bar">
              <span className="is-pink" />
              <span className="is-lime" />
              <span />
              <p className="mhv-404-window-url">myhireview.com/…</p>
            </div>
            <div className="mhv-404-window-body">
              <span className="mhv-404-skel mhv-404-skel-a" />
              <span className="mhv-404-skel mhv-404-skel-b" />
              <span className="mhv-404-skel mhv-404-skel-c" />
              <span className="mhv-404-skel mhv-404-skel-d" />
              <span className="mhv-404-skel mhv-404-skel-e" />
            </div>
          </div>
          <p className="mhv-404-ghost">404</p>
        </div>

        <section className="mhv-404-overlay" aria-labelledby="not-found-title">
          <p className="mhv-404-stamp">Missing</p>
          <h1 id="not-found-title">This link leads nowhere.</h1>
          <p className="mhv-404-copy">
            Removed, renamed, or never real — there is no page at this address.
          </p>
          <Link className="mhv-404-home" href="/">
            Take me home
          </Link>
        </section>
      </main>
    </div>
  );
}
