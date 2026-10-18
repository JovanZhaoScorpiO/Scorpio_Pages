<script setup>
import { ref, onMounted } from 'vue'

const sizes = ['标准', '适中', '稍大', '超大']
const sizeValues = ['15px', '16px', '18px', '20px']

const currentIndex = ref(1)

onMounted(() => {
  try {
    const saved = localStorage.getItem('scorpio-font-size')
    if (saved !== null) {
      const idx = sizeValues.indexOf(saved)
      if (idx >= 0) {
        currentIndex.value = idx
        applySize(idx)
      }
    }
  } catch (e) {
    // LocalStorage might be disabled in private mode
  }
})

function applySize(idx) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--vp-font-size-base', sizeValues[idx])
  const ratio = parseFloat(sizeValues[idx]) / 16
  document.documentElement.style.setProperty('--vp-font-size-h1', `${2 * ratio}rem`)
  document.documentElement.style.setProperty('--vp-font-size-h2', `${1.5 * ratio}rem`)
  document.documentElement.style.setProperty('--vp-font-size-h3', `${1.25 * ratio}rem`)
}

function smaller() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    applySize(currentIndex.value)
    try {
      localStorage.setItem('scorpio-font-size', sizeValues[currentIndex.value])
    } catch {}
  }
}

function larger() {
  if (currentIndex.value < sizeValues.length - 1) {
    currentIndex.value++
    applySize(currentIndex.value)
    try {
      localStorage.setItem('scorpio-font-size', sizeValues[currentIndex.value])
    } catch {}
  }
}
</script>

<template>
  <div class="font-size-controls" role="group" aria-label="正文字号调节">
    <span class="control-label">
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
        <path d="M4 12h16" />
        <path d="M9 19v-4" />
        <path d="M15 19v-4" />
      </svg>
      字号
    </span>
    <div class="control-pill">
      <button
        type="button"
        @click="smaller"
        :disabled="currentIndex === 0"
        class="size-btn minus-btn"
        aria-label="缩小字号"
        title="缩小字号"
      >
        <span aria-hidden="true">A−</span>
      </button>
      <span class="size-label" aria-live="polite">
        {{ sizes[currentIndex] }}
      </span>
      <button
        type="button"
        @click="larger"
        :disabled="currentIndex === sizeValues.length - 1"
        class="size-btn plus-btn"
        aria-label="放大字号"
        title="放大字号"
      >
        <span aria-hidden="true">A+</span>
      </button>
    </div>
  </div>
</template>
