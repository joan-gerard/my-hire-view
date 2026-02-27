"use client";

import { AvatarIcon } from "@/components/admin/icons";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import type { RefObject } from "react";
import { handleSignOut } from "./signOut";

export interface UserDropdownProps {
  user: User | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
}

export function UserDropdown({
  user,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
}: UserDropdownProps) {
  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-(--foreground)/10 text-foreground hover:bg-(--foreground)/20 focus:outline-none focus:ring-(--brand-primary) focus:ring-offset-2"
        aria-label={user ? "Open account menu" : "Open menu"}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <AvatarIcon className="h-5 w-5" />
      </button>
      {dropdownOpen && (
        <div
          className="absolute -right-4 top-full z-50 mt-3 w-48 rounded-2xl border border-(--foreground)/10 bg-white py-1 shadow-sm shadow-black/15"
          role="menu"
        >
          {user ? (
            <>
              <Link
                href="/admin"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  void handleSignOut();
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground hover:bg-(--secondary-background)"
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
