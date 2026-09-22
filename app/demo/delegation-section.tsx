"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

const ARROWS = "https://parley-home.vercel.app/assets/arrows.svg";
const STEP_COUNT = 4;

const FEATURES = [
  {
    label: "Video pitch",
    desc: "Let recruiters see and hear you. A 60–90 second intro showcases communication and personality a PDF never will.",
  },
  {
    label: "A page for every role",
    desc: "Upload your CV, add a portfolio link, and tailor each application so the hiring team sees the most relevant you.",
  },
  {
    label: "Private shareable link",
    desc: "Send a professional URL by email, LinkedIn, or the job form. Recruiters open it instantly — no account required.",
  },
  {
    label: "Know when they looked",
    desc: "Track views, CV downloads, and last seen. Follow up when the page is warm, not when you are guessing.",
  },
] as const;

function VideoPitchMock() {
  return (
    <div className="mock__frame mock__frame--split">
      <div className="mock__media">
        <img src="/solution-2.webp" alt="" />
        <span className="mock__play" aria-hidden="true">
          ▶
        </span>
        <span className="mock__chip">90s pitch</span>
      </div>
      <div className="mock__body">
        <p className="mock__kicker">Application page</p>
        <h3 className="mock__name">Alex Chen</h3>
        <p className="mock__role">Product designer · San Francisco</p>
        <p className="mock__blurb">
          A short intro, then the CV. Recruiters watch, download, and remember
          a person — not another attachment.
        </p>
        <div className="mock__actions">
          <span className="mock__btn">Watch pitch</span>
          <span className="mock__btn mock__btn--ghost">Download CV</span>
        </div>
      </div>
    </div>
  );
}

function RolePagesMock() {
  const rows = [
    { role: "Product Designer", company: "Stripe", status: "Live" },
    { role: "Product Manager", company: "Notion", status: "Live" },
    { role: "Design Engineer", company: "Linear", status: "Draft" },
  ];
  return (
    <div className="mock__frame">
      <div className="mock__body mock__body--full">
        <p className="mock__kicker">Your applications</p>
        <h3 className="mock__name">One page per role</h3>
        <ul className="mock__rows">
          {rows.map((row) => (
            <li className="mock__row" key={row.role}>
              <span>
                <strong>{row.role}</strong>
                <em>{row.company}</em>
              </span>
              <span className="mock__status">{row.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ShareLinkMock() {
  return (
    <div className="mock__frame">
      <div className="mock__body mock__body--full">
        <p className="mock__kicker">Shareable link</p>
        <h3 className="mock__name">No login required</h3>
        <p className="mock__url">myhireview.com/view/alex-chen/product-designer</p>
        <p className="mock__blurb">
          Private by default — the public id is not derived from your name. Send
          it in an email, a LinkedIn note, or the application form.
        </p>
        <div className="mock__actions">
          <span className="mock__btn">Copy link</span>
          <span className="mock__btn mock__btn--ghost">Preview</span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMock() {
  return (
    <div className="mock__frame">
      <div className="mock__body mock__body--full">
        <p className="mock__kicker">Analytics</p>
        <h3 className="mock__name">Follow up with proof</h3>
        <div className="mock__stats">
          <div>
            <strong>12</strong>
            <span>Views</span>
          </div>
          <div>
            <strong>4</strong>
            <span>CV downloads</span>
          </div>
          <div>
            <strong>2h</strong>
            <span>Last viewed</span>
          </div>
        </div>
        <div className="mock__bars" aria-hidden="true">
          <span style={{ height: "42%" }} />
          <span style={{ height: "68%" }} />
          <span style={{ height: "35%" }} />
          <span style={{ height: "88%" }} />
          <span style={{ height: "54%" }} />
          <span style={{ height: "72%" }} />
          <span style={{ height: "46%" }} />
        </div>
      </div>
    </div>
  );
}

const MOCKS = [
  VideoPitchMock,
  RolePagesMock,
  ShareLinkMock,
  AnalyticsMock,
] as const;

export function DelegationSection() {
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;

  const goToStep = useCallback((nextRaw: number) => {
    const next = Math.max(0, Math.min(STEP_COUNT - 1, nextRaw));
    if (next === stepRef.current) return;
    setStep(next);
  }, []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const triggers = Array.from(
      scroll.querySelectorAll<HTMLElement>(".trigger"),
    );

    const computeStepFromTriggers = () => {
      const middle = window.innerHeight / 2;
      let next = 0;
      for (let i = 0; i < triggers.length; i++) {
        const rect = triggers[i].getBoundingClientRect();
        if (rect.top <= middle) next = i;
      }
      return next;
    };

    const onUpdate = () => {
      if (performance.now() < lockUntil.current) return;
      goToStep(computeStepFromTriggers());
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onUpdate();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onUpdate();
    return () => window.removeEventListener("scroll", onScroll);
  }, [goToStep]);

  const onTabClick = (index: number) => {
    const scroll = scrollRef.current;
    const trigger = scroll?.querySelectorAll<HTMLElement>(".trigger")[index];
    if (!trigger) {
      goToStep(index);
      return;
    }
    lockUntil.current = Number.POSITIVE_INFINITY;
    const y = trigger.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: "smooth" });
    goToStep(index);

    const unlock = () => {
      lockUntil.current = 0;
      window.removeEventListener("scrollend", unlock);
    };
    window.addEventListener("scrollend", unlock);
    window.setTimeout(unlock, 1200);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      onTabClick(Math.min(STEP_COUNT - 1, index + 1));
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      onTabClick(Math.max(0, index - 1));
    }
  };

  return (
    <section className="delegation" id="delegation">
      <div
        className="delegation__scroll"
        id="delegation-scroll"
        ref={scrollRef}
      >
        <div className="trigger" data-step="0"></div>
        <div className="trigger" data-step="1"></div>
        <div className="trigger" data-step="2"></div>
        <div className="trigger" data-step="3"></div>
        <div className="delegation__pin">
          <header className="delegation__header">
            <div className="delegation__heading">
              <p className="badge">Your application page</p>
              <h2 className="h2">
                Create once.
                <br />
                <em>Share a link they open.</em>
              </h2>
            </div>
            <p className="delegation__lede">
              Upload your CV, record a short pitch, and send a professional URL.
              Recruiters see you. You see when they looked.
            </p>
          </header>
          <div className="delegation__inner">
            <ol className="features" role="tablist">
              {FEATURES.map((feature, index) => (
                <li className="feature" key={feature.label}>
                  <button
                    className="feature__btn"
                    type="button"
                    role="tab"
                    id={`feature-tab-${index}`}
                    data-step={index}
                    aria-selected={step === index}
                    aria-controls={`mock-${index}`}
                    onClick={() => onTabClick(index)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                  >
                    <img
                      className="feature__chevron"
                      src={ARROWS}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="feature__head">
                      <span className="feature__label">{feature.label}</span>
                      <span className="feature__desc">{feature.desc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="stage" aria-live="polite">
              {MOCKS.map((Mock, index) => (
                <div
                  className={step === index ? "mock is-active" : "mock"}
                  id={`mock-${index}`}
                  role="tabpanel"
                  data-step={index}
                  hidden={step !== index}
                  key={FEATURES[index].label}
                >
                  <Mock />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
