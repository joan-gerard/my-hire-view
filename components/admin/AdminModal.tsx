"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
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
  /** Optional id for `aria-controls` on the open trigger. */
  id?: string;
  title: string;
  /** Optional subtitle / help under the title. */
  description?: ReactNode;
  children: ReactNode;
  /**
   * Dialog width utility. Defaults to status-legend width.
   * Example: `w-[min(100vw-2rem,28rem)]`
   */
  widthClassName?: string;
  /**
   * `centered` (default): translate centering, max height 40rem.
   * `viewport`: `m-auto`, max height 90vh, no transform — required when a
   * nested `position: fixed` overlay (e.g. VideoModal) must not be clipped.
   */
  layout?: "centered" | "viewport";
  /** Replace the default padded scroll body classes. */
  bodyClassName?: string;
  /** Content inside the dialog but outside the panel (nested overlays). */
  overlay?: ReactNode;
  /** Focus this element after the dialog closes (e.g. the open trigger). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Native dialog `cancel` (Escape). Call `preventDefault` to keep the dialog
   * open (e.g. close a nested video first).
   */
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;
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
  id,
  title,
  description,
  children,
  widthClassName = "w-[min(100vw-2rem,32rem)]",
  layout = "centered",
  bodyClassName = "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6",
  overlay,
  returnFocusRef,
  onCancel,
  footer,
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeEmittedRef = useRef(false);
  /** True only when the press started on the dialog backdrop (not the panel). */
  const pointerDownOnBackdropRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const isViewport = layout === "viewport";
  const dialogLayoutClass = isViewport
    ? "z-50 m-auto h-fit max-h-[90vh] overflow-visible border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col"
    : "fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40 open:flex open:flex-col";
  const panelMaxHeightClass = isViewport
    ? "max-h-[90vh]"
    : "max-h-[min(90vh,40rem)]";

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
      returnFocusRef?.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose, returnFocusRef]);

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
      id={id}
      className={`${dialogLayoutClass} ${widthClassName}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={onCancel}
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
          className={`flex ${panelMaxHeightClass} w-full flex-col overflow-hidden text-[var(--ink)] shadow-[0_12px_40px_-16px_rgba(11,11,12,0.28)] ${ADMIN_PANEL_CLASS}`}
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

          <div className={bodyClassName}>{children}</div>

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
        {overlay}
      </AdminModalDismissContext.Provider>
    </dialog>
  );
}
