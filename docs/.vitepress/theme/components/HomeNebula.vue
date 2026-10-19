<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { withBase } from 'vitepress'

// Title letters for staggered reveal animation
const titleLetters = 'Scorpio Pages'.split('')

// Typewriter phrases
const phrases = [
  '> reading BERT…',
  '> listening to Takk…',
  '> farming runes in Limgrave…'
]
const typewriterDisplay = ref('')
let typewriterTimeout = null
let currentPhraseIdx = 0
let currentCharIdx = 0
let isDeleting = false

function tickTypewriter() {
  const currentPhrase = phrases[currentPhraseIdx]

  if (isDeleting) {
    currentCharIdx--
    typewriterDisplay.value = currentPhrase.slice(0, currentCharIdx)
    if (currentCharIdx <= 0) {
      isDeleting = false
      currentPhraseIdx = (currentPhraseIdx + 1) % phrases.length
      typewriterTimeout = setTimeout(tickTypewriter, 380)
      return
    }
    typewriterTimeout = setTimeout(tickTypewriter, 35)
  } else {
    currentCharIdx++
    typewriterDisplay.value = currentPhrase.slice(0, currentCharIdx)
    if (currentCharIdx >= currentPhrase.length) {
      isDeleting = true
      typewriterTimeout = setTimeout(tickTypewriter, 2200)
      return
    }
    typewriterTimeout = setTimeout(tickTypewriter, 65)
  }
}

// WebGL Nebula Canvas
const canvasRef = ref(null)
const heroRef = ref(null)
const webglFailed = ref(false)

let gl = null
let program = null
let animationFrameId = null
let vertexShader = null
let fragmentShader = null
let positionBuffer = null
let mutationObserver = null
let resizeObserver = null

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fsSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color_bg;
  uniform vec3 u_color_primary;
  uniform vec3 u_color_secondary;
  uniform vec3 u_color_highlight;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(10.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float t = u_time * 0.06;

    vec2 q = vec2(fbm(p + vec2(t * 0.32, t * 0.16)), fbm(p + vec2(t * -0.21, t * 0.38)));
    vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + 0.11 * t), fbm(p + 3.2 * q + vec2(8.3, 2.8) + 0.08 * t));
    float f = fbm(p + 3.0 * r + 0.04 * t);

    float dist = length(p * vec2(0.8, 1.2));
    float mask = smoothstep(1.9, 0.15, dist);

    vec3 col = u_color_bg;
    col = mix(col, u_color_primary, clamp(f * f * 2.1, 0.0, 1.0) * mask);
    col = mix(col, u_color_secondary, clamp(length(q) * 0.7, 0.0, 1.0) * mask);
    col = mix(col, u_color_highlight, clamp(f * r.x * 1.6, 0.0, 1.0) * mask);

    gl_FragColor = vec4(col, 1.0);
  }
