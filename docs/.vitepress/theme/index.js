import DefaultTheme from 'vitepress/theme'
import { watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import './style.css'

import LatestUpdates from './components/LatestUpdates.vue'
import TagCloud from './components/TagCloud.vue'
import TimelineArchive from './components/TimelineArchive.vue'
import RelatedContent from './components/RelatedContent.vue'
import FontSizeControl from './components/FontSizeControl.vue'

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    app.component('LatestUpdates', LatestUpdates)
    app.component('TagCloud', TagCloud)
    app.component('TimelineArchive', TimelineArchive)
    app.component('RelatedContent', RelatedContent)
    app.component('FontSizeControl', FontSizeControl)
  },

  setup() {
    const route = useRoute()

    onMounted(() => {
      watch(
        () => route.path,
        (path) => {
          let section = 'home'
          if (path.startsWith('/paper-library')) section = 'paper'
          else if (path.startsWith('/game-guide')) section = 'game'
          else if (path.startsWith('/music-review')) section = 'music'
          document.documentElement.setAttribute('data-section', section)
        },
        { immediate: true }
      )
    })
  },
}
