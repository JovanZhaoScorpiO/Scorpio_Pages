import DefaultTheme from 'vitepress/theme'
import { watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'
import './style.css'

import LatestUpdates from './components/LatestUpdates.vue'
import TagCloud from './components/TagCloud.vue'
import TimelineArchive from './components/TimelineArchive.vue'
import RelatedContent from './components/RelatedContent.vue'
import FontSizeControl from './components/FontSizeControl.vue'
import HomeNebula from './components/HomeNebula.vue'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    app.component('HomeNebula', HomeNebula)
    app.component('LatestUpdates', LatestUpdates)
    app.component('TagCloud', TagCloud)
    app.component('TimelineArchive', TimelineArchive)
    app.component('RelatedContent', RelatedContent)
    app.component('FontSizeControl', FontSizeControl)
  },

  setup() {
    const route = useRoute()
    const router = useRouter()

    onMounted(() => {
      // 1. Section visual system tracking with base URL normalization
      watch(
        () => route.path,
        (path) => {
          // Strip base prefix '/Scorpio_Pages' if present
          const cleanPath = path.replace(/^\/Scorpio_Pages/, '')
          let section = 'home'
          if (cleanPath.startsWith('/paper-library')) section = 'paper'
          else if (cleanPath.startsWith('/game-guide')) section = 'game'
          else if (cleanPath.startsWith('/music-review')) section = 'music'
          document.documentElement.setAttribute('data-section', section)

          nextTick(() => {
            rewriteRawLinks()
            setupHomepageSearch()
          })
        },
        { immediate: true }
      )

      // 2. Global link interceptor to prevent 404s when links omit withBase
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a')
        if (!link) return
        const href = link.getAttribute('href')
        if (!href) return

        // Ignore hash anchors, external links, mailto, etc.
        if (href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('//')) {
          return
        }

        const base = withBase('/')
        // If href starts with '/' but doesn't have the base path '/Scorpio_Pages/'
        if (base !== '/' && href.startsWith('/') && !href.startsWith(base)) {
          e.preventDefault()
          const target = withBase(href)
          router.go(target)
        }
      })

      // 3. Link rewrite in DOM for right-click / middle-click support
      function rewriteRawLinks() {
        const base = withBase('/')
        if (base === '/') return
        const links = document.querySelectorAll('a[href^="/"]:not([href^="//"]):not([href^="/Scorpio_Pages/"])')
        links.forEach((a) => {
          const raw = a.getAttribute('href')
          if (raw && raw.startsWith('/') && !raw.startsWith(base)) {
            a.setAttribute('href', withBase(raw))
          }
        })
      }

      // 4. Enhance homepage search box with reactive filtering & shortcut hint
      function setupHomepageSearch() {
        const input = document.getElementById('global-search')
        if (!input) return

        // Prevent attaching multiple times
        if (input.dataset.scorpioBound) return
        input.dataset.scorpioBound = 'true'

        // Synchronize initial value from URL query if present
        const params = new URLSearchParams(window.location.search)
        const q = params.get('q')
        if (q && !input.value) {
          input.value = q
        }

        // Live input debounced filtering
        let debounceTimer
        input.addEventListener('input', (e) => {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            const query = e.target.value.trim()
            const url = new URL(window.location.href)
            if (query) {
              url.searchParams.set('q', query)
            } else {
              url.searchParams.delete('q')
            }
            window.history.replaceState({}, '', url.toString())
            window.dispatchEvent(new CustomEvent('scorpio-filter'))
          }, 180)
        })

        // Esc clears search
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            input.value = ''
            const url = new URL(window.location.href)
            url.searchParams.delete('q')
            window.history.replaceState({}, '', url.toString())
            window.dispatchEvent(new CustomEvent('scorpio-filter'))
            input.blur()
          }
        })
      }

      nextTick(() => {
        rewriteRawLinks()
        setupHomepageSearch()
      })
    })
  },
}
