import Link from "next/link";

export default function DemoLogo() {
  return (
    <Link href="/" className="mhv-auth-demo-logo" aria-label="MyHireView home">
      <span>MyHireView</span>
      <span className="mhv-auth-demo-logo-dot" aria-hidden />
    </Link>
  );
}
