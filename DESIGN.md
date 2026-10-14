---
name: 栖页 · 书签启动台
description: 本地书签的大图标桌面
colors:
  bg: "#f7f8f5"
  surface: "#fff"
  sidebar: "#eef1ec"
  text: "#29382e"
  muted: "#67746b"
  line: "#e0e5de"
  accent: "#355f46"
  active: "#dce6da"
  hover: "#eaf0e7"
  dark-bg: "#171e1b"
  dark-surface: "#202a24"
  dark-sidebar: "#1c2620"
  dark-text: "#e2e9e0"
  dark-muted: "#a1b1a6"
  dark-line: "#354239"
  dark-accent: "#acd2b3"
  dark-active: "#344d3b"
  dark-hover: "#2b382f"
  sage: "#e1e8db"
  blue: "#dce9f6"
  rose: "#f5e0e4"
  sand: "#f4e9cc"
  lavender: "#e7e1f6"
  mint: "#d9eee5"
typography:
  display:
    fontFamily: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif'
    fontSize: "clamp(24px,2.6vw,36px)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-.035em"
  clock:
    fontSize: "42px"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-2px"
  title:
    fontSize: "17px"
    fontWeight: 600
  body:
    fontFamily: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif'
    fontSize: "14px"
    fontWeight: 400
  bookmark-label:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
  metadata:
    fontSize: "9px"
rounded:
  control: "8px"
  navigation: "9px"
  tile: "14px"
  icon: "19px"
spacing:
  small: "6px"
  medium: "12px"
  large: "18px"
components:
  action:
    backgroundColor: "{colors.active}"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  icon-button:
    rounded: "{rounded.control}"
    width: "32px"
    height: "32px"
  navigation-active:
    backgroundColor: "{colors.active}"
    textColor: "{colors.accent}"
    rounded: "{rounded.navigation}"
    padding: "10px 14px"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.tile}"
    height: "58px"
    padding: "0 20px"
  bookmark-icon:
    rounded: "{rounded.icon}"
    width: "68px"
    height: "68px"
---

# Design System: 栖页

## Overview

**Creative North Star: "大图标书签桌面"**

用户确认的视觉方向是桌面风格、大图标、类似应用启动台。每个网站由独立图标、标题和小号域名组成，以较松的网格排列；侧边栏保留书签文件夹层级。

当前实现以暖白、灰绿和低饱和图标底色形成安静的桌面。名称、配色和文案属于当前实现选择，可以调整；用户尚未确认它们是长期品牌规范。此文档从 `src/index.css` 与组件源码提取，并对照 `artifacts/desktop.png` 的桌面预览检查。

**Key Characteristics:**

- 大图标优先，网站标题与域名保持独立层级。
- 左侧文件夹导航与主区域启动台形成稳定空间关系。
- 浅深两套主题使用相同的语义颜色角色。
- 细微悬停抬升提供点击反馈，减少动态效果时关闭动画。

## Colors

主色是沉静的森林绿，背景是带灰绿色调的暖白；彩色图标帮助扫描，不承担操作状态表达。

### Primary

`accent` 用于选中导航、时钟、焦点和操作文字；`active` 用于选中导航与动作按钮；`hover` 用于低强度悬停反馈。

### Secondary

`sage`、`blue`、`rose`、`sand`、`lavender`、`mint` 是网站图标的六种淡色背景，按域名稳定选择。它们不代表分类或重要程度。

### Neutral

`bg` 是主桌面背景，`surface` 是搜索和设置表面，`sidebar` 是左侧导航区域，`text` 与 `muted` 区分主要阅读内容和元信息，`line` 用于轻分隔。

深色主题按 `dark-` 前缀对应替换上述角色，彩色图标整体降低亮度。颜色的规范值以 frontmatter 为准，实际 CSS 变量定义在应用容器而非文档根元素上。

## Typography

