import { redirect } from "next/navigation";

/** Former style demo — production `/login` now uses this layout. */
export default function DemoAuthLoginPage() {
  redirect("/login");
}
