/**
 * Shared Framer Motion config for the landing page.
 * Use with motion components for consistent scroll and entrance animations.
 */

export const viewport = { once: true, amount: 0.15 } as const;

export const transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94],
} as const;

/** Fade in and slide up when in view */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition,
} as const;

export const slideUp = {
  initial: { y: 24 },
  whileInView: { y: 0 },
  viewport: { once: false, amount: 0.65 },
  transition,
} as const;

/** Fade in only (no movement) */
export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: false, amount: 0.65 },
  transition,
} as const;

/** Stagger container: use with staggerChildren on parent */
export const staggerContainer = {
  initial: "hidden",
  whileInView: "visible",
  viewport,
  variants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  },
} as const;

/** Stagger item: use with staggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

export const staggerY = {
  hidden: { y: 40 },
  visible: { y: 0, transition: { duration: 0.9 } },
} as const;

/** Header entrance (on load) */
export const headerEntrance = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;
