---
# 
layout: home
title: Scorpio Pages
description: 个人综合内容档案馆
---

<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
</script>

<!-- ========== 首页横幅 ========== -->
<div class="home-hero" style="text-align: center; padding: 3rem 0 2rem;">
  <h1 style="font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, #1a365d, #2b6cb0, #dd6b20, #7c6f64); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
    Scorpio Pages
  </h1>
  <p style="font-size: 1.15rem; color: var(--vp-c-text-2); max-width: 600px; margin: 0.5rem auto 1.5rem; line-height: 1.8;">
    博士论文精读笔记 · 游戏通关攻略 · 专辑深度乐评<br>
    个人综合内容档案馆，三大维度记录思想轨迹
  </p>

  <FontSizeControl />
</div>

<!-- ========== 全局搜索框 ========== -->
<div class="search-box-wrapper">
  <input
    type="search"
    class="search-box"
    placeholder="🔍 搜索全站内容（标题、标签、关键词）…"
    id="global-search"
    v-on:keyup.enter="doSearch"
  />
</div>

<script>
function doSearch(e) {
  const q = e.target.value.trim()
  if (q) {
    window.location.href = `?q=${encodeURIComponent(q)}`
  }
}
</script>

<!-- ========== 三大分区导航卡片 ========== -->
<div class="home-sections">
  <a href="/paper-library/" class="section-card paper">
    <div class="card-icon">📄</div>
    <div class="card-title">Paper 文库</div>
    <div class="card-desc">
      博士学术论文精读笔记<br>
      计算机视觉 · NLP · AI安全<br>
      <small style="opacity: 0.7;">冷简约 · LaTeX公式 · Mermaid图解</small>
    </div>
  </a>

  <a href="/game-guide/" class="section-card game">
    <div class="card-icon">🎮</div>
    <div class="card-title">游戏攻略库</div>
    <div class="card-desc">
      RPG 主线支线全收集攻略<br>
      配装数据 · 隐藏彩蛋 · BOSS战<br>
      <small style="opacity: 0.7;">活泼明亮 · 大图展示 · 剧透折叠</small>
    </div>
  </a>

  <a href="/music-review/" class="section-card music">
    <div class="card-icon">🎵</div>
    <div class="card-title">音乐乐评集</div>
    <div class="card-desc">
      专辑深度乐评 · 编曲分析<br>
      后摇 · 氛围 · 电子 · 独立<br>
      <small style="opacity: 0.7;">文艺留白 · 莫兰迪色 · 沉浸阅读</small>
    </div>
  </a>
</div>

---

<!-- ========== 最新更新 ========== -->
<div style="margin: 2rem 0;">
  <h2 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem;">
    <span>📰</span> 最新更新
    <a href="/timeline" style="font-size: 0.8rem; font-weight: 400; margin-left: auto; color: var(--vp-c-brand-2);">查看全部时间线 →</a>
  </h2>
  <LatestUpdates />
</div>

---

<!-- ========== 标签快速入口 ========== -->
<div style="margin: 2rem 0;">
  <h2 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.3rem;">
    <span>🏷️</span> 热门标签
    <a href="/tag-cloud" style="font-size: 0.8rem; font-weight: 400; margin-left: auto; color: var(--vp-c-brand-2);">查看全部标签云 →</a>
  </h2>
  <TagCloud />
</div>

---

<div style="margin: 2rem 0; padding: 1.5rem; background: var(--vp-c-bg-soft); border-radius: 12px; text-align: center;">
  <p style="color: var(--vp-c-text-2); font-size: 0.9rem;">
    🚀 本站所有内容均为个人原创 · 使用 <strong>VitePress</strong> 构建 · 
    <a href="https://github.com/AzScorpio/Scorpio_Pages" target="_blank" style="color: var(--vp-c-brand-2);">GitHub 仓库</a>
  </p>
  <p style="color: var(--vp-c-text-3); font-size: 0.8rem; margin-top: 0.5rem;">
    新增内容只需在对应分区新建 Markdown 文件，推送到 main 分支即可自动部署
  </p>
</div>
