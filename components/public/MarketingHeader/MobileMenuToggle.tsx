"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

interface MobileMenuToggleProps {
  open: boolean;
  onToggle: () => void;
  /** When true, use dark icon (e.g. when header has white background). When false, use light icon over hero. */
  darkIcon?: boolean;
}

export function MobileMenuToggle({
  open,
  onToggle,
  darkIcon = false,
}: MobileMenuToggleProps) {
  const iconLight = !open && !darkIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex md:hidden h-10 w-10 items-center justify-center rounded-lg focus:outline-none ${iconLight ? "text-white hover:bg-white/10" : "text-foreground hover:bg-(--foreground)/10"}`}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.span
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <FiX className="h-6 w-6" />
          </motion.span>
        ) : (
          <motion.span
            key="menu"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <FiMenu className="h-6 w-6" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
