import type { TreeNode } from "./model";
// Preview-only public sample data; never substituted for a failed Chrome API call.
const groups = [
  [
    "每日常用",
    [
      ["GitHub", "https://github.com"],
      ["Notion", "https://notion.so"],
      ["Gmail", "https://mail.google.com"],
      ["Google 日历", "https://calendar.google.com"],
      ["Figma", "https://figma.com"],
      ["YouTube", "https://youtube.com"],
    ],
  ],
  [
    "灵感与设计",
    [
      ["Dribbble", "https://dribbble.com"],
      ["Behance", "https://behance.net"],
      ["Pinterest", "https://pinterest.com"],
      ["Are.na", "https://are.na"],
      ["Unsplash", "https://unsplash.com"],
      ["Awwwards", "https://awwwards.com"],
    ],
  ],
  [
    "开发工具",
    [
      ["MDN Web Docs", "https://developer.mozilla.org"],
      ["Vercel", "https://vercel.com"],
      ["Stack Overflow", "https://stackoverflow.com"],
      ["CodePen", "https://codepen.io"],
      ["npm", "https://npmjs.com"],
      ["TypeScript", "https://typescriptlang.org"],
    ],
  ],
  [
    "阅读与生活",
    [
      ["少数派", "https://sspai.com"],
      ["豆瓣", "https://douban.com"],
      ["Wikipedia", "https://wikipedia.org"],
      ["哔哩哔哩", "https://bilibili.com"],
      ["即刻", "https://okjike.com"],
      ["国家地理", "https://nationalgeographic.com"],
    ],
  ],
] as const;
export const demoTree: TreeNode[] = [
  {
    id: "0",
    title: "",
    children: [
      {
        id: "1",
        title: "书签栏",
        children: groups.map(([title, links], index) => ({
          id: `folder-${index}`,
          title,
          children: links.map(([name, url], j) => ({
            id: `demo-${index}-${j}`,
            title: name,
            url,
            dateAdded: 1700000000000 + index * 100 + j,
          })),
        })),
      },
    ],
  },
];
