# BFF 路由表

浏览器**只**访问 `f2b-web` 同源 `/api/*`。BFF 在服务端转发到 `f2b-sandbox` / `f2b-tunnel`，并注入仅服务端持有的凭证。

实现：`@f2b/bff-core`（`proxyToSandbox` / `proxySseToSandbox` / `proxyToTunnel`）。  
**权威清单（与代码对齐）**：[`@f2b/plugin-sandbox` 的 `sandboxBffRoutes`](https://github.com/f2b-dev/f2b-web/blob/main/plugins/sandbox/src/bff-map.ts)；CI 可用 `pnpm check:bff-map`。

## 环境变量（web 服务端）

| 变量 | 说明 |
|------|------|
| `F2B_SANDBOX_URL` | 沙箱上游，默认 `http://127.0.0.1:13287` |
| `F2B_SANDBOX_API_KEY` / `F2B_BFF_API_KEY` | `auth=api_key` 时注入 `Authorization` |
| `F2B_SANDBOX_ADMIN_TOKEN` / `F2B_ADMIN_TOKEN` | 仅用于 `/api/keys*` → 上游管理接口 |
| `F2B_TUNNEL_URL` | 隧道上游，默认 `http://127.0.0.1:8790` |

## 路由表（V1，与 bff-map 同步）

| BFF | 方法 | 上游 | 备注 |
|-----|------|------|------|
| `/api/sandboxes` | GET, POST | `/v1/sandboxes` | JSON |
| `/api/sandboxes/[id]` | GET, PATCH, DELETE | `/v1/sandboxes/{id}` | PATCH 延期 / metadata |
| `/api/sandboxes/[id]/pause` | POST | `.../pause` | |
| `/api/sandboxes/[id]/resume` | POST | `.../resume` | |
| `/api/sandboxes/[id]/commands` | POST | `.../commands` | 缓冲结果 |
| `/api/sandboxes/[id]/commands/stream` | POST | `.../commands/stream` | **SSE** |
| `/api/sandboxes/[id]/files` | GET, POST, DELETE | `.../files` | |
| `/api/sandboxes/[id]/files/mkdir` | POST | `.../files/mkdir` | |
| `/api/sandboxes/[id]/files/rename` | POST | `.../files/rename` | |
| `/api/templates` | GET | `/v1/templates` | |
| `/api/usage` | GET | `/v1/usage` | |
| `/api/keys` | GET, POST | `/v1/api-keys` | admin token |
| `/api/keys/[id]` | DELETE | `/v1/api-keys/{id}` | admin token |
| `/api/tunnels` | GET, POST | tunnel `/v1/tunnels` | `proxyToTunnel` |
| `/api/tunnels/[id]` | GET, DELETE | tunnel `/v1/tunnels/{id}` | |
| `/api/health` | GET | （web 自身 / 聚合） | **不在** sandbox 清单 |

## 代理语义

- **JSON**：读完整上游 body 后返回。
- **SSE**：`proxySseToSandbox` 透传 `ReadableStream`。
- **上游不可达**：`503`，`BACKEND_UNAVAILABLE`。

## 禁止

- 前端 / `packages/ui` / `console-shell` 引用 `CUBE_*`、admin token、数据面内网 URL。
- 浏览器直连持管理密钥的 sandbox 管理口。

## 扩展：新增 BFF 路由

完整步骤与代码样例见 **[f2b-web `plugins/sandbox/README.md`](https://github.com/f2b-dev/f2b-web/blob/main/plugins/sandbox/README.md)**「如何新增 BFF 路由」。摘要：

1. 上游契约就绪（spec + sandbox）。  
2. `apps/web/src/app/api/.../route.ts` 用 `proxyToSandbox` / SSE / tunnel。  
3. `plugins/sandbox/src/bff-map.ts` 追加一行。  
4. `pnpm check:bff-map` + `ci-guards` + 可选 `e2e:bff`。  
5. 更新本页表格。

新产品侧栏走 [插件模型](./plugins)。
