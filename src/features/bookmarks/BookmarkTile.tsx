import { useState } from "react";
import { Pin, PinOff, ShieldAlert } from "lucide-react";
import { faviconUrl } from "./api";
import type { Bookmark } from "./model";
const colors = ["sage", "blue", "rose", "sand", "lavender", "mint"];
export function BookmarkTile({
  item,
  pinned,
  newTab,
  disabled,
  onPin,
}: {
  item: Bookmark;
  pinned: boolean;
  newTab: boolean;
  disabled: boolean;
  onPin: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const icon = faviconUrl(item.url);
  const color =
    colors[
      [...item.domain].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        colors.length
    ];
  return (
    <div className="bookmark-tile">
      <a
        className="bookmark-link"
        href={item.safe ? item.url : undefined}
        aria-disabled={!item.safe}
        target={newTab ? "_blank" : "_self"}
        rel="noopener noreferrer"
        title={`${item.title}\n${item.url}${item.safe ? "" : "\n此类型链接不支持直接打开"}`}
      >
        <span className={`app-icon ${color}`}>
          {icon && !failed ? (
            <img
              src={icon}
              alt=""
              loading="lazy"
              onError={() => setFailed(true)}
            />
          ) : (
            <span className="letter-icon">
              {item.title.slice(0, 1).toUpperCase()}
            </span>
          )}
          {!item.safe && <ShieldAlert className="unsafe-mark" size={16} />}
        </span>
        <span className="bookmark-title">{item.title}</span>
        <span className="bookmark-domain">{item.domain}</span>
      </a>
      <button
        className={`pin-button ${pinned ? "is-pinned" : ""}`}
        onClick={onPin}
        disabled={disabled}
        aria-label={`${pinned ? "取消固定" : "固定"} ${item.title}`}
        title={pinned ? "取消固定" : "固定到常用"}
      >
        {pinned ? <PinOff size={13} /> : <Pin size={13} />}
      </button>
    </div>
  );
}
