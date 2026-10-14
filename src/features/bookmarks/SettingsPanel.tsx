import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { Dialog } from "../../components/Dialog";
import { wallpaper } from "./api";
import { defaults } from "./model";
import type { Preferences } from "./model";
import type { UpdatePreferences } from "./useBookmarks";
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="setting-toggle">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
      >
        <span />
      </button>
    </label>
  );
}
export function SettingsPanel({
  preferences: prefs,
  update,
  saving,
  error,
  onClose,
}: {
  preferences: Preferences;
  update: UpdatePreferences;
  saving: boolean;
  error: string;
  onClose: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  async function upload(image?: File) {
    if (!image) return;
    setUploadError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(image.type) ||
      image.size > 3 * 1024 * 1024
    ) {
      setUploadError("请选择 3 MB 以内的 JPG、PNG 或 WebP 图片。");
      return;
    }
    try {
      const bitmap = await createImageBitmap(image);
      bitmap.close();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
      update({ wallpaper: data });
    } catch {
      setUploadError("无法读取这张图片，请换一张试试。");
    }
  }
  const toggles: {
    title: string;
    options: [
      keyof Pick<
        Preferences,
        | "compact"
        | "showTime"
        | "showWelcome"
        | "showFolderPath"
        | "showPinned"
        | "newTab"
      >,
      string,
    ][];
  }[] = [
    {
      title: "桌面布局",
      options: [
        ["compact", "紧凑图标"],
        ["showTime", "显示时间"],
        ["showWelcome", "显示欢迎语"],
      ],
    },
    {
      title: "书签显示",
      options: [
        ["showFolderPath", "显示文件夹路径"],
        ["showPinned", "显示常用网站"],
      ],
    },
    { title: "使用习惯", options: [["newTab", "在新标签页打开网站"]] },
  ];
  return (
    <Dialog className="settings-panel glass" label="设置" onClose={onClose}>
      <header className="dialog-header">
        <h2>设置</h2>
        <button
          className="close-button"
          aria-label="关闭设置"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      <div className="settings-body">
        <section className="settings-section appearance-section">
          <h3>外观</h3>
          <div className="theme-card">
            <img src={prefs.wallpaper || wallpaper} alt="云屿壁纸预览" />
            <div>
              <strong>云屿</strong>
              <span>A · 玻璃桌面</span>
            </div>
            <Check size={24} />
          </div>
          <div className="appearance-actions">
            <div className="theme-switch" aria-label="配色模式">
              <button
                aria-pressed={prefs.theme === "light"}
                onClick={() => update({ theme: "light" })}
              >
                浅色
              </button>
              <button
                aria-pressed={prefs.theme === "dark"}
                onClick={() => update({ theme: "dark" })}
              >
                深色
              </button>
            </div>
            <button
              className="text-button"
              onClick={() => file.current?.click()}
            >
              更换壁纸
              <ChevronRight size={15} />
            </button>
          </div>
          <input
            ref={file}
            className="file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="选择壁纸"
            onChange={(event) => {
              void upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {prefs.wallpaper && (
            <button
              className="reset-wallpaper text-button"
              onClick={() => update({ wallpaper: "" })}
            >
              恢复云海壁纸
            </button>
          )}
          {uploadError && (
            <p role="alert" className="inline-error">
              {uploadError}
            </p>
          )}
          <label className="range-setting">
            <span>
              面板不透明度<output>{prefs.opacity}%</output>
            </span>
            <input
              aria-label="面板不透明度"
              style={
                {
                  "--range-progress": `${((prefs.opacity - 20) / 75) * 100}%`,
                } as CSSProperties
              }
              type="range"
              min="20"
              max="95"
              value={prefs.opacity}
              onChange={(event) =>
                update({ opacity: Number(event.target.value) })
              }
            />
          </label>
          <label className="range-setting">
            <span>
              玻璃模糊<output>{prefs.blur} px</output>
            </span>
            <input
              aria-label="玻璃模糊"
              style={
                {
                  "--range-progress": `${(prefs.blur / 40) * 100}%`,
                } as CSSProperties
              }
              type="range"
              min="0"
              max="40"
              value={prefs.blur}
              onChange={(event) => update({ blur: Number(event.target.value) })}
            />
          </label>
        </section>
        {toggles.map((section) => (
          <section className="settings-section" key={section.title}>
            <h3>{section.title}</h3>
            {section.options.map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                checked={prefs[key]}
                onChange={() => update({ [key]: !prefs[key] })}
              />
            ))}
          </section>
        ))}
      </div>
      <footer className="settings-footer">
        <p role="status" className={error ? "inline-error" : "save-status"}>
          {error || (saving ? "正在保存…" : "偏好已保存到此设备")}
        </p>
        <div>
          <button
            className="text-button"
            onClick={() =>
              update((current) => ({ ...defaults, pins: current.pins }))
            }
          >
            恢复默认
          </button>
          <span>Esc 关闭</span>
        </div>
      </footer>
    </Dialog>
  );
}
