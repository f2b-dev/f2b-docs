# 沙箱 HTTP API

权威契约：[f2b-spec/openapi/sandbox-v1.yaml](https://github.com/f2b-dev/f2b-spec/blob/main/openapi/sandbox-v1.yaml)。

默认本地：`http://127.0.0.1:13287`，路径前缀 **`/v1`**。

## 健康检查

```http
GET /healthz
```

无鉴权。响应示例字段（**不含密钥**）：

| 字段 | 说明 |
|------|------|
| `ok` / `service` | 存活标记与服务名 |
| `backend` | 数据面 kind（`fake` / `cube` 等）；控制台可诚实展示 |
| `auth` | 鉴权模式（`off` / `api_key`…），不回显密钥 |
| `db` | 控制面库路径（运维） |
| `activeSandboxes` | 占用并发槽数（`provisioning` / `running` / `paused`） |
| `maxConcurrentSandboxes` | 兼容字段；等于 `capacity.max`（未配置硬顶时省略） |
| `capacity.active` / `max` / `available` | 占用 / 硬顶（`F2B_MAX_CONCURRENT_SANDBOXES`，null=不限制）/ 剩余 |
| `reaper.enabled` / `intervalMs` | 超时回收器（`F2B_TIMEOUT_REAPER_MS`，默认 2000；≤0 关闭） |

控制台概览经 BFF `GET /api/health` 同源代理展示容量提示。

## 沙箱

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/sandboxes` | 列表（可选 `?projectId=` / `?status=` 逗号多状态） |
| POST | `/v1/sandboxes` | 创建 body：`name` / `template` / `timeoutMs` / `allowInternetAccess` / `metadata` / `projectId` |
| GET | `/v1/sandboxes/{id}` | 详情（含 `metadata`） |
| PATCH | `/v1/sandboxes/{id}` | 延期 `timeoutMs`（`null` 取消）与/或浅合并 `metadata`；仅活动沙箱 |
| DELETE | `/v1/sandboxes/{id}` | 销毁 |
| POST | `/v1/sandboxes/{id}/pause` | 暂停（fake 支持；Cube 视集群） |
| POST | `/v1/sandboxes/{id}/resume` | 恢复 |
| POST | `/v1/sandboxes/{id}/commands` | body：`cmd` 必填；可选 `cwd` / `env` / `timeoutMs`（命令级，≤30 min） |
| POST | `/v1/sandboxes/{id}/commands/stream` | 同上 body；响应 SSE：`stdout`/`stderr`/`result` |

> **stdin**：契约与控制台 **1.0 前不暴露**；即使底层 envd 有字段，产品 API / SDK / MCP 也不接。交互式管道后置。
| GET | `/v1/sandboxes/{id}/files` | `?path=` 读（`encoding=utf8|base64`）；`?list=1&path=` 列目录 |
| POST | `/v1/sandboxes/{id}/files` | body：`path` / `content` / `encoding`（`utf8` 默认 / `base64` 二进制） |
| DELETE | `/v1/sandboxes/{id}/files` | `?path=` 删除；目录加 `recursive=1` |
| POST | `/v1/sandboxes/{id}/files/mkdir` | body：`path` / `recursive`（默认 true） |
| POST | `/v1/sandboxes/{id}/files/rename` | body：`from` / `to` 重命名或移动 |

### 文件 encoding

- 写：`encoding: "utf8"`（默认）时 `content` 为文本；`"base64"` 时 `content` 为 base64，解码后写入字节。
- 读：查询参数 `encoding=utf8|base64`（默认 utf8）；base64 适合二进制或非 UTF-8。
- SDK：JS `write(path, Uint8Array)` / `readBytes`；Python `write(path, bytes)` / `read_bytes`。

### metadata

- 创建时可传 `metadata: { "key": "value" }`（string→string），控制面持久化，不进 guest。
- `PATCH` 对 `metadata` **浅合并**（同 key 覆盖）；终端态返回 `SANDBOX_ALREADY_TERMINAL`。

### 超时回收（滑动空闲）

- 创建或 `PATCH` 设置 `timeoutMs`（1 ms–24 h；`null` 取消）为**空闲窗口**。
- 到期点 = `lastActiveAt`（缺省回落 `startedAt` / `createdAt`）+ `timeoutMs`。
- 命令（含 stream）、读写/列目录/删除/mkdir/rename 成功后会刷新 `lastActiveAt`（活动保活）。
- `PATCH` 设置非 null `timeoutMs` 时同步刷新 `lastActiveAt`（从现在起重新计时）。
- 进程内 reaper 默认每 **2 s** 扫表（`F2B_TIMEOUT_REAPER_MS`，`≤0` 关闭）；到期自动 `kill`，`error` 记为 `timeout exceeded`，并写入 lifetime 用量。
- 启动时立即扫一次，清理重启前遗留的超时实例。

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
| `PATCH /api/sandboxes/{id}` | 延期 timeout / 合并 metadata |
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

