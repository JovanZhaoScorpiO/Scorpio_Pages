<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

const props = defineProps({
  maxItems: { type: Number, default: 4 },
})

const { page } = useData()

const related = computed(() => {
  const currentUrl = page.value?.relativePath
    ? '/' + page.value.relativePath.replace(/\.md$/, '')
    : null

  if (!currentUrl) return []

  const current = posts.find(p => p.url === currentUrl)
  if (!current) return []

  const currentTags = (current.tags || []).map(t => String(t).toLowerCase().trim())
  const currentSection = current.section

  // Score each post by tag overlap and same section
  const scored = posts
    .filter(p => p.url !== currentUrl && p.title)
    .map(p => {
      let score = 0
      const ptags = (p.tags || []).map(t => String(t).toLowerCase().trim())
      // Tag overlap
      for (const tag of currentTags) {
        if (ptags.includes(tag)) score += 2
      }
      // Same section bonus
      if (p.section === currentSection) score += 1
      // Priority by date
      if (p.date) score += 0.5
      return { ...p, score }
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, props.maxItems)

  return scored
})

function formatRelatedDate(d) {
  if (!d) return ''
  const s = String(d).trim()
  if (s.length === 4) return `${s} 年`
  try {
    const dt = new Date(s)
    if (isNaN(dt.getTime())) return s
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt)
  } catch {
    return s
  }
}
</script>

<template>
  <aside v-if="related.length > 0" class="related-section" aria-label="相关推荐">
    <div class="related-header">
      <span class="related-icon">📎</span>
      <h3 class="related-heading">关联推荐</h3>
    </div>
    <div class="related-grid">
      <a
        v-for="item in related"
        :key="item.url"
        :href="withBase(item.url)"
        class="related-card"
        :class="item.section"
      >
        <div class="related-badge-row">
          <span
            class="update-section-badge"
            :class="item.section"
          >
            {{ item.sectionLabel }}
          </span>
          <time v-if="item.date" class="related-date" :datetime="String(item.date)">
            {{ formatRelatedDate(item.date) }}
          </time>
        </div>
        <div class="related-title" :title="item.title">
          {{ item.title }}
        </div>
        <p v-if="item.description" class="related-desc">
          {{ item.description }}
        </p>
      </a>
    </div>
  </aside>
</template>
