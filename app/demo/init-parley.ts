const ASSETS = "https://parley-home.vercel.app/assets/";
const LOTTIE_SRC = `${ASSETS}lottie.min.js`;

type LottiePlayer = {
  play: () => void;
  pause: () => void;
  destroy: () => void;
};

type LottieAPI = {
  loadAnimation: (opts: {
    container: Element;
    renderer: string;
    loop: boolean;
    autoplay: boolean;
    path: string;
  }) => LottiePlayer;
};

declare global {
  interface Window {
    lottie?: LottieAPI;
  }
}

function loadLottie(): Promise<LottieAPI> {
  if (window.lottie) return Promise.resolve(window.lottie);

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${LOTTIE_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => {
        if (window.lottie) resolve(window.lottie);
        else reject(new Error("lottie failed to initialize"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load lottie")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LOTTIE_SRC;
    script.async = true;
    script.onload = () => {
      if (window.lottie) resolve(window.lottie);
      else reject(new Error("lottie failed to initialize"));
    };
    script.onerror = () => reject(new Error("Failed to load lottie"));
    document.head.appendChild(script);
  });
}

export function initParley(root: HTMLElement): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups: Array<() => void> = [];
  let cancelled = false;

  initNav(root, cleanups);
  initHero(root, reduced, cleanups);
  initWhyCards(root, cleanups);
  initMarquee(root, cleanups);
  initPricingToggle(root, cleanups);
  initFaq(root, reduced, cleanups);

  void loadLottie()
    .then((lottie) => {
      if (cancelled) return;
      const hiwCleanup = initHowItWorks(root, reduced, lottie);
      if (cancelled) {
        hiwCleanup?.();
        return;
      }
      if (hiwCleanup) cleanups.push(hiwCleanup);
    })
    .catch(() => {
      // Lottie is progressive enhancement for the How-it-works stage.
    });

  return () => {
    cancelled = true;
    while (cleanups.length) {
      cleanups.pop()?.();
    }
  };
}

function initNav(root: HTMLElement, cleanups: Array<() => void>) {
  const navBar = root.querySelector<HTMLElement>(".nav-bar");
  const heroSection = root.querySelector<HTMLElement>("#hero");
  if (!navBar) return;

  const REVEAL_AT_TOP = 80;
  const DELTA = 6;
  let lastY = window.scrollY;
  let lastDir = 0;

  const onNav = () => {
    const y = window.scrollY;
    const dy = y - lastY;

    if (y <= REVEAL_AT_TOP) {
      navBar.classList.remove("is-hidden");
      lastDir = 0;
    } else if (Math.abs(dy) >= DELTA) {
      const dir = dy > 0 ? 1 : -1;
      if (dir !== lastDir) {
        if (dir === 1) navBar.classList.add("is-hidden");
        else navBar.classList.remove("is-hidden");
        lastDir = dir;
      }
    }

    if (heroSection) {
      const navH = navBar.offsetHeight || 60;
      const heroBottomInViewport = heroSection.getBoundingClientRect().bottom;
      navBar.classList.toggle("is-over-hero", heroBottomInViewport > navH);
    }

    lastY = y;
  };

  window.addEventListener("scroll", onNav, { passive: true });
  onNav();
  cleanups.push(() => window.removeEventListener("scroll", onNav));
}

function initHero(
  root: HTMLElement,
  reduced: boolean,
  cleanups: Array<() => void>,
) {
  const hero = root.querySelector<HTMLElement>("#hero");
  const media = root.querySelector<HTMLElement>("#hero-media");
  const heroImg = root.querySelector<HTMLElement>(".hero__img");
  if (!hero || !media || !heroImg || reduced) return;

  const INITIAL_H = 600;
  const INITIAL_RADIUS = 18;
  const INITIAL_IMG_SCALE = 1.8;
  const FINAL_IMG_SCALE = 1.0;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const sticky = hero.querySelector<HTMLElement>(".hero__sticky");
  if (!sticky) return;

  const updateHero = () => {
    const scrolled = Math.max(0, window.scrollY);
    const p = Math.min(1, scrolled / 500);
    const eased = p * p * (3 - 2 * p);

    const vw = window.innerWidth;
    const heroH = hero.offsetHeight;
    const containerL = Math.max(0, sticky.getBoundingClientRect().left);
    const startW = vw - containerL * 2;
    const finalW = vw;

    const w = lerp(startW, finalW, eased);
    const h = lerp(INITIAL_H, heroH, eased);
    const l = lerp(0, -containerL, eased);
    const t = lerp(0, -80, eased);
    const radius = lerp(INITIAL_RADIUS, 0, eased);
    const imgScale = lerp(INITIAL_IMG_SCALE, FINAL_IMG_SCALE, eased);

    media.style.setProperty("--w", `${w}px`);
    media.style.setProperty("--h", `${h}px`);
    media.style.setProperty("--l", `${l}px`);
    media.style.setProperty("--t", `${t}px`);
    media.style.setProperty("--radius", `${radius}px`);
    heroImg.style.setProperty("--img-scale", imgScale.toFixed(3));
  };

  let heroTick = false;
  const onHeroScroll = () => {
    if (heroTick) return;
    heroTick = true;
    requestAnimationFrame(() => {
      updateHero();
      heroTick = false;
    });
  };

  window.addEventListener("scroll", onHeroScroll, { passive: true });
  window.addEventListener("resize", onHeroScroll, { passive: true });
  updateHero();
  cleanups.push(() => {
    window.removeEventListener("scroll", onHeroScroll);
    window.removeEventListener("resize", onHeroScroll);
  });
}

function initWhyCards(root: HTMLElement, cleanups: Array<() => void>) {
  const whyRow = root.querySelector<HTMLElement>("#why-cards");
  if (!whyRow) return;

  const wcards = Array.from(whyRow.querySelectorAll<HTMLElement>(".wcard"));
  const activate = (card: HTMLElement) => {
    if (card.classList.contains("is-active")) return;
    wcards.forEach((c) => c.classList.toggle("is-active", c === card));
  };

  const onEnter = (event: Event) => {
    const card = event.currentTarget;
    if (card instanceof HTMLElement) activate(card);
  };

  wcards.forEach((card) => {
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("focus", onEnter);
  });

  cleanups.push(() => {
    wcards.forEach((card) => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("focus", onEnter);
    });
  });
}

