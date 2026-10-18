<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'

const timeline = computed(() => {
  const entries = posts
    .filter(p => p.date)
    .map(p => ({
      ...p,
      dateStr: String(p.date).trim(),
    }))
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr))

  const groups = {}
  for (const entry of entries) {
    let year, month, day
    const ds = entry.dateStr
    if (ds.length >= 4) {
      year = ds.slice(0, 4)
      month = ds.length >= 7 ? ds.slice(5, 7) : null
      day = ds.length >= 10 ? ds.slice(8, 10) : null
    } else {
      year = ds
      month = null
      day = null
    }

    if (!groups[year]) groups[year] = {}
    const ym = year + (month ? `-${month}` : '')
    if (!groups[year][ym]) groups[year][ym] = []
    groups[year][ym].push({ ...entry, displayDay: day, displayMonth: month })
  }

  const result = []
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a))
  for (const year of years) {
    const months = Object.keys(groups[year]).sort((a, b) => b.localeCompare(a))
    const yearEntries = []
    for (const ym of months) {
      yearEntries.push({
        monthLabel: ym.length > 4 ? ym : null,
        entries: groups[year][ym],
      })
    }
    result.push({ year, months: yearEntries })
  }
  return result
})

function formatDay(d) {
  if (d) return `${d} 日`
  return '—'
}

function sectionBadge(section) {
  const map = { paper: 'Paper文库', game: '游戏攻略', music: '音乐乐评' }
  return map[section] || '其他'
}
</script>

<template>
  <div class="timeline-archive-container">
    <div v-if="timeline.length === 0" class="empty-timeline">
      <span class="empty-icon">📅</span>
      <p class="empty-title">暂无时间线数据</p>
    </div>
    <div v-else class="timeline-tree">
      <div v-for="yr in timeline" :key="yr.year" class="timeline-year-group">
        <div class="timeline-year-header">
          <span class="year-marker"></span>
          <h2 class="timeline-year-title">{{ yr.year }}</h2>
        </div>

        <div
          v-for="mo in yr.months"
          :key="mo.monthLabel || yr.year"
          class="timeline-month-group"
        >
          <div v-if="mo.monthLabel" class="timeline-month-header">
            <span class="month-marker"></span>
            <h3 class="timeline-month-title">
              {{ mo.monthLabel.slice(0, 4) }} 年 {{ mo.monthLabel.slice(5, 7) }} 月
            </h3>
          </div>

          <div class="timeline-entries-list">
            <div
              v-for="entry in mo.entries"
              :key="entry.url"
              class="timeline-entry"
            >
              <div class="timeline-node"></div>
              <time class="entry-day">{{ formatDay(entry.displayDay) }}</time>
              <span
                class="update-section-badge"
                :class="entry.section"
              >
                {{ sectionBadge(entry.section) }}
              </span>
              <a
                :href="withBase(entry.url)"
                class="timeline-entry-link"
                :title="entry.title"
              >
                {{ entry.title }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
