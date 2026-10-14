import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { SortControl } from "./features/bookmarks/SortControl";
import { DesktopToolbar } from "./features/bookmarks/DesktopToolbar";
import { BookmarkTile } from "./features/bookmarks/BookmarkTile";
import type { MenuTarget } from "./features/bookmarks/BookmarkTile";
import { BookmarkMenu } from "./features/bookmarks/BookmarkMenu";
import { FolderDialog, FolderPanel } from "./features/bookmarks/FolderPanel";
import { SettingsPanel } from "./features/bookmarks/SettingsPanel";
import { DesignIcon } from "./features/bookmarks/DesignIcon";
import { wallpaper } from "./features/bookmarks/api";
import { useBookmarks } from "./features/bookmarks/useBookmarks";
import { groupBookmarks, selectBookmarks } from "./features/bookmarks/model";
import { isExtension, openBookmarkManager } from "./features/bookmarks/api";
export default function App() {
  const {
    bookmarks,
    folders,
    preferences: prefs,
    loading,
    error,
    saving,
    reload,
    updatePreferences,
  } = useBookmarks();
  const [selected, setSelected] = useState("all");
  const [sort, setSort] = useState("original");
  const [settings, setSettings] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs.theme]);
  const groups = useMemo(
    () =>
      groupBookmarks(
        selectBookmarks(bookmarks, "all", "", [], sort),
        folders,
        selected === "all" || folders.some((folder) => folder.id === selected)
          ? selected
          : "all",
      ),
    [bookmarks, folders, selected, sort],
  );
  const categories = folders.filter(
    (folder) =>
      folder.depth > 0 ||
      bookmarks.some((item) => item.folderId === folder.id) ||
      !folder.count,
  );
  const byId = useMemo(
    () => new Map(bookmarks.map((item) => [item.id, item])),
    [bookmarks],
  );
  const pinned = prefs.pins.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  const expandedGroup = groups.find((group) => group.id === expanded);
  const pin = (id: string) =>
    updatePreferences((current) => ({
      ...current,
      pins: current.pins.includes(id)
        ? current.pins.filter((pinId) => pinId !== id)
        : [...current.pins, id],
    }));
  const style = {
    "--panel-opacity": prefs.opacity / 100,
    "--pin-opacity": (prefs.opacity - 4) / 100,
    "--glass-blur": `${prefs.blur / 2}px`,
    "--wallpaper": `url("${prefs.wallpaper || wallpaper}")`,
  } as CSSProperties;
  return (
    <div className={`desktop ${prefs.compact ? "compact" : ""}`} style={style}>
      <div className="wallpaper" />
      <DesktopToolbar
        bookmarks={bookmarks}
        newTab={prefs.newTab}
        onSettings={() => setSettings(true)}
      />
      <main>
        {(prefs.showWelcome || prefs.showTime) && (
          <section className="welcome-row" aria-label="桌面概览">
            {prefs.showWelcome && (
              <div className="welcome">
                <h1>常去的地方，都在这里。</h1>
                <p>让收藏井然有序，让每次出发更轻松。</p>
              </div>
            )}
            {prefs.showTime && (
              <div className="clock">
                <time>
                  {now.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                <span>
                  {now.toLocaleDateString("zh-CN", {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </span>
              </div>
            )}
          </section>
        )}
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => void reload()}>重试</button>
          </div>
        )}
        {prefs.showPinned && !!pinned.length && (
          <section className="pinned-panel glass" aria-label="常用网站">
            <div className="pinned-grid">
              {pinned.map((item) => (
                <BookmarkTile
                  key={item.id}
                  item={item}
                  newTab={prefs.newTab}
                  onMenu={setMenu}
                />
              ))}
            </div>
          </section>
        )}
        <div className="category-row">
          <nav className="categories" aria-label="书签文件夹">
            <button
              className={selected === "all" ? "active" : ""}
              onClick={() => {
                setSelected("all");
                setLimit(20);
              }}
            >
              <DesignIcon name="imgGrid" size={20} />
              全部书签
            </button>
            {categories.map((folder) => (
              <button
                key={folder.id}
                title={folder.path}
                className={selected === folder.id ? "active" : ""}
                onClick={() => {
                  setSelected(folder.id);
                  setLimit(20);
                }}
              >
                {folder.title}
              </button>
            ))}
          </nav>
          <div className="view-controls">
            <SortControl value={sort} onChange={setSort} />
            <button
              className="glass"
              aria-label="紧凑图标"
              aria-pressed={prefs.compact}
              onClick={() => updatePreferences({ compact: !prefs.compact })}
            >
              <DesignIcon name="imgGrid" size={20} />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="page-empty glass" role="status">
            正在读取书签…
          </div>
        ) : groups.length ? (
          <>
            <div className="folder-panels" key={selected}>
              {groups.slice(0, limit).map((group) => (
                <FolderPanel
                  key={group.id}
                  group={group}
                  preferences={prefs}
                  onMenu={setMenu}
                  onOpen={() => setExpanded(group.id)}
                />
              ))}
            </div>
            {groups.length > limit && (
              <button
                className="load-more glass"
                onClick={() => setLimit(limit + 20)}
              >
                显示更多文件夹
              </button>
            )}
          </>
        ) : (
          <div className="page-empty glass">
            <DesignIcon name="imgBookmark" size={36} />
            <p>还没有书签</p>
            {isExtension && (
              <button className="text-button" onClick={openBookmarkManager}>
                管理书签
              </button>
            )}
          </div>
        )}
      </main>
      <footer className="desktop-footer">
        <span className="sync-status">
          {isExtension ? "书签已同步 · 仅在本地读取" : "示例书签 · 本地预览"}
        </span>
        <div>
          {isExtension && (
            <button onClick={openBookmarkManager}>管理书签</button>
          )}
          <span>/ 搜索 · Esc 返回</span>
        </div>
      </footer>
      {settings && (
        <SettingsPanel
          preferences={prefs}
          update={updatePreferences}
          saving={saving}
          error={error}
          onClose={() => setSettings(false)}
        />
      )}
      {expandedGroup && (
        <FolderDialog
          key={expandedGroup.id}
          group={expandedGroup}
          preferences={prefs}
          onMenu={setMenu}
          onClose={() => setExpanded(null)}
        />
      )}
      {menu && (
        <BookmarkMenu
          target={menu}
          pinned={prefs.pins.includes(menu.item.id)}
          onPin={() => pin(menu.item.id)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
