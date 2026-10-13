# illufluo

## 本地

Node.js 22.12+。

```sh
npm ci
npm run dev      # http://127.0.0.1:4321
npm test        # 类型、构建和浏览器检查
npm run build   # 输出 dist/
npm run preview # 预览正式构建
```

开发模式包含排版示例，正式构建排除示例。

## 写记录

在 `src/content/notes/` 新建 `.md` 或 `.mdx`：

```md
---
date: '2026-10-12'
---

正文。
```

可选字段：`title`、`updated`（同日期格式）、`description`（摘要）、`draft: true`（隐藏页面）。

文件名用小写字母、数字、短横线，如 `2026-10-12-01.md`。发布后不改文件名和目录，永久链接就不会变。标题可以省略。

图片放 `src/assets/`，引用：`![描述](../../assets/photo.jpg)`。

介绍：`src/content/about.md`；排版与配色：`src/styles/global.css`。

## Cloudflare Pages

连接 `illufluo/illufluo`，构建命令 `npm run build`，输出目录 `dist`。

环境变量：`NODE_VERSION=22.14.0`、`SITE_URL=https://正式域名`（不含子路径）。本地域名配置见 `.env.example`。
