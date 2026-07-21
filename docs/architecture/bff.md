# BFF 路由表

浏览器**只**访问 `f2b-web` 同源 `/api/*`。BFF 在服务端转发到 `f2b-sandbox`（及后续产品服务），并注入仅服务端持有的凭证。

实现：`@f2b/bff-core`（`proxyToSandbox` / `proxySseToSandbox`）。

## 环境变量（web 服务端）

| 变量 | 说明 |
|------|------|
| `F2B_SANDBOX_URL` | 沙箱上游，默认 `http://127.0.0.1:13287` |
| `F2B_SANDBOX_ADMIN_TOKEN` / `F2B_ADMIN_TOKEN` | 仅用于 `/api/keys*` → 上游管理接口 |

## 路由表（V1）

| BFF | 方法 | 上游 | 备注 |
|-----|------|------|------|
| `/api/sandboxes` | GET, POST | `/v1/sandboxes` | JSON 代理 |
| `/api/sandboxes/[id]` | GET, DELETE | `/v1/sandboxes/{id}` | |
| `/api/sandboxes/[id]/commands` | POST | `/v1/sandboxes/{id}/commands` | 缓冲结果 |
| `/api/sandboxes/[id]/commands/stream` | POST | `/v1/sandboxes/{id}/commands/stream` | **SSE 透传**，不缓冲 body |
| `/api/sandboxes/[id]/files` | * | `/v1/sandboxes/{id}/files…` | 读写文件 |
| `/api/keys` | GET, POST | `/v1/api-keys` | 注入 `X-F2B-Admin-Token` |
| `/api/keys/[id]` | DELETE 等 | `/v1/api-keys/{id}` | 同上 |

## 代理语义

- **JSON**：读完整上游 body 后返回（便于改写 header）。
- **SSE**：`content-type: text/event-stream` 时把 `ReadableStream` 原样交给浏览器；非 SSE / 错误仍按 JSON 缓冲。
- **上游不可达**：`503`，错误码 `BACKEND_UNAVAILABLE`。

## 禁止

- 前端 / `packages/ui` / `console-shell` 引用 `CUBE_*`、admin token、数据面内网 URL。
- 浏览器直连持管理密钥的 sandbox 管理口。

## 扩展

新产品：`apps/web/src/app/api/<product>/**` + 上游 client（可仿 `bff-core`），侧栏走 [插件模型](./plugins)。
