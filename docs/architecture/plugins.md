# 控制台插件模型

`f2b-web` **单仓多插件**：新产品扩展侧栏与标题，不新建前端仓。

## 目录

```text
f2b-web/
  packages/console-shell/   # ConsolePlugin 类型、mergePluginNav、壳布局
  packages/ui/              # 设计系统
  packages/bff-core/        # 上游代理
  plugins/sandbox/          # @f2b/plugin-sandbox（nav + bff-map）
  apps/web/src/plugins/registry.ts   # 启用列表
  apps/web/src/app/console/**        # 页面（V1 仍可放 app）
  apps/web/src/app/api/**            # BFF 实现
```

## `ConsolePlugin`（V1）

| 字段 | 说明 |
|------|------|
| `id` | 稳定 id，如 `sandbox` |
| `nav` | `NavSection[]`；同 `group` 名合并 items |
| `titleFor?` | 根据 pathname 返回页眉标题 |
| `productLabel?` | 顶栏产品名 |

V1 **不**在插件包内挂 Next 页面或 BFF route 文件（仍在 `apps/web`）；**不**做远程动态加载。  
沙箱插件额外导出 **`sandboxBffRoutes`**：文档与 `pnpm check:bff-map` 的契约表，实现仍在 `app/api`。

## 新增插件

1. `plugins/<name>` 导出 `ConsolePlugin`。
2. 在 `registry.ts` 的 `consolePlugins` append。
3. 补页面与 `/api/*` BFF。
4. 浏览器 client 只请求同源 `/api`。

## 新增 BFF 路由

见 [BFF 路由表](./bff) 与仓库内 [`plugins/sandbox/README.md`](https://github.com/f2b-dev/f2b-web/blob/main/plugins/sandbox/README.md) 的逐步示例（`proxyToSandbox` / SSE / admin / tunnel）。

## UI 硬约束

- Tailwind v4 + shadcn 风格 + lucide；**禁止 antd**。
- 品牌主色 `#FF5C33`；顶栏 `#001529`。
- 用户可见文案用「灵境云 / F2B-Navo」，不写数据面内核品牌。
