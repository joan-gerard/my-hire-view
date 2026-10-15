import Link from "next/link";

export default function DemoAuthBanner({ active }: { active: "login" | "signup" }) {
  return (
    <div className="mhv-auth-demo-banner">
      <span>
        <strong>Style demo</strong> — Reslink layout + MyHireView tokens (not real auth)
      </span>
      <span>
        {active === "login" ? (
          <>
            Login · <Link href="/demo/auth-reslink/signup">Signup</Link>
          </>
        ) : (
          <>
            <Link href="/demo/auth-reslink/login">Login</Link> · Signup
          </>
        )}
        {" · "}
        <Link href="/login">Production auth</Link>
      </span>
    </div>
  );
}
