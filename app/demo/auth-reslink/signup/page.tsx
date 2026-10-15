import { redirect } from "next/navigation";

/** Former style demo — production `/signup` now uses this layout. */
export default function DemoAuthSignupPage() {
  redirect("/signup");
}
