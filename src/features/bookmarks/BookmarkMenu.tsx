import { ExternalLink, ArrowUpRight, Pin, PinOff } from "lucide-react";
import { Dialog } from "../../components/Dialog";
import type { MenuTarget } from "./BookmarkTile";
export function BookmarkMenu({
  target,
  pinned,
  onPin,
  onClose,
}: {
  target: MenuTarget;
  pinned: boolean;
  onPin: () => void;
  onClose: () => void;
}) {
  const { item } = target;
  return (
    <Dialog
      className="bookmark-menu"
      label={`${item.title}的操作`}
      onClose={onClose}
      style={{
        left: Math.max(8, Math.min(target.x, window.innerWidth - 236)),
        top: Math.max(8, Math.min(target.y, window.innerHeight - 165)),
      }}
      onKeyDown={(event) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])',
          ),
        );
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
                items.length;
        items[next]?.focus();
      }}
    >
      {(close) => (
        <div role="menu" aria-label={item.title}>
          <a
            role="menuitem"
            href={item.safe ? item.url : undefined}
            aria-disabled={!item.safe}
            tabIndex={item.safe ? 0 : -1}
            onClick={(event) => {
              if (!item.safe) event.preventDefault();
              else close();
            }}
          >
            <ArrowUpRight size={18} />
            打开
          </a>
          <a
            role="menuitem"
            href={item.safe ? item.url : undefined}
            aria-disabled={!item.safe}
            tabIndex={item.safe ? 0 : -1}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!item.safe) event.preventDefault();
              else close();
            }}
          >
            <ExternalLink size={17} />
            在新标签页打开
          </a>
          <hr />
          <button
            role="menuitem"
            onClick={() => {
              onPin();
              close();
            }}
          >
            {pinned ? <PinOff size={17} /> : <Pin size={17} />}
            {pinned ? "取消固定" : "固定到常用"}
          </button>
        </div>
      )}
    </Dialog>
  );
}
