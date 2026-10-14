import { useCallback, useEffect, useRef, useState } from "react";
import {
  readBookmarks,
  readPreferences,
  writePreferences,
  subscribeBookmarks,
  subscribePreferences,
} from "./api";
import { defaults, flattenTree } from "./model";
import type { Preferences } from "./model";
export function useBookmarks() {
  const [data, setData] = useState<ReturnType<typeof flattenTree>>({
    bookmarks: [],
    folders: [],
  });
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const version = ++request.current;
    try {
      const tree = await readBookmarks();
      if (version === request.current) {
        setData(flattenTree(tree));
        setError("");
      }
    } catch {
      if (version === request.current)
        setError("书签读取失败，请重新加载扩展后重试。");
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Synchronize external Chrome data after mounting.
    // eslint-disable-next-line react/set-state-in-effect
    void reload();
    void readPreferences()
      .then(setPreferences)
      .catch(() => setError("偏好设置读取失败，暂时使用默认设置。"));
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = subscribeBookmarks(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void reload(), 120);
    });
    const unPrefs = subscribePreferences(setPreferences);
    // Invalidate in-flight requests; this ref is a generation counter, not a DOM node.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      clearTimeout(timer);
      unsubscribe();
      unPrefs();
    };
  }, [reload]);
  async function updatePreferences(next: Preferences) {
    setSaving(true);
    try {
      await writePreferences(next);
      setPreferences(next);
      setError("");
    } catch {
      setError("设置保存失败，请检查浏览器存储空间后重试。");
    } finally {
      setSaving(false);
    }
  }
  return {
    ...data,
    preferences,
    loading,
    error,
    saving,
    reload,
    updatePreferences,
  };
}
