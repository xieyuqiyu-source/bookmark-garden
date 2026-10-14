import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties, KeyboardEventHandler } from "react";
export function Dialog({
  children,
  className,
  label,
  onClose,
  style,
  onKeyDown,
}: {
  children: ReactNode | ((close: () => void) => ReactNode);
  className: string;
  label: string;
  onClose: () => void;
  style?: CSSProperties;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
}) {
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(
      onClose,
      getComputedStyle(ref.current!).animationName === "none" ? 0 : 160,
    );
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      data-closing={closing || undefined}
      aria-label={label}
      style={style}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            close();
        }
      }}
    >
      {typeof children === "function" ? children(close) : children}
    </dialog>
  );
}
