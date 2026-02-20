import Link from "next/link";

/**
 * SVG logo icon for MyHireView - a document with a play button overlay,
 * representing resumes enhanced with video pitches.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c283c9" />
          <stop offset="50%" stopColor="#90A6D5" />
          <stop offset="100%" stopColor="#50b2d7" />
        </linearGradient>
      </defs>
      <path
        d="M511.019 118.23L331.435 297.814C311.411 317.788 284.283 329.005 256 329.005C227.717 329.005 200.589 317.788 180.565 297.814L0.981333 118.23C0.682667 121.601 0 124.652 0 128.001V384.001C0.0338743 412.281 11.2828 439.392 31.2794 459.388C51.2759 479.385 78.3873 490.634 106.667 490.668H405.333C433.613 490.634 460.724 479.385 480.721 459.388C500.717 439.392 511.966 412.281 512 384.001V128.001C512 124.652 511.317 121.601 511.019 118.23Z"
        fill="url(#logoIconGradient)"
      />
      <path
        d="M301.269 267.647L496.128 72.7667C486.689 57.1148 473.375 44.1595 457.471 35.1503C441.568 26.1411 423.611 21.382 405.333 21.332H106.667C88.3887 21.382 70.432 26.1411 54.5286 35.1503C38.6251 44.1595 25.3116 57.1148 15.872 72.7667L210.731 267.647C222.754 279.621 239.031 286.345 256 286.345C272.969 286.345 289.246 279.621 301.269 267.647Z"
        fill="url(#logoIconGradient)"
      />
    </svg>
  );
}

export function LogoIconWhite({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M511.019 118.23L331.435 297.814C311.411 317.788 284.283 329.005 256 329.005C227.717 329.005 200.589 317.788 180.565 297.814L0.981333 118.23C0.682667 121.601 0 124.652 0 128.001V384.001C0.0338743 412.281 11.2828 439.392 31.2794 459.388C51.2759 479.385 78.3873 490.634 106.667 490.668H405.333C433.613 490.634 460.724 479.385 480.721 459.388C500.717 439.392 511.966 412.281 512 384.001V128.001C512 124.652 511.317 121.601 511.019 118.23Z"
        fill="white"
      />
      <path
        d="M301.269 267.647L496.128 72.7667C486.689 57.1148 473.375 44.1595 457.471 35.1503C441.568 26.1411 423.611 21.382 405.333 21.332H106.667C88.3887 21.382 70.432 26.1411 54.5286 35.1503C38.6251 44.1595 25.3116 57.1148 15.872 72.7667L210.731 267.647C222.754 279.621 239.031 286.345 256 286.345C272.969 286.345 289.246 279.621 301.269 267.647Z"
        fill="white"
      />
    </svg>
  );
}

export function LogoGradient() {
  return (
    <Link
      href="/"
      id="logo"
      className="font-['Varela_Round'] flex items-center gap-2 text-2xl font-extrabold bg-linear-to-r from-[#c283c9] via-[#90A6D5] to-[#50b2d7] bg-clip-text text-transparent"
      aria-label="MyHireView home"
    >
      <span className="shrink-0 text-[initial]" aria-hidden="true">
        <LogoIcon className="w-6 h-6" />
      </span>
      MyHireView
    </Link>
  );
}

export function LogoWhite() {
  return (
    <Link
      href="/"
      id="logo"
      className="text-4xl font-extrabold text-white flex items-center gap-2"
      aria-label="MyHireView home"
    >
      <LogoIconWhite className="w-9 h-9" />
      MyHireView
    </Link>
  );
}
