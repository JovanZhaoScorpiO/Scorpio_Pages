<script setup>
import { computed } from 'vue'
import { data as posts } from '../../posts.data'

const sorted = computed(() =>
  posts
    .filter(p => p.date)
    .sort((a, b) => {
      const da = String(a.date)
      const db = String(b.date)
      // YYYY-MM-DD or YYYY
      return db.localeCompare(da)
    })
    .slice(0, 10)
)

function formatDate(d) {
  if (!d) return ''
  const s = String(d)
  if (s.length === 4) return s
  try {
    const dt = new Date(s)
    if (isNaN(dt.getTime())) return s
    return dt.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return s
  }
}
</script>

<template>
  <div class="latest-updates">
    <div v-if="sorted.length === 0" style="color: var(--vp-c-text-3); font-size: 0.9rem;">
      暂无内容更新记录
    </div>
    <div
      v-for="post in sorted"
      :key="post.url"
      class="update-item"
    >
      <span
        class="update-section-badge"
        :class="post.section"
      >
        {{ post.sectionLabel }}
      </span>
      <a :href="post.url" class="update-title">{{ post.title }}</a>
      <span class="update-date">{{ formatDate(post.date) }}</span>
    </div>
  </div>
</template>
