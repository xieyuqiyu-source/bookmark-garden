export interface TreeNode {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  children?: TreeNode[];
}
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  folderId: string;
  folderPath: string;
  ancestors: string[];
  dateAdded: number;
  safe: boolean;
}
export interface Folder {
  id: string;
  title: string;
  path: string;
  depth: number;
  count: number;
}
export interface Preferences {
  pins: string[];
  theme: "light" | "dark";
  compact: boolean;
  newTab: boolean;
}
export const defaults: Preferences = {
  pins: [],
  theme: "light",
  compact: false,
  newTab: true,
};
export function normalizePreferences(value: unknown): Preferences {
  const data = (
    value && typeof value === "object" ? value : {}
  ) as Partial<Preferences>;
  return {
    pins: Array.isArray(data.pins)
      ? [
          ...new Set(
            data.pins.filter((id): id is string => typeof id === "string"),
          ),
        ]
      : [],
    theme: data.theme === "dark" ? "dark" : "light",
    compact: data.compact === true,
    newTab: data.newTab !== false,
  };
}
export function flattenTree(tree: TreeNode[]) {
  const bookmarks: Bookmark[] = [],
    folders: Folder[] = [];
  function walk(nodes: TreeNode[], ancestors: string[], titles: string[]) {
    for (const node of nodes) {
      if (node.url !== undefined) {
        let domain = node.url,
          safe = false;
        try {
          const url = new URL(node.url);
          domain = url.hostname || url.protocol;
          safe = ["https:", "http:", "ftp:", "file:", "chrome:"].includes(
            url.protocol,
          );
        } catch {
          /* Keep unsupported entries visible. */
        }
        bookmarks.push({
          id: node.id,
          title: node.title.trim() || domain,
          url: node.url,
          domain: domain.replace(/^www\./, ""),
          folderId: ancestors.at(-1) || "",
          folderPath: titles.join(" / "),
          ancestors,
          dateAdded: node.dateAdded || 0,
          safe,
        });
      } else if (node.id === "0") walk(node.children || [], ancestors, titles);
      else {
        const path = [...titles, node.title || "未命名文件夹"];
        const folder = {
          id: node.id,
          title: node.title || "未命名文件夹",
          path: path.join(" / "),
          depth: ancestors.length,
          count: 0,
        };
        folders.push(folder);
        const start = bookmarks.length;
        walk(node.children || [], [...ancestors, node.id], path);
        folder.count = bookmarks.length - start;
      }
    }
  }
  walk(tree, [], []);
  return { bookmarks, folders };
}
export function selectBookmarks(
  bookmarks: Bookmark[],
  folder: string,
  query: string,
  pins: string[],
  sort: string,
) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const result = bookmarks.filter(
    (item) =>
      (folder === "all" ||
        (folder === "pinned"
          ? pins.includes(item.id)
          : item.ancestors.includes(folder))) &&
      terms.every((term) =>
        `${item.title} ${item.url} ${item.folderPath}`
          .toLocaleLowerCase()
          .includes(term),
      ),
  );
  if (sort === "title")
    result.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  if (sort === "recent") result.sort((a, b) => b.dateAdded - a.dateAdded);
  return result;
}
