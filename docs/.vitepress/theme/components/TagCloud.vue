<script setup>
import { computed } from 'vue'
import { data as posts } from '../../posts.data'

const tagMap = computed(() => {
  const map = new Map()
  for (const post of posts) {
    const tags = post.tags || []
    for (const tag of tags) {
      if (!tag) continue
      const key = tag.trim()
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

function tagSize(count) {
  const ratio = count / maxCount.value
  if (ratio >= 0.8) return { fontSize: '1.4rem', fontWeight: 700 }
  if (ratio >= 0.6) return { fontSize: '1.2rem', fontWeight: 600 }
  if (ratio >= 0.4) return { fontSize: '1.05rem', fontWeight: 500 }
  if (ratio >= 0.2) return { fontSize: '0.9rem', fontWeight: 400 }
  return { fontSize: '0.8rem', fontWeight: 400 }
}
</script>

<template>
  <div class="tag-cloud">
    <div v-if="tagsSorted.length === 0" style="color: var(--vp-c-text-3); padding: 2rem; text-align: center;">
      暂无标签数据
    </div>
    <template v-else>
      <div
        v-for="tag in tagsSorted"
        :key="tag.name"
        class="tag-item"
        :style="tagSize(tag.count)"
        :title="`${tag.name} · ${tag.count} 篇文章`"
      >
        <a :href="`/?tag=${encodeURIComponent(tag.name)}`" style="text-decoration: none; color: inherit;">
          {{ tag.name }}
          <small style="opacity: 0.6;">({{ tag.count }})</small>
        </a>
      </div>
    </template>
  </div>
</template>
