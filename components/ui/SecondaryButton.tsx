export default function SecondaryButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-(--brand-secondary) px-4 py-2 text-base font-medium text-(--brand-secondary-text) hover:opacity-95 hover:cursor-pointer"
    >
      {label}
    </button>
  );
}