function initMarquee(root: HTMLElement, cleanups: Array<() => void>) {
  const track = root.querySelector<HTMLElement>("#track");
  if (!track) return;

  const originals = Array.from(track.children);
  originals.forEach((node) => {
    const clone = node.cloneNode(true);
    if (clone instanceof HTMLElement) {
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
  });

  cleanups.push(() => {
    track
      .querySelectorAll(':scope > [aria-hidden="true"]')
      .forEach((node) => node.remove());
  });
}

function initPricingToggle(root: HTMLElement, cleanups: Array<() => void>) {
  const toggleBtns = Array.from(
    root.querySelectorAll<HTMLButtonElement>(".toggle__btn"),
  );

  const onClick = (button: HTMLButtonElement) => () => {
    toggleBtns.forEach((other) => {
      const active = other === button;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const handlers = toggleBtns.map((button) => onClick(button));
  toggleBtns.forEach((button, i) => {
    button.addEventListener("click", handlers[i]);
  });

  cleanups.push(() => {
    toggleBtns.forEach((button, i) => {
      button.removeEventListener("click", handlers[i]);
    });
  });
}

function initHowItWorks(
  root: HTMLElement,
  reduced: boolean,
  lottie: LottieAPI,
): (() => void) | undefined {
  const hiwPanel = root.querySelector<HTMLElement>("#hiw-panel");
  if (!hiwPanel) return;

  const pills = Array.from(
    hiwPanel.querySelectorAll<HTMLButtonElement>(".hiw__pill"),
  );
  const stages = Array.from(
    hiwPanel.querySelectorAll<HTMLElement>(".hiw__lottie"),
  );
  const files = [
    "/demo/hiw/hiw-1.json",
    "/demo/hiw/hiw-2.json",
    "/demo/hiw/hiw-3.json",
  ];
  const players: Array<LottiePlayer | null> = new Array(files.length).fill(
    null,
  );

  const load = (i: number) => {
    const existing = players[i];
    if (existing) return existing;
    const player = lottie.loadAnimation({
      container: stages[i],
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: files[i],
    });
    players[i] = player;
    return player;
  };

  let current = 0;
  const setStep = (next: number) => {
    if (next === current && players[next]) return;
    current = next;
    pills.forEach((pill, i) => {
      pill.classList.toggle("is-active", i === next);
      pill.setAttribute("aria-pressed", i === next ? "true" : "false");
    });
    stages.forEach((stage, i) => {
      const active = i === next;
      stage.classList.toggle("is-active", active);
      if (active) stage.removeAttribute("hidden");
      else stage.setAttribute("hidden", "");
      const player = players[i];
      if (player) {
        if (active) player.play();
        else player.pause();
      }
    });
    const player = load(next);
    if (!reduced) player.play();
  };

  const onPillClick = (i: number) => () => setStep(i);
  const pillHandlers = pills.map((_, i) => onPillClick(i));
  pills.forEach((pill, i) => pill.addEventListener("click", pillHandlers[i]));

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        const player = load(0);
        if (!reduced) player.play();
        io.disconnect();
      }
    },
    { rootMargin: "600px" },
  );
  io.observe(hiwPanel);

  return () => {
    io.disconnect();
    pills.forEach((pill, i) =>
      pill.removeEventListener("click", pillHandlers[i]),
    );
    players.forEach((player) => player?.destroy());
  };
}

function initFaq(
  root: HTMLElement,
  reduced: boolean,
  cleanups: Array<() => void>,
) {
  const faqItems = Array.from(root.querySelectorAll<HTMLElement>(".faq__item"));
  const handlers: Array<() => void> = [];

  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector<HTMLElement>(".faq__answer");
    if (!summary || !answer) return;

    let anim: Animation | null = null;

    const collapse = () => {
      const startH = answer.offsetHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [
          { height: `${startH}px`, opacity: 1 },
          { height: "0px", opacity: 0 },
        ],
        { duration: reduced ? 0 : 280, easing: "cubic-bezier(0.2, 0, 0, 1)" },
      );
      anim.onfinish = () => {
        item.removeAttribute("open");
        answer.style.height = "";
        anim = null;
      };
    };

    const expand = () => {
      item.setAttribute("open", "");
      const endH = answer.scrollHeight;
      if (anim) anim.cancel();
      anim = answer.animate(
        [
          { height: "0px", opacity: 0 },
          { height: `${endH}px`, opacity: 1 },
        ],
        {
          duration: reduced ? 0 : 320,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        },
      );
      anim.onfinish = () => {
        answer.style.height = "";
        anim = null;
      };
    };

    const onClick = (event: Event) => {
      event.preventDefault();
      if (item.hasAttribute("open")) {
        collapse();
      } else {
        faqItems.forEach((other) => {
          if (other !== item && other.hasAttribute("open")) {
            other.removeAttribute("open");
          }
        });
        expand();
      }
    };

    summary.addEventListener("click", onClick);
    handlers.push(() => summary.removeEventListener("click", onClick));
  });

  cleanups.push(() => handlers.forEach((fn) => fn()));
}
