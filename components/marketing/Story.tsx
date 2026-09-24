export function Story() {
  return (
    <section className="ot-story" id="story">
      <div className="ot-wrap ot-story-grid">
        <div className="ot-story-copy">
          <h2>
            Hiring still treats people like unread files. You apply, you follow
            up, then nothing: no signal that anyone looked.
          </h2>
          <p>
            So we built MyHireView: one page per role with your CV, an optional
            video pitch, and a link you can share anywhere. Recruiters open it
            with no account. You see when they viewed it, so follow-ups
            aren&apos;t guesswork.
          </p>
        </div>
        <div className="ot-stats">
          <article className="ot-stat ot-stat-a">
            <p>Recruiter scan time</p>
            <p className="ot-stat-num">
              6<span>s</span>
            </p>
          </article>
          <article className="ot-stat ot-stat-b">
            <p>Engagement with video</p>
            <p className="ot-stat-num">3×</p>
          </article>
          <article className="ot-stat ot-stat-c">
            <p>Time to share a page</p>
            <p className="ot-stat-num ot-stat-num-light">
              &lt;2<span>m</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
