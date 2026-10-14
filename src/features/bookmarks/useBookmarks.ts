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
export type UpdatePreferences = (
  change: Partial<Preferences> | ((current: Preferences) => Preferences),
) => void;
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
  const current = useRef(defaults);
  const confirmed = useRef(defaults);
  const pending = useRef(0);
  const queue = useRef(Promise.resolve());
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
    let active = true;
    // Read the browser bookmark tree after mounting.
    // eslint-disable-next-line react/set-state-in-effect
    void reload();
    const accept = (value: Preferences) => {
      if (!active || pending.current) return;
      current.current = confirmed.current = value;
      setPreferences(value);
    };
    void readPreferences()
      .then(accept)
      .catch(() => {
        if (active) setError("偏好设置读取失败，暂时使用默认设置。");
      });
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = subscribeBookmarks(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void reload(), 120);
    });
    const unPrefs = subscribePreferences(accept);
    return () => {
      active = false;
      // This ref is a request generation counter, not a DOM node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      clearTimeout(timer);
      unsubscribe();
      unPrefs();
    };
  }, [reload]);
  const updatePreferences: UpdatePreferences = (change) => {
    const next =
      typeof change === "function"
        ? change(current.current)
        : { ...current.current, ...change };
    current.current = next;
    setPreferences(next);
    setSaving(true);
    pending.current++;
    // Serialize writes so a slower slider update cannot overwrite a newer pin or toggle.
    queue.current = queue.current.then(async () => {
      try {
        await writePreferences(next);
        confirmed.current = next;
        setError("");
      } catch {
        setError("设置保存失败，请检查浏览器存储空间后重试。");
        if (pending.current === 1) {
          current.current = confirmed.current;
          setPreferences(confirmed.current);
        }
      } finally {
        pending.current--;
        if (!pending.current) setSaving(false);
      }
    });
  };
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
