"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import { WHY_CARDS } from "./content";

const DEFAULT_INDEX = WHY_CARDS.findIndex((card) => card.active);

export function WhySection() {
  const [active, setActive] = useState(
    DEFAULT_INDEX >= 0 ? DEFAULT_INDEX : 1,
  );

  const activate = useCallback((index: number) => {
    setActive((current) => (current === index ? current : index));
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(index);
      return;
    }
    const last = WHY_CARDS.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.min(last, index + 1);
      activate(next);
      event.currentTarget.parentElement
        ?.querySelectorAll<HTMLElement>(".wcard")
        [next]?.focus();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, index - 1);
      activate(next);
      event.currentTarget.parentElement
        ?.querySelectorAll<HTMLElement>(".wcard")
        [next]?.focus();
    }
  };

  return (
    <section className="why" id="why">
      <header className="why__header">
        <div className="why__heading">
          <p className="badge">Why MyHireView</p>
          <h2 className="h2">
            Still sending the
            <br />
            same old resume?
          </h2>
        </div>
        <p className="why__lede">
          Standing out in today&apos;s hiring process is harder than ever. The
          old playbook isn&apos;t enough — a PDF cannot show who you are, and
          you never know if anyone opened it.
        </p>
      </header>

      <div className="why-cards" id="why-cards" role="list">
        {WHY_CARDS.map((card, index) => {
          const isActive = active === index;
          return (
            <article
              className={`wcard${isActive ? " is-active" : ""}`}
              data-index={card.index}
              tabIndex={0}
              role="listitem"
              aria-current={isActive ? "true" : undefined}
              key={card.index}
              onPointerEnter={() => activate(index)}
              onFocus={() => activate(index)}
              onClick={() => activate(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <div className="wcard__closed" aria-hidden="true">
                <p className="wcard__number">{card.index}.</p>
                <div className="wcard__mosaic">
                  <img src={card.mosaic} alt="" loading="lazy" />
                </div>
                <h3 className="wcard__title-closed">{card.title}</h3>
              </div>
              <div className="wcard__open">
                <div className="wcard__img">
                  <img src={card.image} alt="" loading="lazy" />
                </div>
                <div className="wcard__content">
                  <h3 className="wcard__title">{card.title}</h3>
                  <p className="wcard__desc">{card.desc}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
