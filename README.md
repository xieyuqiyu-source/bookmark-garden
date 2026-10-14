# 栖页 · 书签启动台

把拥挤的 Chrome 书签栏变成一张清爽的导航桌面。打开新标签页，用大图标启动常去的网站；不用手动导入，不需要账号或服务器。

![桌面预览](docs/preview.png)

## 仓库与设计

- 公开仓库：https://github.com/xieyuqiyu-source/bookmark-garden
- [已确认的 A 云屿设计](https://www.figma.com/design/acfysADpxG5pFDfadqOUSc?node-id=2-16)
- 当前初始提交保留已可运行的版本；接下来按 Figma 实现云海玻璃桌面、设置侧栏、搜索浮层和书签菜单。

## 已实现功能

- **自动读取书签**：首次打开读取当前 Chrome 配置的完整书签树；新增、删除、重命名、移动、重排、导入后自动更新。
- **文件夹导航**：保留原始文件夹层级，点击父文件夹可浏览所有后代书签，支持空文件夹。
- **本地搜索**：按标题、网址和完整文件夹路径搜索；空格分隔的关键词需要同时匹配。搜索范围为当前分类。
- **桌面启动台**：大图标网格、Chrome 网站图标、文字图标回退；标题过长时截断，悬停显示完整名称及网址。
- **固定常用**：图钉将书签加入“固定常用”；只保存书签 ID，不移动原始书签。同一浏览器配置的其他栖页标签会同步更新偏好。
- **外观偏好**：浅色/深色、标准/紧凑图标，是否在新标签打开网站；偏好保存在本机。
- **排序与分页**：原始书签顺序、名称、最近添加；首次最多渲染 120 条，点击按需加载下一批。
- **键盘操作**：`/` 或 `⌘/Ctrl + K` 聚焦搜索，`Esc` 清空搜索并关闭设置/分类菜单；支持 Tab 导航、焦点样式和减少动态效果设置。
- **普通网页预览**：非扩展环境显示明确标注的公共示例，不读取个人数据。

## 安装：无需运行开发服务器

1. 打开 Chrome，在地址栏输入 `chrome://extensions/`。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目的 **`dist` 文件夹**：
   从源码安装前，请先按下面的开发步骤运行 `pnpm install && pnpm build`。
5. 打开新标签页。如果 Chrome 询问是否保留新标签页更改，选择保留。

也可以使用 `releases/qiye-1.0.0.zip`：先解压，再加载包含 `manifest.json` 的解压目录。Chrome 不支持直接把 ZIP 当作已解压扩展加载。安装后不要移动或删除所加载的文件夹。

工具栏上的栖页图标也可以打开导航桌面。

### 打开 Chrome 就进入栖页

在 Chrome **设置 → 启动时 → 打开新标签页**。若选择“继续浏览上次打开的网页”或指定启动页，Chrome 会保留该行为；扩展不会擅自修改启动设置。

可用 macOS 的 `⌘ + Shift + B` 或 Windows/Linux 的 `Ctrl + Shift + B` 切换书签栏显示。

### 更新或卸载

更新：重新执行构建，或替换安装文件；在扩展管理页点击栖页的刷新按钮，再打开新标签页。

卸载：在扩展管理页点击“移除”。原始书签完全不受影响；扩展的本地偏好可能被 Chrome 清除。

## 本地数据与权限

无后端、无登录、无分析统计、无第三方图标服务、无远程字体或脚本。书签索引只在页面内存中构建；偏好保存到 `chrome.storage.local`。普通预览模式使用独立的 `localStorage` 键，不与扩展共享偏好。

| 权限 | 用途 |
| --- | --- |
| `bookmarks` | 读取书签树和监听变化。Chrome 授权提示可能包含修改能力，但项目不调用书签创建/删除/移动接口。 |
| `storage` | 保存固定列表、主题、密度和打开方式。 |
| `favicon` | 使用 Chrome 内置 favicon 接口显示站点图标。 |

没有站点 host 权限、浏览历史权限或标签内容读取权限。点击网站后才正常导航到目标网址。`chrome.tabs.create` 用于打开扩展页和原生书签管理器，不需要 `tabs` 权限。

扩展不会主动把书签发送给任何服务。Chrome 自身的账号书签同步及图标缓存策略由浏览器管理。扩展偏好不跨设备同步。

## 开发

推荐 Node.js 22.18+（本次验证为 24.12）、pnpm 10+。

```bash
pnpm install
pnpm dev --host 127.0.0.1 --port 5177
pnpm test
pnpm lint
pnpm build
```

开发预览：`http://127.0.0.1:5177`，显示示例书签。

生产扩展：`pnpm build` 生成 `dist/`，直接由 Chrome 本地加载，**运行扩展不依赖 Node.js 或开发服务器**。

生成 ZIP：

```bash
mkdir -p releases
(cd dist && zip -r ../releases/qiye-1.0.0.zip .)
```

## 项目结构

```text
src/
  App.tsx                         页面结构、分类、搜索、设置面板
  index.css                       主题、桌面布局、响应式样式
  features/bookmarks/
    api.ts                        Chrome 读取/监听/偏好 API 与演示适配
    model.ts                      树扁平化、搜索排序、协议和偏好校验
    useBookmarks.ts               数据加载、更新监听、错误及保存状态
    BookmarkTile.tsx              网站入口、图标、固定按钮
    Sidebar.tsx                   文件夹与快捷分类
    DesktopToolbar.tsx            顶部导航与偏好设置
    demo.ts                       公共示例书签
public/
  manifest.json                   Manifest V3 与最小权限
  background.js                   工具栏按钮打开导航页
  icons/                          扩展图标
  安装指南.html / guide.css        离线安装帮助
artifacts/                        界面验证截图
releases/                         可解压安装包
tests/                            数据逻辑测试及浏览器验证清单
```

## 验证情况

- 6 项自动测试：嵌套文件夹/空文件夹、危险协议保留但禁用、组合搜索和分类过滤、排序、异常偏好数据、5000 条书签完整性。
- TypeScript 构建和 oxlint 检查通过。
- Playwright 检查 1440px 桌面和 390px 窄屏：无横向溢出；搜索、清空、固定/取消、刷新持久化、深浅色、密度、打开方式、排序、快捷键及窄屏分类交互通过。
- 在**临时独立 Chrome for Testing 配置**实际加载生产扩展：读取测试书签、新标签覆盖、新增/改名/移动/删除实时刷新、跨标签偏好变化、安全协议和 120 条分页均已验证；无页面 JavaScript 错误。
- 验证不访问个人浏览器配置；仍需在你常用的 Chrome 中按上述步骤安装。

## 已知边界

- 按现有文件夹整合，未实现 AI 内容分类、拖拽修改原始书签、跨设备同步偏好。
- 空缺的网站图标由 Chrome 可能返回通用图标；加载失败则回退为标题首字。普通网页演示始终使用首字图标。
- `javascript:`、`data:` 等可执行链接保留可见但禁止打开。`file:` 和浏览器内部页面能否导航还受 Chrome 自身安全策略限制。
- 多个扩展同时接管新标签页可能冲突；保留一个新标签页扩展即可。
- Chrome 隐身窗口不能被此扩展接管新标签页；企业策略也可能限制扩展安装或权限。
- 上千条书签按需展示；尚未对数十万条书签做性能验证。
- 本版本为本地加载包，尚未发布 Chrome 应用商店。

## 官方资料

- [Chrome 书签 API](https://developer.chrome.com/docs/extensions/reference/api/bookmarks)
- [覆盖新标签页](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
- [Chrome favicon 接口](https://developer.chrome.com/docs/extensions/how-to/ui/favicons)
