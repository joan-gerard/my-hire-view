import { PRINCIPLES } from "@/lib/marketing/constants";

export function Principles() {
  return (
    <section className="ot-principles" aria-labelledby="principles-title">
      <div className="ot-principles-panel">
        <div className="ot-principles-intro">
          <h2 id="principles-title">
            Introducing MyHireView: Your application, elevated
          </h2>
          <p>
            Stand out with a video pitch, smart analytics, and shareable links,
            so recruiters see the real you.
          </p>
        </div>
        <div className="ot-principle-grid">
          {PRINCIPLES.map((item) => (
            <article key={item.n} className="ot-principle">
              <span className="ot-principle-n">{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
