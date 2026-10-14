import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Folder,
  Grid2X2,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { BookmarkTile } from "./features/bookmarks/BookmarkTile";
import { isExtension } from "./features/bookmarks/api";
import { selectBookmarks } from "./features/bookmarks/model";
import { useBookmarks } from "./features/bookmarks/useBookmarks";
import { Sidebar } from "./features/bookmarks/Sidebar";
import { DesktopToolbar } from "./features/bookmarks/DesktopToolbar";
const PAGE_SIZE = 120;
export default function App() {
  const {
    bookmarks,
    folders,
    preferences,
    loading,
    error,
    saving,
    reload,
    updatePreferences,
  } = useBookmarks();
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("original");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [settings, setSettings] = useState(false);
  const [menu, setMenu] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const input = useRef<HTMLInputElement>(null);
  const currentFolder = folders.find((folder) => folder.id === selected);
  const effectiveSelected =
    selected === "pinned" || selected === "all" || currentFolder
      ? selected
      : "all";
  const filtered = useMemo(
    () =>
      selectBookmarks(
        bookmarks,
        effectiveSelected,
        query,
        preferences.pins,
        sort,
      ),
    [bookmarks, effectiveSelected, query, preferences.pins, sort],
  );
  const displayed = filtered.slice(0, limit);
  const groups = useMemo(() => {
    const result: { id: string; title: string; items: typeof bookmarks }[] = [];
    if (query || sort !== "original" || effectiveSelected === "pinned")
      return [
        {
          id: "results",
          title: query
            ? "搜索结果"
            : effectiveSelected === "pinned"
              ? "一键到达你的常用网站"
              : "全部网站",
          items: displayed,
        },
      ];
    for (const item of displayed) {
      let group = result.find((group) => group.id === item.folderId);
      if (!group) {
        group = {
          id: item.folderId,
          title: item.folderPath || "未分类书签",
          items: [],
        };
        result.push(group);
      }
      group.items.push(item);
    }
    return result;
  }, [displayed, effectiveSelected, query, sort]);
  const pinnedCount = bookmarks.filter((item) =>
    preferences.pins.includes(item.id),
  ).length;
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    function keydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        (event.key === "/" &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === "Escape") {
        setQuery("");
        setSettings(false);
        setMenu(false);
        input.current?.blur();
      }
    }
    window.addEventListener("keydown", keydown);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", keydown);
    };
  }, []);
  function choose(id: string) {
    setSelected(id);
    setQuery("");
    setLimit(PAGE_SIZE);
    setMenu(false);
  }
  function pin(id: string) {
    void updatePreferences({
      ...preferences,
      pins: preferences.pins.includes(id)
        ? preferences.pins.filter((pin) => pin !== id)
        : [...preferences.pins, id],
    });
  }
  const hour = now.getHours();
  const greeting =
    hour < 6
      ? "夜深了，慢慢来。"
      : hour < 12
        ? "早上好，从这里出发。"
        : hour < 18
          ? "下午好，从这里出发。"
          : "晚上好，留一点好时光。";
  return (
    <div
      className={`app ${preferences.theme} ${preferences.compact ? "compact" : ""}`}
    >
      <a className="skip-link" href="#main">
        跳到书签
      </a>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="关闭分类菜单"
          onClick={() => setMenu(false)}
        />
      )}
      <Sidebar
        menu={menu}
        effectiveSelected={effectiveSelected}
        bookmarkCount={bookmarks.length}
        pinnedCount={pinnedCount}
        folders={folders}
        choose={choose}
      />
      <main id="main" className="workspace">
        <DesktopToolbar
          effectiveSelected={effectiveSelected}
          folderTitle={currentFolder?.title}
          preferences={preferences}
          saving={saving}
          settings={settings}
          setMenu={setMenu}
          setSettings={setSettings}
          updatePreferences={updatePreferences}
        />
        <div className="content">
          <section className="welcome">
            <div>
              <p className="date">
                {now.toLocaleDateString("zh-CN", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
              <h1>{greeting}</h1>
              <p className="intro">常去的地方，都在眼前。</p>
            </div>
            <time className="clock" dateTime={now.toISOString()}>
              {now.toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              <span>享受专注的此刻</span>
            </time>
          </section>
          <div className="search-box">
            <Search size={21} />
            <input
              ref={input}
              aria-label="搜索书签"
              placeholder="搜索书签、网址或文件夹…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            />
            <button
              className="search-shortcut"
              aria-label={query ? "清除搜索" : "聚焦搜索"}
              onClick={() => (query ? setQuery("") : input.current?.focus())}
            >
              {query ? <X size={16} /> : "/"}
            </button>
          </div>
          {!isExtension && (
            <div className="preview-note">
              <span>
                这是示例桌面。安装扩展后，这里会自动换成你的 Chrome 书签。
              </span>
              <a href="./安装指南.html" target="_blank" rel="noreferrer">
                安装指南
                <ArrowUpRight size={13} />
              </a>
            </div>
          )}
          <div className="section-toolbar">
            <div>
              <h2>
                {query
                  ? "找到你的收藏"
                  : effectiveSelected === "all"
                    ? "我的桌面"
                    : effectiveSelected === "pinned"
                      ? "固定常用"
                      : currentFolder?.title}
              </h2>
              <span aria-live="polite">{filtered.length} 个书签</span>
            </div>
            <div className="view-controls">
              <SlidersHorizontal size={15} />
              <label className="sr-only" htmlFor="sort">
                排序方式
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setLimit(PAGE_SIZE);
                }}
              >
                <option value="original">书签顺序</option>
                <option value="title">按名称排序</option>
                <option value="recent">最近添加</option>
              </select>
              <span className="control-divider" />
              <button
                className="icon-button"
                disabled={saving}
                aria-label={preferences.compact ? "切换大图标" : "切换紧凑图标"}
                onClick={() =>
                  void updatePreferences({
                    ...preferences,
                    compact: !preferences.compact,
                  })
                }
              >
                {preferences.compact ? (
                  <LayoutGrid size={17} />
                ) : (
                  <Grid2X2 size={17} />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="error-state" role="alert">
              {error}
              <button onClick={() => void reload()}>重试读取</button>
            </div>
          )}
          {loading ? (
            <div className="empty-state" role="status">
              正在铺开你的书签…
            </div>
          ) : !filtered.length ? (
            <div className="empty-state">
              <span className="empty-icon">
                {query ? <Search size={28} /> : <Bookmark size={28} />}
              </span>
              <h3>
                {query
                  ? "还没找到这个收藏"
                  : effectiveSelected === "pinned"
                    ? "把常去的地方，放在一起。"
                    : "这里还是一张空白桌面"}
              </h3>
              <p>
                {query
                  ? "试试网站名称、网址，或者文件夹里的关键词。"
                  : effectiveSelected === "pinned"
                    ? "点击网站右上角的图钉，就能固定到这里。"
                    : "在 Chrome 中添加书签，栖页就会自动显示。"}
              </p>
              {query && (
                <button className="text-button" onClick={() => setQuery("")}>
                  清除搜索
                </button>
              )}
            </div>
          ) : (
            <div className="bookmark-sections">
              {groups.map((group) => (
                <section className="bookmark-section" key={group.id}>
                  <div className="group-heading">
                    <Folder size={15} />
                    <h3>{group.title}</h3>
                    <span>{group.items.length}</span>
                    <div />
                  </div>
                  <div className="bookmark-grid">
                    {group.items.map((item) => (
                      <BookmarkTile
                        key={item.id}
                        item={item}
                        pinned={preferences.pins.includes(item.id)}
                        newTab={preferences.newTab}
                        disabled={saving}
                        onPin={() => pin(item.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {filtered.length > limit && (
            <button
              className="load-more"
              onClick={() => setLimit(limit + PAGE_SIZE)}
            >
              再显示 {Math.min(PAGE_SIZE, filtered.length - limit)} 个书签
            </button>
          )}
          <footer>
            <span>
              <Check size={13} />
              {isExtension
                ? "书签在本地读取，偏好在本地保存"
                : "演示数据 · 安装后自动读取真实书签"}
            </span>
            <span>少一点寻找，多一点发现。</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
