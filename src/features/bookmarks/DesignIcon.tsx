import { useState } from "react";
import { faviconUrl, isExtension } from "./api";
import type { Bookmark } from "./model";
export const wallpaper = "./assets/main/img.png";
export function DesignIcon({
  name,
  size = 22,
}: {
  name: string;
  size?: number;
}) {
  return (
    <img
      className="design-icon"
      src={`./assets/main/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
const samples: Record<string, string> = {
  "github.com": "imgGitHub.svg",
  "figma.com": "imgFigma.svg",
  "notion.so": "imgNotion.svg",
  "mail.google.com": "imgGmail.svg",
  "chatgpt.com": "imgChatGpt.svg",
  "youtube.com": "imgYouTube.svg",
  "vercel.com": "imgVercel.svg",
  "sspai.com": "img1.png",
  "calendar.google.com": "calendar.svg",
  "feishu.cn": "img3.png",
  "slack.com": "imgSlack.svg",
  "docs.qq.com": "img4.png",
  "dropbox.com": "imgDropbox.svg",
  "todoist.com": "imgTodoist.svg",
  "dribbble.com": "imgDribbble.svg",
  "behance.net": "imgBehance.svg",
  "pinterest.com": "imgPinterest.svg",
  "unsplash.com": "imgUnsplash.svg",
  "are.na": "imgAreNa.png",
  "awwwards.com": "imgAwwwards.svg",
  "huaban.com": "img5.png",
  "developer.mozilla.org": "imgMdn.svg",
  "codepen.io": "imgCodePen.svg",
  "npmjs.com": "imgNpm.svg",
  "typescriptlang.org": "imgTypeScript.svg",
  "stackoverflow.com": "imgStackOverflow.svg",
  "cloudflare.com": "imgCloudflare.svg",
  "zhihu.com": "img6.svg",
  "douban.com": "img7.svg",
  "bilibili.com": "img8.svg",
  "wikipedia.org": "imgWikipedia.svg",
  "okjike.com": "img9.png",
  "weread.qq.com": "img10.png",
  "nationalgeographic.com": "img11.png",
};
export function SiteIcon({ item }: { item: Bookmark }) {
  const [failed, setFailed] = useState<string>();
  const source = isExtension
    ? faviconUrl(item.url)
    : samples[item.domain]
      ? `./assets/main/${samples[item.domain]}`
      : undefined;
  return (
    <span className="site-icon" aria-hidden="true">
      {source && failed !== source ? (
        <img
          src={source}
          alt=""
          draggable="false"
          onError={() => setFailed(source)}
        />
      ) : (
        <span className="site-initial">
          {Array.from(item.title)[0]?.toUpperCase() || "?"}
        </span>
      )}
    </span>
  );
}
