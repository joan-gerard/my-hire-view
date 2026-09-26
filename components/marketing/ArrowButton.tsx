export function RollLabel({ text }: { text: string }) {
  return (
    <span className="ot-roll">
      <span>{text}</span>
      <span>{text}</span>
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11 11"
      width="11"
      height="11"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M.72 9.78a.75.75 0 0 0 1.06 0l8.5-8.5A.75.75 0 1 0 9.22.22l-8.5 8.5a.75.75 0 0 0 0 1.06"
      />
      <path
        fill="currentColor"
        d="M9.75 10.5a.75.75 0 0 0 .75-.75v-9A.75.75 0 0 0 9.75 0h-9a.75.75 0 0 0 0 1.5H9v8.25c0 .414.336.75.75.75"
      />
    </svg>
  );
}

export function ArrowButton({
  href,
  label,
  tone,
  className,
}: {
  href: string;
  label: string;
  tone: "dark" | "lime";
  className?: string;
}) {
  return (
    <a
      className={`ot-arrow-btn ot-arrow-btn-${tone}${className ? ` ${className}` : ""}`}
      href={href}
    >
      <RollLabel text={label} />
      <span className="ot-arrow-btn-icon" aria-hidden="true">
        <ArrowIcon />
      </span>
    </a>
  );
}
