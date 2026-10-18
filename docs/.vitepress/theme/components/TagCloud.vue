<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

const tagMap = computed(() => {
  const map = new Map()
  for (const post of posts) {
    const tags = post.tags || []
    for (const tag of tags) {
      if (!tag) continue
      const key = String(tag).trim()
      if (!key) continue
      if (!map.has(key)) {
        map.set(key, { name: key, count: 0, posts: [] })
      }
      const entry = map.get(key)
      entry.count++
      entry.posts.push({ url: post.url, title: post.title })
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
  if (ratio >= 0.8) return { '--tag-size': '1.15rem', '--tag-weight': '650' }
  if (ratio >= 0.6) return { '--tag-size': '1.05rem', '--tag-weight': '600' }
  if (ratio >= 0.4) return { '--tag-size': '0.95rem', '--tag-weight': '550' }
  if (ratio >= 0.2) return { '--tag-size': '0.88rem', '--tag-weight': '500' }
  return { '--tag-size': '0.82rem', '--tag-weight': '450' }
}

function handleTagClick(tagName, e) {
  // If we are on the homepage, we can update the search params smoothly
  if (typeof window !== 'undefined' && (window.location.pathname === withBase('/') || window.location.pathname === withBase('/index.html') || window.location.pathname === '/')) {
    e.preventDefault()
    const url = new URL(window.location.href)
    url.searchParams.set('tag', tagName)
    url.searchParams.delete('q')
    window.history.pushState({}, '', url.toString())
    window.dispatchEvent(new CustomEvent('scorpio-filter'))
    // Smooth scroll down to latest updates section if needed
    const updatesEl = document.querySelector('.latest-updates-wrapper')
    if (updatesEl) {
      updatesEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}
</script>

<template>
  <div class="tag-cloud-wrapper">
    <div v-if="tagsSorted.length === 0" class="empty-tag-cloud">
      <span class="empty-icon">🏷️</span>
      <p>暂无标签数据</p>
    </div>
    <div v-else class="tag-cloud-items">
      <a
        v-for="tag in tagsSorted"
        :key="tag.name"
        :href="withBase(`/?tag=${encodeURIComponent(tag.name)}`)"
        class="tag-item"
        :style="tagStyle(tag.count)"
        :title="`${tag.name} · ${tag.count} 篇内容`"
        @click="handleTagClick(tag.name, $event)"
      >
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tag-count">{{ tag.count }}</span>
      </a>
    </div>
  </div>
</template>
