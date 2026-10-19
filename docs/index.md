---
layout: home
title: Scorpio Pages
description: 个人综合内容档案馆 — 博士论文笔记 · 游戏攻略 · 音乐乐评
---

<script setup>
import { withBase } from 'vitepress'
</script>

<HomeNebula />

<div class="home-secondary-wrap">
<div class="home-secondary-inner">
<div class="home-section-block">
<div class="home-section-header">
<span class="home-section-badge">DISPATCHES · RECENT</span>
<h2 class="home-section-heading">最新<em>更新</em></h2>
<a :href="withBase('/timeline')" class="home-section-link">完整时间轴 →</a>
</div>
<LatestUpdates />
</div>

<div class="home-hairline"></div>

<div class="home-section-block">
<div class="home-section-header">
<span class="home-section-badge">TAXONOMY · THEMES</span>
<h2 class="home-section-heading">探索<em>标签云</em></h2>
<a :href="withBase('/tag-cloud')" class="home-section-link">全部标签 →</a>
</div>
<TagCloud />
</div>

<footer class="home-quiet-footer">
<p>博士学术研究 · 游戏通关记录 · 专辑深度乐评</p>
<p class="sub">Scorpio Pages · Built with VitePress · Pure Markdown</p>
</footer>
</div>
</div>
