<script setup>
import { ref, onMounted, watch } from 'vue'

const sizes = ['小', '中', '大', '超大']
const sizeValues = ['14px', '16px', '18px', '20px']

const currentIndex = ref(1)

onMounted(() => {
  const saved = localStorage.getItem('scorpio-font-size')
  if (saved !== null) {
    const idx = sizeValues.indexOf(saved)
    if (idx >= 0) {
      currentIndex.value = idx
      applySize(idx)
    }
  }
})

function applySize(idx) {
  document.documentElement.style.setProperty('--vp-font-size-base', sizeValues[idx])
  // Scale headings proportionally
  const ratio = parseFloat(sizeValues[idx]) / 16
  document.documentElement.style.setProperty('--vp-font-size-h1', `${2 * ratio}rem`)
  document.documentElement.style.setProperty('--vp-font-size-h2', `${1.5 * ratio}rem`)
  document.documentElement.style.setProperty('--vp-font-size-h3', `${1.25 * ratio}rem`)
}

function smaller() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    applySize(currentIndex.value)
    localStorage.setItem('scorpio-font-size', sizeValues[currentIndex.value])
  }
}

function larger() {
  if (currentIndex.value < sizeValues.length - 1) {
    currentIndex.value++
    applySize(currentIndex.value)
    localStorage.setItem('scorpio-font-size', sizeValues[currentIndex.value])
  }
}
</script>

<template>
  <div class="font-size-controls">
    <span style="font-size: 0.8rem; color: var(--vp-c-text-2);">字号：</span>
    <button @click="smaller" title="缩小字号" :disabled="currentIndex === 0">A−</button>
    <span class="size-label">{{ sizes[currentIndex] }}</span>
    <button @click="larger" title="放大字号" :disabled="currentIndex === sizeValues.length - 1">A+</button>
  </div>
</template>
