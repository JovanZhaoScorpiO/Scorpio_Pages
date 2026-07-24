# 🦂 Scorpio Pages

**个人综合内容档案馆** — 博士论文精读笔记 · 原创游戏攻略 · 专辑深度乐评

> 使用 [VitePress](https://vitepress.dev/) 构建，全静态页面，支持本地预览 + GitHub Actions 自动部署到 GitHub Pages。

---

## ✨ 功能特性

- 📄 **Paper 文库** — 学术论文精读笔记，支持 LaTeX 公式、Mermaid 图表、代码高亮
- 🎮 **游戏攻略库** — RPG 主线支线攻略，配装数据表、剧透折叠、Boss 打法
- 🎵 **音乐乐评集** — 专辑深度聆听笔记，曲目点评、编曲分析、同风格推荐
- 🔍 **全局全文搜索** — 跨三大专区全文检索
- 🌗 **明暗双主题** — 日间/夜间阅读模式
- 🔤 **字体大小调节** — 适配不同阅读习惯
- 🏷️ **完整标签系统** — 全站标签云、按标签筛选
- 📅 **时间线归档** — 按年月倒序展示所有内容更新
- 📎 **关联推荐** — 文章底部自动推荐同类内容
- 🚀 **自动部署** — 推送 main 分支即可自动构建和部署 Pages

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/JovanZhaoScorpiO/Scorpio_Pages.git
cd Scorpio_Pages

# 2. 安装依赖
npm install

# 3. 启动本地预览（支持热更新）
npm run dev

# 4. 浏览器打开 http://localhost:5174/Scorpio_Pages/
```

### 构建生产版本

```bash
npm run build
# 静态文件输出到 docs/.vitepress/dist/
```

### 预览构建产物

```bash
npm run preview
```

## 📝 如何新增内容

### 新增一篇文章

1. 在对应分区文件夹下创建 `.md` 文件：
   - Paper 文库：`docs/paper-library/<研究方向>/<文件名>.md`
   - 游戏攻略：`docs/game-guide/<游戏名>/<文件名>.md`
   - 音乐乐评：`docs/music-review/<歌手或流派>/<文件名>.md`

2. 在文件开头填写 Frontmatter 元数据：

```yaml
---
title: '文章标题'
# Paper 文库专用字段
author: '作者名'
field: '计算机视觉'
conference: 'NeurIPS 2021'
year: 2021
doi: '10.xxxx/xxxxx'
keywords:
  - 关键词1
  - 关键词2
# game-guide 专用字段
game-name: '游戏名'
game-type: 'ARPG'
version: '1.0'
difficulty: '困难'
# music-review 专用字段
artist: '音乐人/乐队'
album: '专辑名'
genre: '后摇'
release-year: 2005
score: 9.5
# 通用字段
tags:
  - 标签1
  - 标签2
---
```

3. 使用 Markdown 撰写正文

4. 图片放入 `docs/assets/` 下对应子文件夹，使用相对路径引用

5. 保存文件后，本地开发环境会自动刷新预览

### 新增一张图片

- Paper 图表 → `docs/assets/paper-img/`
- 游戏截图 → `docs/assets/game-img/`
- 专辑封面 → `docs/assets/music-img/`

在 Markdown 中引用：
```markdown
![图片说明](/assets/paper-img/example.png)
```

> `assets/` 路径前不需要加 `docs/`，VitePress 会自动解析。

## 🚢 部署到 GitHub Pages

### 首次部署

1. 在 GitHub 上创建新仓库 `Scorpio_Pages`
2. 在仓库 Settings → Pages 中：
   - Source 选择 **GitHub Actions**
3. 将本地代码推送到 `main` 分支：

```bash
git remote add origin https://github.com/JovanZhaoScorpiO/Scorpio_Pages.git
git branch -M main
git push -u origin main
```

4. 推送后，GitHub Actions 会自动执行 `deploy.yml` 工作流
5. 部署完成后，访问 `https://JovanZhaoScorpiO.github.io/Scorpio_Pages/`

### 日常更新

```bash
# 新增 / 修改内容后
git add .
git commit -m "新增 XX 论文笔记"
git push
```

推送即自动部署，无需手动操作。

## 📂 目录结构

```
Scorpio_Pages/
├── docs/                          # 网站内容根目录
│   ├── index.md                   # 首页门户
│   ├── about.md                   # 关于本站
│   ├── tag-cloud.md               # 标签云
│   ├── timeline.md                # 时间线
│   ├── 404.md                     # 404 友好页面
│   ├── favicon.svg                # 网站图标
│   ├── assets/                    # 静态资源
│   │   ├── paper-img/             # 论文图表
│   │   ├── game-img/              # 游戏配图
│   │   ├── music-img/             # 专辑封面
│   │   └── global-css/            # 预留样式文件夹
│   ├── paper-library/             # Paper 文库
│   │   ├── index.md
│   │   ├── timeline.md
│   │   └── computer-vision/       # 细分研究方向
│   ├── game-guide/                # 游戏攻略
│   │   ├── index.md
│   │   └── elden-ring/            # 单款游戏文件夹
│   └── music-review/              # 音乐乐评
│       ├── index.md
│       └── post-rock/             # 按流派/歌手
├── .vitepress/                    # VitePress 配置
│   ├── config.js                  # 全站配置
│   ├── posts.data.ts              # 数据加载器
│   └── theme/                     # 自定义主题
│       ├── index.js
│       ├── style.css              # 全局 + 三区独立样式
│       └── components/            # Vue 组件
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions 部署
├── package.json
└── README.md
```

## 🏗️ 架构说明

### 三分区独立视觉

- **Paper 文库**：窄卡片、冷色调（深蓝/浅灰）、Serif 字体、最少装饰
- **游戏攻略**：大圆角卡片、高饱和暖色、渐变色标题、大图展示
- **音乐乐评**：超大留白、低饱和莫兰迪色系、宽松排版、全屏头图

主题切换基于路由路径自动完成，进入对应分区即切换样式。

### 拓展新板块

如需新增板块（如读书随笔、旅行日记）：

1. 在 `docs/` 下新建文件夹（如 `docs/reading-notes/`）
2. 在 `docs/reading-notes/` 下创建 `index.md` 和内容文件
3. 在 `.vitepress/config.js` 的 `themeConfig.sidebar` 中添加侧边栏配置
4. 在 `.vitepress/theme/style.css` 中添加新区块的 CSS 变量（可选）
5. 在 `posts.data.ts` 中会自动包含新区块的内容（无需修改）

> 现有核心代码无需改动，天然支持板块拓展。

## 🧰 技术栈

| 技术 | 用途 |
|------|------|
| [VitePress](https://vitepress.dev/) | 静态站点生成器 |
| [Vue 3](https://vuejs.org/) | 前端框架 |
| [markdown-it-mathjax3](https://github.com/nicehash/markdown-it-mathjax3) | LaTeX 公式渲染 |
| [vitepress-plugin-mermaid](https://github.com/emersonbottero/vitepress-plugin-mermaid) | Mermaid 图表 |
| [GitHub Actions](https://docs.github.com/actions) | CI/CD 自动部署 |
| [GitHub Pages](https://pages.github.com/) | 免费静态托管 |

## 📄 许可证

本项目内容均为个人原创，仅供个人学习与记录使用。

---

<p align="center">
  用 ❤️ 和 Markdown 构建 · <a href="https://github.com/AzScorpio">@AzScorpio</a>
</p>
