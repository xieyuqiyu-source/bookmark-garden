import { useEffect, useRef } from "react";
import type { ReactNode, CSSProperties, KeyboardEventHandler } from "react";
export function Dialog({
  children,
  className,
  label,
  onClose,
  style,
  onKeyDown,
}: {
  children: ReactNode;
  className: string;
  label: string;
  onClose: () => void;
  style?: CSSProperties;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
}) {
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
      aria-label={label}
      style={style}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
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
            onClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}
