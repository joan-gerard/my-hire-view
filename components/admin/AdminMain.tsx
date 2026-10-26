"use client";

import {
  ADMIN_HEADER_INSET_CLASS,
  ADMIN_SHELL_CLASS,
} from "@/components/admin/admin-chrome";
import { usePathname } from "next/navigation";

function usesHeaderWidth(pathname: string): boolean {
  return pathname === "/admin/new" || pathname.startsWith("/admin/edit/");
}

/** Dashboard owns its top gap inside the sticky toolbar (see AdminDashboard). */
function isDashboard(pathname: string): boolean {
  return pathname === "/admin";
}

/** Create and edit span the header. Other admin pages stay in the 1440 column. */
export default function AdminMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const wide = usesHeaderWidth(pathname);
  const dashboard = isDashboard(pathname);

  return (
    <main
      className={
        wide
          ? `py-8 ${ADMIN_HEADER_INSET_CLASS}`
          : dashboard
            ? `${ADMIN_SHELL_CLASS} pt-0 pb-8`
            : `${ADMIN_SHELL_CLASS} py-8`
      }
    >
      {children}
    </main>
  );
}
