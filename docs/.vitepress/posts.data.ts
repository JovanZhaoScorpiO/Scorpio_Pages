import { createContentLoader } from 'vitepress'

export default createContentLoader(['paper-library/**/*.md', 'game-guide/**/*.md', 'music-review/**/*.md'], {
  includeSrc: false,
  render: false,
  excerpt: true,
  transform(rawData) {
    return rawData
      .filter(({ frontmatter }) => frontmatter?.title)
      .map(({ url, frontmatter, excerpt }) => ({
        url,
        title: frontmatter.title,
        date: frontmatter.date || frontmatter.year || frontmatter.releaseYear || frontmatter.release_year || null,
        tags: (() => {
          const t = frontmatter.tags
          if (Array.isArray(t)) return t
          if (typeof t === 'string') return t.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
          return []
        })(),
        section: url.startsWith('/paper-library') ? 'paper'
          : url.startsWith('/game-guide') ? 'game'
          : url.startsWith('/music-review') ? 'music'
          : 'other',
        sectionLabel: url.startsWith('/paper-library') ? 'Paper文库'
          : url.startsWith('/game-guide') ? '游戏攻略'
          : url.startsWith('/music-review') ? '音乐乐评'
          : '其他',
        excerpt: excerpt || '',
        description: frontmatter.description || '',
        ...frontmatter,
      }))
      .filter(p => p.url !== '/') // exclude homepage
  },
})
