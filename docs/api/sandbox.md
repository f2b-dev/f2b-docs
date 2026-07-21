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

### 超时回收

- 创建时若设置 `timeoutMs`（1 ms–24 h），从 `startedAt`（无则 `createdAt`）起算到期。
- 进程内 reaper 默认每 **2 s** 扫表（`F2B_TIMEOUT_REAPER_MS`，`≤0` 关闭）；到期自动 `kill`，`error` 记为 `timeout exceeded`，并写入 lifetime 用量。
- 启动时立即扫一次，清理重启前遗留的超时实例。
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

## 模板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/templates` | 预置模板目录（`id` 即创建时的 `template`） |

## 用量

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/usage?days=7` | 近 N 日（1–90）UTC 日聚合：沙箱存活时长 + 命令次数 |

响应字段：`usage.totalSandboxHours`、`usage.totalCommands`、`usage.byDay[]`（`day` / `sandboxHours` / `commands` / `durationMs`）。

- 存活时长：沙箱销毁时写入 `sandbox_usage`（`kind=lifetime`）
- 命令次数：`POST .../commands` 与 `.../commands/stream` 成功记账（`kind=command`，`commands=1`）

控制台：`/console/usage`（经 BFF `GET /api/usage` 代理，不暴露数据面密钥）。

