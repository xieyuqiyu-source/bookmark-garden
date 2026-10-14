import { DesignIcon } from "./DesignIcon";
import { SearchBox } from "./SearchBox";
import type { Bookmark } from "./model";
export function DesktopToolbar({
  bookmarks,
  newTab,
  onSettings,
}: {
  bookmarks: Bookmark[];
  newTab: boolean;
  onSettings: () => void;
}) {
  return (
    <header className="desktop-toolbar">
      <div className="brand">
        <DesignIcon name="imgBookmark" size={35} />
        <strong>栖页</strong>
        <i />
        <span>我的桌面</span>
      </div>
      <SearchBox bookmarks={bookmarks} newTab={newTab} />
      <div className="toolbar-actions">
        <button className="appearance-button glass" onClick={onSettings}>
          <DesignIcon name="imgPalette" />
          <span>外观 · 云屿</span>
          <DesignIcon name="imgChevron" size={18} />
        </button>
        <button
          className="settings-button glass"
          aria-label="设置"
          onClick={onSettings}
        >
          <DesignIcon name="imgSettings" />
        </button>
      </div>
    </header>
  );
}
