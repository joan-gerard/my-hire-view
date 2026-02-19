import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      id="logo"
      className="text-2xl font-semibold text-foreground"
      aria-label="MyHireView home"
    >
      MyHireView
    </Link>
  );
}
