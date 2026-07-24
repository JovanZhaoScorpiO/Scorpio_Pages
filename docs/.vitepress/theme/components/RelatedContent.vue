<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
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

  const currentTags = (current.tags || []).map(t => t.toLowerCase())
  const currentSection = current.section

  // Score each post by tag overlap and same section
  const scored = posts
    .filter(p => p.url !== currentUrl && p.title)
    .map(p => {
      let score = 0
      const ptags = (p.tags || []).map(t => t.toLowerCase())
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
</script>

<template>
  <div v-if="related.length > 0" class="related-section">
    <h3>📎 关联推荐</h3>
    <div class="related-grid">
      <a
        v-for="item in related"
        :key="item.url"
        :href="item.url"
        class="related-card"
      >
        <div class="related-title">{{ item.title }}</div>
        <div class="related-meta">
          <span
            class="update-section-badge"
            :class="item.section"
            style="display: inline-block; margin-bottom: 0.25rem;"
          >
            {{ item.sectionLabel }}
          </span>
          <span v-if="item.date" style="display: block; margin-top: 0.2rem;">
            {{ item.date }}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>
