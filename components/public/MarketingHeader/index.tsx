"use client";

import { LogoBlack, LogoWhite } from "@/components/ui/Logo";
import { useHeroEntrance } from "@/contexts/HeroEntranceContext";
import { useScrollCover } from "@/contexts/ScrollCoverContext";
import { useMobileViewport } from "@/hooks/useMobileViewport";
import { headerEntrance } from "@/lib/landing-animations";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MARKETING_NAV_LINKS,
  MOBILE_MENU_BG,
  MOBILE_MENU_BG_TRANSPARENT,
} from "./constants";
import { MobileMenuContent } from "./MobileMenuContent";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { UserDropdown } from "./UserDropdown";

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
  const { scrollCoverReachedTop } = useScrollCover();
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
  const mobileHeaderBg = isMobileMenuExpanded
    ? MOBILE_MENU_BG
    : scrollCoverReachedTop
      ? "#ffffff"
      : MOBILE_MENU_BG_TRANSPARENT;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 overflow-hidden md:overflow-visible"
      initial={{
        ...headerEntrance.initial,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid transparent",
      }}
      animate={
        heroReady
          ? {
              ...headerEntrance.animate,
              height: headerHeight,
              backgroundColor: isMobileViewport ? mobileHeaderBg : "#ffffff",
              borderBottom: isMobileViewport
                ? scrollCoverReachedTop
                  ? "1px solid transparent"
                  : "0.5px solid #6e6d6d"
                : "1px solid transparent",
            }
          : {
              ...headerEntrance.initial,
              height: "72px",
              backgroundColor: isMobileViewport ? mobileHeaderBg : "#ffffff",
              borderBottom: isMobileViewport
                ? scrollCoverReachedTop
                  ? "1px solid transparent"
                  : "1px solid black"
                : "1px solid transparent",
            }
      }
      transition={{
        ...headerEntrance.transition,
        delay: heroReady ? 0.4 : 0,
        height: { type: "tween", duration: 0.5, ease: "easeInOut" },
        backgroundColor: {
          type: "tween",
          duration: 0.3,
          ease: "easeInOut",
          delay: isMobileMenuExpanded ? 0.15 : 0,
        },
        borderBottom: { type: "tween", duration: 0.5, ease: "easeInOut" },
      }}
    >
      <div className="relative flex h-[72px] min-h-[72px] shrink-0 justify-between items-center px-4 py-2 md:px-10 2xl:px-6 max-w-[1700px] mx-auto">
        <div className="flex items-center">
          {isMobileViewport && !mobileMenuOpen && !scrollCoverReachedTop ? (
            <LogoWhite />
          ) : (
            <LogoBlack />
          )}
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
              className="text-lg font-medium text-black hover:text-black/60 transition-colors duration-300"
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
          darkIcon={scrollCoverReachedTop || mobileMenuOpen}
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
