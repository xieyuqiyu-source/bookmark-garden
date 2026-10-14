import type { TreeNode } from "./model";
// Preview-only public sample data; never substituted for a failed Chrome API call.
const groups = [
  [
    "工作与效率",
    [
      ["Notion", "https://notion.so"],
      ["Gmail", "https://mail.google.com"],
      ["Google 日历", "https://calendar.google.com"],
      ["飞书", "https://feishu.cn"],
      ["Slack", "https://slack.com"],
      ["腾讯文档", "https://docs.qq.com"],
      ["Dropbox", "https://dropbox.com"],
      ["Todoist", "https://todoist.com"],
    ],
  ],
  [
    "设计与灵感",
    [
      ["Figma", "https://figma.com"],
      ["Dribbble", "https://dribbble.com"],
      ["Behance", "https://behance.net"],
      ["Pinterest", "https://pinterest.com"],
      ["Unsplash", "https://unsplash.com"],
      ["Are.na", "https://are.na"],
      ["Awwwards", "https://awwwards.com"],
      ["花瓣", "https://huaban.com"],
    ],
  ],
  [
    "开发工具",
    [
      ["GitHub", "https://github.com"],
      ["Vercel", "https://vercel.com"],
      ["MDN", "https://developer.mozilla.org"],
      ["CodePen", "https://codepen.io"],
      ["npm", "https://npmjs.com"],
      ["TypeScript", "https://typescriptlang.org"],
      ["Stack Overflow", "https://stackoverflow.com"],
      ["Cloudflare", "https://cloudflare.com"],
    ],
  ],
  [
    "阅读与生活",
    [
      ["少数派", "https://sspai.com"],
      ["知乎", "https://zhihu.com"],
      ["豆瓣", "https://douban.com"],
      ["哔哩哔哩", "https://bilibili.com"],
      ["Wikipedia", "https://wikipedia.org"],
      ["即刻", "https://okjike.com"],
      ["微信读书", "https://weread.qq.com"],
      ["国家地理", "https://nationalgeographic.com"],
    ],
  ],
] as const;
export const demoPins = [
  "demo-2-0",
  "demo-1-0",
  "demo-0-0",
  "demo-0-1",
  "demo-chatgpt",
  "demo-youtube",
  "demo-2-1",
  "demo-3-0",
];
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
          children: [
            ...links.map(([name, url], j) => ({
              id: `demo-${index}-${j}`,
              title: name,
              url,
              dateAdded: 1700000000000 + index * 100 + j,
            })),
            ...(index === 0
              ? [
                  {
                    id: "demo-chatgpt",
                    title: "ChatGPT",
                    url: "https://chatgpt.com",
                  },
                  {
                    id: "demo-youtube",
                    title: "YouTube",
                    url: "https://youtube.com",
                  },
                ]
              : []),
          ],
        })),
      },
    ],
  },
];
