import { demoTree, demoPins } from "./demo";
import { defaults, normalizePreferences } from "./model";
import type { Preferences, TreeNode } from "./model";
export const isExtension =
  typeof chrome !== "undefined" && !!chrome.runtime?.id;
export async function readBookmarks(): Promise<TreeNode[]> {
  return isExtension ? chrome.bookmarks.getTree() : demoTree;
}
export async function readPreferences(): Promise<Preferences> {
  if (isExtension)
    return normalizePreferences(
      (await chrome.storage.local.get("preferences")).preferences,
    );
  const stored = localStorage.getItem("qiye-preview");
  return stored
    ? normalizePreferences(JSON.parse(stored))
    : { ...defaults, pins: demoPins };
}
export async function writePreferences(preferences: Preferences) {
  if (isExtension) await chrome.storage.local.set({ preferences });
  else localStorage.setItem("qiye-preview", JSON.stringify(preferences));
}
export function subscribeBookmarks(callback: () => void) {
  if (!isExtension) return () => {};
  const events = [
    chrome.bookmarks.onCreated,
    chrome.bookmarks.onRemoved,
    chrome.bookmarks.onChanged,
    chrome.bookmarks.onMoved,
    chrome.bookmarks.onChildrenReordered,
    chrome.bookmarks.onImportEnded,
  ];
  events.forEach((event) => event.addListener(callback));
  return () => events.forEach((event) => event.removeListener(callback));
}
export function subscribePreferences(callback: (value: Preferences) => void) {
  if (!isExtension) return () => {};
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ) => {
    if (area === "local" && changes.preferences)
      callback(normalizePreferences(changes.preferences.newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
export function faviconUrl(url: string) {
  if (!isExtension) return undefined;
  const icon = new URL(chrome.runtime.getURL("/_favicon/"));
  icon.searchParams.set("pageUrl", url);
  icon.searchParams.set("size", "64");
  return icon.href;
}
export function openBookmarkManager() {
  if (isExtension) void chrome.tabs.create({ url: "chrome://bookmarks/" });
}
