'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export type AdminTooltipProps = {
  /** Visible tip text (also linked via `aria-describedby`). */
  label: string;
  /** Single focusable/hoverable control (button, link, or span). */
  children: ReactElement;
  /** Prefer top for icon rows so tips stay clear of menus below. */
  side?: 'top' | 'bottom';
};

type TriggerProps = {
  'aria-describedby'?: string;
  'aria-expanded'?: boolean | 'true' | 'false';
  title?: string;
  className?: string;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

type TipAnchor = { top: number; left: number };

/**
 * Instant custom tooltip (no native `title` delay).
 * Shows on hover, or keyboard focus (`:focus-visible`) — not plain focus, so
 * returning focus after closing a dialog does not leave the tip stuck open.
 * Hides while the child reports `aria-expanded="true"` (open menus / dialogs).
 *
 * The tip is portaled so it can paint above the sticky day label without
 * lifting the card itself over that label's background.
 */
export default function AdminTooltip({
  label,
  children,
  side = 'top',
}: AdminTooltipProps) {
  const tipId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<TipAnchor | null>(null);
  const [mounted, setMounted] = useState(false);
  const child = Children.only(children);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isValidElement(child)) {
    return children;
  }

  const childProps = child.props as TriggerProps;
  const expanded =
    childProps['aria-expanded'] === true || childProps['aria-expanded'] === 'true';

  const trigger = cloneElement(child as ReactElement<TriggerProps>, {
    'aria-describedby': tipId,
    title: undefined,
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      setOpen(true);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      setOpen(false);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      if (event.currentTarget.matches(':focus-visible')) {
        setOpen(true);
      }
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      setOpen(false);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (event.key === "Escape" && open) {
        event.stopPropagation();
        setOpen(false);
      }
    },
  });

  return (
    <span ref={anchorRef} className="inline-flex">
      {trigger}
      {mounted ? (
        <TooltipPortal
          id={tipId}
          label={label}
          side={side}
          open={open && !expanded}
          anchorRef={anchorRef}
          anchor={anchor}
          setAnchor={setAnchor}
        />
      ) : null}
    </span>
  );
}

function TooltipPortal({
  id,
  label,
  side,
  open,
  anchorRef,
  anchor,
  setAnchor,
}: {
  id: string;
  label: string;
  side: 'top' | 'bottom';
  open: boolean;
  anchorRef: RefObject<HTMLSpanElement | null>;
  anchor: TipAnchor | null;
  setAnchor: (next: TipAnchor | null) => void;
}) {
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setAnchor({
        top: side === 'bottom' ? rect.bottom : rect.top,
        left: rect.left + rect.width / 2,
      });
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, side, label, anchorRef, setAnchor]);

  if (!open || !anchor) return null;

  const caretClass =
    side === 'bottom'
      ? 'bottom-full left-1/2 -mb-px -translate-x-1/2 border-b-[var(--ink)] border-l-transparent border-r-transparent border-t-transparent'
      : 'top-full left-1/2 -mt-px -translate-x-1/2 border-t-[var(--ink)] border-l-transparent border-r-transparent border-b-transparent';

  return createPortal(
    <span
      id={id}
      role="tooltip"
      style={{
        position: 'fixed',
        left: anchor.left,
        top: side === 'bottom' ? anchor.top + 6 : anchor.top - 6,
        transform:
          side === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
        zIndex: 40,
      }}
      className="pointer-events-none w-max max-w-[14rem] rounded-md bg-[var(--ink)] px-2 py-1 text-center text-xs font-medium leading-snug text-[var(--white)] shadow-[0_8px_20px_-8px_rgba(11,11,12,0.45)]"
    >
      {label}
      <span aria-hidden className={`absolute h-0 w-0 border-4 ${caretClass}`} />
    </span>,
    document.body,
  );
}
