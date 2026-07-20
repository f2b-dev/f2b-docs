import { defineConfig } from "vitepress";

export default defineConfig({
  title: "灵境云文档",
  description: "F2B-Navo / 灵境云 — AI Agent 安全执行云开发者文档",
  lang: "zh-CN",
  cleanUrls: true,
  themeConfig: {
    logo: undefined,
    siteTitle: "灵境云 · Docs",
    nav: [
      { text: "指南", link: "/guide/intro" },
      { text: "架构", link: "/architecture/overview" },
      { text: "API", link: "/api/sandbox" },
      { text: "SDK", link: "/sdk/overview" },
      {
        text: "GitHub",
        link: "https://github.com/f2b-dev",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "入门",
          items: [
            { text: "产品介绍", link: "/guide/intro" },
            { text: "本地快速开始", link: "/guide/quickstart" },
            { text: "仓库地图", link: "/guide/repos" },
            { text: "MCP 网关", link: "/guide/mcp" },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "架构",
          items: [
            { text: "总览", link: "/architecture/overview" },
            { text: "控制面与数据面", link: "/architecture/planes" },
            { text: "鉴权模型", link: "/architecture/auth" },
          ],
        },
      ],
      "/api/": [
        {
          text: "HTTP API",
          items: [
            { text: "沙箱 API", link: "/api/sandbox" },
            { text: "错误码", link: "/api/errors" },
          ],
        },
      ],
      "/sdk/": [
        {
          text: "SDK",
          items: [
            { text: "概览", link: "/sdk/overview" },
            { text: "TypeScript", link: "/sdk/js" },
            { text: "Python", link: "/sdk/python" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/f2b-dev" },
    ],
    footer: {
      message: "Apache-2.0 · f2b-dev",
      copyright: "灵境云 / F2B-Navo",
    },
    search: { provider: "local" },
    outline: { label: "本页" },
    docFooter: { prev: "上一页", next: "下一页" },
  },
  head: [
    ["meta", { name: "theme-color", content: "#FF5C33" }],
  ],
});
