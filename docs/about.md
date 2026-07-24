---
title: 关于本站
description: Scorpio Pages — 关于个人综合内容档案馆
---

# ℹ️ 关于本站

<div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; margin: 2rem 0;">
  <div style="flex: 1; min-width: 260px;">
    <p style="font-size: 1.05rem; line-height: 2;">
      <strong>Scorpio Pages</strong> 是我的个人综合内容档案馆，承载三类完全不同维度的内容创作：
    </p>
    <ul style="line-height: 2; font-size: 1.05rem;">
      <li><strong>📄 Paper 文库</strong> — 博士阶段阅读的学术论文精读笔记，涵盖计算机视觉、自然语言处理、AI 安全等研究方向</li>
      <li><strong>🎮 游戏攻略</strong> — 个人通关游戏的原创攻略，包含主线流程、隐藏要素、配装数据等</li>
      <li><strong>🎵 音乐乐评</strong> — 专辑深度聆听笔记，从编曲、歌词、情感多维度记录音乐感受</li>
    </ul>
  </div>
  <div style="flex-shrink: 0; padding: 1.5rem 2rem; background: var(--vp-c-bg-soft); border-radius: 12px; min-width: 200px;">
    <p style="font-weight: 700; margin-bottom: 0.5rem;">🔗 快速链接</p>
    <p style="margin: 0.3rem 0;"><a href="https://github.com/AzScorpio" target="_blank">🐙 GitHub 个人主页 →</a></p>
    <p style="margin: 0.3rem 0;"><a href="/paper-library/">📄 Paper 文库</a></p>
    <p style="margin: 0.3rem 0;"><a href="/game-guide/">🎮 游戏攻略</a></p>
    <p style="margin: 0.3rem 0;"><a href="/music-review/">🎵 音乐乐评</a></p>
    <p style="margin: 0.3rem 0;"><a href="/tag-cloud">🏷️ 标签云</a></p>
    <p style="margin: 0.3rem 0;"><a href="/timeline">📅 时间线</a></p>
  </div>
</div>

## 🏗️ 网站架构

本站使用 [VitePress](https://vitepress.dev/) 构建，Markdown + Vue 驱动，全静态页面，无需后端服务。

| 特性 | 实现方式 |
|------|----------|
| 构建框架 | VitePress 1.x + Vue 3 |
| 全文搜索 | VitePress Local Search |
| LaTeX 公式 | markdown-it-mathjax3 |
| Mermaid 图表 | vitepress-plugin-mermaid |
| 代码高亮 | Shiki (VitePress 内置) |
| 自动部署 | GitHub Actions → GitHub Pages |
| 托管地址 | `https://azscorpio.github.io/Scorpio_Pages` |

## ✍️ 如何新增内容

1. 在对应分区文件夹新建 `.md` 文件
2. 填写完整的 Frontmatter 元数据
3. 使用 Markdown 撰写正文
4. 图片放入 `docs/assets/` 下对应子文件夹
5. 提交并推送到 `main` 分支，GitHub Actions 自动部署

::: tip 💡
无需修改任何配置代码，站点会自动为新页面生成导航和索引。
:::

## 🚀 未来拓展计划

本站架构预留了板块拓展能力，未来计划新增：

- **📚 读书随笔** — 阅读笔记与书评
- **✈️ 旅行日记** — 旅行摄影记录
- **💻 技术博客** — 编程开发心得

只需在 `docs/` 下新建文件夹，即可无缝接入现有框架。

---

<div style="text-align: center; padding: 2rem 0;">
  <p style="color: var(--vp-c-text-2);">
    所有内容均为个人原创 · © <a href="https://github.com/AzScorpio" target="_blank">AzScorpio</a>
  </p>
  <p style="font-size: 0.85rem; color: var(--vp-c-text-3);">
    用 ❤️ 和 Markdown 构建
  </p>
</div>
