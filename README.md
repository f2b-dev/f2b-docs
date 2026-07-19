# f2b-docs

灵境云 / F2B-Navo **开发者文档站**（VitePress）。

## 本地

```bash
pnpm install
pnpm dev      # http://127.0.0.1:5173
pnpm build    # 输出 docs/.vitepress/dist
pnpm preview
```

## 内容结构

```text
docs/
  index.md                 # 首页
  guide/                   # 入门、仓库地图
  architecture/            # 总览、控制/数据面、鉴权
  api/                     # 沙箱 HTTP、错误码
  sdk/                     # JS / Python
```

## 相关仓

- 组织：https://github.com/f2b-dev  
- 契约：https://github.com/f2b-dev/f2b-spec  
- 沙箱：https://github.com/f2b-dev/f2b-sandbox  
- 控制台：https://github.com/f2b-dev/f2b-web  

对外文案遵循品牌规则：宣传灵境云自研沙箱能力，不在用户文档中堆砌上游实现商标。

Apache-2.0