`

function createShader(glCtx, type, source) {
  const shader = glCtx.createShader(type)
  glCtx.shaderSource(shader, source)
  glCtx.compileShader(shader)
  if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
    console.warn('Shader compile failed:', glCtx.getShaderInfoLog(shader))
    glCtx.deleteShader(shader)
    return null
  }
  return shader
}

function initWebGL() {
  const canvas = canvasRef.value
  if (!canvas) return false

  gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' }) ||
       canvas.getContext('experimental-webgl', { alpha: true, antialias: false, powerPreference: 'low-power' })

  if (!gl) {
    webglFailed.value = true
    return false
  }

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vertexShader || !fragmentShader) {
    webglFailed.value = true
    return false
  }

  program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('WebGL link program failed:', gl.getProgramInfoLog(program))
    webglFailed.value = true
    return false
  }

  gl.useProgram(program)

  // Fullscreen quad [-1, -1] to [1, 1]
  const vertices = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0
  ])

  positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const posAttr = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(posAttr)
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

  updateUniformColors()
  resizeCanvas()

  return true
}

function updateUniformColors() {
  if (!gl || !program) return
  const isDark = document.documentElement.classList.contains('dark')

  const uBg = gl.getUniformLocation(program, 'u_color_bg')
  const uPrimary = gl.getUniformLocation(program, 'u_color_primary')
  const uSecondary = gl.getUniformLocation(program, 'u_color_secondary')
  const uHighlight = gl.getUniformLocation(program, 'u_color_highlight')

  if (isDark) {
    // Deep navy #071526, dimmer blue clouds, cyan highlight
    gl.uniform3f(uBg, 0.027, 0.082, 0.149)
    gl.uniform3f(uPrimary, 0.08, 0.25, 0.44)
    gl.uniform3f(uSecondary, 0.12, 0.34, 0.58)
    gl.uniform3f(uHighlight, 0.26, 0.75, 0.97)
  } else {
    // Pale sky #f4fbff / #e6f6fe, soft blue #42c0f8, pale #d4effd, white highlight
    gl.uniform3f(uBg, 0.957, 0.984, 1.0)
    gl.uniform3f(uPrimary, 0.259, 0.753, 0.973)
    gl.uniform3f(uSecondary, 0.831, 0.937, 0.992)
    gl.uniform3f(uHighlight, 1.0, 1.0, 1.0)
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !gl || !program) return

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight

  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  gl.viewport(0, 0, canvas.width, canvas.height)
  const uResolution = gl.getUniformLocation(program, 'u_resolution')
  gl.uniform2f(uResolution, canvas.width, canvas.height)
}

function startAnimationLoop() {
  if (!gl || !program) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const uTime = gl.getUniformLocation(program, 'u_time')

  if (prefersReducedMotion) {
    // Render one static frame and stop
    gl.uniform1f(uTime, 12.0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    return
  }

  let startTime = performance.now()
  function render(now) {
    const elapsed = (now - startTime) * 0.001
    gl.uniform1f(uTime, elapsed)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    animationFrameId = requestAnimationFrame(render)
  }

  animationFrameId = requestAnimationFrame(render)
}

// Scroll-driven sticky stage section
const activeStep = ref(0)
let stepObserver = null

const steps = [
  {
    num: '01',
    label: 'RESEARCH ARCHIVE',
    title: 'Paper 文库',
    url: '/paper-library/',
    desc: '深度研读自然语言处理与计算机视觉顶会论文，以数学推导、核心架构解析与实验对比为主线，记录学术探索轨迹。',
    articles: [
      {
        tag: 'NLP · 深度预训练',
        title: 'BERT：预训练深度双向 Transformer 的语言理解',
        url: '/paper-library/nlp/bert-paper-review',
        badge: 'Devlin et al. · NAACL'
      },
      {
        tag: 'CV · 架构对比',
        title: 'ViT vs ResNet：视觉Transformer与卷积网络的对比分析',
        url: '/paper-library/computer-vision/vit-resnet-analysis',
        badge: 'Dosovitskiy et al. · ICLR'
      }
    ]
  },
  {
    num: '02',
    label: 'SONIC CRITIQUES',
    title: '音乐乐评集',
    url: '/music-review/',
    desc: '探索冰岛后摇的极光史诗与环境音乐的时空静谧。深入编曲构架、声场质感与情绪涌流，用文字雕刻声音的几何形态。',
    articles: [
      {
        tag: '后摇 · 极光诗篇',
        title: 'Takk… — 冰岛极光般的后摇诗篇',
        url: '/music-review/post-rock/sigur-ros-takk',
        badge: 'Sigur Rós · 2005'
      },
      {
        tag: '氛围音乐 · 概念宣言',
        title: 'Music for Airports — 氛围音乐的诞生宣言',
        url: '/music-review/ambient/brian-eno-music-for-airports',
        badge: 'Brian Eno · 1978'
      }
    ]
  },
  {
    num: '03',
    label: 'QUEST CHRONICLES',
    title: '游戏攻略库',
    url: '/game-guide/',
    desc: '交界地全方位硬核探险全集。理清黄金律法碎片下的支线全图景，提供传说武器获取路径与 BOSS 战机制解构。',
    articles: [
      {
        tag: 'Elden Ring · 主线流程',
        title: 'Elden Ring 主线流程完整攻略',
        url: '/game-guide/elden-ring/main-quest-guide',
        badge: 'FromSoftware · Action RPG'
      },
      {
        tag: 'Elden Ring · 传说收集',
        title: 'Elden Ring 传说级武器全收集指南',
        url: '/game-guide/elden-ring/legendary-armaments-guide',
        badge: '全9把传说级武具 · 路线图'
      }
    ]
  }
]

// Horizontal Carousel Section
const carouselRef = ref(null)
const activeCarouselIndex = ref(0)

const carouselArticles = [
  {
    section: 'Paper 文库',
    category: 'NLP · TRANSFORMER',
    title: 'BERT：预训练深度双向 Transformer 的语言理解',
    url: '/paper-library/nlp/bert-paper-review',
    desc: '双向编码器表示模型，以 MLM 任务与自注意力机制开启了现代 NLP 大模型时代。',
    tags: ['BERT', 'NLP', 'Transformer', 'Pre-training']
  },
  {
    section: 'Paper 文库',
    category: 'CV · ARCHITECTURE',
    title: 'ViT vs ResNet：视觉Transformer与卷积网络的对比分析',
    url: '/paper-library/computer-vision/vit-resnet-analysis',
    desc: '从归纳偏置、感受野到全局注意力，全面剖析自注意力如何重构计算机视觉范式。',
    tags: ['ViT', 'ResNet', 'Vision', 'Attention']
  },
  {
    section: '音乐乐评集',
    category: 'POST-ROCK · ICELAND',
    title: 'Takk… — 冰岛极光般的后摇诗篇',
    url: '/music-review/post-rock/sigur-ros-takk',
    desc: '弓弦吉他、管弦乐潮涌与霍普语低吟，Sigur Rós 构建的纯净冰原与精神归宿。',
    tags: ['Sigur Rós', 'Takk', 'Post-Rock', 'Ambient']
  },
  {
    section: '音乐乐评集',
    category: 'AMBIENT · MINIMAL',
    title: 'Music for Airports — 氛围音乐的诞生宣言',
    url: '/music-review/ambient/brian-eno-music-for-airports',
    desc: 'Brian Eno 将磁带循环相位微移融入声学空间，为纷乱尘世提供不被侵扰的安宁。',
    tags: ['Brian Eno', 'Ambient', 'Tape Loops', '1978']
  },
  {
    section: '游戏攻略库',
    category: 'ELDEN RING · WALKTHROUGH',
    title: 'Elden Ring 主线流程完整攻略',
    url: '/game-guide/elden-ring/main-quest-guide',
    desc: '从宁姆格福出发跨越史东薇尔与王城罗德尔，交界地登王之路关键节点全整理。',
    tags: ['Elden Ring', 'FromSoftware', 'Boss Fight', 'RPG']
  },
  {
    section: '游戏攻略库',
    category: 'ELDEN RING · ARMAMENTS',
    title: 'Elden Ring 传说级武器全收集指南',
    url: '/game-guide/elden-ring/legendary-armaments-guide',
    desc: '夜与火之剑、暗月大剑、吞世权杖等全部九把传说级武器详细坐标与避坑路线。',
    tags: ['Elden Ring', 'Weapons', 'Armaments', 'Collection']
  }
]

function onCarouselScroll() {
  const container = carouselRef.value
  if (!container) return
  const center = container.scrollLeft + container.clientWidth / 2
  const cards = Array.from(container.querySelectorAll('.carousel-card'))
  let closestIdx = 0
  let minDiff = Infinity

  cards.forEach((card, idx) => {
    const cardCenter = card.offsetLeft + card.clientWidth / 2
    const diff = Math.abs(center - cardCenter)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = idx
    }
  })

  activeCarouselIndex.value = closestIdx
}

function scrollToCarouselCard(idx) {
  const container = carouselRef.value
  if (!container) return
  const cards = container.querySelectorAll('.carousel-card')
  if (cards[idx]) {
    const card = cards[idx]
    const scrollTarget = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2
    container.scrollTo({ left: scrollTarget, behavior: 'smooth' })
  }
}

function prevCarouselCard() {
  if (activeCarouselIndex.value > 0) {
    scrollToCarouselCard(activeCarouselIndex.value - 1)
  }
}

function nextCarouselCard() {
  if (activeCarouselIndex.value < carouselArticles.length - 1) {
    scrollToCarouselCard(activeCarouselIndex.value + 1)
  }
}

onMounted(() => {
  // Start typewriter
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    typewriterDisplay.value = phrases[0]
  } else {
    tickTypewriter()
  }

  // Init WebGL
  const ok = initWebGL()
  if (ok) {
    startAnimationLoop()

    // Watch dark mode toggle
    mutationObserver = new MutationObserver(() => {
      updateUniformColors()
    })
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Watch resize
    window.addEventListener('resize', resizeCanvas, { passive: true })
  }

  // Observe scroll-driven steps
  if ('IntersectionObserver' in window) {
    stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-step') || '0', 10)
            activeStep.value = idx
          }
        })
      },
      {
        rootMargin: '-30% 0px -40% 0px',
        threshold: [0.1, 0.4]
      }
    )

    const stepElements = document.querySelectorAll('.scroll-step-box')
    stepElements.forEach((el) => stepObserver.observe(el))
  }
})

onBeforeUnmount(() => {
  if (typewriterTimeout) clearTimeout(typewriterTimeout)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (mutationObserver) mutationObserver.disconnect()
  if (stepObserver) stepObserver.disconnect()
  window.removeEventListener('resize', resizeCanvas)

  if (gl) {
    if (program) {
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
      gl.deleteProgram(program)
    }
    if (positionBuffer) gl.deleteBuffer(positionBuffer)
  }
})
</script>

<template>
  <div class="scorpio-nebula-home" data-design="nebula-v2">
    <!-- ==================== HERO SECTION (FULL BLEED) ==================== -->
    <section ref="heroRef" class="nebula-hero">
      <!-- WebGL Canvas or CSS radial-gradient fallback -->
      <canvas
        v-show="!webglFailed"
        ref="canvasRef"
        class="nebula-canvas"
      ></canvas>

      <div
        v-if="webglFailed"
        class="nebula-fallback"
      ></div>

      <!-- Hero Content -->
      <div class="hero-container">
        <!-- Mono Label -->
        <div class="hero-mono-badge">
          <span class="badge-dot"></span>
          SCORPIO · PERSONAL ARCHIVE
        </div>

        <!-- Big Editorial Serif Title with Staggered Reveal -->
        <h1 class="hero-title" aria-label="Scorpio Pages">
          <span
            v-for="(char, idx) in titleLetters"
            :key="idx"
            class="title-letter"
            :class="{ 'is-space': char === ' ' }"
            :style="{ animationDelay: `${idx * 45}ms` }"
          >{{ char === ' ' ? '\u00A0' : char }}</span>
        </h1>

        <!-- Serif Subtitle with Italic Accent Word -->
        <p class="hero-subtitle">
          A quiet archive of <em>thought</em>
        </p>

        <!-- Chinese Tagline -->
        <p class="hero-chinese-tagline">
          博士论文精读笔记 · 游戏通关攻略 · 专辑深度乐评
        </p>

        <!-- Typewriter Prompt Line -->
        <div class="hero-typewriter-wrapper">
          <div class="hero-typewriter-box">
            <span class="typewriter-content">{{ typewriterDisplay }}</span>
            <span class="typewriter-caret" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <!-- Hero Bottom Feathered Melt -->
      <div class="hero-feather-edge"></div>
    </section>

    <!-- Hairline Divider -->
    <div class="section-hairline"></div>

    <!-- ==================== SCROLL-DRIVEN SECTION ==================== -->
    <section class="scroll-driven-container">
      <div class="scroll-driven-layout">
        <!-- Sticky Stage (Left Column) -->
        <div class="sticky-stage-col">
          <div class="stage-frame">
            <!-- Stage Visual 0: Paper (Neural Orb & Attention Geometry) -->
            <div
              class="stage-visual stage-paper"
              :class="{ 'is-active': activeStep === 0 }"
            >
              <div class="paper-orb-glow"></div>
              <svg class="paper-stage-svg" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="180" cy="180" r="140" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="6 8" class="spin-slow" />
                <circle cx="180" cy="180" r="100" stroke="currentColor" stroke-opacity="0.35" class="spin-reverse" />
                <circle cx="180" cy="180" r="60" stroke="currentColor" stroke-opacity="0.5" />
                <!-- Attention matrix rays and nodes -->
                <line x1="180" y1="40" x2="180" y2="320" stroke="currentColor" stroke-opacity="0.2" />
                <line x1="40" y1="180" x2="320" y2="180" stroke="currentColor" stroke-opacity="0.2" />
                <line x1="80" y1="80" x2="280" y2="280" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4" />
                <line x1="80" y1="280" x2="280" y2="80" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4" />
                <circle cx="180" cy="40" r="5" fill="currentColor" />
                <circle cx="180" cy="320" r="5" fill="currentColor" />
                <circle cx="40" cy="180" r="5" fill="currentColor" />
                <circle cx="320" cy="180" r="5" fill="currentColor" />
                <circle cx="180" cy="180" r="16" fill="currentColor" fill-opacity="0.85" class="pulse-core" />
              </svg>
              <div class="stage-caption">
                <span class="stage-mono-tag">STAGE 01</span>
                <span class="stage-name">NEURAL ATTENTION MATRIX</span>
              </div>
            </div>

            <!-- Stage Visual 1: Music (Harmonic Waveforms & Sound Ripples) -->
            <div
              class="stage-visual stage-music"
              :class="{ 'is-active': activeStep === 1 }"
            >
              <div class="music-wave-glow"></div>
              <svg class="music-stage-svg" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Concentric sound propagation ripples -->
                <circle cx="180" cy="180" r="45" stroke="currentColor" stroke-opacity="0.6" class="ripple-ring-1" />
                <circle cx="180" cy="180" r="85" stroke="currentColor" stroke-opacity="0.45" class="ripple-ring-2" />
                <circle cx="180" cy="180" r="125" stroke="currentColor" stroke-opacity="0.3" class="ripple-ring-3" />
                <circle cx="180" cy="180" r="160" stroke="currentColor" stroke-opacity="0.15" />
                <!-- Spectrum bars -->
                <g class="spectrum-bars" fill="currentColor">
                  <rect x="110" y="155" width="6" height="50" rx="3" class="bar-anim-1" />
                  <rect x="125" y="140" width="6" height="80" rx="3" class="bar-anim-2" />
                  <rect x="140" y="125" width="6" height="110" rx="3" class="bar-anim-3" />
                  <rect x="155" y="105" width="6" height="150" rx="3" class="bar-anim-4" />
                  <rect x="170" y="90" width="6" height="180" rx="3" class="bar-anim-5" />
                  <rect x="185" y="110" width="6" height="140" rx="3" class="bar-anim-2" />
                  <rect x="200" y="130" width="6" height="100" rx="3" class="bar-anim-4" />
                  <rect x="215" y="145" width="6" height="70" rx="3" class="bar-anim-1" />
                  <rect x="230" y="160" width="6" height="40" rx="3" class="bar-anim-3" />
                  <rect x="245" y="170" width="6" height="20" rx="3" class="bar-anim-5" />
                </g>
              </svg>
              <div class="stage-caption">
                <span class="stage-mono-tag">STAGE 02</span>
                <span class="stage-name">HARMONIC ACOUSTIC SPECTRUM</span>
              </div>
            </div>

            <!-- Stage Visual 2: Game (Elden Rune Circle & Golden Sigils) -->
            <div
              class="stage-visual stage-game"
              :class="{ 'is-active': activeStep === 2 }"
            >
              <div class="game-rune-glow"></div>
              <svg class="game-stage-svg" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Arcane Elden rune geometry -->
                <circle cx="180" cy="180" r="145" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.5" />
                <circle cx="180" cy="180" r="120" stroke="currentColor" stroke-opacity="0.4" stroke-dasharray="8 6" class="spin-slow" />
                <!-- Intersecting grace arcs -->
                <path d="M 90,180 A 90,90 0 0,1 270,180" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" />
                <path d="M 90,180 A 90,90 0 0,0 270,180" stroke="currentColor" stroke-opacity="0.6" stroke-width="1.5" />
                <circle cx="180" cy="120" r="55" stroke="currentColor" stroke-opacity="0.5" />
                <circle cx="180" cy="240" r="55" stroke="currentColor" stroke-opacity="0.5" />
                <line x1="180" y1="20" x2="180" y2="340" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" />
                <!-- Center Grace Spark -->
                <polygon points="180,150 188,172 210,180 188,188 180,210 172,188 150,180 172,172" fill="currentColor" class="pulse-core" />
              </svg>
              <div class="stage-caption">
                <span class="stage-mono-tag">STAGE 03</span>
                <span class="stage-name">ELDEN RUNE ARCANUM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step List (Right Column) -->
        <div class="step-list-col">
          <div
            v-for="(step, sIdx) in steps"
            :key="step.num"
            class="scroll-step-box"
            :class="{ 'is-active': activeStep === sIdx }"
            :data-step="sIdx"
          >
            <div class="step-inner-card">
              <div class="step-top-meta">
                <span class="step-mono-badge">{{ step.num }} · {{ step.label }}</span>
                <a :href="withBase(step.url)" class="step-explore-btn">
                  进入专区 <span>↗</span>
                </a>
              </div>

              <h2 class="step-title">
                <a :href="withBase(step.url)">{{ step.title }}</a>
              </h2>

              <p class="step-desc">{{ step.desc }}</p>

              <!-- Articles in this step -->
              <div class="step-articles-list">
                <a
                  v-for="art in step.articles"
                  :key="art.url"
                  :href="withBase(art.url)"
                  class="step-article-card"
                >
                  <div class="article-meta-row">
                    <span class="article-tag">{{ art.tag }}</span>
                    <span class="article-badge">{{ art.badge }}</span>
                  </div>
                  <div class="article-main-row">
                    <h3 class="article-heading">{{ art.title }}</h3>
                    <span class="article-arrow" aria-hidden="true">→</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Hairline Divider -->
    <div class="section-hairline"></div>

    <!-- ==================== HORIZONTAL CAROUSEL SECTION ==================== -->
    <section class="carousel-section">
      <div class="carousel-header">
        <div class="carousel-header-left">
          <span class="carousel-mono-badge">COLLECTION · HIGHLIGHTS</span>
          <h2 class="carousel-title">深度<em>典藏</em></h2>
        </div>
        <div class="carousel-nav-controls">
          <button
            class="carousel-nav-btn"
            aria-label="Previous article"
            :disabled="activeCarouselIndex === 0"
            @click="prevCarouselCard"
          >
            ←
          </button>
          <span class="carousel-page-indicator">
            {{ activeCarouselIndex + 1 }} / {{ carouselArticles.length }}
          </span>
          <button
            class="carousel-nav-btn"
            aria-label="Next article"
            :disabled="activeCarouselIndex === carouselArticles.length - 1"
            @click="nextCarouselCard"
          >
            →
          </button>
        </div>
      </div>

      <!-- Carousel Container with Scroll Snap -->
      <div
        ref="carouselRef"
        class="carousel-track"
        @scroll.passive="onCarouselScroll"
      >
        <div class="carousel-spacer carousel-spacer-start" aria-hidden="true"></div>
        <div
          v-for="(card, cIdx) in carouselArticles"
          :key="card.url"
          class="carousel-card"
          :class="{ 'is-active': activeCarouselIndex === cIdx }"
          @click="scrollToCarouselCard(cIdx)"
        >
          <div class="carousel-card-inner">
            <div class="card-section-row">
              <span class="card-section-badge">{{ card.section }}</span>
              <span class="card-category-mono">{{ card.category }}</span>
            </div>

            <h3 class="card-title">
              <a :href="withBase(card.url)">{{ card.title }}</a>
            </h3>

            <p class="card-desc">{{ card.desc }}</p>

            <div class="card-tags-row">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="card-pill"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="card-footer-row">
              <a :href="withBase(card.url)" class="card-read-link">
                研读全文 <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
        <div class="carousel-spacer carousel-spacer-end" aria-hidden="true"></div>
      </div>

      <!-- Dot Indicators -->
      <div class="carousel-dots">
        <button
          v-for="(_, dotIdx) in carouselArticles"
          :key="dotIdx"
          class="carousel-dot"
          :class="{ 'is-active': activeCarouselIndex === dotIdx }"
          :aria-label="`Go to slide ${dotIdx + 1}`"
          @click="scrollToCarouselCard(dotIdx)"
        ></button>
      </div>
    </section>

    <!-- Hairline Divider -->
    <div class="section-hairline"></div>
  </div>
</template>

<style scoped>
/* ============================================================
   Scorpio Nebula v2 Root & Base Layout
   ============================================================ */
.scorpio-nebula-home {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow-x: clip;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Hairline 1px Divider */
.section-hairline {
  width: 100%;
  max-width: 1140px;
  height: 1px;
  margin: 3.5rem auto;
  background: linear-gradient(90deg, transparent, var(--vp-c-divider), transparent);
}

/* ============================================================
   Hero Section: Full Bleed 100vw, ~100vh
   ============================================================ */
.nebula-hero {
  position: relative;
  width: 100%;
  min-height: calc(100vh - var(--vp-nav-height, 64px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem 5rem;
  box-sizing: border-box;
  background: var(--vp-c-bg);
  overflow: hidden;
}

/* WebGL Smoky Nebula Canvas */
.nebula-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse 90% 85% at 50% 45%, #000 45%, rgba(0, 0, 0, 0.35) 75%, transparent 100%);
  mask-image: radial-gradient(ellipse 90% 85% at 50% 45%, #000 45%, rgba(0, 0, 0, 0.35) 75%, transparent 100%);
}

/* CSS Animated Fallback if WebGL unavailable */
.nebula-fallback {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 45% 40%, rgba(66, 192, 248, 0.32), transparent 55%),
    radial-gradient(circle at 65% 55%, rgba(212, 239, 253, 0.5), transparent 60%),
    radial-gradient(ellipse at 50% 50%, rgba(15, 134, 196, 0.18), transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 95%);
  mask-image: radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 95%);
  animation: fallbackPulse 14s ease-in-out infinite alternate;
}

@keyframes fallbackPulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08) translate(-1%, 2%); opacity: 1; }
  100% { transform: scale(0.96) translate(2%, -1%); opacity: 0.85; }
}

.hero-feather-edge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: linear-gradient(to bottom, transparent, var(--vp-c-bg));
  z-index: 2;
  pointer-events: none;
}

/* Hero Content Block */
.hero-container {
  position: relative;
  z-index: 3;
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Small Mono Uppercase Label */
.hero-mono-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.26em;
  color: var(--vp-c-brand-1);
  background: rgba(66, 192, 248, 0.08);
  border: 1px solid rgba(66, 192, 248, 0.28);
  padding: 0.35rem 1.15rem;
  border-radius: 9999px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-bottom: 1.75rem;
  box-shadow: 0 4px 16px rgba(66, 192, 248, 0.12);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  box-shadow: 0 0 8px var(--vp-c-brand-2);
  animation: dotBlink 2.5s ease-in-out infinite;
}

@keyframes dotBlink {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.25); }
}

/* Editorial Serif Title with Staggered Reveal Animation */
.hero-title {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: clamp(3.2rem, 7.5vw, 5.8rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  margin: 0 0 1.25rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.title-letter {
  display: inline-block;
  opacity: 0;
  animation: letterReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.title-letter.is-space {
  width: 0.3em;
}

@keyframes letterReveal {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.92);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Serif Subtitle with Italic Accent Word */
.hero-subtitle {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: clamp(1.25rem, 2.6vw, 1.75rem);
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin: 0 0 0.85rem;
  letter-spacing: 0.01em;
}

.hero-subtitle em {
  font-style: italic;
  font-family: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  color: var(--vp-c-brand-1);
  border-bottom: 1px solid rgba(66, 192, 248, 0.35);
  padding-bottom: 2px;
}

/* Chinese Tagline */
.hero-chinese-tagline {
  font-family: 'Noto Serif SC', 'PingFang SC', Georgia, serif;
  font-size: 0.96rem;
  color: var(--vp-c-text-3);
  letter-spacing: 0.16em;
  margin: 0 0 2.25rem;
  opacity: 0.9;
}

/* Typewriter Prompt-like Line */
.hero-typewriter-wrapper {
  margin-top: 0.5rem;
}

.hero-typewriter-box {
  display: inline-flex;
  align-items: center;
  min-width: 310px;
  padding: 0.55rem 1.4rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(66, 192, 248, 0.12), 0 2px 8px rgba(11, 35, 64, 0.04);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92rem;
  color: var(--vp-c-brand-1);
  text-align: left;
}

.typewriter-content {
  letter-spacing: 0.02em;
}

.typewriter-caret {
  display: inline-block;
  width: 2px;
  height: 1.15em;
  background-color: var(--vp-c-brand-1);
  margin-left: 4px;
  animation: caretBlink 1s step-end infinite;
}

@keyframes caretBlink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

/* ============================================================
   Scroll-Driven Section: Sticky Stage + Step List (~280vh)
   ============================================================ */
.scroll-driven-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  box-sizing: border-box;
}

.scroll-driven-layout {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 3.5rem;
  align-items: start;
}

/* Sticky Stage (Left Column) */
.sticky-stage-col {
  position: sticky;
  top: calc(var(--vp-nav-height, 64px) + 24px);
  height: calc(88vh - var(--vp-nav-height, 64px));
  min-height: 480px;
  max-height: 720px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.stage-frame {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 480px;
  max-height: 520px;
  background: rgba(255, 255, 255, 0.65);
  border: none;
  border-radius: 24px;
  box-shadow: 0 0 60px 15px rgba(66, 192, 248, 0.25), 0 20px 50px rgba(66, 192, 248, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse at center, #000 60%, transparent 100%);
}

.dark .stage-frame {
  background: rgba(15, 36, 62, 0.6);
  box-shadow: 0 0 70px 18px rgba(66, 192, 248, 0.3), 0 20px 50px rgba(15, 134, 196, 0.2);
}

.stage-visual {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  opacity: 0;
  transform: scale(0.92);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.stage-visual.is-active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

/* Stage Visual 1: Paper (Neural & Attention Matrix) */
.stage-paper {
  color: #0f86c4;
}
.paper-orb-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(66, 192, 248, 0.32) 0%, rgba(15, 134, 196, 0.12) 50%, transparent 75%);
  filter: blur(28px);
  z-index: 0;
}
.paper-stage-svg {
  width: 280px;
  height: 280px;
  z-index: 1;
}

/* Stage Visual 2: Music (Waveforms & Harmonic Ripples) */
.stage-music {
  color: #42c0f8;
}
.music-wave-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(66, 192, 248, 0.3) 0%, rgba(120, 180, 250, 0.15) 50%, transparent 75%);
  filter: blur(28px);
  z-index: 0;
}
.music-stage-svg {
  width: 280px;
  height: 280px;
  z-index: 1;
}

/* Stage Visual 3: Game (Elden Rune Circle) */
.stage-game {
  color: #0b82be;
}
.dark .stage-game {
  color: #61cdfc;
}
.game-rune-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(66, 192, 248, 0.35) 0%, rgba(14, 110, 168, 0.16) 50%, transparent 75%);
  filter: blur(28px);
  z-index: 0;
}
.game-stage-svg {
  width: 280px;
  height: 280px;
  z-index: 1;
}

/* Stage Caption */
.stage-caption {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
}

.stage-mono-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  color: var(--vp-c-brand-2);
  font-weight: 700;
}

.stage-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.74rem;
  letter-spacing: 0.15em;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

/* Stage SVG Animations */
.spin-slow {
  transform-origin: center;
  animation: spinClockwise 28s linear infinite;
}
.spin-reverse {
  transform-origin: center;
  animation: spinCounter 22s linear infinite;
}
@keyframes spinClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spinCounter {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.pulse-core {
  animation: corePulse 3s ease-in-out infinite alternate;
  transform-origin: center;
}
@keyframes corePulse {
  0% { transform: scale(0.9); opacity: 0.75; }
  100% { transform: scale(1.15); opacity: 1; }
}

.ripple-ring-1 {
  transform-origin: center;
  animation: ripplePulse 3.5s ease-out infinite;
}
.ripple-ring-2 {
  transform-origin: center;
  animation: ripplePulse 3.5s ease-out 1.1s infinite;
}
.ripple-ring-3 {
  transform-origin: center;
  animation: ripplePulse 3.5s ease-out 2.2s infinite;
}
@keyframes ripplePulse {
  0% { opacity: 0.8; transform: scale(0.9); }
  70% { opacity: 0.3; transform: scale(1.06); }
  100% { opacity: 0; transform: scale(1.14); }
}

.bar-anim-1 { animation: barOscillate 1.8s ease-in-out infinite alternate; }
.bar-anim-2 { animation: barOscillate 1.4s ease-in-out 0.2s infinite alternate; }
.bar-anim-3 { animation: barOscillate 2.1s ease-in-out 0.4s infinite alternate; }
.bar-anim-4 { animation: barOscillate 1.6s ease-in-out 0.1s infinite alternate; }
.bar-anim-5 { animation: barOscillate 2.3s ease-in-out 0.3s infinite alternate; }
@keyframes barOscillate {
  0% { transform: scaleY(0.7); }
  100% { transform: scaleY(1.3); }
}

/* Step List (Right Column) */
.step-list-col {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  padding: 4rem 0 10rem;
}

.scroll-step-box {
  min-height: 72vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-inner-card {
  background: rgba(255, 255, 255, 0.65);
  border: none;
  border-radius: 20px;
  padding: 2.5rem 2.25rem;
  box-shadow: 0 0 50px 12px rgba(66, 192, 248, 0.18), 0 12px 36px rgba(11, 35, 64, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  -webkit-mask-image:
    linear-gradient(to bottom, transparent, #000 16px, #000 calc(100% - 16px), transparent),
    linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to bottom, transparent, #000 16px, #000 calc(100% - 16px), transparent),
    linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  mask-composite: intersect;
}

.dark .step-inner-card {
  background: rgba(15, 36, 62, 0.6);
  box-shadow: 0 0 50px 12px rgba(66, 192, 248, 0.22), 0 12px 36px rgba(0, 0, 0, 0.3);
}

.scroll-step-box.is-active .step-inner-card {
  box-shadow: 0 0 70px 18px rgba(66, 192, 248, 0.32), 0 16px 48px rgba(66, 192, 248, 0.18);
  transform: translateY(-2px);
}

.dark .scroll-step-box.is-active .step-inner-card {
  box-shadow: 0 0 80px 20px rgba(66, 192, 248, 0.36), 0 16px 48px rgba(15, 134, 196, 0.25);
}

.step-top-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.step-mono-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 0.28rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(66, 192, 248, 0.25);
}

.step-explore-btn {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.2s, color 0.2s;
  font-weight: 500;
}

.step-explore-btn:hover {
  color: var(--vp-c-brand-2);
  transform: translateX(3px);
  text-decoration: none;
}

.step-title {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: clamp(2rem, 3.2vw, 2.5rem);
  font-weight: 600;
  margin: 0 0 1rem;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.step-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.step-title a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.step-desc {
  font-size: 0.98rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 2rem;
}

/* Articles in Step */
.step-articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-article-card {
  display: block;
  background: rgba(212, 239, 253, 0.45);
  border: none;
  border-radius: 12px;
  padding: 1.25rem 1.4rem;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 24px 6px rgba(66, 192, 248, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  -webkit-mask-image:
    linear-gradient(to bottom, transparent, #000 10px, #000 calc(100% - 10px), transparent),
    linear-gradient(to right, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to bottom, transparent, #000 10px, #000 calc(100% - 10px), transparent),
    linear-gradient(to right, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  mask-composite: intersect;
}

.dark .step-article-card {
  background: rgba(21, 50, 85, 0.45);
  box-shadow: 0 0 24px 6px rgba(66, 192, 248, 0.16);
}

.step-article-card:hover {
  background: rgba(255, 255, 255, 0.75);
  transform: translateX(6px);
  box-shadow: 0 0 36px 10px rgba(66, 192, 248, 0.25), 0 8px 24px rgba(66, 192, 248, 0.15);
  text-decoration: none;
}

.dark .step-article-card:hover {
  background: rgba(26, 62, 102, 0.7);
  box-shadow: 0 0 40px 12px rgba(66, 192, 248, 0.3), 0 8px 24px rgba(15, 134, 196, 0.2);
}

.article-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.article-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.04em;
}

.article-badge {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.article-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.article-heading {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: 1.12rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.article-arrow {
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.step-article-card:hover .article-arrow {
  transform: translateX(4px);
  color: var(--vp-c-brand-2);
}

/* ============================================================
   Horizontal Carousel Section
   ============================================================ */
.carousel-section {
  --carousel-card-w: 350px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 0 4rem;
  box-sizing: border-box;
}

.carousel-header {
  max-width: 1140px;
  margin: 0 auto 2.5rem;
  padding: 0 1.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.carousel-mono-badge {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
}

.carousel-title {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: clamp(2rem, 3.4vw, 2.75rem);
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  letter-spacing: -0.02em;
}

.carousel-title em {
  font-style: italic;
  color: var(--vp-c-brand-1);
  font-family: 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
}

.carousel-nav-controls {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.carousel-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(11, 35, 64, 0.05);
}

.carousel-nav-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  transform: scale(1.06);
}

.carousel-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.carousel-page-indicator {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  min-width: 3.5rem;
  text-align: center;
}

/* Horizontal Scroll Track */
.carousel-track {
  position: relative;
  display: flex;
  gap: 28px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 30px 0;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

/* Carousel Spacers to center first and last cards */
.carousel-spacer {
  flex: 0 0 max(0px, calc(50% - var(--carousel-card-w) / 2 - 28px));
  width: max(0px, calc(50% - var(--carousel-card-w) / 2 - 28px));
  flex-shrink: 0;
  pointer-events: none;
  scroll-snap-align: none;
}

/* Carousel Card */
.carousel-card {
  flex: 0 0 var(--carousel-card-w);
  width: var(--carousel-card-w);
  max-width: 82vw;
  scroll-snap-align: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.65);
  border: none;
  box-shadow: 0 0 45px 10px rgba(66, 192, 248, 0.15), 0 8px 24px rgba(11, 35, 64, 0.05);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              filter 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(0.91);
  filter: blur(2px);
  opacity: 0.55;
  cursor: pointer;
  -webkit-mask-image:
    linear-gradient(to bottom, transparent, #000 16px, #000 calc(100% - 16px), transparent),
    linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to bottom, transparent, #000 16px, #000 calc(100% - 16px), transparent),
    linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  mask-composite: intersect;
}

.dark .carousel-card {
  background: rgba(15, 36, 62, 0.6);
  box-shadow: 0 0 45px 10px rgba(66, 192, 248, 0.18), 0 8px 24px rgba(0, 0, 0, 0.25);
}

.carousel-card.is-active {
  transform: scale(1);
  filter: blur(0);
  opacity: 1;
  box-shadow: 0 0 70px 18px rgba(66, 192, 248, 0.32), 0 16px 48px rgba(66, 192, 248, 0.18);
  cursor: default;
}

.dark .carousel-card.is-active {
  box-shadow: 0 0 80px 20px rgba(66, 192, 248, 0.36), 0 16px 48px rgba(15, 134, 196, 0.25);
}

.carousel-card-inner {
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.card-section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.card-section-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 0.22rem 0.65rem;
  border-radius: 4px;
}

.card-category-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: var(--vp-c-text-3);
}

.card-title {
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Palatino', Georgia, 'Noto Serif SC', serif;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.015em;
  margin: 0 0 1rem;
}

.card-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.card-title a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.card-desc {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin: 0 0 1.5rem;
  flex-grow: 1;
}

.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.5rem;
}

.card-pill {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid var(--vp-c-border);
}

.card-footer-row {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1.15rem;
}

.card-read-link {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: transform 0.2s, color 0.2s;
}

.card-read-link .arrow {
  transition: transform 0.2s;
}

.card-read-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: none;
}

.card-read-link:hover .arrow {
  transform: translateX(4px);
}

/* Carousel Dots */
.carousel-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--vp-c-border);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.carousel-dot.is-active {
  width: 24px;
  background: var(--vp-c-brand-2);
  box-shadow: 0 0 8px rgba(66, 192, 248, 0.6);
}

/* ============================================================
   Responsive Layout Breakpoints
   ============================================================ */
@media (max-width: 960px) {
  .scroll-driven-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .sticky-stage-col {
    position: relative;
    top: 0;
    height: 380px;
    max-height: 400px;
  }

  .stage-frame {
    max-width: 100%;
    max-height: 360px;
  }

  .step-list-col {
    padding-top: 1rem;
    gap: 3.5rem;
  }

  .scroll-step-box {
    min-height: auto;
  }

  .carousel-section {
    --carousel-card-w: 300px;
  }

  .carousel-track {
    padding: 20px 0;
  }

  .carousel-card {
    flex: 0 0 var(--carousel-card-w);
    width: var(--carousel-card-w);
  }
}

@media (max-width: 640px) {
  .hero-mono-badge {
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    padding: 0.3rem 0.9rem;
  }

  .hero-typewriter-box {
    min-width: 260px;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }

  .step-inner-card {
    padding: 1.75rem 1.4rem;
  }

  .carousel-section {
    --carousel-card-w: 280px;
  }

  .carousel-card {
    flex: 0 0 var(--carousel-card-w);
    width: var(--carousel-card-w);
  }

  .carousel-card-inner {
    padding: 1.75rem 1.4rem;
  }
}

/* ============================================================
   prefers-reduced-motion: reduce Everywhere
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  .title-letter {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
  }

  .typewriter-caret {
    animation: none !important;
  }

  .spin-slow,
  .spin-reverse,
  .pulse-core,
  .ripple-ring-1,
  .ripple-ring-2,
  .ripple-ring-3,
  .bar-anim-1,
  .bar-anim-2,
  .bar-anim-3,
  .bar-anim-4,
  .bar-anim-5,
  .nebula-fallback {
    animation: none !important;
  }
}
</style>
