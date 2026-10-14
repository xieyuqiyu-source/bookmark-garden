import { SiteIcon } from "./DesignIcon";
import type { Bookmark } from "./model";
export interface MenuTarget {
  item: Bookmark;
  x: number;
  y: number;
}
export function BookmarkTile({
  item,
  newTab,
  onMenu,
}: {
  item: Bookmark;
  newTab: boolean;
  onMenu: (target: MenuTarget) => void;
}) {
  const menu = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    onMenu({ item, x: rect.right - 16, y: rect.top + 16 });
  };
  return (
    <div
      className="bookmark-tile"
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.querySelector("a")?.focus({ preventScroll: true });
        onMenu({ item, x: event.clientX, y: event.clientY });
      }}
      onKeyDown={(event) => {
        if (
          event.key === "ContextMenu" ||
          (event.shiftKey && event.key === "F10")
        ) {
          event.preventDefault();
          menu(event.currentTarget);
        }
      }}
    >
      <a
        className="bookmark-link"
        tabIndex={0}
        aria-haspopup="menu"
        href={item.safe ? item.url : undefined}
        aria-disabled={!item.safe}
        target={newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
        title={
          item.safe
            ? `${item.title}\n${item.url}`
            : `${item.title} · 不支持打开此链接`
        }
        onClick={(event) => {
          if (!item.safe) event.preventDefault();
        }}
      >
        <SiteIcon item={item} />
        <span className="bookmark-name">{item.title}</span>
      </a>
    </div>
  );
}
