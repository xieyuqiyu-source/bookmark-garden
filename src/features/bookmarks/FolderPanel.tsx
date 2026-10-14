import { useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "../../components/Dialog";
import { DesignIcon } from "./DesignIcon";
import { BookmarkTile } from "./BookmarkTile";
import type { MenuTarget } from "./BookmarkTile";
import type { Bookmark, Folder, Preferences } from "./model";
export type BookmarkGroup = Folder & { items: Bookmark[] };
interface Props {
  group: BookmarkGroup;
  preferences: Preferences;
  onMenu: (target: MenuTarget) => void;
}
function FolderName({
  group,
  showPath,
}: {
  group: BookmarkGroup;
  showPath: boolean;
}) {
  const parent = group.path.split(" / ").slice(0, -1).join(" / ");
  return (
    <>
      <DesignIcon name="imgFolder" size={26} />
      <span className="folder-name" title={group.path}>
        {showPath && parent && <span className="folder-path">{parent} / </span>}
        <strong>{group.title}</strong>
      </span>
      <span className="folder-count">{group.items.length}</span>
    </>
  );
}
export function FolderPanel({
  group,
  preferences,
  onMenu,
  onOpen,
}: Props & { onOpen: () => void }) {
  return (
    <section className="folder-panel glass" aria-label={group.title}>
      <header className="folder-header">
        <button className="folder-title" onClick={onOpen}>
          <FolderName group={group} showPath={preferences.showFolderPath} />
        </button>
        <button
          className="icon-button"
          aria-label={`展开${group.title}`}
          onClick={onOpen}
        >
          <DesignIcon name="img2" size={24} />
        </button>
      </header>
      <div className="bookmark-grid">
        {group.items.slice(0, preferences.compact ? 12 : 8).map((item) => (
          <BookmarkTile
            key={item.id}
            item={item}
            pinned={preferences.pins.includes(item.id)}
            newTab={preferences.newTab}
            onMenu={onMenu}
          />
        ))}
      </div>
      {!group.items.length && <div className="folder-empty">暂无书签</div>}
    </section>
  );
}
export function FolderDialog({
  group,
  preferences,
  onMenu,
  onClose,
}: Props & { onClose: () => void }) {
  const [limit, setLimit] = useState(120);
  return (
    <Dialog
      className="folder-dialog glass"
      label={group.path}
      onClose={onClose}
    >
      <header className="folder-header">
        <div className="folder-title">
          <FolderName group={group} showPath={preferences.showFolderPath} />
        </div>
        <button
          className="close-button"
          aria-label="关闭文件夹"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <div className="folder-content">
        <div className="bookmark-grid">
          {group.items.slice(0, limit).map((item) => (
            <BookmarkTile
              key={item.id}
              item={item}
              pinned={preferences.pins.includes(item.id)}
              newTab={preferences.newTab}
              onMenu={onMenu}
            />
          ))}
        </div>
        {!group.items.length && <div className="folder-empty">暂无书签</div>}
        {group.items.length > limit && (
          <button className="load-more" onClick={() => setLimit(limit + 120)}>
            显示更多
          </button>
        )}
      </div>
    </Dialog>
  );
}
