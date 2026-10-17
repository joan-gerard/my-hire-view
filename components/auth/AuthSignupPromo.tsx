/**
 * Decorative promo column for the signup split shell. aria-hidden — form carries purpose.
 */
export default function AuthSignupPromo() {
  return (
    <aside className="mhv-auth-shell-promo" aria-hidden>
      <div className="mhv-auth-promo-inner">
        <span className="mhv-auth-promo-badge">Published</span>
        <h2>A page that survives the inbox</h2>
        <p className="mhv-auth-promo-lead">
          Tailor one hire view per role — story, proof, and how to reach you.
        </p>

        <div className="mhv-auth-preview">
          <div className="mhv-auth-preview-media">
            <span className="mhv-auth-preview-playing">Live</span>
            <div className="mhv-auth-preview-avatar">JL</div>
          </div>
          <div className="mhv-auth-preview-body">
            <strong>Jordan Lee</strong>
            <p className="mhv-auth-preview-meta">
              Product designer · applying to Northwind
            </p>
            <p className="mhv-auth-preview-stat">
              Shared for the senior design role
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
