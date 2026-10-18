<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

const activeTag = ref('')
const searchQuery = ref('')

function syncFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  activeTag.value = params.get('tag') || ''
  searchQuery.value = params.get('q') || ''
}

function clearFilter() {
  activeTag.value = ''
  searchQuery.value = ''
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.delete('tag')
    url.searchParams.delete('q')
    window.history.replaceState({}, '', url.toString())
  }
}

onMounted(() => {
  syncFromUrl()
  window.addEventListener('popstate', syncFromUrl)
  // Listen for custom filter event if search box dispatches it
  window.addEventListener('scorpio-filter', syncFromUrl)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', syncFromUrl)
    window.removeEventListener('scorpio-filter', syncFromUrl)
  }
})

const filteredPosts = computed(() => {
  let list = posts.filter(p => p.date)

  if (activeTag.value) {
    const target = activeTag.value.toLowerCase().trim()
    list = list.filter(p => {
      const tags = (p.tags || []).map(t => String(t).toLowerCase().trim())
      return tags.includes(target)
    })
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => {
      const title = String(p.title || '').toLowerCase()
      const desc = String(p.description || '').toLowerCase()
      const excerpt = String(p.excerpt || '').toLowerCase()
      const tags = (p.tags || []).map(t => String(t).toLowerCase()).join(' ')
      return title.includes(q) || desc.includes(q) || excerpt.includes(q) || tags.includes(q)
    })
  }

  return list.sort((a, b) => {
    const da = String(a.date || '')
    const db = String(b.date || '')
    return db.localeCompare(da)
  })
})

const displayedPosts = computed(() => {
  // If no filter, limit to 10 latest. If filtered, show all matching results (up to 20)
  return activeTag.value || searchQuery.value
    ? filteredPosts.value.slice(0, 20)
    : filteredPosts.value.slice(0, 10)
})

function formatDate(d) {
  if (!d) return ''
  const s = String(d).trim()
  if (s.length === 4) return `${s} 年`
  try {
    const dt = new Date(s)
    if (isNaN(dt.getTime())) return s
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dt)
  } catch {
    return s
  }
}
</script>

<template>
  <div class="latest-updates-wrapper">
    <!-- Active Filter Indicator Banner -->
    <div v-if="activeTag || searchQuery" class="active-filter-banner" role="status">
      <div class="filter-info">
        <span class="filter-icon">{{ activeTag ? '🏷️' : '🔍' }}</span>
        <span class="filter-text">
          <template v-if="activeTag">
            标签筛选：<strong>{{ activeTag }}</strong>
          </template>
          <template v-else>
            搜索关键词：<strong>{{ searchQuery }}</strong>
          </template>
          <span class="filter-count">（共 {{ filteredPosts.length }} 篇）</span>
        </span>
      </div>
      <button
        class="clear-filter-btn"
        @click="clearFilter"
        type="button"
        title="清除筛选条件"
      >
        <span>✕</span>
        <span>清除筛选</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="displayedPosts.length === 0" class="empty-updates">
      <div class="empty-icon">📭</div>
      <div class="empty-title">
        {{ activeTag || searchQuery ? '未找到符合条件的文章' : '暂无内容更新记录' }}
      </div>
      <p class="empty-desc">
        {{ activeTag || searchQuery ? '尝试更换搜索词或查看全部内容' : '新文章将会在发布后自动展示在这里' }}
      </p>
      <button
        v-if="activeTag || searchQuery"
        class="empty-reset-btn"
        @click="clearFilter"
        type="button"
      >
        查看全部最新文章
      </button>
    </div>

    <!-- Posts List -->
    <div v-else class="latest-updates-list">
      <div
        v-for="(post, index) in displayedPosts"
        :key="post.url"
        class="update-item"
        :style="{ '--item-index': index }"
      >
        <span
          class="update-section-badge"
          :class="post.section"
        >
          {{ post.sectionLabel }}
        </span>
        <a
          :href="withBase(post.url)"
          class="update-title"
          :title="post.title"
        >
          {{ post.title }}
        </a>
        <time class="update-date" :datetime="String(post.date)">
          {{ formatDate(post.date) }}
        </time>
      </div>
    </div>
  </div>
</template>
