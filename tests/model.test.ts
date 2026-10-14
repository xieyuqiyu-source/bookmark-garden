import test from "node:test";
import assert from "node:assert/strict";
import {
  flattenTree,
  selectBookmarks,
  normalizePreferences,
} from "../src/features/bookmarks/model.ts";
const tree = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "bar",
        title: "书签栏",
        children: [
          {
            id: "folder",
            title: "设计",
            children: [
              {
                id: "a",
                title: "Figma",
                url: "https://figma.com",
                dateAdded: 2,
              },
              { id: "b", title: "", url: "https://example.com", dateAdded: 1 },
              { id: "bad", title: "脚本", url: "javascript:alert(1)" },
            ],
          },
          { id: "empty", title: "空文件夹", children: [] },
        ],
      },
    ],
  },
];
test("nested folders keep ancestry and counts; empty folders survive", () => {
  const data = flattenTree(tree);
  assert.equal(data.bookmarks.length, 3);
  assert.deepEqual(data.bookmarks[0].ancestors, ["bar", "folder"]);
  assert.equal(data.folders[0].count, 3);
  assert.equal(data.folders[2].count, 0);
  assert.equal(data.bookmarks[1].title, "example.com");
});
test("blocks executable URLs without losing bookmark entries", () => {
  const { bookmarks } = flattenTree(tree);
  assert.equal(bookmarks[2].safe, false);
  assert.equal(bookmarks[0].safe, true);
  for (const url of ["data:text/html,test", "vbscript:test", "not a url"])
    assert.equal(
      flattenTree([{ id: url, title: "", url }]).bookmarks[0].safe,
      false,
    );
});
test("search combines folder, title, domain terms and scopes", () => {
  const { bookmarks } = flattenTree(tree);
  assert.equal(
    selectBookmarks(bookmarks, "bar", "设计 FIGMA", [], "original")[0].id,
    "a",
  );
  assert.equal(
    selectBookmarks(bookmarks, "empty", "", [], "original").length,
    0,
  );
  assert.equal(
    selectBookmarks(bookmarks, "pinned", "", ["b", "deleted"], "original")[0]
      .id,
    "b",
  );
  assert.equal(
    selectBookmarks(bookmarks, "all", "missing", [], "original").length,
    0,
  );
});
test("sorting does not mutate bookmark tree order", () => {
  const { bookmarks } = flattenTree(tree);
  assert.deepEqual(
    selectBookmarks(bookmarks, "all", "", [], "recent").map((item) => item.id),
    ["a", "b", "bad"],
  );
  assert.equal(bookmarks[0].id, "a");
});
test("preferences tolerate invalid stored data", () => {
  assert.deepEqual(
    normalizePreferences({
      pins: ["a", 3, "a"],
      theme: "unknown",
      compact: "true",
      newTab: false,
    }),
    { pins: ["a"], theme: "light", compact: false, newTab: false },
  );
  assert.equal(normalizePreferences(null).newTab, true);
});
test("large trees retain every entry", () => {
  const data = flattenTree([
    {
      id: "0",
      title: "",
      children: Array.from({ length: 5000 }, (_, index) => ({
        id: String(index + 1),
        title: `站点${index}`,
        url: `https://example.com/${index}`,
      })),
    },
  ]);
  assert.equal(data.bookmarks.length, 5000);
});
