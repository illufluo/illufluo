# illufluo

一些想法与记录。以中文阅读为中心的静态个人网站，使用 Astro、Tailwind CSS 与 Markdown / MDX；没有数据库、账号系统或外部字体请求。

## 本地运行

需要 Node.js 22.12+（推荐使用 `.node-version` 中的版本）。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://127.0.0.1:4321`。开发模式会显示明确标注的排版示例，包含无标题短随笔、较长 MDX 文章与图片。

```sh
npm run check       # Astro / TypeScript 检查
npm run build       # 正式静态构建，输出 dist/，排除全部示例
npm run preview     # 预览正式构建（初始为空状态）
npm run build:demo  # 排版演示，单独输出 dist-demo/，设置 noindex
```

本地开发和演示页都设置为禁止搜索引擎索引。开发模式显示真实记录与示例，演示构建只显示示例，以便测试不受未来文章数量影响。`dist-demo/` 只用于测试，不要作为正式网站部署。

## 发布一条记录

在 `src/content/notes/` 新建 `2026-10-12-01.md`：

```md
---
date: '2026-10-12'
---

在这里写下正文。一两句话就足够了。
```

这是完整的最小格式。**标题始终可选**，不会补成「无题」。日期需带引号，格式为 `YYYY-MM-DD`。

目录中也有 `writing-template.md` 草稿模板，可以复制后修改。它不会在网站上公开。

可选字段：

```yaml
title: 一篇稍长的文章
updated: '2026-10-13'
description: 可选的首页摘要与搜索描述
draft: true
```

- 所有公开记录都有独立页面，例如 `/notes/2026-10-12-01/`；不依赖标题或日期字段。
- 文件名使用小写英文字母、数字、短横线；同一天用 `-01`、`-02` 区分。文件名必须唯一，`.md` 与 `.mdx` 也不能重名。
- 发布后保留文件名和所在子目录，修改标题、日期、正文都不会改变永久链接。无需填写 `slug`。
- `draft: true` 在开发与正式构建中均隐藏，删除该行或改为 `false` 后发布。不要把私密信息提交到公开仓库，草稿只是隐藏页面。
- 正文超过 220 个字符时首页显示摘要与「阅读全文」；短记录直接显示全文。每页首页最近展示 10 条，其余在归档中。
- 同一日期的记录按文件名排序。支持 `.mdx`，通常直接使用 `.md` 即可。
- Markdown 支持段落、小标题、链接、列表、引用、代码和表格。无标题记录的独立页面以日期作为阅读入口，不另加文章标题。

### 图片

把图片放在 `src/assets/`，在记录中用相对路径引入，例如：

```md
![图片内容的简短描述](../../assets/my-photo.jpg)

*可选的图片说明*
```

本地 Markdown 图片由 Astro 处理，保持原始比例并限制在正文栏内。请写清楚替代文字，发布前压缩较大的图片。原样静态文件可放在 `public/images/` 并使用 `/images/文件名.jpg`。位于 `public/` 的资源会全部公开，草稿或私密图片不要放在那里。测试图片位于 `src/assets/example-study.svg`，不会进入正式构建。

### 关于与样式

- 个人介绍在 `src/content/about.md` 填写，当前只说明网站用途，没有虚构个人经历。
- 字号、间距与浅深主题变量：`src/styles/global.css`。
- 全站结构与 SEO：`src/layouts/BaseLayout.astro`。
- 记录 schema：`src/content.config.ts`；排序、摘要与永久链接：`src/lib/notes.ts`。
- 主题控件：`src/components/ThemeSwitch.astro`。默认跟随系统，手动选择保存在浏览器中；选「跟随系统」可恢复。

## 基础测试

```sh
# 本机安装 Chrome 时直接复用；否则首次先下载测试浏览器：
npx playwright install chromium
npm test
```

测试会执行类型检查、正式和演示构建，再使用桌面与手机浏览器检查：空状态、示例与草稿隔离、无标题记录、MDX 长文、图片加载、归档、内部链接、主题持久化、受限存储、无 JavaScript 阅读、320px / 平板尺寸溢出，以及浅深主题 WCAG AA 自动扫描。自动扫描不能替代真实辅助技术与人工阅读检查。

## GitHub 与 Cloudflare Pages（以后部署）

当前只完成本地项目，不会创建远程仓库或触发上线。

1. 创建自己的 GitHub 仓库，将此目录提交并推送。已提供 `.gitignore` 与 GitHub Actions 基础验证工作流。
2. 在 Cloudflare Pages 中导入仓库，构建命令设为 `npm run build`，输出目录设为 `dist`，项目根目录为仓库根目录。
3. 设置环境变量 `NODE_VERSION=22.14.0`、`SITE_URL=https://你的正式域名`；可选设置 `ASTRO_TELEMETRY_DISABLED=1`。
4. 本地可以复制 `.env.example` 为 `.env`，填写同样的 `SITE_URL`。设置完整域名后才生成 canonical 与 sitemap，避免错误的占位域名进入搜索引擎。不要设置子路径。
5. 发布前运行 `npm test`，确认正式预览中只有真实内容。后续提交 Markdown 并推送后，Pages 会重新构建。

纯静态构建不需要 Cloudflare adapter、Worker、数据库或付费服务。部署参数可参见 [Cloudflare Astro 静态托管文档](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)。
