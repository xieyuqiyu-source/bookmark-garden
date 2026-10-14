import { ChevronRight, Menu, Moon, Settings2, Sun, X } from "lucide-react";
import { isExtension } from "./api";
import type { Preferences } from "./model";
export function DesktopToolbar({
  effectiveSelected,
  folderTitle,
  preferences,
  saving,
  settings,
  setMenu,
  setSettings,
  updatePreferences,
}: {
  effectiveSelected: string;
  folderTitle?: string;
  preferences: Preferences;
  saving: boolean;
  settings: boolean;
  setMenu: (open: boolean) => void;
  setSettings: (open: boolean) => void;
  updatePreferences: (next: Preferences) => Promise<void>;
}) {
  return (
    <>
      <header className="topbar">
        <div className="breadcrumb">
          <button
            className="icon-button mobile-menu"
            aria-label="打开分类菜单"
            onClick={() => setMenu(true)}
          >
            <Menu size={19} />
          </button>
          <span>我的空间</span>
          <ChevronRight size={13} />
          <strong>
            {effectiveSelected === "all"
              ? "我的桌面"
              : effectiveSelected === "pinned"
                ? "固定常用"
                : folderTitle}
          </strong>
        </div>
        <div className="top-actions">
          <span className="connection">
            <i />
            {isExtension ? "本地已连接" : "演示预览"}
          </span>
          <button
            className="icon-button"
            aria-label={
              preferences.theme === "light" ? "切换深色模式" : "切换浅色模式"
            }
            disabled={saving}
            onClick={() =>
              void updatePreferences({
                ...preferences,
                theme: preferences.theme === "light" ? "dark" : "light",
              })
            }
          >
            {preferences.theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>
          <button
            className={`icon-button ${settings ? "selected" : ""}`}
            aria-label="桌面设置"
            aria-expanded={settings}
            onClick={() => setSettings(!settings)}
          >
            <Settings2 size={19} />
          </button>
        </div>
      </header>
      {settings && (
        <section className="settings-panel" aria-label="桌面设置">
          <div>
            <strong>让桌面顺手一点</strong>
            <p>偏好保存在这台设备。</p>
          </div>
          <label>
            <input
              type="checkbox"
              checked={preferences.newTab}
              disabled={saving}
              onChange={(event) =>
                void updatePreferences({
                  ...preferences,
                  newTab: event.target.checked,
                })
              }
            />
            在新标签页打开网站
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.compact}
              disabled={saving}
              onChange={(event) =>
                void updatePreferences({
                  ...preferences,
                  compact: event.target.checked,
                })
              }
            />
            紧凑图标
          </label>
          <button
            className="icon-button"
            aria-label="关闭设置"
            onClick={() => setSettings(false)}
          >
            <X size={18} />
          </button>
        </section>
      )}
    </>
  );
}
