# 沙箱 HTTP API

权威契约：[f2b-spec/openapi/sandbox-v1.yaml](https://github.com/f2b-dev/f2b-spec/blob/main/openapi/sandbox-v1.yaml)。

默认本地：`http://127.0.0.1:13287`，路径前缀 **`/v1`**。

## 健康检查

```http
GET /healthz
```

## 沙箱

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/sandboxes` | 列表（可选 `?projectId=`） |
| POST | `/v1/sandboxes` | 创建 body：`name` / `template` / `timeoutMs` / `allowInternetAccess` / `projectId` |
| GET | `/v1/sandboxes/{id}` | 详情 |
| DELETE | `/v1/sandboxes/{id}` | 销毁 |
| POST | `/v1/sandboxes/{id}/commands` | body：`{ "cmd": "echo hi" }` 整包 JSON |
| POST | `/v1/sandboxes/{id}/commands/stream` | 同上 body；响应 SSE：`stdout`/`stderr`/`result` |
| GET | `/v1/sandboxes/{id}/files` | `?path=` 读；`?list=1&path=` 列目录 |
| POST | `/v1/sandboxes/{id}/files` | body：`path` / `content` / `encoding` |

## API Key（管理）

| 方法 | 路径 | 鉴权 |
|------|------|------|
| GET/POST | `/v1/api-keys` | `X-F2B-Admin-Token` |
| DELETE | `/v1/api-keys/{id}` | 同上 |

## 经 BFF（浏览器同源）

f2b-web 将 `/api/sandboxes*` 代理到 sandbox `/v1/sandboxes*`。

| 浏览器路径 | 上游 |
|------------|------|
| `POST /api/sandboxes` | `POST /v1/sandboxes` |
| `POST /api/sandboxes/{id}/commands` | 整包命令 |
| `POST /api/sandboxes/{id}/commands/stream` | SSE 透传（`proxySseToSandbox`，不缓冲 body） |

控制台终端默认走 stream。E2E：`pnpm e2e:bff`。

## 示例

```bash
# 创建
curl -s -X POST http://127.0.0.1:13287/v1/sandboxes \
  -H 'content-type: application/json' \
  -d '{"name":"demo","template":"base"}'

# 命令（替换 ID）
curl -s -X POST http://127.0.0.1:13287/v1/sandboxes/$ID/commands \
  -H 'content-type: application/json' \
  -d '{"cmd":"echo hello"}'

# 销毁
curl -s -X DELETE http://127.0.0.1:13287/v1/sandboxes/$ID
```
