export function initParley(root: HTMLElement): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups: Array<() => void> = [];

  initNav(root, cleanups);
  initHero(root, reduced, cleanups);
  initMarquee(root, cleanups);
  initFaq(root, reduced, cleanups);

  const hiwCleanup = initHowItWorks(root, reduced);
  if (hiwCleanup) cleanups.push(hiwCleanup);

  return () => {
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

function initHowItWorks(
  root: HTMLElement,
  reduced: boolean,
): (() => void) | undefined {
  const hiwPanel = root.querySelector<HTMLElement>("#hiw-panel");
  if (!hiwPanel) return;

  const pills = Array.from(
    hiwPanel.querySelectorAll<HTMLButtonElement>(".hiw__pill"),
  );
  const stages = Array.from(
    hiwPanel.querySelectorAll<HTMLElement>(".hiw__lottie"),
  );
  const videos = stages.map((stage) => stage.querySelector("video"));

  let current = 0;
  const playStep = (index: number) => {
    videos.forEach((video, i) => {
      if (!video) return;
      if (i === index && !reduced) {
        void video.play().catch(() => {
          /* Autoplay or missing remote file is non-fatal. */
        });
      } else {
        video.pause();
      }
    });
  };

  const setStep = (next: number) => {
    if (next === current) {
      playStep(next);
      return;
    }
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
    });
    playStep(next);
  };

  const onPillClick = (i: number) => () => setStep(i);
  const pillHandlers = pills.map((_, i) => onPillClick(i));
  pills.forEach((pill, i) => pill.addEventListener("click", pillHandlers[i]));

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        playStep(current);
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
    videos.forEach((video) => video?.pause());
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
