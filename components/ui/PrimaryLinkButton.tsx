import Link from "next/link";

export default function PrimaryLinkButton({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-(--brand-primary) px-4 py-2 text-base font-medium text-(--brand-primary-text) hover:opacity-95"
    >
      {label}
    </Link>
  );
}