统一使用系统中文无衬线字体，不请求远程字体。欢迎标题与细字重时钟形成首屏视觉重点；书签名称保持中等字重，域名和辅助状态采用较小字号。

字号层级由 frontmatter 定义。窄屏欢迎标题为（23px）、书签名称为（11px）；时钟在中等宽度下为（35px），窄屏隐藏。网站名称单行省略，完整名称和 URL 保留在链接提示中；文件夹组标题允许换行。

## Layout

桌面侧栏固定在左侧，宽（236px），主区域相应留出左边距；顶栏高（85px）。内容区最大宽（1350px），默认内边距（43px 58px 22px）。文件夹导航单独滚动。

启动台采用自适应网格，默认最小列宽（115px），行列间距（12px、18px）。紧凑模式最小列宽（92px）；宽于（1500px）时常规列宽增加到（126px）。每批显示（120）个项目，继续显示按钮位于分组之后。

在（1100px）及以下，侧栏缩至（210px），内容边距缩为（32px）。在（760px）及以下，侧栏成为可展开抽屉，主内容占满宽度；常规网格固定三列，紧凑网格四列，时钟隐藏。

## Elevation & Depth

页面层次主要由背景色和细边线区分。搜索框、侧栏和设置区域不依赖重阴影；网站图标具有轻投影，悬停时上移（4px）并略增强阴影。侧栏抽屉开启时使用半透明遮罩。

图标默认阴影为 `0 4px 8px -6px #23362950`，悬停阴影为 `0 9px 15px -9px #23362960`。动画、断点等扩展数据记录于 `.impeccable/design.json`。

## Shapes

网站图标采用饱满圆角方形，常规尺寸（68px）、圆角使用 `icon`；紧凑尺寸（48px）、圆角使用 `tile`。窄屏常规图标（60px）、圆角（17px）。搜索框和图标点击区共享 `tile` 圆角，导航行和小按钮使用更克制的圆角。

图钉使用圆形按钮；分组与区域分隔采用细直线。不要将每个书签再包进独立的大块面板，保持图标启动台的组织方式。

## Components

### Buttons

文字动作使用淡色底和主色文字，内边距由 `action` 定义。图标操作具有方形点击区，悬停时显现淡色底。通用键盘焦点是（3px）主色描边，向外偏移（4px）。禁用状态降低透明度并保持不可操作。

### Inputs / Fields

搜索是单行宽输入区域，左侧搜索符号，右侧快捷键或清空按钮。焦点进入时边框切换主色，输入文字保持主文字颜色。设置项采用原生复选框，排序使用原生下拉列表。

### Navigation

导航采用图标、名称、计数的水平布局。选中行使用主色文字与淡绿底，文件夹层级通过缩进表达；长名称省略。窄屏抽屉通过菜单按钮展开，遮罩和 Escape 可关闭。

### Bookmark launcher

网站卡片以图标为视觉中心，标题居中，域名作为次要文本。真实扩展从 Chrome 本地图标接口读取网站图标；图标失败或示例预览时显示首字。鼠标悬停或键盘进入卡片时显示固定按钮；已固定与触摸设备始终显示。非支持协议仍可见，但不能点击跳转，并有状态符号与文字提示。

### Empty and error states

空状态沿用居中图标、短标题和辅助句式；无搜索结果时提供清空搜索。错误使用暖红色描边与明确文本，并给出重试操作。状态不只依赖颜色。

## Do's and Don'ts

### Do:

- **Do** 优先保留大图标启动台的阅读层级与文件夹导航。
- **Do** 使用语义颜色同步实现浅色和深色主题。
- **Do** 让固定操作同时支持鼠标、键盘和触摸。
- **Do** 对减少动态效果偏好关闭过渡动画。

### Don't:

- **Don't** 用彩色图标底色暗示并不存在的分类含义。
- **Don't** 引入远程字体或外部图片作为本地桌面的默认依赖。
- **Don't** 把当前暂定的名称和配色描述成用户已经确认的品牌承诺。
