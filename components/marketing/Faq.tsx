"use client";

import { FAQ_ITEMS } from "@/components/public/faq/constants";
import { withoutEmDash } from "@/lib/marketing/utils";
import { useState } from "react";

export function Faq() {
  const [faqOpen, setFaqOpen] = useState<ReadonlySet<number>>(
    () => new Set([0]),
  );

  return (
    <section className="ot-faq" id="faq" aria-labelledby="faq-title">
      <div className="ot-wrap">
        <div className="ot-faq-intro">
          <p className="ot-eyebrow">
            <i />
            Common questions
            <i />
          </p>
          <h2 id="faq-title">Frequently asked questions</h2>
        </div>

        <div className="ot-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = faqOpen.has(index);
            const panelId = `ot-faq-panel-${index}`;
            const buttonId = `ot-faq-button-${index}`;

            return (
              <div
                key={item.q}
                className={isOpen ? "ot-faq-item is-open" : "ot-faq-item"}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    className="ot-faq-question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => {
                      setFaqOpen((prev) => {
                        const next = new Set(prev);
                        if (next.has(index)) next.delete(index);
                        else next.add(index);
                        return next;
                      });
                    }}
                  >
                    <span>{item.q}</span>
                    <span className="ot-faq-switch" aria-hidden="true">
                      <span className="ot-faq-switch-bar ot-faq-switch-bar-h" />
                      <span className="ot-faq-switch-bar ot-faq-switch-bar-v" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="ot-faq-answer"
                  aria-hidden={!isOpen}
                >
                  <div className="ot-faq-answer-inner">
                    <p>{withoutEmDash(item.a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
