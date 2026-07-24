<script setup>
import { computed } from 'vue'
import { data as posts } from '../../posts.data'

const timeline = computed(() => {
  const entries = posts
    .filter(p => p.date)
    .map(p => ({
      ...p,
      dateStr: String(p.date),
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

  // Sort years desc, months desc
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

function formatDay(d, m) {
  if (d) return `${d}日`
  if (m) return ''
  return '今年'
}

function sectionBadge(section) {
  const map = { paper: 'Paper文库', game: '游戏攻略', music: '音乐乐评' }
  return map[section] || '其他'
}
</script>

<template>
  <div class="timeline-archive">
    <div v-if="timeline.length === 0" style="color: var(--vp-c-text-3); padding: 2rem; text-align: center;">
      暂无时间线数据
    </div>
    <template v-else>
      <div v-for="yr in timeline" :key="yr.year">
        <h2 class="timeline-year">{{ yr.year }}</h2>
        <div v-for="mo in yr.months" :key="mo.monthLabel || yr.year">
          <h3 v-if="mo.monthLabel" class="timeline-month">
            {{ mo.monthLabel.slice(0, 4) }}年{{ mo.monthLabel.slice(5, 7) }}月
          </h3>
          <div
            v-for="entry in mo.entries"
            :key="entry.url"
            class="timeline-entry"
          >
            <span class="entry-day">{{ entry.displayDay ? `${entry.displayDay}日` : '' }}</span>
            <span
              class="update-section-badge"
              :class="entry.section"
            >
              {{ sectionBadge(entry.section) }}
            </span>
            <a :href="entry.url" style="font-weight: 500; flex: 1;">{{ entry.title }}</a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
