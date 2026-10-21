"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import {
  ADMIN_PANEL_CLASS,
  ADMIN_SECONDARY_CLASS,
} from "@/components/admin/admin-chrome";

const AdminModalDismissContext = createContext<(() => void) | null>(null);

/** Close the nearest open `AdminModal` (e.g. from a link in the description). */
export function useAdminModalDismiss(): () => void {
  const dismiss = useContext(AdminModalDismissContext);
  if (!dismiss) {
    throw new Error("useAdminModalDismiss must be used inside AdminModal");
  }
  return dismiss;
}

export type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional subtitle / help under the title. */
  description?: ReactNode;
  children: ReactNode;
  /**
   * Dialog width utility. Defaults to status-legend width.
   * Example: `w-[min(100vw-2rem,28rem)]`
   */
  widthClassName?: string;
  /** Replace the default Close footer. */
  footer?: ReactNode;
};

/**
 * Shared admin modal: native `<dialog>`, backdrop dismiss, Escape, scroll lock,
 * and `onClose` only from the `close` event (once).
 */
export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  widthClassName = "w-[min(100vw-2rem,32rem)]",
  footer,
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeEmittedRef = useRef(false);
  /** True only when the press started on the dialog backdrop (not the panel). */
  const pointerDownOnBackdropRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  const requestDismiss = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      onClose();
      return;
    }
    if (dialog.open) {
      dialog.close();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      closeEmittedRef.current = false;
      dialog.showModal();
      const heading = titleRef.current;
      if (heading) {
        heading.focus({
          preventScroll: true,
          focusVisible: false,
        } as FocusOptions & { focusVisible?: boolean });
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      if (closeEmittedRef.current) return;
      closeEmittedRef.current = true;
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col ${widthClassName}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onPointerDown={(e) => {
        pointerDownOnBackdropRef.current = e.target === dialogRef.current;
      }}
      onClick={(e) => {
        const startedOnBackdrop = pointerDownOnBackdropRef.current;
        pointerDownOnBackdropRef.current = false;
        // Require press + release on the backdrop so a text-selection drag that
        // starts in the panel and ends on the backdrop does not dismiss.
        if (startedOnBackdrop && e.target === dialogRef.current) {
          requestDismiss();
        }
      }}
    >
      <AdminModalDismissContext.Provider value={requestDismiss}>
        <div
          className={`flex max-h-[min(90vh,40rem)] w-full flex-col overflow-hidden text-[var(--ink)] shadow-[0_12px_40px_-16px_rgba(11,11,12,0.28)] ${ADMIN_PANEL_CLASS}`}
        >
          <header className="shrink-0 border-b border-[var(--ink)]/8 px-5 pb-4 pt-5 sm:px-6">
            <h2
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="font-heading text-lg font-semibold tracking-[-0.02em] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
            >
              {title}
            </h2>
            {description ? (
              <div
                id={descriptionId}
                className="mt-1.5 text-sm leading-snug text-[var(--muted)]"
              >
                {description}
              </div>
            ) : null}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>

          <footer className="relative z-10 flex shrink-0 justify-end border-t border-[var(--ink)]/8 bg-[var(--white)] px-5 py-3 sm:px-6">
            {footer ?? (
              <button
                type="button"
                onClick={requestDismiss}
                className={ADMIN_SECONDARY_CLASS}
              >
                Close
              </button>
            )}
          </footer>
        </div>
      </AdminModalDismissContext.Provider>
    </dialog>
  );
}
