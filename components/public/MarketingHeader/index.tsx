"use client";

import { useHeroEntrance } from "@/contexts/HeroEntranceContext";
import { headerEntrance } from "@/lib/landing-animations";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoBlack } from "@/components/ui/Logo";
import { MOBILE_MENU_BG, MARKETING_NAV_LINKS } from "./constants";
import { MobileMenuContent } from "./MobileMenuContent";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { UserDropdown } from "./UserDropdown";
import { useMobileViewport } from "./useMobileViewport";

export interface MarketingHeaderProps {
  user: User | null;
}

/**
 * Header for public marketing pages: home (/), How it Works, Pricing, Blog.
 * Rendered by app/(marketing)/layout.tsx.
 *
 * Desktop (md+): Left logo, right nav links + avatar dropdown (Dashboard/Sign out or Sign in).
 * Mobile: Logo left, hamburger icon right. Tapping the icon expands the header to full
 * height (100vh) and reveals nav links plus Dashboard/Sign Out or Sign In. Body scroll
 * is locked while the menu is open.
 */
export default function MarketingHeader({ user }: MarketingHeaderProps) {
  const { heroReady } = useHeroEntrance();
  const isMobileViewport = useMobileViewport();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobileViewport) setMobileMenuOpen(false);
  }, [isMobileViewport]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const headerHeight = isMobileViewport && mobileMenuOpen ? "100vh" : "72px";
  const isMobileMenuExpanded = isMobileViewport && mobileMenuOpen;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 overflow-hidden md:overflow-visible"
      initial={{ ...headerEntrance.initial, backgroundColor: "#ffffff" }}
      animate={
        heroReady
          ? {
              ...headerEntrance.animate,
              height: headerHeight,
              backgroundColor: isMobileMenuExpanded
                ? MOBILE_MENU_BG
                : "#ffffff",
            }
          : { ...headerEntrance.initial, height: "72px", backgroundColor: "#ffffff" }
      }
      transition={{
        ...headerEntrance.transition,
        delay: heroReady ? 0.4 : 0,
        height: { type: "tween", duration: 0.3, ease: "easeInOut" },
        backgroundColor: { type: "tween", duration: 0.3, ease: "easeInOut" },
      }}
    >
      <div className="relative flex h-[72px] min-h-[72px] shrink-0 justify-between items-center px-4 py-2 md:px-10 2xl:px-6 max-w-[1700px] mx-auto">
        <div className="flex items-center">
          <LogoBlack />
        </div>

        <nav
          className="hidden md:flex flex-1 justify-end items-center gap-6"
          aria-label="Main"
        >
          {MARKETING_NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              id="marketing-nav-link"
              className="text-lg font-medium text-foreground/80 hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          <UserDropdown
            user={user}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownRef={dropdownRef}
          />
        </nav>

        <MobileMenuToggle
          open={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen((prev) => !prev)}
        />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenuContent user={user} onClose={closeMobileMenu} />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
