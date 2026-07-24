---
title: 全站标签云
description: 浏览所有内容标签，按标签筛选文章
---

<script setup>
import { computed } from 'vue'
import { data as posts } from './.vitepress/posts.data'

const tagMap = computed(() => {
  const map = new Map()
  for (const post of posts) {
    const tags = post.tags || []
    for (const tag of tags) {
      if (!tag) continue
      const key = tag.trim()
      if (!key) continue
      if (!map.has(key)) {
        map.set(key, { name: key, count: 0 })
      }
      map.get(key).count++
    }
  }
  return map
})

const tagsSorted = computed(() =>
  Array.from(tagMap.value.values()).sort((a, b) => b.count - a.count)
)

const maxCount = computed(() =>
  tagsSorted.value.length > 0 ? tagsSorted.value[0].count : 1
)

function tagStyle(count) {
  const ratio = count / maxCount.value
  const size = 0.8 + ratio * 0.7
  const weight = ratio >= 0.4 ? 600 : 400
  return { fontSize: `${size}rem`, fontWeight: weight }
}
</script>

# 🏷️ 全站标签云

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">
  点击标签查看对应分类的所有文章 · 标签大小反映文章数量
</p>

<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; padding: 2rem 0;">
  <div v-if="tagsSorted.length === 0" style="color: var(--vp-c-text-3); padding: 2rem; text-align: center;">
    暂无标签数据
  </div>
  <a
    v-for="tag in tagsSorted"
    :key="tag.name"
    :href="`/?tag=${encodeURIComponent(tag.name)}`"
    :style="tagStyle(tag.count)"
    class="tag-item"
  >
    {{ tag.name }}
    <small style="opacity: 0.6;">({{ tag.count }})</small>
  </a>
</div>

---

<div style="margin-top: 2rem; padding: 1rem; background: var(--vp-c-bg-soft); border-radius: 8px; font-size: 0.85rem; color: var(--vp-c-text-2);">
  <p>💡 标签数据自动从各文章的 Frontmatter 中提取。新增文章时填写 <code>tags</code> 字段即可自动更新此页面。</p>
  <p>🏠 <a href="/">返回首页</a> · 📄 <a href="/paper-library/">Paper 文库</a> · 🎮 <a href="/game-guide/">游戏攻略</a> · 🎵 <a href="/music-review/">音乐乐评</a></p>
</div>
