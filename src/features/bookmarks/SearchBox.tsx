import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { DesignIcon, SiteIcon } from "./DesignIcon";
import { selectBookmarks } from "./model";
import type { Bookmark } from "./model";
export function SearchBox({
  bookmarks,
  newTab,
}: {
  bookmarks: Bookmark[];
  newTab: boolean;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [limit, setLimit] = useState(120);
  const input = useRef<HTMLInputElement>(null);
  const results = selectBookmarks(bookmarks, "all", query, [], "original");
  const open = focused && !!query.trim();
  const visible = results.slice(0, limit);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const typing =
        event.target instanceof HTMLElement &&
        (event.target.matches("input,textarea,select") ||
          event.target.isContentEditable);
      if (
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      {open && (
        <div className="search-scrim" onClick={() => setFocused(false)} />
      )}
      <div
        className={`search-box ${open ? "search-open" : ""}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <div className="search-input-wrap glass">
          <DesignIcon name="imgSearch" size={23} />
          <input
            ref={input}
            type="search"
            placeholder="搜索书签、网址或文件夹"
            aria-label="搜索书签"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? "search-results" : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              open && visible[active]
                ? `result-${visible[active].id}`
                : undefined
            }
            value={query}
            onFocus={() => setFocused(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setLimit(120);
              setFocused(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setFocused(false);
                input.current?.blur();
              }
              if (
                open &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
              ) {
                event.preventDefault();
                const next = Math.max(
                  0,
                  Math.min(
                    visible.length - 1,
                    active + (event.key === "ArrowDown" ? 1 : -1),
                  ),
                );
                setActive(next);
                document
                  .getElementById(`result-${visible[next]?.id}`)
                  ?.scrollIntoView({ block: "nearest" });
              }
              if (open && event.key === "Enter") {
                event.preventDefault();
                document
                  .getElementById(`result-${visible[active]?.id}`)
                  ?.querySelector("a")
                  ?.click();
              }
            }}
          />
          {query ? (
            <button
              className="icon-button search-clear"
              aria-label="清空搜索"
              onClick={() => {
                setQuery("");
                setActive(0);
                input.current?.focus();
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <kbd>⌘ K</kbd>
          )}
        </div>
        {open && (
          <div className="search-popover glass">
            {results.length ? (
              <>
                <div className="search-count" role="status">
                  {results.length} 个结果
                </div>
                <ul
                  id="search-results"
                  role="listbox"
                  aria-label="书签搜索结果"
                >
                  {visible.map((item, index) => (
                    <li
                      id={`result-${item.id}`}
                      key={item.id}
                      role="option"
                      aria-selected={active === index}
                      onMouseEnter={() => setActive(index)}
                    >
                      <a
                        href={item.safe ? item.url : undefined}
                        aria-disabled={!item.safe}
                        target={newTab ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        tabIndex={-1}
                        onClick={() => {
                          if (item.safe) setFocused(false);
                        }}
                      >
                        <SiteIcon item={item} />
                        <span className="result-text">
                          <strong>{item.title}</strong>
                          <span>{item.folderPath || "未分类"}</span>
                        </span>
                        <span className="result-domain">{item.domain}</span>
                        <ArrowUpRight size={16} className="result-arrow" />
                      </a>
                    </li>
                  ))}
                </ul>
                {results.length > limit && (
                  <button
                    className="load-more"
                    onClick={() => setLimit(limit + 120)}
                  >
                    显示更多
                  </button>
                )}
              </>
            ) : (
              <div
                id="search-results"
                role="listbox"
                aria-label="书签搜索结果"
                className="search-empty"
              >
                <span className="empty-icon">
                  <DesignIcon name="imgSearch" size={26} />
                </span>
                <p role="status">未找到书签</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
