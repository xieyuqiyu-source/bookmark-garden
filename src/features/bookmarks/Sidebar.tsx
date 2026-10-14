import {
  ArrowUpRight,
  Bookmark,
  Folder as FolderIcon,
  HardDrive,
  LayoutGrid,
  Pin,
} from "lucide-react";
import { isExtension, openBookmarkManager } from "./api";
import type { Folder } from "./model";
export function Sidebar({
  menu,
  effectiveSelected,
  bookmarkCount,
  pinnedCount,
  folders,
  choose,
}: {
  menu: boolean;
  effectiveSelected: string;
  bookmarkCount: number;
  pinnedCount: number;
  folders: Folder[];
  choose: (id: string) => void;
}) {
  return (
    <aside className={`sidebar ${menu ? "open" : ""}`} aria-label="书签分类">
      <button
        className="brand"
        onClick={() => choose("all")}
        aria-label="栖页首页"
      >
        <span className="brand-mark">
          <Bookmark size={23} strokeWidth={1.8} />
        </span>
        <span>
          栖页<small>给收藏一个家</small>
        </span>
      </button>
      <nav>
        <button
          className={`nav-item ${effectiveSelected === "all" ? "active" : ""}`}
          onClick={() => choose("all")}
        >
          <LayoutGrid size={18} />
          <span>我的桌面</span>
          <small>{bookmarkCount}</small>
        </button>
        <button
          className={`nav-item ${effectiveSelected === "pinned" ? "active" : ""}`}
          onClick={() => choose("pinned")}
        >
          <Pin size={18} />
          <span>固定常用</span>
          {pinnedCount > 0 && <small>{pinnedCount}</small>}
        </button>
        <div className="nav-caption">
          书签文件夹<span>{folders.length}</span>
        </div>
        <div className="folder-nav">
          {folders.map((folder) => (
            <button
              key={folder.id}
              title={folder.path}
              className={`nav-item folder-item ${effectiveSelected === folder.id ? "active" : ""}`}
              style={{ paddingLeft: 14 + Math.min(folder.depth, 4) * 12 }}
              onClick={() => choose(folder.id)}
            >
              <FolderIcon size={17} />
              <span>{folder.title}</span>
              <small>{folder.count}</small>
            </button>
          ))}
        </div>
      </nav>
      <div className="sidebar-bottom">
        <div className="local-note">
          <HardDrive size={16} />
          <span>
            {isExtension ? "与 Chrome 书签实时连接" : "正在浏览示例书签"}
          </span>
        </div>
        <button
          className="manager-button"
          onClick={openBookmarkManager}
          disabled={!isExtension}
        >
          管理 Chrome 书签
          <ArrowUpRight size={15} />
        </button>
      </div>
    </aside>
  );
}
