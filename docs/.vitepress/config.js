import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
    title: 'Scorpio Pages',
    description: '个人综合内容档案馆 — 博士论文笔记 · 游戏攻略 · 音乐乐评',
    lang: 'zh-CN',
    base: '/Scorpio_Pages/',

    lastUpdated: true,
    cleanUrls: true,

    head: [
      ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content' }],
      ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' }],
      ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#090d16' }],
      ['meta', { name: 'color-scheme', content: 'light dark' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
      ['link', { rel: 'icon', href: '/Scorpio_Pages/favicon.svg' }],
      ['meta', { property: 'og:title', content: 'Scorpio Pages' }],
      ['meta', { property: 'og:description', content: '个人综合内容档案馆 — 博士论文笔记 · 游戏攻略 · 音乐乐评' }],
    ],

    markdown: {
      config: (md) => {
        md.use(mathjax3)
      },
    },

    themeConfig: {
      logo: { src: '/favicon.svg', width: 32, height: 32 },

      nav: [
        { text: '🏠 首页', link: '/' },
        {
          text: '📄 Paper 文库',
          link: '/paper-library/',
          activeMatch: '/paper-library/',
        },
        {
          text: '🎮 游戏攻略',
          link: '/game-guide/',
          activeMatch: '/game-guide/',
        },
        {
          text: '🎵 音乐乐评',
          link: '/music-review/',
          activeMatch: '/music-review/',
        },
        { text: '🏷️ 标签云', link: '/tag-cloud' },
        { text: '📅 时间线', link: '/timeline' },
        { text: 'ℹ️ 关于', link: '/about' },
      ],

      sidebar: {
        '/paper-library/': [
          {
            text: '📄 Paper 文库',
            items: [
              { text: '📚 专区总览', link: '/paper-library/' },
              { text: '⏳ 论文时间轴', link: '/paper-library/timeline' },
            ],
            collapsed: false,
          },
          {
            text: '👁️ 计算机视觉',
            collapsible: true,
            collapsed: false,
            items: [
              { text: 'ViT-ResNet 对比分析', link: '/paper-library/computer-vision/vit-resnet-analysis' },
            ],
          },
          {
            text: '📝 自然语言处理',
            collapsible: true,
            collapsed: false,
            items: [
              { text: 'BERT 论文精读', link: '/paper-library/nlp/bert-paper-review' },
            ],
          },
        ],

        '/game-guide/': [
          {
            text: '🎮 游戏攻略库',
            items: [
              { text: '🏟️ 专区总览', link: '/game-guide/' },
            ],
            collapsed: false,
          },
          {
            text: '⚔️ Elden Ring',
            collapsible: true,
            collapsed: false,
            items: [
              { text: '主线流程攻略', link: '/game-guide/elden-ring/main-quest-guide' },
              { text: '传说级武器收集', link: '/game-guide/elden-ring/legendary-armaments-guide' },
            ],
          },
        ],

        '/music-review/': [
          {
            text: '🎵 音乐乐评集',
            items: [
              { text: '🎨 专区总览', link: '/music-review/' },
            ],
            collapsed: false,
          },
          {
            text: '🌊 后摇 / 氛围',
            collapsible: true,
            collapsed: false,
            items: [
              { text: "Sigur Rós — Takk…", link: '/music-review/post-rock/sigur-ros-takk' },
            ],
          },
          {
            text: '🌌 氛围音乐',
            collapsible: true,
            collapsed: false,
            items: [
              { text: 'Brian Eno — Music for Airports', link: '/music-review/ambient/brian-eno-music-for-airports' },
            ],
          },
        ],

        // 通用侧边栏回退
        '/': [
          { text: '🏠 首页', link: '/' },
          { text: '📄 Paper 文库', link: '/paper-library/' },
          { text: '🎮 游戏攻略', link: '/game-guide/' },
          { text: '🎵 音乐乐评', link: '/music-review/' },
          { text: '🏷️ 标签云', link: '/tag-cloud' },
          { text: '📅 时间线', link: '/timeline' },
          { text: 'ℹ️ 关于', link: '/about' },
        ],
      },

      // 全文搜索
      search: {
        provider: 'local',
        options: {
          locales: {
            root: {
              translations: {
                button: {
                  buttonText: '搜索全站内容',
                  buttonAriaLabel: '搜索',
                },
                modal: {
                  noResultsText: '没有找到相关结果',
                  resetButtonTitle: '清除搜索条件',
                  footer: {
                    selectText: '选择',
                    navigateText: '切换',
                  },
                },
              },
            },
          },
        },
      },

      // 页脚
      footer: {
        message: '用 ❤️ 和 Markdown 构建 · 所有内容均为个人原创',
        copyright: `Copyright © ${new Date().getFullYear()} <a href="https://github.com/AzScorpio" target="_blank">AzScorpio</a> · Powered by VitePress`,
      },

      // 编辑链接
      editLink: {
        pattern: 'https://github.com/AzScorpio/Scorpio_Pages/edit/main/docs/:path',
        text: '在 GitHub 上编辑此页',
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/AzScorpio' },
      ],

      // 大纲目录深度
      outline: {
        level: [2, 4],
        label: '页面目录',
      },

      // 返回顶部
      returnToTopLabel: '返回顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题切换',
      lightModeSwitchTitle: '切换浅色模式',
      darkModeSwitchTitle: '切换深色模式',
      skipToContentLabel: '跳转到内容',
    },

    // 构建时不忽略 404
    ignoreDeadLinks: [
      /^\/paper-library\/.*$/,
      /^\/game-guide\/.*$/,
      /^\/music-review\/.*$/,
    ],

    vite: {
      ssr: {
        noExternal: [],
      },
    },
  })
