"use client";

import { forwardRef, type ReactNode } from "react";
import { FiCamera, FiX } from "react-icons/fi";

export type ProfilePictureIconActionsSize = "sm" | "md";

const sizeStyles: Record<
  ProfilePictureIconActionsSize,
  {
    frame: string;
    stack: string;
    button: string;
    /** Matches button box so the camera stays put when × is hidden. */
    spacer: string;
    icon: string;
  }
> = {
  /** Profile page — smaller avatar. */
  sm: {
    frame: "relative mr-6 w-fit shrink-0",
    stack:
      "absolute top-1/2 left-full z-10 flex -translate-x-[70%] -translate-y-1/2 flex-col gap-10",
    button:
      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-[var(--white)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50",
    spacer: "h-9 w-9 shrink-0",
    icon: "size-4",
  },
  /** Manage-picture dialog — larger avatar. */
  md: {
    frame: "relative mr-8 w-fit shrink-0",
    stack:
      "absolute top-1/2 left-full z-10 flex -translate-x-[70%] -translate-y-1/2 flex-col gap-16",
    button:
      "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-[var(--white)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50",
    spacer: "h-11 w-11 shrink-0",
    icon: "size-5",
  },
};

export type ProfilePictureIconActionsProps = {
  /** Circular avatar (or placeholder) the controls sit against. */
  children: ReactNode;
  /** Opens the file picker (choose or change). */
  onChooseOrChange: () => void;
  /** Accessible name for the camera control. */
  chooseLabel: string;
  /** When set, shows a red dismiss/remove control. */
  onRemove?: () => void;
  /** Accessible name for the remove control. */
  removeLabel?: string;
  disabled?: boolean;
  /**
   * Control scale relative to the avatar. Default `md` (dialog);
   * use `sm` on Profile where the circle is smaller.
   */
  size?: ProfilePictureIconActionsSize;
};

/**
 * Avatar frame with camera / remove controls on the circle’s right edge.
 */
const ProfilePictureIconActions = forwardRef<
  HTMLButtonElement,
  ProfilePictureIconActionsProps
>(function ProfilePictureIconActions(
  {
    children,
    onChooseOrChange,
    chooseLabel,
    onRemove,
    removeLabel = "Remove picture",
    disabled = false,
    size = "md",
  },
  ref,
) {
  const styles = sizeStyles[size];

  return (
    <div className={styles.frame}>
      {children}
      <div className={styles.stack}>
        {onRemove ? (
          <button
            type="button"
            className={`${styles.button} border-[var(--status-danger-fg)]/30 text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]`}
            aria-label={removeLabel}
            disabled={disabled}
            onClick={onRemove}
          >
            <FiX className={styles.icon} strokeWidth={2.5} aria-hidden />
          </button>
        ) : (
          <span className={styles.spacer} aria-hidden />
        )}
        <button
          ref={ref}
          type="button"
          className={`${styles.button} border-[var(--ink)]/12 text-[var(--ink)] hover:bg-[var(--surface)]`}
          aria-label={chooseLabel}
          disabled={disabled}
          onClick={onChooseOrChange}
        >
          <FiCamera className={styles.icon} aria-hidden />
        </button>
      </div>
    </div>
  );
});

export default ProfilePictureIconActions;
